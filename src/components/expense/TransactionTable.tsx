import { Pencil, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, type Transaction } from "@/lib/expense-store";

const categoryStyles: Record<string, string> = {
  Food: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Travel: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  Shopping: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  Education: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Entertainment: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Others: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  Income: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionTable({ transactions, onEdit, onDelete }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <p className="text-sm font-medium">No transactions found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try a different search, or add your first transaction.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        t.type === "income"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {t.type === "income" ? (
                        <ArrowDownRight className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </span>
                    {t.description}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`border-0 ${categoryStyles[t.category] ?? ""}`}>
                    {t.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(t.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell
                  className={`text-right font-semibold tabular-nums ${
                    t.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {t.type === "income" ? "+" : "−"}
                  {formatCurrency(t.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(t)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(t.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {transactions.map((t) => (
          <div key={t.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    t.type === "income"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {t.type === "income" ? (
                    <ArrowDownRight className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium">{t.description}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className={`border-0 text-[10px] ${categoryStyles[t.category] ?? ""}`}>
                      {t.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
              <p
                className={`font-semibold tabular-nums ${
                  t.type === "income"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {t.type === "income" ? "+" : "−"}
                {formatCurrency(t.amount)}
              </p>
            </div>
            <div className="mt-3 flex justify-end gap-1">
              <Button variant="ghost" size="sm" onClick={() => onEdit(t)}>
                <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(t.id)}>
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
