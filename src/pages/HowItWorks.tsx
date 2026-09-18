import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  Code2,
  FileSearch,
  ListChecks,
  Map,
  MessagesSquare,
  Target,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/authSession";
import { Reveal } from "@/components/common/Reveal";
import StaticPageShell from "./StaticPageShell";

const steps = [
  {
    icon: ClipboardList,
    title: "Tell us where you are",
    desc: "Current role, target role, timeframe. Two minutes — not a form-filling marathon.",
  },
  {
    icon: Target,
    title: "We name the gap",
    desc: "The specific skills and proof your target level actually requires, in priority order.",
  },
  {
    icon: ListChecks,
    title: "Execute in order",
    desc: "Projects and milestones sequenced so each one makes the next one possible.",
  },
  {
    icon: Trophy,
    title: "Show the receipts",
    desc: "Interview reps and a proof portfolio aimed at the level above you.",
  },
];

// Leap.ai isn't just a roadmap generator — each row here is a real, live
// feature, not aspirational copy.
const featureList = [
  {
    icon: Map,
    title: "A roadmap, not a reading list",
    desc: "One sequenced plan from where you are to the role you want — skills, projects, and milestones, in order.",
  },
  {
    icon: MessagesSquare,
    title: "An AI coach, on demand",
    desc: "Ask it anything about your plan or your next move — it knows your profile and progress, not just generic advice.",
  },
  {
    icon: Code2,
    title: "A real practice judge",
    desc: "Coding problems with hidden tests, compiled and run for real — not multiple choice. You see exactly which cases pass.",
  },
  {
    icon: Briefcase,
    title: "Hands-on experience, built for you",
    desc: "Case studies, build projects, and interview & exam prep tracks matched to your target role — not a generic course.",
  },
  {
    icon: FileSearch,
    title: "Resume, reviewed by AI",
    desc: "A real analysis of your resume against your target role — what's missing, what to cut, what to lead with.",
  },
  {
    icon: Target,
    title: "Goals and AI insights",
    desc: "Track milestones and get insights on your progress, so you know the plan is actually working.",
  },
];

const tints = [
  { bg: "bg-edu-lavender", fg: "text-edu-lavender-fg" },
  { bg: "bg-edu-mint", fg: "text-edu-mint-fg" },
  { bg: "bg-edu-peach", fg: "text-edu-peach-fg" },
  { bg: "bg-edu-sky", fg: "text-edu-sky-fg" },
];

/** A single alternating showcase row — slides in from whichever side its icon sits on. */
const FeatureRow = ({
  f,
  i,
}: {
  f: (typeof featureList)[number];
  i: number;
}) => {
  const tint = tints[i % tints.length];
  const Icon = f.icon;
  const fromLeft = i % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: fromLeft ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center gap-8 py-10 sm:flex-row ${
        fromLeft ? "" : "sm:flex-row-reverse"
      }`}
    >
      <div className="flex-1">
        <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tint.bg} ${tint.fg}`}>
          <Icon className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <h3 className="mt-5 font-marketing text-2xl font-extrabold tracking-tight text-edu-ink">
          {f.title}
        </h3>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-edu-ink/70">{f.desc}</p>
      </div>
      <div className="flex flex-1 justify-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          className={`flex h-40 w-40 items-center justify-center rounded-[2.5rem] ${tint.bg} shadow-inner sm:h-48 sm:w-48`}
        >
          <Icon className={`h-16 w-16 ${tint.fg}`} strokeWidth={1.25} />
        </motion.div>
      </div>
    </motion.div>
  );
};

/** Vertical timeline whose connecting line draws in as you scroll past it. */
const StepsTimeline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.4"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="relative mt-16">
      <div className="absolute left-[27px] top-2 bottom-2 w-[3px] rounded-full bg-edu-ink/10" />
      <motion.div
        style={{ scaleY: lineScale }}
        className="absolute left-[27px] top-2 bottom-2 w-[3px] origin-top rounded-full bg-edu-indigo"
      />
      <div className="space-y-12">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="relative flex items-start gap-6 pl-[0px]"
            >
              <motion.span
                initial={{ scale: 0.6 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-edu-indigo text-white shadow-lg shadow-edu-indigo/30"
              >
                <Icon className="h-6 w-6" strokeWidth={1.75} />
              </motion.span>
              <div className="pt-3">
                <h3 className="text-lg font-semibold tracking-tight text-edu-ink">{s.title}</h3>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-edu-ink/60">{s.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const signedIn = typeof window !== "undefined" ? !!getAuthToken() : false;
  const startHref = signedIn ? "/onboarding" : "/signup";

  return (
    <StaticPageShell>
      {/* What's inside — alternating showcase */}
      <section className="border-b border-edu-ink/5">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal className="text-center">
            <span className="inline-flex items-center rounded-full bg-edu-peach px-4 py-1.5 text-xs font-semibold text-edu-peach-fg">
              What's inside
            </span>
            <h1 className="mx-auto mt-4 max-w-xl font-marketing text-4xl font-extrabold tracking-tight text-edu-ink sm:text-5xl">
              Built for real career moves — including the big ones.
            </h1>
          </Reveal>
          <div className="mt-6 divide-y divide-edu-ink/5">
            {featureList.map((f, i) => (
              <FeatureRow key={f.title} f={f} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works — scroll-drawn timeline */}
      <section className="border-b border-edu-ink/5 bg-white">
        <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal className="text-center">
            <span className="inline-flex items-center rounded-full bg-edu-lavender px-4 py-1.5 text-xs font-semibold text-edu-lavender-fg">
              How it works
            </span>
            <h2 className="mx-auto mt-4 max-w-xl font-marketing text-3xl font-extrabold tracking-tight text-edu-ink sm:text-4xl">
              Four steps. No dead ends.
            </h2>
          </Reveal>
          <StepsTimeline />
        </div>
      </section>

      <section className="py-20 text-center">
        <Button
          asChild
          className="h-12 rounded-full bg-edu-coral px-7 text-sm font-semibold shadow-lg shadow-edu-coral/30 hover:bg-edu-coral-dark"
        >
          <Link to={startHref}>
            Get started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </StaticPageShell>
  );
};

export default HowItWorks;
