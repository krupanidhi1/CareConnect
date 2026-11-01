import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { authApi } from "@/api/careconnect";
import { useAuth } from "@/lib/AuthContext";
import { resolveRole, ROLES, ROLE_LABEL } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HandHeart, Building2, Users, Loader2, ArrowLeft, Check } from "lucide-react";

const OPTIONS = [
  {
    value: ROLES.DONOR,
    icon: HandHeart,
    title: "I want to donate",
    body: "Contribute money, materials or supplies and follow each contribution to delivery.",
  },
  {
    value: ROLES.ORGANIZATION,
    icon: Building2,
    title: "I run an old age home",
    body: "Publish requirements, receive support and manage verification for your organisation.",
  },
  {
    value: ROLES.VOLUNTEER,
    icon: Users,
    title: "I want to volunteer",
    body: "Find opportunities near you, apply, and track your hours and activities.",
  },
];

export default function Onboarding() {
  const { user, checkUserAuth } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("role");
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ phone: "", location: "", organizationName: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState("");

  if (resolveRole(user)) return <Navigate to="/dashboard" replace />;

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!/^\+?[1-9]\d{6,14}$/.test(form.phone.replace(/[\s-]/g, ""))) {
      next.phone = "Enter a valid phone number with country code, e.g. +919876543210.";
    }
    if (form.location.trim().length < 2) next.location = "Tell us your city or region.";
    if (role === ROLES.ORGANIZATION && form.organizationName.trim().length < 2) {
      next.organizationName = "Enter your organisation's name.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async (event) => {
    event.preventDefault();
    if (!role || !validate()) return;
    setSaving(true);
    setFailure("");
    try {
      await authApi.updateProfile({
        careconnect_role: role,
        phone: form.phone.trim(),
        location: form.location.trim(),
        organization_name: role === ROLES.ORGANIZATION ? form.organizationName.trim() : undefined,
      });
      await checkUserAuth();
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFailure(error.message || "We could not save your details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="shell flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-2xl">
          <p className="eyebrow text-center">One last step</p>
          <h1 className="mt-3 text-center font-heading text-[2rem] leading-tight tracking-tight text-foreground sm:text-[2.4rem]">
            {step === "role" ? "How will you use CareConnect?" : "A few details for your account"}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-muted-foreground">
            {step === "role"
              ? "Your choice decides which dashboard and tools you get. It cannot be changed later from your profile."
              : `You're joining as ${ROLE_LABEL[role]?.toLowerCase() || "a member"}. This is how organisations will reach you.`}
          </p>

          {step === "role" ? (
            <div className="mt-9 space-y-3">
              {OPTIONS.map((option) => {
                const active = role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`surface flex w-full items-start gap-4 p-5 text-left transition-all duration-200 ${
                      active ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : "hover:-translate-y-0.5"
                    }`}
                  >
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                        active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
                      }`}
                    >
                      <option.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 font-heading text-lg text-foreground">
                        {option.title}
                        {active && <Check className="h-4 w-4 text-accent" aria-hidden="true" />}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{option.body}</span>
                    </span>
                  </button>
                );
              })}

              <Button className="mt-4 h-12 w-full rounded-full" disabled={!role} onClick={() => setStep("details")}>
                Continue
              </Button>
            </div>
          ) : (
            <form onSubmit={save} className="surface mt-9 space-y-4 p-6 sm:p-8">
              {failure && (
                <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{failure}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="+919876543210"
                  inputMode="tel"
                  className="h-11"
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">City or region</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={update("location")}
                  placeholder="Pune, Maharashtra"
                  className="h-11"
                  aria-invalid={Boolean(errors.location)}
                />
                {errors.location && <p className="field-error">{errors.location}</p>}
              </div>

              {role === ROLES.ORGANIZATION && (
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organisation name</Label>
                  <Input
                    id="organizationName"
                    value={form.organizationName}
                    onChange={update("organizationName")}
                    placeholder="Sunrise Old Age Home"
                    className="h-11"
                    aria-invalid={Boolean(errors.organizationName)}
                  />
                  {errors.organizationName && <p className="field-error">{errors.organizationName}</p>}
                  <p className="text-xs text-muted-foreground">
                    You can add registration documents and verification details from your dashboard.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button type="button" variant="ghost" className="rounded-full" onClick={() => setStep("role")}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
                <Button type="submit" className="h-11 flex-1 rounded-full" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Saving…
                    </>
                  ) : (
                    "Go to my dashboard"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}