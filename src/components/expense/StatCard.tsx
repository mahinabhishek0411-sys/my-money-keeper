import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  variant?: "primary" | "success" | "destructive";
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, variant = "primary", hint }: StatCardProps) {
  const gradient =
    variant === "success"
      ? "var(--gradient-success)"
      : variant === "destructive"
        ? "var(--gradient-destructive)"
        : "var(--gradient-primary)";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 text-white",
        "shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5",
      )}
      style={{ background: gradient }}
    >
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-white/70">{hint}</p>}
        </div>
        <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
