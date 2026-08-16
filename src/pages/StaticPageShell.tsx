import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AuthMenu } from "@/components/auth/AuthMenu";

const footerLinks: { label: string; to: string }[][] = [
  [
    { label: "How it works", to: "/#how-it-works" },
    { label: "Features", to: "/#features" },
    { label: "Pricing", to: "/#pricing" },
    { label: "Dashboard", to: "/dashboard" },
  ],
  [
    { label: "Resources", to: "/resources" },
    { label: "Community", to: "/community" },
    { label: "Blog", to: "/blog" },
    { label: "FAQ", to: "/faq" },
  ],
  [
    { label: "Privacy", to: "/privacy" },
    { label: "Terms", to: "/terms" },
    { label: "Support", to: "/support" },
    { label: "Contact", to: "/contact" },
  ],
];

type StaticPageShellProps = {
  children: ReactNode;
};

const StaticPageShell = ({ children }: StaticPageShellProps) => {
  return (
    <div className="min-h-screen bg-[#FAF9F7] text-stone-900">
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#FAF9F7]/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="font-display text-[22px] font-semibold tracking-tight">
            Leap<span className="text-stone-400">.ai</span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            <a href="/#features" className="text-[13px] tracking-wide text-stone-600 hover:text-stone-900">
              Features
            </a>
            <a href="/#how-it-works" className="text-[13px] tracking-wide text-stone-600 hover:text-stone-900">
              How it works
            </a>
            <a href="/#pricing" className="text-[13px] tracking-wide text-stone-600 hover:text-stone-900">
              Pricing
            </a>
            <Link to="/resources" className="text-[13px] tracking-wide text-stone-600 hover:text-stone-900">
              Resources
            </Link>
          </div>
          {/* Signed out: Log in / Sign up. Signed in: avatar + verified badge
              with Dashboard / Profile / Sign out. */}
          <div className="hidden md:block">
            <AuthMenu />
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="border-t border-stone-200">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <p className="font-display text-xl font-semibold tracking-tight">
                Leap<span className="text-stone-400">.ai</span>
              </p>
              <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-stone-600">
                Built by one person, in the open. Early access is free — your feedback decides
                what ships next.
              </p>
            </div>
            {footerLinks.map((col, i) => (
              <div key={i} className="grid grid-cols-1 gap-2.5 content-start">
                {col.map((l) => (
                  <Link key={l.label} to={l.to} className="text-[13px] text-stone-600 hover:text-stone-900">
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-10 border-t border-stone-200 pt-6 font-mono text-[11px] text-stone-400">
            © {new Date().getFullYear()} Leap.ai — made with a keyboard, not a template.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StaticPageShell;
