import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";

const TIPS = [
  "Save before you spend — pay yourself first.",
  "Track small expenses regularly; they add up fast.",
  "Avoid unnecessary purchases — wait 24 hours before buying.",
  "Maintain an emergency fund of 3–6 months of expenses.",
  "Review your budget every month and adjust as needed.",
  "Set clear savings goals with a target date.",
  "Cook at home more often — eating out drains your wallet.",
  "Automate your savings to stay consistent.",
];

export function MoneyMentorTips() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-semibold">MoneyMentor Tips</h3>
          <p className="text-xs text-muted-foreground">Rotating financial wisdom</p>
        </div>
      </div>
      <p key={index} className="animate-in fade-in slide-in-from-bottom-1 text-sm leading-relaxed text-foreground/90">
        “{TIPS[index]}”
      </p>
      <div className="mt-4 flex gap-1.5">
        {TIPS.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i === index ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>
    </div>
  );
}
