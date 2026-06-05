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
  date: string; // ISO yyyy-mm-dd
}

const KEY = "expense-tracker:transactions:v1";

function load(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [];
  }
}

function seed(): Transaction[] {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const back = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return iso(d);
  };
  const sample: Transaction[] = [
    { id: crypto.randomUUID(), type: "income", amount: 4200, category: "Income", description: "Monthly salary", date: back(2) },
    { id: crypto.randomUUID(), type: "expense", amount: 48.5, category: "Food", description: "Groceries", date: back(1) },
    { id: crypto.randomUUID(), type: "expense", amount: 22, category: "Entertainment", description: "Movie night", date: back(3) },
    { id: crypto.randomUUID(), type: "expense", amount: 180, category: "Travel", description: "Train tickets", date: back(5) },
    { id: crypto.randomUUID(), type: "expense", amount: 95, category: "Shopping", description: "New shoes", date: back(7) },
    { id: crypto.randomUUID(), type: "expense", amount: 60, category: "Education", description: "Online course", date: back(10) },
  ];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(sample));
  } catch {}
  return sample;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTransactions(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(transactions));
    } catch {}
  }, [transactions, hydrated]);

  const add = useCallback((t: Omit<Transaction, "id">) => {
    setTransactions((prev) => [{ ...t, id: crypto.randomUUID() }, ...prev]);
  }, []);

  const update = useCallback((id: string, t: Omit<Transaction, "id">) => {
    setTransactions((prev) => prev.map((x) => (x.id === id ? { ...t, id } : x)));
  }, []);

  const remove = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return { transactions, add, update, remove, hydrated };
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
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
