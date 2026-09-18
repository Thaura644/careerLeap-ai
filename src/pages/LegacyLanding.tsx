import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";
import { getAuthToken } from "@/lib/authSession";
import { Reveal } from "@/components/common/Reveal";
import { HeroIllustration } from "@/components/landing/HeroIllustration";
import { FeaturePreview } from "@/components/landing/FeaturePreview";
import { BookDemoModal } from "@/components/common/BookDemoModal";
import StaticPageShell from "./StaticPageShell";

/** Newsletter capture — posts to the real /api/newsletter endpoint. */
const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await apiPost<{ ok: boolean; error?: string }>("/newsletter", {
        email: email.trim(),
        website: "", // honeypot
      });
      if (res.ok) {
        setStatus("done");
      } else {
        setStatus("error");
        setErrorMsg(res.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Could not reach the server. Please try again.");
    }
  };

  if (status === "done") {
    return (
      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-edu-mint px-5 py-3 text-[13px] font-medium text-edu-mint-fg">
        <Check className="h-4 w-4" />
        You're in — check your inbox for a welcome.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <input
        ref={inputRef}
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
        className="h-11 w-full max-w-xs rounded-full border border-edu-ink/15 bg-white px-4 text-[13px] text-edu-ink placeholder:text-edu-ink/40 focus:border-edu-indigo focus:outline-none focus:ring-2 focus:ring-edu-indigo/20 sm:w-72"
      />
      <Button
        type="submit"
        disabled={status === "loading"}
        className="h-11 rounded-full bg-edu-ink px-6 text-[13px] font-semibold hover:bg-edu-ink/90 disabled:opacity-50"
      >
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </Button>
      {status === "error" && (
        <p className="w-full text-center text-[12px] text-red-600 sm:text-left">{errorMsg}</p>
      )}
    </form>
  );
};

const LegacyLanding = () => {
  // Signed-in users jump straight to onboarding; everyone else goes through
  // signup first.
  const signedIn = typeof window !== "undefined" ? !!getAuthToken() : false;
  const startHref = signedIn ? "/onboarding" : "/signup";

  return (
    <StaticPageShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-edu-lavender via-edu-bg to-edu-sky">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <span className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-edu-coral shadow-sm">
              Live now · free to start
            </span>
            <h1 className="mt-6 font-marketing text-[40px] font-extrabold leading-[1.08] tracking-tight text-edu-ink sm:text-[54px]">
              From any field to the career you{" "}
              <span className="relative inline-block">
                <span className="relative z-10">actually</span>
                <span className="absolute inset-x-0 bottom-1 z-0 h-[0.4em] bg-edu-highlight" aria-hidden="true" />
              </span>{" "}
              want.
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-edu-ink/70">
              Marketing to healthcare. Support to data. Senior to Staff. Leap.ai isn't just a
              roadmap — it's the plan, an AI coach who knows your progress, real practice with a
              real judge, and proof you can put in front of a hiring team.
            </p>
            <p className="mt-4 max-w-lg font-marketing text-lg font-bold text-edu-indigo">
              Get hands-on experience, built for you — not a generic course.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Button
                asChild
                className="h-12 rounded-full bg-edu-coral px-7 text-sm font-semibold shadow-lg shadow-edu-coral/30 hover:bg-edu-coral-dark"
              >
                <Link to={startHref}>
                  Get started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <BookDemoModal appearance="link" label="Contact sales" />
            </div>
            <p className="mt-6 text-[13px] text-edu-ink/50">
              Free to start. No card, no spam — delete your account anytime.
            </p>
          </div>

          <div className="self-center">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Live product preview */}
      <section className="border-b border-edu-ink/5 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <Reveal>
            <FeaturePreview />
          </Reveal>
        </div>
      </section>

      {/* How it works / What's inside — teaser, full showcase lives on its own page */}
      <section id="how-it-works" className="border-b border-edu-ink/5 bg-edu-bg">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center sm:px-8">
          <Reveal>
            <span className="inline-flex items-center rounded-full bg-edu-lavender px-4 py-1.5 text-xs font-semibold text-edu-lavender-fg">
              How it works
            </span>
            <h2 className="mx-auto mt-4 max-w-xl font-marketing text-3xl font-extrabold tracking-tight text-edu-ink sm:text-4xl">
              Four steps. Every feature real.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-edu-ink/70">
              Not a chat window with career advice bolted on. An AI coach that knows your actual
              profile and progress, a real code judge that compiles and runs your work, and
              real-world scenarios built for your target role — see exactly what's inside and
              how the four-step process works.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
              <Button
                asChild
                className="h-11 rounded-full bg-edu-ink px-7 text-sm font-semibold hover:bg-edu-ink/90"
              >
                <Link to="/how-it-works">
                  See how it works <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <BookDemoModal appearance="link" label="Contact sales" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Newsletter capture */}
      <section className="border-b border-edu-ink/5">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center rounded-full bg-edu-peach px-4 py-1.5 text-xs font-semibold text-edu-peach-fg">
              Stay in the loop
            </span>
            <h2 className="mt-4 font-marketing text-3xl font-extrabold tracking-tight text-edu-ink sm:text-4xl">
              Career moves, delivered weekly.
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-edu-ink/70">
              One email per week: real skill gaps, practical roadmaps, and what's working
              for people making the switch. No spam — unsubscribe anytime.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-5 my-20 overflow-hidden rounded-[2.5rem] bg-edu-ink sm:mx-8">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <h2 className="font-marketing text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Your next level is a list of moves.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-white/60">
            Start with the first one — a two-minute profile is all it takes to see yours.
          </p>
          <div className="mt-8">
            <Button
              asChild
              className="h-12 rounded-full bg-edu-coral px-7 text-sm font-semibold shadow-lg shadow-edu-coral/30 hover:bg-edu-coral-dark"
            >
              <Link to={startHref}>
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </StaticPageShell>
  );
};

export default LegacyLanding;
