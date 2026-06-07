import { useEffect, useState } from "react";
import { Target, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency, usePrimaryGoal } from "@/lib/expense-store";

export function SavingsGoalCard({ balance }: { balance: number }) {
  const { target, setTarget } = usePrimaryGoal();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (open) setDraft(target > 0 ? String(target) : "");
  }, [open, target]);

  const saved = Math.max(0, balance);
  const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Savings Goal</h3>
            <p className="text-xs text-muted-foreground">
              {target > 0 ? "Keep going — you got this" : "Set a target to start"}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" /> {target > 0 ? "Edit" : "Set"}
        </Button>
      </div>

      {target > 0 ? (
        <>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-semibold tracking-tight">{formatCurrency(saved)}</p>
              <p className="text-xs text-muted-foreground">of {formatCurrency(target)}</p>
            </div>
            <p className="text-2xl font-semibold text-primary">{pct.toFixed(0)}%</p>
          </div>
          <Progress value={pct} className="mt-3" />
        </>
      ) : (
        <p className="py-4 text-sm text-muted-foreground">
          Click "Set" to define your savings target.
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Set savings target</DialogTitle>
            <DialogDescription>Your current balance counts toward this goal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="goal-target">Target amount</Label>
            <Input
              id="goal-target"
              type="number"
              min="0"
              step="0.01"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                const n = parseFloat(draft);
                setTarget(isNaN(n) || n < 0 ? 0 : n);
                setOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
