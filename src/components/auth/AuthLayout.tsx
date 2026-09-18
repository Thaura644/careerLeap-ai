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
 * Auth pages use the same marketing design system as the landing page —
 * edu.* palette, Sora (font-marketing) headings, rounded/pill controls, and
 * a dark brand panel — so login/signup don't feel like a different site.
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
    <div className="flex min-h-screen bg-edu-bg font-sans text-edu-ink">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center p-8 md:p-16 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <Link
            to="/"
            className="mb-10 inline-block font-marketing text-[22px] font-extrabold tracking-tight"
          >
            Leap<span className="text-edu-coral">.ai</span>
          </Link>

          <h1 className="mb-2 font-marketing text-3xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mb-8 text-[15px] leading-relaxed text-edu-ink/70">{description}</p>

          {children}

          <div className="mt-8 text-center text-sm text-edu-ink/60">
            {firstWord}{" "}
            <Link
              to={linkHref}
              className="font-semibold text-edu-indigo underline underline-offset-4 hover:text-edu-ink"
            >
              {rest}
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - brand panel, matching the landing's closing CTA */}
      <div className="hidden lg:flex lg:w-1/2">
        <div className="flex w-full flex-col justify-center bg-edu-ink p-12 text-white">
          <span className="inline-flex w-fit items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-edu-coral">
            Any field → any field
          </span>
          <h2 className="mt-5 max-w-md font-marketing text-4xl font-extrabold leading-tight tracking-tight">
            Transition into the career you actually want.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/60">
            Leap.ai turns the gap between where you are and the role you want into a working
            plan — the skills to build, the proof to show, and the milestones to hit, in that
            order. From marketing to healthcare, support to data, any field to any field.
          </p>
          <div className="mt-8 flex items-center gap-3 text-[13px] text-white/60">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-edu-coral text-white">
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
