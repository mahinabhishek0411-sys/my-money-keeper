import { useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  EXPENSE_CATEGORIES,
  formatCurrency,
  useBudgets,
  type Transaction,
} from "@/lib/expense-store";
import { toast } from "sonner";

export function BudgetPlanner({ transactions }: { transactions: Transaction[] }) {
  const { budgets, upsert } = useBudgets();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const monthlyExpenseByCategory = useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      if (!t.date.startsWith(key)) continue;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return map;
  }, [transactions]);

  const budgetMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of budgets) m.set(b.category, b.amount);
    return m;
  }, [budgets]);

  const handleSave = async (category: string) => {
    const raw = drafts[category];
    if (raw === undefined) return;
    const n = parseFloat(raw);
    if (isNaN(n) || n < 0) {
      toast.error("Enter a valid amount");
      return;
    }
    await upsert(category, n);
    setDrafts((d) => {
      const { [category]: _, ...rest } = d;
      return rest;
    });
    toast.success(n === 0 ? "Budget removed" : "Budget saved");
  };

  const monthName = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center gap-2">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-base font-semibold">Monthly budgets</h3>
          <p className="text-xs text-muted-foreground">{monthName}</p>
        </div>
      </div>

      <ul className="space-y-3">
        {EXPENSE_CATEGORIES.map((cat) => {
          const spent = monthlyExpenseByCategory.get(cat) ?? 0;
          const budget = budgetMap.get(cat) ?? 0;
          const draft = drafts[cat] ?? (budget > 0 ? String(budget) : "");
          const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
          const over = budget > 0 && spent > budget;
          return (
            <li key={cat} className="rounded-xl border bg-background p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">{cat}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={draft}
                    onChange={(e) => setDrafts((d) => ({ ...d, [cat]: e.target.value }))}
                    className="h-8 w-24"
                  />
                  <Button size="sm" variant="outline" onClick={() => handleSave(cat)}>
                    Save
                  </Button>
                </div>
              </div>
              {budget > 0 && (
                <>
                  <Progress value={pct} className="mt-3" />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span className={over ? "text-destructive font-medium" : ""}>
                      {formatCurrency(spent)} spent
                    </span>
                    <span>{formatCurrency(Math.max(0, budget - spent))} left</span>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
