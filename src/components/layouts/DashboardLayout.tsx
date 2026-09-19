
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Lightbulb,
  Settings,
  Crown,
  MenuIcon,
  X,
  Code2,
  Brain,
  Search as SearchIcon,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AuthMenu } from "@/components/auth/AuthMenu";
import { GlobalSearch, openGlobalSearch } from "@/components/search/GlobalSearch";
import { FloatingAssistant } from "@/components/ai/FloatingAssistant";
import { apiGet } from "@/lib/api";
import { getAuthToken } from "@/lib/authSession";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  pro?: boolean;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Resources", href: "/resources", icon: BookOpen },
    ],
  },
  {
    label: "Learn",
    items: [
      { title: "Practice", href: "/practice", icon: Code2 },
      { title: "Flashcards", href: "/flashcards", icon: Brain },
    ],
  },
  {
    label: "Connect",
    items: [{ title: "Community", href: "/community", icon: Users }],
  },
  {
    label: "Account",
    items: [
      { title: "AI Insights", href: "/insights", icon: Lightbulb, pro: true },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

const COLLAPSE_KEY = "leap_sidebar_collapsed";

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  // Real collapse, not decorative — a dedicated toggle distinct from the
  // account-menu icon, which just opens the account dropdown either way.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      /* private mode — collapse state just won't persist */
    }
  }, [collapsed]);

  useEffect(() => {
    const load = () => {
      if (!getAuthToken()) {
        setFullName(null);
        return;
      }
      apiGet<{ user: { fullName: string } }>("/auth/me")
        .then(({ user }) => setFullName(user.fullName))
        .catch(() => {});
    };
    load();
    // Re-fetch when the session changes (login/logout/account switch) so the
    // header name never shows the previous account's.
    window.addEventListener("leap:auth-change", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("leap:auth-change", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.href;
    return (
      <Link
        to={item.href}
        title={collapsed ? item.title : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-full px-3 py-2 text-[13px] font-medium transition-colors",
          collapsed && "justify-center px-2",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        )}
      >
        <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground")} />
        {!collapsed && <span>{item.title}</span>}
        {!collapsed && item.pro && (
          <span
            className={cn(
              "ml-auto flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-semibold tracking-wide",
              isActive ? "bg-edu-coral text-white" : "bg-sidebar-foreground/10 text-sidebar-foreground/70"
            )}
          >
            PRO
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile navigation */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-3 sm:static sm:h-auto sm:gap-4 sm:px-4 md:hidden">
        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-none bg-sidebar p-0 text-sidebar-foreground">
            <div className="flex h-14 items-center border-b border-sidebar-border px-4">
              <Link to="/" className="flex items-center gap-2">
                <span className="font-marketing text-[22px] font-extrabold tracking-tight text-sidebar-foreground">
                  Leap<span className="text-edu-coral">.ai</span>
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="grid gap-1 p-4">
              {navGroups.flatMap((g) => g.items).map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
              <Link to="/upgrade" className="mt-4">
                <Button className="w-full rounded-full bg-edu-coral hover:bg-edu-coral-dark">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="truncate font-marketing text-xl font-extrabold tracking-tight text-foreground sm:text-[22px]">
            Leap<span className="text-edu-coral">.ai</span>
          </span>
        </Link>          <div className="ml-auto flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <AuthMenu />
        </div>
      </div>

      {/* Desktop navigation — sticky sidebar with its own scroll. The user
          icon and global search stay pinned; only the nav list scrolls. */}
      <div className="flex flex-1 items-start">
        <aside
          className={cn(
            "sticky top-0 hidden h-screen flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
            collapsed ? "w-[76px]" : "w-64"
          )}
        >
          <div className={cn("flex h-14 shrink-0 items-center border-b border-sidebar-border", collapsed ? "justify-center px-2" : "px-4")}>
            {!collapsed && (
              <Link to="/" className="flex items-center gap-2">
                <span className="font-marketing text-[22px] font-extrabold tracking-tight text-sidebar-foreground">
                  Leap<span className="text-edu-coral">.ai</span>
                </span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                !collapsed && "ml-auto"
              )}
            >
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          {!collapsed && (
            <div className="shrink-0 border-b border-sidebar-border px-4 py-3">
              <button
                type="button"
                onClick={openGlobalSearch}
                className="flex w-full items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/50 px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:border-sidebar-ring hover:text-sidebar-accent-foreground"
              >
                <SearchIcon className="h-4 w-4" />
                <span className="flex-1 text-left">Search…</span>
                <kbd className="rounded border border-sidebar-border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
              </button>
            </div>
          )}
          {collapsed && (
            <div className="flex shrink-0 justify-center border-b border-sidebar-border py-3">
              <button
                type="button"
                onClick={openGlobalSearch}
                title="Search"
                className="flex h-9 w-9 items-center justify-center rounded-full text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <SearchIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          <nav className={cn("no-scrollbar grid flex-1 content-start gap-5 overflow-y-auto py-4", collapsed ? "px-2" : "px-3")}>
            {navGroups.map((group) => (
              <div key={group.label} className="grid gap-1">
                {!collapsed && (
                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/40">
                    {group.label}
                  </p>
                )}
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            ))}
          </nav>

          <div className="shrink-0 border-t border-sidebar-border p-3">
            {collapsed ? (
              <Link to="/upgrade" title="Upgrade to Pro" className="flex justify-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent/60 text-edu-coral">
                  <Crown className="h-5 w-5" />
                </span>
              </Link>
            ) : (
              <div className="rounded-3xl bg-sidebar-accent/60 p-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-edu-coral" />
                  <p className="text-[13px] font-semibold text-sidebar-foreground">Unlock everything</p>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/60">
                  Full practice library, scenarios, interview prep &amp; creator content.
                </p>
                <Link to="/upgrade" className="mt-3 block">
                  <Button className="h-8 w-full rounded-full bg-edu-coral text-xs hover:bg-edu-coral-dark">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="hidden items-center justify-between border-b bg-background p-4 md:flex">
            <div></div>
            <div className="flex items-center gap-4">
              {fullName && <span className="text-sm text-muted-foreground">{fullName}</span>}
              <ThemeToggle />
              <AuthMenu />
            </div>
          </div>
          <div className="p-4">{children}</div>
        </main>
      </div>

      <GlobalSearch />
      <FloatingAssistant />
    </div>
  );
}
