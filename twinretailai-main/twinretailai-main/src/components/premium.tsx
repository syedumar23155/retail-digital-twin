import { cn } from "@/lib/utils";
import type { ReactNode, ComponentType } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 pb-8 border-b border-white/5">
      <div className="min-w-0 max-w-3xl">
        {eyebrow && (
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-medium mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-primary/60" />
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function GlassCard({
  className,
  children,
  glow,
}: {
  className?: string;
  children: ReactNode;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl glass-strong overflow-hidden",
        glow && "shadow-[var(--shadow-glow)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon?: ComponentType<{ className?: string }>;
  accent?: "primary" | "violet" | "emerald" | "amber" | "rose";
}) {
  const accentMap: Record<string, string> = {
    primary: "from-primary/20 to-transparent text-primary",
    violet: "from-violet/20 to-transparent text-violet",
    emerald: "from-emerald/20 to-transparent text-emerald",
    amber: "from-amber/20 to-transparent text-amber",
    rose: "from-rose/20 to-transparent text-rose",
  };
  const positive = (delta ?? 0) >= 0;
  return (
    <GlassCard className="p-5 group hover:border-white/15 transition">
      <div className={cn("absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br blur-3xl opacity-60 pointer-events-none", accentMap[accent])} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
          {label}
        </div>
        {Icon && (
          <div className={cn("w-8 h-8 rounded-lg grid place-items-center bg-white/[0.04] border border-white/5", accentMap[accent].split(" ").pop())}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="relative mt-3 flex items-baseline gap-2">
        <div className="text-3xl font-semibold tracking-tight font-display">{value}</div>
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-md",
              positive ? "text-emerald bg-emerald/10" : "text-rose bg-rose/10",
            )}
          >
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      {hint && <div className="relative mt-1.5 text-xs text-muted-foreground">{hint}</div>}
    </GlassCard>
  );
}

export function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <div className="text-base font-semibold tracking-tight">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

export function Chip({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "primary" | "violet" | "emerald" | "amber" | "rose";
  className?: string;
}) {
  const map: Record<string, string> = {
    default: "bg-white/5 text-muted-foreground border-white/10",
    primary: "bg-primary/10 text-primary border-primary/20",
    violet: "bg-violet/10 text-violet border-violet/20",
    emerald: "bg-emerald/10 text-emerald border-emerald/20",
    amber: "bg-amber/10 text-amber border-amber/20",
    rose: "bg-rose/10 text-rose border-rose/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border",
        map[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}