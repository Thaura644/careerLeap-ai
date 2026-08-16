import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlignJustify, BadgeCheck, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getAuthToken, getAuthUser, clearAuthSession, StoredUser } from "@/lib/authSession";

/** Read the signed-in user from the auth session (localStorage or sessionStorage). */
const readUser = (): StoredUser | null => {
  if (!getAuthToken()) return null;
  return getAuthUser();
};

/**
 * Header auth control: Log in / Sign up when logged out; when signed in it
 * becomes an avatar with a verified badge that drops down Dashboard, Profile,
 * and Sign out. Stays in sync across tabs and after login/logout via the
 * storage + `leap:auth-change` events.
 */
export const AuthMenu: React.FC<{ className?: string }> = ({ className }) => {
  const [user, setUser] = useState<StoredUser | null>(readUser);
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setUser(readUser());
    window.addEventListener("storage", sync);
    window.addEventListener("leap:auth-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("leap:auth-change", sync);
    };
  }, []);

  const signOut = () => {
    clearAuthSession();
    window.dispatchEvent(new Event("leap:auth-change"));
    navigate("/");
  };

  if (!user) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <Link to="/login" className="text-[13px] tracking-wide text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
          Log in
        </Link>
        <Button asChild className="h-9 rounded-none bg-stone-900 px-4 text-[13px] hover:bg-stone-700">
          <Link to="/signup">Sign up</Link>
        </Button>
      </div>
    );
  }

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "…";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className={cn(
            "group relative flex items-center gap-2.5 rounded-full outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
        >
          {/* Menu (four horizontal lines) + profile icon — the signed-in
              header control replaces the Log in / Sign up pair. */}
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition-colors group-hover:bg-stone-100">
            <AlignJustify className="h-4 w-4" />
          </span>
          <span className="relative">
            <Avatar className="h-9 w-9 border border-stone-300">
              <AvatarFallback className="bg-stone-900 text-sm font-semibold text-stone-50">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Verified badge */}
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-white ring-2 ring-[#FAF9F7]"
              aria-hidden="true"
            >
              <BadgeCheck className="h-3 w-3" />
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="text-sm font-medium">{user.fullName || "Your account"}</p>
          {user.email && (
            <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <UserRound className="mr-2 h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={signOut}
          className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/40"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
