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
  Quote,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Feature = {
  icon: typeof Target;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Target,
    title: "AI-Powered Roadmaps",
    description:
      "Craft a personalized learning plan tailored to your career objectives.",
  },
  {
    icon: BrainCircuit,
    title: "AI-Driven Insights",
    description:
      "Leverage AI insights to prioritize skills and make informed career moves.",
  },
  {
    icon: HeartHandshake,
    title: "Mentor Network",
    description:
      "Connect with experienced professionals for guidance and support.",
  },
  {
    icon: Users,
    title: "Community Support",
    description:
      "Join a focused community to share wins, advice, and opportunities.",
  },
  {
    icon: Lightbulb,
    title: "Skill Development",
    description:
      "Access workshops and curated resources to build market-ready skills.",
  },
  {
    icon: Zap,
    title: "Overcome Challenges",
    description:
      "Get tools that help build confidence and reduce career uncertainty.",
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
                Accelerate Your Career Growth <span className="text-cyan-600 dark:text-cyan-400">with AI</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-cyan-100/80">
                Unlock your potential with personalized career roadmaps and AI-driven insights.
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
                No credit card required · 14-day free trial · Cancel anytime
              </p>
            </div>

            <div className="relative">
              <img src="/career.webp" alt="Career growth" className="h-full w-full rounded-2xl object-cover shadow-xl" />
              <div className="absolute -bottom-6 left-1/2 w-[85%] -translate-x-1/2 rounded-xl bg-white p-5 shadow-lg dark:bg-cyan-900">
                <p className="italic text-slate-600 dark:text-cyan-100/80">
                  "Leap.ai gave me clarity and confidence to pursue opportunities I thought were out of reach."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/jm.jpg" alt="James Thaura" />
                    <AvatarFallback>JT</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">James Thaura</p>
                    <p className="text-sm text-slate-500 dark:text-cyan-100/70">Software Engineer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Everything You Need to Succeed</h2>
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
              {["Craft your path", "Tailor your learning", "Engage mentors", "Join the network"].map((title, i) => (
                <div key={title} className="rounded-xl bg-white p-6 text-center shadow-sm dark:bg-cyan-900">
                  <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600 text-white">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Choose the Perfect Plan</h2>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              {[
                { name: "Starter", price: "$0", cta: "Start Free" },
                { name: "Professional", price: "$29", cta: "Choose Pro" },
                { name: "Ultimate", price: "$99", cta: "Choose Ultimate" },
              ].map((plan) => (
                <Card key={plan.name} className="dark:border-cyan-800 dark:bg-cyan-900/40">
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="text-3xl font-bold text-slate-900 dark:text-cyan-50">{plan.price}/mo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-cyan-100/80">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> AI roadmap</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Skills tracking</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Community support</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700">{plan.cta}</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-cyan-600 to-violet-600 py-16 text-center text-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold">Ready to Empower Your Career Journey?</h2>
            <p className="mt-4 text-cyan-100">
              Use the landing experience you had before, plus the newer dashboard and AI workflows.
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
            <p className="mt-2 text-sm">Empowering your career journey with AI.</p>
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

      <section className="sr-only">
        <Quote />
      </section>
    </div>
  );
};

export default LegacyLanding;
