import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { applicationsApi, isApiConfigured } from "@/api/careconnect";
import { toast } from "@/components/ui/use-toast";

export default function ApplyDialog({ opportunity, open, onOpenChange, onApplied }) {
  const [form, setForm] = useState({ message: "", availability: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ message: "", availability: "" });
      setError("");
    }
  }, [open, opportunity]);

  if (!opportunity) return null;

  const submit = async (event) => {
    event.preventDefault();
    if (form.message.trim().length < 10) {
      setError("Tell the organisation a little about how you can help.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await applicationsApi.apply({
        opportunity_id: opportunity.id || opportunity._id,
        message: form.message.trim(),
        availability: form.availability.trim(),
      });
      toast({ title: "Application sent", description: "The organisation will review your request." });
      onApplied?.();
      onOpenChange(false);
    } catch (failure) {
      setError(failure.message || "Your application could not be sent.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Apply to volunteer</DialogTitle>
          <DialogDescription>
            {opportunity.title}
            {opportunity.organizationName ? ` · ${opportunity.organizationName}` : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="availability">When are you available?</Label>
            <Input
              id="availability"
              value={form.availability}
              onChange={(event) => setForm({ ...form, availability: event.target.value })}
              placeholder="Weekends, 10am – 2pm"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your message</Label>
            <Textarea
              id="message"
              rows={4}
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              placeholder="Share your experience and how you would like to help…"
            />
          </div>

          {!isApiConfigured() && (
            <p className="rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
              The CareConnect API is not connected, so this application cannot be recorded yet.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="rounded-full" disabled={saving || !isApiConfigured()}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Sending…
                </>
              ) : (
                "Send application"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}