const nodemailer = require("nodemailer");
const config = require("../config/env");
const { logger } = require("../utils");

let transporter = null;
function getTransport() {
  if (transporter) return transporter;
  if (config.email.host) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: config.email.user ? { user: config.email.user, pass: config.email.pass } : undefined,
    });
  } else {
    // No SMTP configured: use a JSON transport that just logs the message.
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }
  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  const t = getTransport();
  const info = await t.sendMail({ from: config.email.from, to, subject, text, html });
  if (config.email.devLog) {
    logger.info(`[EMAIL → ${to}] ${subject}`);
    logger.info(text);
  }
  return info;
}

async function sendOtpEmail({ to, code, purpose = "email" }) {
  const label = purpose === "reset" ? "reset your password" : "verify your email";
  const subject = `CareConnect — your ${purpose === "reset" ? "password reset" : "verification"} code`;
  const text = `Your CareConnect code to ${label} is ${code}. It expires in ${config.otp.ttlMinutes} minutes. If you did not request this, ignore this email.`;
  return sendEmail({ to, subject, text, html: `<p>Your CareConnect code to ${label} is:</p><h2>${code}</h2><p>It expires in ${config.otp.ttlMinutes} minutes. If you did not request this, you can ignore this email.</p>` });
}

let twilioClient = null;
function getTwilio() {
  if (!config.sms.enabled) return null;
  if (twilioClient) return twilioClient;
  const twilio = require("twilio");
  twilioClient = twilio(config.sms.accountSid, config.sms.authToken);
  return twilioClient;
}

async function sendSms({ to, body }) {
  const client = getTwilio();
  if (client) {
    return client.messages.create({ from: config.sms.from, to, body });
  }
  if (config.sms.devLog) {
    logger.info(`[SMS → ${to}] ${body}`);
  }
  return null;
}

async function sendOtpSms({ to, code }) {
  return sendSms({ to, body: `Your CareConnect verification code is ${code}. It expires in ${config.otp.ttlMinutes} minutes.` });
}

module.exports = { sendEmail, sendOtpEmail, sendSms, sendOtpSms };