import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { AuthMenu } from "@/components/auth/AuthMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const footerLinks: { label: string; to: string }[][] = [
  [
    { label: "How it works", to: "/how-it-works" },
    { label: "Pricing", to: "/pricing" },
    { label: "Dashboard", to: "/dashboard" },
  ],
  [
    { label: "Blog", to: "/blog" },
    { label: "Research", to: "/research" },
    { label: "Community", to: "/community" },
    { label: "FAQ", to: "/faq" },
  ],
  [
    { label: "Privacy", to: "/privacy" },
    { label: "Terms", to: "/terms" },
    { label: "Support", to: "/support" },
    { label: "Contact", to: "/contact" },
  ],
];

const resourceLinks = [
  { label: "Blog", to: "/blog", desc: "Career strategy & skill-building" },
  { label: "Research", to: "/research", desc: "Compiled research, by category" },
];

const navLinks = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Practice", href: "/catalog" },
  { label: "Pricing", href: "/pricing" },
];

type StaticPageShellProps = {
  children: ReactNode;
};

const StaticPageShell = ({ children }: StaticPageShellProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-edu-bg font-sans text-edu-ink">
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full bg-edu-ink px-3 pl-5 shadow-[0_12px_30px_-8px_rgba(22,19,32,0.35)] sm:px-4 sm:pl-6">
          <Link to="/" className="font-marketing text-xl font-extrabold tracking-tight text-white">
            Leap<span className="text-edu-coral">.ai</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.slice(0, 2).map((l) =>
              l.href.startsWith("/#") ? (
                <a key={l.label} href={l.href} className="text-sm font-medium text-white/70 hover:text-white">
                  {l.label}
                </a>
              ) : (
                <Link key={l.label} to={l.href} className="text-sm font-medium text-white/70 hover:text-white">
                  {l.label}
                </Link>
              )
            )}

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-white/70 outline-none hover:text-white">
                Resources <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {resourceLinks.map((r) => (
                  <DropdownMenuItem key={r.label} asChild>
                    <Link to={r.to} className="flex flex-col items-start gap-0.5 py-2">
                      <span className="text-sm font-medium">{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.desc}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.slice(2).map((l) =>
              l.href.startsWith("/#") ? (
                <a key={l.label} href={l.href} className="text-sm font-medium text-white/70 hover:text-white">
                  {l.label}
                </a>
              ) : (
                <Link key={l.label} to={l.href} className="text-sm font-medium text-white/70 hover:text-white">
                  {l.label}
                </Link>
              )
            )}
          </div>

          <div className="hidden md:block">
            <AuthMenu />
          </div>

          <button
            className="rounded-full p-2 text-white md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open && (
          <div className="mx-auto mt-2 flex max-w-6xl flex-col gap-4 rounded-3xl bg-edu-ink px-6 py-5 shadow-[0_12px_30px_-8px_rgba(22,19,32,0.35)] md:hidden">
            {navLinks.slice(0, 2).map((l) =>
              l.href.startsWith("/#") ? (
                <a key={l.label} href={l.href} className="text-sm font-medium text-white/70 hover:text-white">
                  {l.label}
                </a>
              ) : (
                <Link key={l.label} to={l.href} className="text-sm font-medium text-white/70 hover:text-white">
                  {l.label}
                </Link>
              )
            )}
            <div className="border-t border-white/10 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Resources</p>
              <div className="mt-2 flex flex-col gap-2">
                {resourceLinks.map((r) => (
                  <Link key={r.label} to={r.to} className="text-sm font-medium text-white/70 hover:text-white">
                    {r.label}
                  </Link>
                ))}
              </div>
            </div>
            {navLinks.slice(2).map((l) =>
              l.href.startsWith("/#") ? (
                <a key={l.label} href={l.href} className="text-sm font-medium text-white/70 hover:text-white">
                  {l.label}
                </a>
              ) : (
                <Link key={l.label} to={l.href} className="text-sm font-medium text-white/70 hover:text-white">
                  {l.label}
                </Link>
              )
            )}
            <div className="pt-2">
              <AuthMenu />
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="mt-24 border-t border-edu-ink/10 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <p className="font-marketing text-xl font-extrabold tracking-tight text-edu-ink">
                Leap<span className="text-edu-indigo">.ai</span>
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-edu-ink/60">
                Built by one person, in the open. Early access is free — your feedback decides
                what ships next.
              </p>
            </div>
            {footerLinks.map((col, i) => (
              <div key={i} className="grid grid-cols-1 gap-2.5 content-start">
                {col.map((l) => (
                  <Link key={l.label} to={l.to} className="text-sm text-edu-ink/60 hover:text-edu-ink">
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-10 border-t border-edu-ink/10 pt-6 text-xs text-edu-ink/40">
            © {new Date().getFullYear()} Leap.ai — made with a keyboard, not a template.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StaticPageShell;
