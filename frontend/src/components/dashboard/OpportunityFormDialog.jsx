import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { opportunitiesApi, isApiConfigured } from "@/api/careconnect";
import { toast } from "@/components/ui/use-toast";

const EMPTY = { title: "", description: "", location: "", category: "Companionship", date: "", slots: "5" };

export default function OpportunityFormDialog({ open, onOpenChange, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setError("");
    }
  }, [open]);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (form.title.trim().length < 4 || form.description.trim().length < 10 || form.location.trim().length < 2 || Number(form.slots) < 1) {
      setError("Enter a clear title, description, location and at least one volunteer place.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await opportunitiesApi.create({
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        category: form.category.trim() || "General",
        date: form.date || undefined,
        slots: Number(form.slots),
      });
      toast({ title: "Opportunity published", description: "The backend confirmed the opportunity." });
      onCreated?.();
      onOpenChange(false);
    } catch (failure) {
      setError(failure.message || "The opportunity could not be published.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Publish a volunteer opportunity</DialogTitle>
          <DialogDescription>Give volunteers a clear description of the work, location and available places.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="opportunity-title">Title</Label>
            <Input id="opportunity-title" value={form.title} onChange={update("title")} placeholder="Weekend companionship visits" className="h-11" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="opportunity-description">Description</Label>
            <Textarea id="opportunity-description" value={form.description} onChange={update("description")} rows={4} placeholder="Describe what volunteers will do…" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="opportunity-location">Location</Label>
              <Input id="opportunity-location" value={form.location} onChange={update("location")} placeholder="City, area" className="h-11" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opportunity-category">Category</Label>
              <Input id="opportunity-category" value={form.category} onChange={update("category")} placeholder="Companionship" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opportunity-date">Date</Label>
              <Input id="opportunity-date" type="date" value={form.date} onChange={update("date")} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opportunity-slots">Volunteer places</Label>
              <Input id="opportunity-slots" type="number" min="1" max="500" value={form.slots} onChange={update("slots")} className="h-11" required />
            </div>
          </div>
          {!isApiConfigured() && <p className="rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">The CareConnect API is not connected, so this opportunity cannot be published.</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="rounded-full" disabled={saving || !isApiConfigured()}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing…</> : "Publish opportunity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
