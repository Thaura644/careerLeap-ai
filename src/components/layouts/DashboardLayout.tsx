
import React from "react";
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
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  pro?: boolean;
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Resources",
    href: "/resources",
    icon: BookOpen,
  },
  {
    title: "Community",
    href: "/community",
    icon: Users,
  },
  {
    title: "AI Insights",
    href: "/insights",
    icon: Lightbulb,
    pro: true,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.href;
    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.title}</span>
        {item.pro && (
          <span className="ml-auto flex h-5 items-center justify-center rounded-full bg-leap-purple px-2 text-[10px] font-medium text-white">
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
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
              <Link to="/upgrade" className="mt-4">
                <Button className="w-full bg-leap-purple hover:bg-opacity-90">
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
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>

      {/* Desktop navigation */}
      <div className="flex flex-1">
        <aside className="hidden w-64 flex-col border-r bg-background md:flex">
          <div className="flex h-14 items-center border-b px-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-leap-navy to-leap-purple bg-clip-text text-transparent">
                Leap.ai
              </span>
            </Link>
          </div>
          <nav className="grid gap-1 p-4">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
          <div className="mt-auto p-4">
            <Link to="/upgrade">
              <Button className="w-full bg-leap-purple hover:bg-opacity-90">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </aside>
        <main className="flex-1">
          <div className="hidden items-center justify-between border-b bg-background p-4 md:flex">
            <div></div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
          <div className="p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
