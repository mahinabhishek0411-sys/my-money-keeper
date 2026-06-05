import { useState } from "react";
import { Plus, Target, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency, useSavingsGoals, type SavingsGoal } from "@/lib/expense-store";
import { toast } from "sonner";

export function SavingsGoals() {
  const { goals, add, update, remove } = useSavingsGoals();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [date, setDate] = useState("");

  const reset = () => {
    setEditing(null);
    setName("");
    setTarget("");
    setSaved("");
    setDate("");
  };

  const openNew = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (g: SavingsGoal) => {
    setEditing(g);
    setName(g.name);
    setTarget(String(g.target_amount));
    setSaved(String(g.saved_amount));
    setDate(g.target_date ?? "");
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = parseFloat(target);
    const s = parseFloat(saved || "0");
    if (!name.trim() || !t || t <= 0) {
      toast.error("Enter a name and target amount");
      return;
    }
    const payload = {
      name: name.trim(),
      target_amount: t,
      saved_amount: Math.max(0, s),
      target_date: date || null,
    };
    if (editing) await update(editing.id, payload);
    else await add(payload);
    toast.success(editing ? "Goal updated" : "Goal added");
    setOpen(false);
    reset();
  };

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Savings goals</h3>
          <p className="text-xs text-muted-foreground">Track progress toward what matters</p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="mr-1.5 h-4 w-4" /> Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
          <Target className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">No goals yet</p>
          <p className="text-xs text-muted-foreground">Add a target like a vacation or emergency fund.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {goals.map((g) => {
            const pct = Math.min(100, (g.saved_amount / g.target_amount) * 100);
            return (
              <li key={g.id} className="rounded-xl border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{g.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(g.saved_amount)} of {formatCurrency(g.target_amount)}
                      {g.target_date && ` · by ${new Date(g.target_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(g)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(g.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Progress value={pct} className="mt-3" />
                <p className="mt-1 text-right text-xs text-muted-foreground">{pct.toFixed(0)}%</p>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit goal" : "New savings goal"}</DialogTitle>
            <DialogDescription>Set a target and track your progress.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="g-name">Name</Label>
              <Input id="g-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Emergency fund" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="g-target">Target</Label>
                <Input id="g-target" type="number" min="0" step="0.01" value={target} onChange={(e) => setTarget(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="g-saved">Saved so far</Label>
                <Input id="g-saved" type="number" min="0" step="0.01" value={saved} onChange={(e) => setSaved(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-date">Target date (optional)</Label>
              <Input id="g-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save" : "Add goal"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
