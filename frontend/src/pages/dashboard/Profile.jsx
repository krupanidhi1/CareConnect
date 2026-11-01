import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "@/api/careconnect";
import { useAuth } from "@/lib/AuthContext";
import { resolveRole, ROLE_LABEL, displayName } from "@/lib/roles";
import PageHeader from "@/components/common/PageHeader";
import StatusPill from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, LogOut, KeyRound, ShieldCheck, Mail, MapPin, Phone } from "lucide-react";

export default function Profile() {
  const { user, checkUserAuth, logout } = useAuth();
  const role = resolveRole(user);
  const [form, setForm] = useState({ full_name: "", phone: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        phone: user.phone || "",
        location: user.location || "",
      });
    }
  }, [user]);

  const save = async (event) => {
    event.preventDefault();
    const next = {};
    if (form.full_name.trim().length < 2) next.full_name = "Enter your full name.";
    if (form.phone && !/^\+?[1-9]\d{6,14}$/.test(form.phone.replace(/[\s-]/g, ""))) {
      next.phone = "Use an international format such as +919876543210.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      await authApi.updateProfile({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
      });
      await checkUserAuth();
      setPhoneOtp("");
      setPhoneOtpSent(false);
      setPhoneError("");
      toast({ title: "Profile updated", description: "Your details have been saved." });
    } catch (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };


  const requestPhoneOtp = async () => {
    const phone = form.phone.replace(/[\s-]/g, "");
    if (!/^\+?[1-9]\d{6,14}$/.test(phone)) {
      setPhoneError("Save a valid international phone number before requesting a code.");
      return;
    }
    if (phone !== String(user?.phone || "").replace(/[\s-]/g, "")) {
      setPhoneError("Save your new phone number first, then request verification.");
      return;
    }
    setPhoneBusy(true);
    setPhoneError("");
    try {
      await authApi.resendPhoneOtp({ phone });
      setPhoneOtpSent(true);
      toast({ title: "Verification code requested", description: "If SMS is not configured, check the backend terminal in development mode." });
    } catch (error) {
      setPhoneError(error.message || "Could not send the verification code.");
    } finally {
      setPhoneBusy(false);
    }
  };

  const verifyPhoneOtp = async () => {
    if (phoneOtp.length !== 6) return;
    setPhoneBusy(true);
    setPhoneError("");
    try {
      await authApi.verifyPhone({ phone: form.phone.replace(/[\s-]/g, ""), otp: phoneOtp });
      await checkUserAuth();
      setPhoneOtp("");
      setPhoneOtpSent(false);
      toast({ title: "Phone verified", description: "Your phone number has been verified by the backend." });
    } catch (error) {
      setPhoneError(error.message || "The phone verification code was rejected.");
    } finally {
      setPhoneBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile & settings"
        description="Your account details are used by the homes and volunteers you interact with."
        actions={
          <Button variant="outline" className="rounded-full" onClick={() => logout(true)}>
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Log out
          </Button>
        }
      />

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <form onSubmit={save} className="surface p-6 sm:p-7">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary font-heading text-2xl text-primary-foreground">
              {displayName(user).slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-heading text-xl text-foreground">{user?.full_name || displayName(user)}</p>
              <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <StatusPill status="active" />
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {ROLE_LABEL[role] || "Member"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                className="h-11"
                aria-invalid={Boolean(errors.full_name)}
              />
              {errors.full_name && <p className="field-error">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input id="email" value={user?.email || ""} readOnly disabled className="h-11 pl-10" />
              </div>
              <p className="text-xs text-muted-foreground">Your email identifies your account and cannot be changed here.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    placeholder="+919876543210"
                    className="h-11 pl-10"
                    aria-invalid={Boolean(errors.phone)}
                  />
                </div>
                {errors.phone && <p className="field-error">{errors.phone}</p>}
                {user?.isPhoneVerified && form.phone === user.phone ? (
                  <p className="text-xs font-medium text-emerald-700">Phone number verified</p>
                ) : (
                  <div className="space-y-2">
                    <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={requestPhoneOtp} disabled={phoneBusy || !form.phone}>
                      {phoneBusy && !phoneOtpSent ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                      Send phone OTP
                    </Button>
                    {phoneOtpSent && (
                      <div className="flex gap-2">
                        <Input
                          value={phoneOtp}
                          onChange={(event) => setPhoneOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="6-digit code"
                          maxLength={6}
                          className="h-10"
                        />
                        <Button type="button" size="sm" className="rounded-full" onClick={verifyPhoneOtp} disabled={phoneBusy || phoneOtp.length !== 6}>
                          {phoneBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                {phoneError && <p className="field-error">{phoneError}</p>}
                <p className="text-xs text-muted-foreground">If Twilio is not configured, development OTPs are printed in the backend terminal.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(event) => setForm({ ...form, location: event.target.value })}
                    placeholder="City, State"
                    className="h-11 pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="mt-6 h-11 rounded-full" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </form>

        <div className="space-y-5">
          <div className="surface p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              <h2 className="font-heading text-lg text-foreground">Account type</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              You are registered as <strong className="font-semibold text-foreground">{ROLE_LABEL[role] || "a member"}</strong>.
              Your role cannot be changed from this page — it decides which dashboards and records you can access.
            </p>
            {user?.careconnect_role === "organization" && (
              <p className="mt-3 text-xs text-muted-foreground">
                Organisation: <span className="font-medium text-foreground">{user.organization_name || "not named yet"}</span>
              </p>
            )}
          </div>

          <div className="surface p-6">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-accent" aria-hidden="true" />
              <h2 className="font-heading text-lg text-foreground">Password</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Request a one-time email code to set a new password. Codes expire after a short period.
            </p>
            <Button asChild variant="outline" className="mt-4 rounded-full">
              <Link to="/forgot-password">Reset password</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}