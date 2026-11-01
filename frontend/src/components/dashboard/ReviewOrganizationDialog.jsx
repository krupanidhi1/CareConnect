import React, { useState } from "react";
import { Loader2, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, isApiConfigured } from "@/api/careconnect";
import { toast } from "@/components/ui/use-toast";

export default function ReviewOrganizationDialog({ organization, open, onOpenChange, onReviewed }) {
  const [reason, setReason] = useState("");
  const [decision, setDecision] = useState("approved");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!organization) return null;

  const submit = async () => {
    if (decision === "rejected" && reason.trim().length < 5) {
      setError("Give the organisation a reason for the rejection.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await adminApi.reviewOrganization(organization.id || organization._id, {
        status: decision,
        reason: reason.trim() || undefined,
      });
      toast({
        title: decision === "approved" ? "Organisation approved" : "Organisation rejected",
        description: "The backend confirmed the decision.",
      });
      onReviewed?.();
      onOpenChange(false);
      setReason("");
    } catch (failure) {
      setError(failure.message || "The review could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Review {organization.name || organization.organizationName}
          </DialogTitle>
          <DialogDescription>
            Approving lets this organisation publish requirements and receive donations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

          <div className="rounded-xl border border-border/70 bg-secondary/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Submitted documents</p>
            {Array.isArray(organization.verificationDocuments) && organization.verificationDocuments.length > 0 ? (
              <ul className="mt-2 space-y-1.5 text-sm">
                {organization.verificationDocuments.map((url, index) => /^https:\/\//i.test(url) ? (
                  <li key={`${url}-${index}`}><a className="break-all text-primary underline underline-offset-2" href={url} target="_blank" rel="noreferrer">Open document {index + 1}</a></li>
                ) : null)}
              </ul>
            ) : <p className="mt-2 text-sm text-muted-foreground">No document links were submitted.</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={decision === "approved" ? "default" : "outline"}
              className="h-11 rounded-full"
              onClick={() => setDecision("approved")}
            >
              <Check className="mr-2 h-4 w-4" aria-hidden="true" />
              Approve
            </Button>
            <Button
              type="button"
              variant={decision === "rejected" ? "destructive" : "outline"}
              className="h-11 rounded-full"
              onClick={() => setDecision("rejected")}
            >
              <X className="mr-2 h-4 w-4" aria-hidden="true" />
              Reject
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              {decision === "rejected" ? "Reason for rejection" : "Internal note (optional)"}
            </Label>
            <Textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={decision === "rejected" ? "Documents did not match the registration details…" : "Verified against registration certificate."}
            />
          </div>

          {!isApiConfigured() && (
            <p className="rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
              The CareConnect API is not connected, so this decision cannot be saved.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="rounded-full" onClick={submit} disabled={saving || !isApiConfigured()}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save decision"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}