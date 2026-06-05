import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

function mapTx(r: any): Transaction {
  return {
    id: r.id,
    type: r.type,
    amount: Number(r.amount),
    category: r.category,
    description: r.description ?? "",
    date: r.date,
  };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    setTransactions((data ?? []).map(mapTx));
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const add = useCallback(async (t: Omit<Transaction, "id">) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase.from("transactions").insert({
      user_id: userData.user.id,
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: t.date,
    });
    if (error) return toast.error(error.message);
    refresh();
  }, [refresh]);

  const update = useCallback(async (id: string, t: Omit<Transaction, "id">) => {
    const { error } = await supabase
      .from("transactions")
      .update({
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date,
      })
      .eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  }, [refresh]);

  return { transactions, loading, add, update, remove };
}

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("savings_goals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setGoals(
      (data ?? []).map((g: any) => ({
        id: g.id,
        name: g.name,
        target_amount: Number(g.target_amount),
        saved_amount: Number(g.saved_amount),
        target_date: g.target_date,
      })),
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (g: Omit<SavingsGoal, "id">) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { error } = await supabase.from("savings_goals").insert({
        user_id: userData.user.id,
        name: g.name,
        target_amount: g.target_amount,
        saved_amount: g.saved_amount,
        target_date: g.target_date,
      });
      if (error) return toast.error(error.message);
      refresh();
    },
    [refresh],
  );

  const update = useCallback(
    async (id: string, patch: Partial<Omit<SavingsGoal, "id">>) => {
      const { error } = await supabase.from("savings_goals").update(patch).eq("id", id);
      if (error) return toast.error(error.message);
      refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("savings_goals").delete().eq("id", id);
      if (error) return toast.error(error.message);
      refresh();
    },
    [refresh],
  );

  return { goals, add, update, remove };
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.from("budgets").select("*");
    if (error) return toast.error(error.message);
    setBudgets(
      (data ?? []).map((b: any) => ({
        id: b.id,
        category: b.category,
        amount: Number(b.amount),
      })),
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upsert = useCallback(
    async (category: string, amount: number) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      if (amount <= 0) {
        await supabase
          .from("budgets")
          .delete()
          .eq("user_id", userData.user.id)
          .eq("category", category);
      } else {
        const { error } = await supabase
          .from("budgets")
          .upsert(
            { user_id: userData.user.id, category, amount },
            { onConflict: "user_id,category" },
          );
        if (error) return toast.error(error.message);
      }
      refresh();
    },
    [refresh],
  );

  return { budgets, upsert };
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
