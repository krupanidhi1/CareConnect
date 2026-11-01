import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { organizationsApi, isApiConfigured } from "@/api/careconnect";
import { toast } from "@/components/ui/use-toast";

export default function OrganizationVerificationDialog({ open, onOpenChange, onSubmitted }) {
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setError("");
  }, [open]);

  const submit = async (event) => {
    event.preventDefault();
    const links = documents.split("\n").map((value) => value.trim()).filter(Boolean);
    if (description.trim().length < 10 || links.length === 0 || links.some((link) => !/^https:\/\//i.test(link))) {
      setError("Add a short organisation description and at least one HTTPS link to a registration or supporting document.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await organizationsApi.submitVerification({ description: description.trim(), documents: links });
      toast({ title: "Verification submitted", description: "Your organisation is now awaiting administrator review." });
      onSubmitted?.();
      onOpenChange(false);
    } catch (failure) {
      setError(failure.message || "Your verification request could not be submitted.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Submit organisation verification</DialogTitle>
          <DialogDescription>Provide a short description and secure HTTPS links that an administrator can review.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="verification-description">Organisation description</Label>
            <Textarea id="verification-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Describe your home and the care you provide…" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="verification-documents">Document links (one HTTPS link per line)</Label>
            <Textarea id="verification-documents" value={documents} onChange={(event) => setDocuments(event.target.value)} rows={4} placeholder="https://…" required />
            <p className="text-xs text-muted-foreground">This build accepts document links/references, not direct file uploads. Ensure the reviewing administrator can access each link.</p>
          </div>
          {!isApiConfigured() && <p className="rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">The CareConnect API is not connected, so verification cannot be submitted.</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="rounded-full" disabled={saving || !isApiConfigured()}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</> : "Submit for review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
