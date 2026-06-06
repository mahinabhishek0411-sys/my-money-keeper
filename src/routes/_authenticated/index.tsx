import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Download,
  Plus,
  Search,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
} from "lucide-react";
import { Toaster, toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ThemeProvider } from "@/lib/theme";
import {
  downloadCSV,
  EXPENSE_CATEGORIES,
  formatCurrency,
  useTransactions,
  type Transaction,
} from "@/lib/expense-store";

import { StatCard } from "@/components/expense/StatCard";
import { TransactionForm } from "@/components/expense/TransactionForm";
import { TransactionTable } from "@/components/expense/TransactionTable";
import { MonthlyChart } from "@/components/expense/MonthlyChart";
import { CategoryPieChart } from "@/components/expense/CategoryPieChart";
import { SavingsGoals } from "@/components/expense/SavingsGoals";
import { BudgetPlanner } from "@/components/expense/BudgetPlanner";
import { ThemeToggle } from "@/components/expense/ThemeToggle";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Pennywise — Personal Expense Tracker" },
      {
        name: "description",
        content:
          "Track income, expenses, savings goals, and monthly budgets in one beautiful dashboard.",
      },
    ],
  }),
  component: () => (
    <ThemeProvider>
      <ExpenseApp />
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  ),
});

function ExpenseApp() {
  const navigate = useNavigate();
  const { transactions, add, update, remove } = useTransactions();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { income, expense, balance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions
      .filter((t) => (filterType === "all" ? true : t.type === filterType))
      .filter((t) => (filterCategory === "all" ? true : t.category === filterCategory))
      .filter((t) =>
        q
          ? t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            String(t.amount).includes(q)
          : true,
      )
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, search, filterType, filterCategory]);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (t: Transaction) => {
    setEditing(t);
    setFormOpen(true);
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    downloadCSV(filtered);
    toast.success("Exported as CSV");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Pennywise</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Your personal expense tracker
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="hidden sm:inline-flex">
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
            <Button size="sm" onClick={openNew}>
              <Plus className="mr-1.5 h-4 w-4" /> Add
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total income"
            value={formatCurrency(income)}
            icon={TrendingUp}
            variant="success"
            hint="All time"
          />
          <StatCard
            label="Total expenses"
            value={formatCurrency(expense)}
            icon={TrendingDown}
            variant="destructive"
            hint="All time"
          />
          <StatCard
            label="Balance"
            value={formatCurrency(balance)}
            icon={Wallet}
            variant="primary"
            hint={balance >= 0 ? "You're in the green" : "Spending exceeds income"}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <MonthlyChart transactions={transactions} />
          <CategoryPieChart transactions={transactions} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <BudgetPlanner transactions={transactions} />
          <SavingsGoals />
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Transactions</h2>
              <p className="text-xs text-muted-foreground">
                {filtered.length} of {transactions.length}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="sm:hidden">
              <Download className="mr-1.5 h-4 w-4" /> Export CSV
            </Button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search description, category, amount…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
              <SelectTrigger className="sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="Income">Income</SelectItem>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5">
            <TransactionTable
              transactions={filtered}
              onEdit={openEdit}
              onDelete={(id) => setDeleteId(id)}
            />
          </div>
        </section>

        <footer className="pt-2 pb-4 text-center text-xs text-muted-foreground">
          Synced securely to your account
        </footer>
      </main>

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSubmit={(t) => {
          if (editing) update(editing.id, t);
          else add(t);
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  remove(deleteId);
                  toast.success("Transaction deleted");
                }
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
