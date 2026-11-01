import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, PRIORITIES } from "@/lib/roles";
import { isApiConfigured, requirementsApi } from "@/api/careconnect";
import { toast } from "@/components/ui/use-toast";

const BLANK = {
  title: "",
  description: "",
  category: "Food",
  requiredQuantity: "",
  unit: "",
  priority: "medium",
  deadline: "",
};

export default function RequirementFormDialog({ open, onOpenChange, requirement, onSaved }) {
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");
  const [saving, setSaving] = useState(false);
  const editing = Boolean(requirement);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setFailure("");
    setForm(
      requirement
        ? {
            title: requirement.title || "",
            description: requirement.description || "",
            category: requirement.category || "Food",
            requiredQuantity: String(requirement.requiredQuantity ?? ""),
            unit: requirement.unit || "",
            priority: requirement.priority || "medium",
            deadline: (requirement.deadline || "").slice(0, 10),
          }
        : BLANK
    );
  }, [open, requirement]);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (form.title.trim().length < 4) next.title = "Give the requirement a clear title.";
    if (form.description.trim().length < 10) next.description = "Describe what is needed in a sentence or two.";
    if (!Number(form.requiredQuantity) || Number(form.requiredQuantity) <= 0) {
      next.requiredQuantity = "Required quantity must be greater than zero.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setFailure("");
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      quantity: Number(form.requiredQuantity),
      dueDate: form.deadline || undefined,
    };
    try {
      if (editing) await requirementsApi.update(requirement.id || requirement._id, payload);
      else await requirementsApi.create(payload);
      toast({
        title: editing ? "Requirement updated" : "Requirement published",
        description: "The change was confirmed by the backend.",
      });
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      setFailure(error.message || "The requirement could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {editing ? "Edit requirement" : "Publish a requirement"}
          </DialogTitle>
          <DialogDescription>
            Donors see this immediately. Quantities and progress stay editable.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {failure && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{failure}</p>}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={update("title")} placeholder="50 kg rice for the month" className="h-11" aria-invalid={Boolean(errors.title)} />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} value={form.description} onChange={update("description")} placeholder="Explain the need and how it will be used…" aria-invalid={Boolean(errors.description)} />
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
                <SelectTrigger className="h-11 capitalize"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority} className="capitalize">{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="requiredQuantity">Required</Label>
              <Input id="requiredQuantity" type="number" min="1" value={form.requiredQuantity} onChange={update("requiredQuantity")} placeholder="50" className="h-11" aria-invalid={Boolean(errors.requiredQuantity)} />
              {errors.requiredQuantity && <p className="field-error">{errors.requiredQuantity}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" value={form.unit} onChange={update("unit")} placeholder="kg, pieces" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Needed by</Label>
              <Input id="deadline" type="date" value={form.deadline} onChange={update("deadline")} className="h-11" />
            </div>
          </div>

          {!isApiConfigured() && (
            <p className="rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
              The CareConnect API is not connected, so this requirement cannot be saved yet.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="rounded-full" disabled={saving || !isApiConfigured()}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : editing ? (
                "Save changes"
              ) : (
                "Publish requirement"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}