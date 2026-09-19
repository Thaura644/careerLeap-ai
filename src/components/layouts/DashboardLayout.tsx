
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

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const [fullName, setFullName] = useState<string | null>(null);

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
        className={cn(
          "group relative flex items-center gap-3 rounded-full px-3 py-2 text-[13px] font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-white"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white"
        )}
      >
        <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-white")} />
        <span>{item.title}</span>
        {item.pro && (
          <span
            className={cn(
              "ml-auto flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-semibold tracking-wide",
              isActive ? "bg-edu-coral text-white" : "bg-white/10 text-sidebar-foreground/70"
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
                <span className="font-marketing text-[22px] font-extrabold tracking-tight text-white">
                  Leap<span className="text-edu-coral">.ai</span>
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
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
        <aside className="sticky top-0 hidden h-screen w-64 flex-col bg-sidebar text-sidebar-foreground md:flex">
          <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-marketing text-[22px] font-extrabold tracking-tight text-white">
                Leap<span className="text-edu-coral">.ai</span>
              </span>
            </Link>
            <div className="ml-auto">
              <AuthMenu />
            </div>
          </div>

          <div className="shrink-0 border-b border-sidebar-border px-4 py-3">
            <button
              type="button"
              onClick={openGlobalSearch}
              className="flex w-full items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/50 px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:border-sidebar-ring hover:text-white"
            >
              <SearchIcon className="h-4 w-4" />
              <span className="flex-1 text-left">Search…</span>
              <kbd className="rounded border border-sidebar-border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
            </button>
          </div>

          <nav className="grid flex-1 content-start gap-5 overflow-y-auto px-3 py-4">
            {navGroups.map((group) => (
              <div key={group.label} className="grid gap-1">
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/40">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            ))}
          </nav>

          <div className="shrink-0 border-t border-sidebar-border p-3">
            <div className="rounded-3xl bg-sidebar-accent/60 p-4">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-edu-coral" />
                <p className="text-[13px] font-semibold text-white">Unlock everything</p>
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
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="hidden items-center justify-between border-b bg-background p-4 md:flex">
            <div></div>
            <div className="flex items-center gap-4">
              {fullName && <span className="text-sm text-muted-foreground">{fullName}</span>}
              <ThemeToggle />
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
