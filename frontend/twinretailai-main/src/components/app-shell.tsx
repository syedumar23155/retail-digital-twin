import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Brain,
  Target,
  Workflow,
  FlaskConical,
  Network,
  Sparkles,
  Search,
  Bell,
  ChevronsLeft,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Executive Command", icon: LayoutDashboard },
  { to: "/twin", label: "Digital Twin Explorer", icon: Users },
  { to: "/prediction", label: "Prediction Lab", icon: Brain },
  { to: "/recommendations", label: "Recommendation Intelligence", icon: Target },
  { to: "/simulator", label: "Journey Simulator", icon: Workflow },
  { to: "/research", label: "Model Observatory", icon: FlaskConical },
  { to: "/architecture", label: "System Architecture", icon: Network },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen w-full flex text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "sticky top-0 h-screen shrink-0 border-r border-white/5 bg-[var(--sidebar)]/80 backdrop-blur-xl transition-all duration-300 z-30",
          collapsed ? "w-[72px]" : "w-[260px]",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[image:var(--gradient-primary)] grid place-items-center shadow-[var(--shadow-glow)]">
                <Sparkles className="w-4 h-4 text-background" strokeWidth={2.5} />
              </div>
              <div className="absolute inset-0 rounded-xl bg-[image:var(--gradient-primary)] blur-md opacity-40 -z-10" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-[13px] font-semibold tracking-tight truncate">Retail Digital Twin</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-[0.14em]">AI Platform</div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {!collapsed && (
              <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
                Workspace
              </div>
            )}
            {NAV.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative",
                    active
                      ? "text-foreground bg-white/[0.04] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[image:var(--gradient-primary)]" />
                  )}
                  <Icon
                    className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/5 p-3">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <ChevronsLeft
                className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")}
              />
              {!collapsed && <span>Collapse</span>}
            </button>
            {!collapsed && (
              <div className="mt-3 px-3 py-3 rounded-lg glass">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-70" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald" />
                  </span>
                  <span className="text-[11px] text-muted-foreground">All models online</span>
                </div>
                <div className="mt-1.5 text-[10px] text-muted-foreground/70 font-mono">
                  v4.2 · us-east
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 border-b border-white/5 bg-background/60 backdrop-blur-xl">
          <div className="h-full px-6 flex items-center gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search customers, products, segments…"
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition"
              />
              <kbd className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 text-[10px] font-mono text-muted-foreground/60 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5">
                ⌘K
              </kbd>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                <span className="text-muted-foreground">Live · Stream ingesting</span>
                <span className="font-mono text-foreground/90">142k events/s</span>
              </div>
              <button className="relative w-10 h-10 grid place-items-center rounded-lg hover:bg-white/5 transition">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose" />
              </button>
              <div className="w-9 h-9 rounded-full bg-[image:var(--gradient-primary)] grid place-items-center text-[11px] font-semibold text-background">
                RD
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}