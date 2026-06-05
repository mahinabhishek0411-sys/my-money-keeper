import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { EXPENSE_CATEGORIES, formatCurrency, type Transaction } from "@/lib/expense-store";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-muted-foreground)",
];

export function CategoryPieChart({ transactions }: { transactions: Transaction[] }) {
  const data = useMemo(() => {
    const totals = new Map<string, number>();
    for (const c of EXPENSE_CATEGORIES) totals.set(c, 0);
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
    }
    return Array.from(totals.entries())
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
  }, [transactions]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-4">
        <h3 className="text-base font-semibold">Spending by category</h3>
        <p className="text-xs text-muted-foreground">All-time expenses breakdown</p>
      </div>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No expenses yet
        </div>
      ) : (
        <div className="grid items-center gap-4 sm:grid-cols-[1fr_1fr]">
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="var(--color-card)"
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-popover-foreground)",
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2">
            {data
              .slice()
              .sort((a, b) => b.value - a.value)
              .map((d, i) => {
                const pct = total ? (d.value / total) * 100 : 0;
                return (
                  <li key={d.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      {d.name}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatCurrency(d.value)} · {pct.toFixed(0)}%
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
}
