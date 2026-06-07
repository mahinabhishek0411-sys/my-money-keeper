import { useEffect, useState, useCallback } from "react";

export type TxType = "income" | "expense";
export type Category =
  | "Food"
  | "Travel"
  | "Shopping"
  | "Education"
  | "Entertainment"
  | "Others"
  | "Income";

export const EXPENSE_CATEGORIES: Category[] = [
  "Food",
  "Travel",
  "Shopping",
  "Education",
  "Entertainment",
  "Others",
];

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: Category;
  description: string;
  date: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
}

const KEYS = {
  transactions: "pennywise.transactions",
  goals: "pennywise.savings_goals",
  budgets: "pennywise.budgets",
  primaryGoal: "moneymentor.primary_goal",
  monthlyBudget: "moneymentor.monthly_budget",
};

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTransactions(load<Transaction>(KEYS.transactions));
    setLoading(false);
  }, []);

  const persist = (next: Transaction[]) => {
    setTransactions(next);
    save(KEYS.transactions, next);
  };

  const add = useCallback((t: Omit<Transaction, "id">) => {
    persist([{ ...t, id: uid() }, ...load<Transaction>(KEYS.transactions)]);
  }, []);

  const update = useCallback((id: string, t: Omit<Transaction, "id">) => {
    const next = load<Transaction>(KEYS.transactions).map((x) =>
      x.id === id ? { ...t, id } : x,
    );
    persist(next);
  }, []);

  const remove = useCallback((id: string) => {
    persist(load<Transaction>(KEYS.transactions).filter((x) => x.id !== id));
  }, []);

  return { transactions, loading, add, update, remove };
}

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  useEffect(() => {
    setGoals(load<SavingsGoal>(KEYS.goals));
  }, []);

  const persist = (next: SavingsGoal[]) => {
    setGoals(next);
    save(KEYS.goals, next);
  };

  const add = useCallback((g: Omit<SavingsGoal, "id">) => {
    persist([{ ...g, id: uid() }, ...load<SavingsGoal>(KEYS.goals)]);
  }, []);

  const update = useCallback(
    (id: string, patch: Partial<Omit<SavingsGoal, "id">>) => {
      const next = load<SavingsGoal>(KEYS.goals).map((g) =>
        g.id === id ? { ...g, ...patch } : g,
      );
      persist(next);
    },
    [],
  );

  const remove = useCallback((id: string) => {
    persist(load<SavingsGoal>(KEYS.goals).filter((g) => g.id !== id));
  }, []);

  return { goals, add, update, remove };
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    setBudgets(load<Budget>(KEYS.budgets));
  }, []);

  const upsert = useCallback((category: string, amount: number) => {
    const current = load<Budget>(KEYS.budgets);
    let next: Budget[];
    if (amount <= 0) {
      next = current.filter((b) => b.category !== category);
    } else {
      const existing = current.find((b) => b.category === category);
      if (existing) {
        next = current.map((b) =>
          b.category === category ? { ...b, amount } : b,
        );
      } else {
        next = [...current, { id: uid(), category, amount }];
      }
    }
    setBudgets(next);
    save(KEYS.budgets, next);
  }, []);

  return { budgets, upsert };
}

function loadNumber(key: string): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(key);
  const n = raw ? parseFloat(raw) : 0;
  return isNaN(n) ? 0 : n;
}

export function usePrimaryGoal() {
  const [target, setTargetState] = useState(0);
  useEffect(() => setTargetState(loadNumber(KEYS.primaryGoal)), []);
  const setTarget = useCallback((n: number) => {
    setTargetState(n);
    if (typeof window !== "undefined") localStorage.setItem(KEYS.primaryGoal, String(n));
  }, []);
  return { target, setTarget };
}

export function useMonthlyBudget() {
  const [budget, setBudgetState] = useState(0);
  useEffect(() => setBudgetState(loadNumber(KEYS.monthlyBudget)), []);
  const setBudget = useCallback((n: number) => {
    setBudgetState(n);
    if (typeof window !== "undefined") localStorage.setItem(KEYS.monthlyBudget, String(n));
  }, []);
  return { budget, setBudget };
}

export function toCSV(rows: Transaction[]): string {
  const header = ["id", "type", "amount", "category", "description", "date"];
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push([r.id, r.type, r.amount, r.category, r.description, r.date].map(esc).join(","));
  }
  return lines.join("\n");
}

export function downloadCSV(rows: Transaction[]) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);
}
