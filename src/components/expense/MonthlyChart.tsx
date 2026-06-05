import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Transaction } from "@/lib/expense-store";
import { formatCurrency } from "@/lib/expense-store";

export function MonthlyChart({ transactions }: { transactions: Transaction[] }) {
  const data = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        key,
        label: d.toLocaleString("en-US", { month: "short" }),
        income: 0,
        expense: 0,
      });
    }
    const map = new Map(months.map((m) => [m.key, m]));
    for (const t of transactions) {
      const key = t.date.slice(0, 7);
      const m = map.get(key);
      if (!m) continue;
      if (t.type === "income") m.income += t.amount;
      else m.expense += t.amount;
    }
    return months;
  }, [transactions]);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Monthly overview</h3>
          <p className="text-xs text-muted-foreground">Last 6 months</p>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                color: "var(--color-popover-foreground)",
              }}
              formatter={(v: number) => formatCurrency(v)}
            />
            <Bar dataKey="income" fill="var(--color-success)" radius={[6, 6, 0, 0]} maxBarSize={36} />
            <Bar dataKey="expense" fill="var(--color-destructive)" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" /> Income
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-destructive)]" /> Expense
        </span>
      </div>
    </div>
  );
}
