import { useEffect, useMemo, useState } from "react";
import { Wallet, Pencil, AlertTriangle, CheckCircle2 } from "lucide-react";
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
import { formatCurrency, useMonthlyBudget, type Transaction } from "@/lib/expense-store";

export function BudgetStatusCard({ transactions }: { transactions: Transaction[] }) {
  const { budget, setBudget } = useMonthlyBudget();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (open) setDraft(budget > 0 ? String(budget) : "");
  }, [open, budget]);

  const spent = useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(key))
      .reduce((a, b) => a + b.amount, 0);
  }, [transactions]);

  const pct = budget > 0 ? (spent / budget) * 100 : 0;
  const status =
    budget === 0
      ? "none"
      : pct > 100
        ? "over"
        : pct >= 80
          ? "warn"
          : "ok";

  const statusStyles = {
    ok: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    warn: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    over: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    none: "bg-muted text-muted-foreground border-border",
  }[status];

  const statusLabel = {
    ok: "Within budget",
    warn: "Approaching limit",
    over: "Budget exceeded",
    none: "Not set",
  }[status];

  const StatusIcon = status === "ok" ? CheckCircle2 : AlertTriangle;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Monthly Budget</h3>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" /> {budget > 0 ? "Edit" : "Set"}
        </Button>
      </div>

      {budget > 0 ? (
        <>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-semibold tracking-tight">{formatCurrency(spent)}</p>
              <p className="text-xs text-muted-foreground">of {formatCurrency(budget)} budget</p>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {statusLabel}
            </span>
          </div>
          <Progress value={Math.min(100, pct)} className="mt-3" />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {pct.toFixed(0)}% used
          </p>
        </>
      ) : (
        <p className="py-4 text-sm text-muted-foreground">
          Set a monthly budget to track your spending.
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Set monthly budget</DialogTitle>
            <DialogDescription>Compare total expenses against this limit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="budget-amount">Monthly budget</Label>
            <Input
              id="budget-amount"
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
                setBudget(isNaN(n) || n < 0 ? 0 : n);
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
