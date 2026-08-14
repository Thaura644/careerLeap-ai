import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Target,
  BrainCircuit,
  Users,
  HeartHandshake,
  Lightbulb,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Feature = {
  icon: typeof Target;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Target,
    title: "Personalized Roadmaps",
    description:
      "A step-by-step plan from your current role to your target role — skills, milestones, and proof.",
  },
  {
    icon: BrainCircuit,
    title: "Skill-Gap Analysis",
    description:
      "Know exactly what's missing between you and the role you want, in priority order.",
  },
  {
    icon: HeartHandshake,
    title: "Real-World Proof",
    description:
      "Concrete projects and case studies that make your next level visible to hiring teams.",
  },
  {
    icon: Users,
    title: "Community Support",
    description:
      "A focused community of engineers at the same crossroads — wins, advice, and accountability.",
  },
  {
    icon: Lightbulb,
    title: "Curated Learning",
    description:
      "Workshops and resources matched to your roadmap, not a generic course catalog.",
  },
  {
    icon: Zap,
    title: "Interview Prep",
    description:
      "Targeted practice for the interviews that stand between you and the offer.",
  },
];

const LegacyLanding = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-cyan-950 dark:text-cyan-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-cyan-900 dark:bg-cyan-950/95">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
            Leap.ai
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="hover:text-cyan-600">Features</a>
            <a href="#how-it-works" className="hover:text-cyan-600">How It Works</a>
            <a href="#pricing" className="hover:text-cyan-600">Pricing</a>
            <Link to="/resources" className="hover:text-cyan-600">Resources</Link>
            <Link to="/community" className="hover:text-cyan-600">Community</Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="outline" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </nav>

        {open && (
          <div className="border-t border-slate-200 px-4 py-3 md:hidden dark:border-cyan-900">
            <div className="flex flex-col gap-3">
              <a href="#features" onClick={() => setOpen(false)}>Features</a>
              <a href="#how-it-works" onClick={() => setOpen(false)}>How It Works</a>
              <a href="#pricing" onClick={() => setOpen(false)}>Pricing</a>
              <Link to="/resources" onClick={() => setOpen(false)}>Resources</Link>
              <Link to="/community" onClick={() => setOpen(false)}>Community</Link>
              <Button variant="outline" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="bg-gradient-to-br from-cyan-50 via-white to-violet-50 py-24 dark:from-cyan-900 dark:via-cyan-950 dark:to-violet-950">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
                Stuck between <span className="text-cyan-600 dark:text-cyan-400">Senior and Staff?</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-cyan-100/80">
                Leap.ai builds you a concrete, step-by-step roadmap from where you are now to the role you
                actually want — the skills to build, the proof to show, and the milestones to hit, in order.
              </p>
              <div className="mt-8 flex gap-3">
                <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                  <Link to="/onboarding">Start Your Journey <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/dashboard">Open Dashboard</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-cyan-100/70">
                Early access — free while we build. No credit card required.
              </p>
            </div>

            <div className="relative">
              <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-cyan-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">
                  Sample roadmap · Senior → Staff
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    ["Phase 1", "Own a cross-team system", "Take end-to-end ownership of one system used by 2+ teams."],
                    ["Phase 2", "Publish your technical strategy", "Write the RFC that becomes the roadmap others follow."],
                    ["Phase 3", "Prove leverage", "Ship the thing and show the metric that moved because of you."],
                  ].map(([phase, title, desc]) => (
                    <div key={phase} className="rounded-lg border border-slate-200 p-3 dark:border-cyan-800">
                      <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-300">{phase} — {title}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-cyan-100/80">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 left-1/2 w-[85%] -translate-x-1/2 rounded-xl bg-white p-5 shadow-lg dark:bg-cyan-900">
                <p className="text-sm font-semibold text-slate-700 dark:text-cyan-100">
                  Early access is live and free.
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-cyan-100/80">
                  This is the shape of the roadmap the generator actually returns — tell us where you are and
                  where you want to be. We're still building, so feedback is welcome.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Built for the Senior → Staff gap</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((item) => (
                <Card key={item.title} className="dark:border-cyan-800 dark:bg-cyan-900/40">
                  <CardHeader>
                    <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-800 dark:text-cyan-200">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-cyan-100/80">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-cyan-50 py-20 dark:bg-cyan-900/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">How Leap.ai Works</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Tell us where you are", desc: "Current role, target role, and timeframe — a 2-minute profile." },
                { title: "Get your AI roadmap", desc: "Phases, skills, milestones, and resources — in order, built for your gap." },
                { title: "Execute with proof", desc: "Concrete projects that make your next level visible to hiring teams." },
                { title: "Get community backup", desc: "A focused group of engineers at the same crossroads." },
              ].map((step, i) => (
                <div key={step.title} className="rounded-xl bg-white p-6 text-center shadow-sm dark:bg-cyan-900">
                  <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600 text-white">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-cyan-100/80">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Start free. Upgrade when you're ready.</h2>
              <p className="mt-3 text-slate-600 dark:text-cyan-100/80">
                Early access is free while we build. Paid tiers unlock once checkout goes live.
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              {[
                { name: "Early Access", price: "$0", cta: "Start Free", to: "/onboarding", period: "free while we build", features: ["Sample AI roadmap", "Community access", "No credit card"] },
                { name: "Roadmap Report", price: "₦15,000", cta: "Get Yours", to: "/upgrade", period: "one-time", features: ["One personalized roadmap", "Delivered instantly", "Yours to keep"] },
                { name: "Pro", price: "₦10,000", cta: "Go Pro", to: "/upgrade", period: "per month, launch pricing", features: ["Unlimited roadmaps", "Goal tracking + insights", "Community support"] },
              ].map((plan) => (
                <Card key={plan.name} className="dark:border-cyan-800 dark:bg-cyan-900/40">
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="text-3xl font-bold text-slate-900 dark:text-cyan-50">{plan.price}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-cyan-100/80">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {f}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-slate-500 dark:text-cyan-100/70">{plan.period}</p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-700">
                      <Link to={plan.to}>{plan.cta}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-cyan-600 to-violet-600 py-16 text-center text-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold">Ready to see your roadmap?</h2>
            <p className="mt-4 text-cyan-100">
              Get a personalized plan in minutes — free during early access.
            </p>
            <div className="mt-8">
              <Button variant="secondary" asChild>
                <Link to="/onboarding">Discover Your Path</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 py-12 text-slate-300">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div className="col-span-2 lg:col-span-1">
            <p className="text-xl font-bold text-white">Leap.ai</p>
            <p className="mt-2 text-sm">Personalized career roadmaps, built by AI.</p>
          </div>
          <div>
            <p className="mb-3 font-semibold text-white">Company</p>
            <div className="space-y-2 text-sm">
              <Link to="/about" className="block hover:text-white">About Us</Link>
              <a href="/#features" className="block hover:text-white">Features</a>
              <a href="/#pricing" className="block hover:text-white">Pricing</a>
              <Link to="/career" className="block hover:text-white">Careers</Link>
              <Link to="/contact" className="block hover:text-white">Contact</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 font-semibold text-white">Resources</p>
            <div className="space-y-2 text-sm">
              <a href="/#how-it-works" className="block hover:text-white">How It Works</a>
              <Link to="/blog" className="block hover:text-white">Blog</Link>
              <Link to="/dashboard" className="block hover:text-white">Dashboard</Link>
              <Link to="/community" className="block hover:text-white">Community</Link>
              <Link to="/faq" className="block hover:text-white">FAQ</Link>
              <Link to="/support" className="block hover:text-white">Support</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 font-semibold text-white">Legal</p>
            <div className="space-y-2 text-sm">
              <Link to="/privacy" className="block hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="block hover:text-white">Terms of Service</Link>
              <Link to="/cookies" className="block hover:text-white">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>

      <section className="bg-slate-950 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Leap.ai. All rights reserved.
      </section>

    </div>
  );
};

export default LegacyLanding;
