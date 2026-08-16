import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
}

/**
 * Auth pages use the same design system as the landing page — the stone
 * editorial palette (#FAF9F7), Fraunces display headings, and a dark
 * stone-900 brand panel — so login/signup don't feel like a different site.
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  description,
  linkText,
  linkHref,
}) => {
  const linkParts = linkText.split(" ");
  const firstWord = linkParts[0];
  const rest = linkParts.slice(1).join(" ");

  return (
    <div className="flex min-h-screen bg-[#FAF9F7] text-stone-900">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center p-8 md:p-16 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <Link
            to="/"
            className="mb-10 inline-block font-display text-[22px] font-semibold tracking-tight"
          >
            Leap<span className="text-stone-400">.ai</span>
          </Link>

          <h1 className="mb-2 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mb-8 text-[15px] leading-relaxed text-stone-600">{description}</p>

          {children}

          <div className="mt-8 text-center text-sm text-stone-500">
            {firstWord}{" "}
            <Link
              to={linkHref}
              className="font-medium text-stone-900 underline underline-offset-4 hover:text-stone-600"
            >
              {rest}
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - brand panel, matching the landing's closing CTA */}
      <div className="hidden lg:flex lg:w-1/2">
        <div className="flex w-full flex-col justify-center bg-stone-900 p-12 text-stone-50">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">
            Any field → any field
          </p>
          <h2 className="mt-4 max-w-md font-display text-4xl font-medium leading-tight tracking-tight">
            Transition into the career you actually want.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-stone-400">
            Leap.ai turns the gap between where you are and the role you want into a working
            plan — the skills to build, the proof to show, and the milestones to hit, in that
            order. From marketing to healthcare, support to data, any field to any field.
          </p>
          <div className="mt-8 flex items-center gap-3 text-[13px] text-stone-400">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-700 text-stone-300">
              <ArrowRight className="h-4 w-4" />
            </span>
            <span>A two-minute profile is all it takes to see yours.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
