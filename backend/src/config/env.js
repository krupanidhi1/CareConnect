/**
 * Centralised, validated environment access. Reads process.env once and exposes
 * typed helpers so the rest of the app never touches process.env directly.
 */
const env = (key, fallback = "") => process.env[key] || fallback;
const num = (key, fallback) => {
  const v = parseInt(process.env[key], 10);
  return Number.isFinite(v) ? v : fallback;
};
const bool = (key, fallback = false) => {
  const v = process.env[key];
  if (v === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(String(v).toLowerCase());
};

const config = {
  env: env("NODE_ENV", "development"),
  isProd: env("NODE_ENV", "development") === "production",
  port: num("PORT", 5001),
  clientOrigin: env("CLIENT_ORIGIN", "http://localhost:5173"),
  clientOrigins: (env("CLIENT_ORIGINS", env("CLIENT_ORIGIN", "http://localhost:5173")))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  mongoUri: env("MONGODB_URI", "mongodb://127.0.0.1:27017/careconnect"),
  jwt: {
    accessSecret: env("JWT_ACCESS_SECRET", "dev-access-secret-change-me"),
    refreshSecret: env("JWT_REFRESH_SECRET", "dev-refresh-secret-change-me"),
    accessExpiresIn: env("JWT_ACCESS_EXPIRES_IN", "15m"),
    refreshExpiresIn: env("JWT_REFRESH_EXPIRES_IN", "7d"),
  },
  cookie: {
    name: env("JWT_REFRESH_COOKIE_NAME", "careconnect_refresh"),
    secure: bool("COOKIE_SECURE", env("NODE_ENV", "development") === "production"),
    sameSite: env("COOKIE_SAMESITE", "lax"),
  },
  otp: {
    length: num("OTP_LENGTH", 6),
    ttlMinutes: num("OTP_TTL_MINUTES", 10),
    resendCooldownSeconds: num("OTP_RESEND_COOLDOWN_SECONDS", 60),
  },
  email: {
    host: env("SMTP_HOST"),
    port: num("SMTP_PORT", 587),
    user: env("SMTP_USER"),
    pass: env("SMTP_PASS"),
    from: env("SMTP_FROM", "CareConnect <no-reply@careconnect.local>"),
    devLog: bool("EMAIL_DEV_LOG", !bool("SMTP_HOST")),
  },
  sms: {
    enabled: Boolean(env("TWILIO_ACCOUNT_SID")) && Boolean(env("TWILIO_AUTH_TOKEN")) && Boolean(env("TWILIO_FROM_NUMBER")),
    accountSid: env("TWILIO_ACCOUNT_SID"),
    authToken: env("TWILIO_AUTH_TOKEN"),
    from: env("TWILIO_FROM_NUMBER"),
    devLog: bool("SMS_DEV_LOG", true),
  },
};

const insecureSecret = (value) =>
  !value || value.length < 32 || /replace-|change-me|your-secret/i.test(value);

if (config.isProd && (insecureSecret(config.jwt.accessSecret) || insecureSecret(config.jwt.refreshSecret))) {
  throw new Error("Production requires JWT_ACCESS_SECRET and JWT_REFRESH_SECRET with at least 32 non-placeholder characters.");
}
if (config.isProd && config.cookie.sameSite === "none" && !config.cookie.secure) {
  throw new Error("COOKIE_SECURE must be true when COOKIE_SAMESITE=none.");
}
if (!config.isProd && (insecureSecret(config.jwt.accessSecret) || insecureSecret(config.jwt.refreshSecret))) {
  // eslint-disable-next-line no-console
  console.warn("[CareConnect] WARNING: using default JWT secrets. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in production.");
}

module.exports = config;