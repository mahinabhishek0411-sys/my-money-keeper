import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, PiggyBank, Target, Wallet, Lightbulb, BarChart3, Shield } from "lucide-react";
import { ThemeProvider } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/expense/ThemeToggle";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — MoneyMentor" },
      {
        name: "description",
        content:
          "MoneyMentor is a web-based financial management application designed to help users track expenses, monitor savings goals, plan budgets, and develop better financial habits.",
      },
      { property: "og:title", content: "About — MoneyMentor" },
      {
        property: "og:description",
        content: "Learn more about MoneyMentor — your smart expense and savings tracker.",
      },
    ],
  }),
  component: () => (
    <ThemeProvider>
      <AboutPage />
    </ThemeProvider>
  ),
});

const features = [
  { icon: Wallet, title: "Expense Tracking", text: "Log income and expenses across smart categories." },
  { icon: Target, title: "Savings Goals", text: "Set targets and watch your progress grow." },
  { icon: BarChart3, title: "Budget Planning", text: "Stay on top of monthly spending with alerts." },
  { icon: Lightbulb, title: "Financial Tips", text: "Rotating advice to build better money habits." },
  { icon: Shield, title: "Private by Default", text: "Your data lives in your browser — nothing leaves." },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <PiggyBank className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">MoneyMentor</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <section className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            MoneyMentor
          </h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Smart Expense and Savings Tracker
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-foreground/80 sm:text-base">
            MoneyMentor is a web-based financial management application designed to help users
            track expenses, monitor savings goals, plan budgets, and develop better financial
            habits.
          </p>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Built for students, professionals, and anyone who wants to take control of their money.
        </footer>
      </main>
    </div>
  );
}
