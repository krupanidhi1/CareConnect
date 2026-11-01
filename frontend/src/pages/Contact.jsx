import React, { useState } from "react";
import { Mail, MapPin, Phone, Send, Loader2, CheckCircle2, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { contactApi, isApiConfigured } from "@/api/careconnect";
import BackendNotice from "@/components/common/BackendNotice";
import { toast } from "@/components/ui/use-toast";

const EMPTY = { name: "", email: "", subject: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState("");

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please tell us your name.";
    if (!form.email.trim()) next.email = "An email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.subject.trim()) next.subject = "Add a short subject.";
    if (form.message.trim().length < 15) next.message = "Please write at least 15 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    if (!isApiConfigured()) {
      setFailure("The CareConnect API is not connected yet, so your message was not sent.");
      return;
    }
    setSending(true);
    setFailure("");
    try {
      await contactApi.create({ ...form });
      setSent(true);
      setForm(EMPTY);
      toast({ title: "Message received", description: "Our team will reply to your email." });
    } catch (error) {
      setFailure(error.message || "Your message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <title>Contact CareConnect</title>

      <section className="shell grid gap-10 pt-14 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-4 font-heading text-[2.3rem] leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[2.9rem]">
            Talk to the CareConnect team
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Questions about registering an old age home, verifying a donation, or volunteering?
            Write to us and we will get back to you.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-foreground">Email</p>
                <p className="text-muted-foreground">Use the contact form to reach the CareConnect team.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <Phone className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-foreground">Phone</p>
                <p className="text-muted-foreground">No public phone number is listed.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-foreground">Office</p>
                <p className="text-muted-foreground">Online platform — no public office address listed.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <Clock className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-foreground">Response time</p>
                <p className="text-muted-foreground">Response time depends on administrator availability.</p>
              </div>
            </li>
          </ul>
        </div>

        <div>
          {!isApiConfigured() && (
            <div className="mb-5">
              <BackendNotice
                compact
                title="Contact messages need the API"
                description="Messages are stored by your Express backend. Until the API base URL is configured, submitting shows an explicit failure instead of pretending the message was sent."
                endpoints={["POST /contact"]}
              />
            </div>
          )}

          <div className="surface p-6 sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/12 text-accent">
                  <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-heading text-xl text-foreground">Message received</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  The backend confirmed your message. Our team will reply to your email address.
                </p>
                <Button variant="outline" className="mt-6 rounded-full" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {failure && (
                  <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{failure}</p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={form.name} onChange={update("name")} placeholder="Your name" className="h-11" aria-invalid={Boolean(errors.name)} />
                  {errors.name && <p className="field-error">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" className="h-11" aria-invalid={Boolean(errors.email)} />
                  {errors.email && <p className="field-error">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={form.subject} onChange={update("subject")} placeholder="How can we help?" className="h-11" aria-invalid={Boolean(errors.subject)} />
                  {errors.subject && <p className="field-error">{errors.subject}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={6} value={form.message} onChange={update("message")} placeholder="Tell us a little more…" aria-invalid={Boolean(errors.message)} />
                  {errors.message && <p className="field-error">{errors.message}</p>}
                </div>

                <Button type="submit" className="h-11 w-full rounded-full" disabled={sending}>
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                      Send message
                    </>
                  )}
                </Button>
                {!isApiConfigured() && (
                  <p className="text-center text-xs text-muted-foreground">
                    Sending is unavailable until the CareConnect API is connected.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}