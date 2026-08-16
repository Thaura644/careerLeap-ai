
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
          "group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
        )}
        <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
        <span>{item.title}</span>
        {item.pro && (
          <span
            className={cn(
              "ml-auto flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-semibold tracking-wide",
              isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
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
      <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto md:hidden">
        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-14 items-center border-b px-4">
              <Link to="/" className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-leap-navy to-leap-purple bg-clip-text text-transparent">
                  Leap.ai
                </span>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto" 
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
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-leap-navy to-leap-purple bg-clip-text text-transparent">
            Leap.ai
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <AuthMenu />
        </div>
      </div>

      {/* Desktop navigation — sticky sidebar with its own scroll. The user
          icon and global search stay pinned; only the nav list scrolls. */}
      <div className="flex flex-1 items-start">
        <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r bg-background md:flex">
          <div className="flex h-14 shrink-0 items-center border-b px-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-leap-navy to-leap-purple bg-clip-text text-transparent">
                Leap.ai
              </span>
            </Link>
            <div className="ml-auto">
              <AuthMenu />
            </div>
          </div>

          <div className="shrink-0 border-b px-4 py-3">
            <button
              type="button"
              onClick={openGlobalSearch}
              className="flex w-full items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-leap-purple hover:text-foreground"
            >
              <SearchIcon className="h-4 w-4" />
              <span className="flex-1 text-left">Search…</span>
              <kbd className="rounded border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
            </button>
          </div>

          <nav className="grid flex-1 content-start gap-5 overflow-y-auto px-3 py-4">
            {navGroups.map((group) => (
              <div key={group.label} className="grid gap-1">
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            ))}
          </nav>

          <div className="shrink-0 border-t p-3">
            <div className="rounded-md border bg-accent/40 p-3">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <p className="text-[13px] font-semibold">Unlock everything</p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Full practice library, scenarios, interview prep &amp; creator content.
              </p>
              <Link to="/upgrade" className="mt-3 block">
                <Button className="h-8 w-full bg-primary text-primary-foreground text-xs hover:bg-primary/90">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </div>
        </aside>
        <main className="flex-1">
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
