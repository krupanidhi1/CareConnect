import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { donationsApi, isApiConfigured } from "@/api/careconnect";
import RequirementBar from "@/components/common/RequirementBar";
import { toast } from "@/components/ui/use-toast";

export default function DonationDialog({ requirement, open, onOpenChange, onCreated }) {
  const [form, setForm] = useState({ quantity: "", amount: "", message: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ quantity: "", amount: "", message: "" });
      setError("");
    }
  }, [open, requirement]);

  if (!requirement) return null;

  const submit = async (event) => {
    event.preventDefault();
    const quantity = Number(form.quantity) || 0;
    const amount = Number(form.amount) || 0;
    if (quantity <= 0 && amount <= 0) {
      setError("Enter a quantity or an amount to contribute.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await donationsApi.create({
        requirement_id: requirement.id || requirement._id,
        organization_id: requirement.organizationId || requirement.organization_id,
        type: quantity > 0 ? "goods" : "money",
        quantity,
        amount,
        unit: requirement.unit || "",
        note: form.message.trim(),
      });
      toast({ title: "Contribution submitted", description: "The home will confirm it from their dashboard." });
      onCreated?.();
      onOpenChange(false);
    } catch (failure) {
      setError(failure.message || "Your contribution could not be submitted.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Contribute to “{requirement.title}”</DialogTitle>
          <DialogDescription>
            {requirement.organizationName ? `${requirement.organizationName} · ` : ""}
            {requirement.category}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
          <RequirementBar received={requirement.receivedQuantity} required={requirement.requiredQuantity} />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Amount entries are recorded as pledges in this version. Online payment processing is not enabled.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity{requirement.unit ? ` (${requirement.unit})` : ""}</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={form.quantity}
                onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                placeholder="0"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount pledged (₹)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                placeholder="0"
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message to the home</Label>
            <Textarea
              id="message"
              rows={3}
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              placeholder="Optional note about your contribution…"
            />
          </div>

          {!isApiConfigured() && (
            <p className="rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
              The CareConnect API is not connected, so this contribution cannot be recorded yet.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-full" disabled={saving || !isApiConfigured()}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Submitting…
                </>
              ) : (
                "Submit contribution"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}