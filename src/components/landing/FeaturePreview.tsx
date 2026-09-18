import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Code2, Map, MessagesSquare, Play } from "lucide-react";

const TABS = [
  { key: "coach", label: "AI Coach", icon: MessagesSquare },
  { key: "judge", label: "Code Judge", icon: Code2 },
  { key: "roadmap", label: "Roadmap", icon: Map },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const CYCLE_MS = 4800;

/** Typewriter reveal for the coach reply — a sample interaction, not a live call. */
const CoachScene = () => {
  const reply =
    "Based on your progress, focus on system design next — you're closest to Staff there.";
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    const id = setInterval(() => {
      setShown((n) => (n < reply.length ? n + 2 : n));
    }, 18);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col justify-end gap-3 p-5">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-edu-indigo px-4 py-2.5 text-[13px] text-white"
      >
        What should I focus on this week?
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 24 }}
        className="max-w-[85%] rounded-2xl rounded-bl-sm bg-edu-bg px-4 py-2.5 text-[13px] leading-relaxed text-edu-ink"
      >
        {reply.slice(0, shown)}
        <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-edu-ink/40 align-middle" />
      </motion.div>
    </div>
  );
};

const tests = ["parses nested input", "handles empty array", "runs within time limit"];

const JudgeScene = () => {
  const [passed, setPassed] = useState(0);

  useEffect(() => {
    setPassed(0);
    const timers = tests.map((_, i) =>
      setTimeout(() => setPassed((n) => Math.max(n, i + 1)), 500 + i * 550)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-edu-ink/60">
        <Play className="h-3.5 w-3.5 text-edu-indigo" /> Running tests…
      </div>
      <div className="space-y-2">
        {tests.map((t, i) => (
          <div
            key={t}
            className="flex items-center gap-2.5 rounded-xl bg-edu-bg px-3.5 py-2.5 text-[13px] text-edu-ink"
          >
            <AnimatePresence mode="wait">
              {i < passed ? (
                <motion.span
                  key="pass"
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-edu-mint text-edu-mint-fg"
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </motion.span>
              ) : (
                <motion.span
                  key="pending"
                  exit={{ opacity: 0 }}
                  className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-edu-ink/15 border-t-edu-indigo"
                />
              )}
            </AnimatePresence>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
};

const phases = ["Learn the new core", "Get real experience", "Prove it with results"];

const RoadmapScene = () => {
  const [done, setDone] = useState(0);

  useEffect(() => {
    setDone(0);
    const timers = phases.map((_, i) =>
      setTimeout(() => setDone((n) => Math.max(n, i + 1)), 450 + i * 600)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex h-full flex-col justify-center gap-3 p-5">
      <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-edu-bg">
        <motion.div
          className="h-full rounded-full bg-edu-indigo"
          animate={{ width: `${(done / phases.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      {phases.map((p, i) => (
        <div key={p} className="flex items-center gap-3 rounded-xl bg-edu-bg px-3.5 py-2.5">
          <motion.span
            animate={{
              backgroundColor: i < done ? "#4F46E5" : "#ffffff",
              scale: i < done ? [1, 1.3, 1] : 1,
            }}
            transition={{ duration: 0.4 }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-edu-indigo"
          >
            {i < done && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
          </motion.span>
          <span className={`text-[13px] ${i < done ? "text-edu-ink" : "text-edu-ink/40"}`}>{p}</span>
        </div>
      ))}
    </div>
  );
};

const scenes: Record<TabKey, () => JSX.Element> = {
  coach: CoachScene,
  judge: JudgeScene,
  roadmap: RoadmapScene,
};

/**
 * Live-feeling preview of the real product, inspired by codebuff.com's
 * self-driving IDE demo — not literal screenshots, but the same idea: show
 * the thing working instead of describing it. Each scene is illustrative
 * (a sample interaction), not a claim that this is a captured live session.
 */
export const FeaturePreview = () => {
  const [active, setActive] = useState<TabKey>("coach");
  // Re-armed every time `active` changes, whether that came from this timer
  // or a manual click — so clicking a tab naturally resets the countdown
  // instead of being stomped on by an independent interval.
  useEffect(() => {
    const id = setTimeout(() => {
      setActive((current) => {
        const idx = TABS.findIndex((t) => t.key === current);
        return TABS[(idx + 1) % TABS.length].key;
      });
    }, CYCLE_MS);
    return () => clearTimeout(id);
  }, [active]);

  const selectTab = (key: TabKey) => setActive(key);

  const ActiveScene = scenes[active];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Tabs with auto-advancing progress underline */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => selectTab(t.key)}
              className="group flex flex-col items-center gap-2 pb-3 text-center"
            >
              <span
                className={`flex items-center gap-2 text-[13px] font-semibold transition-colors ${
                  isActive ? "text-edu-ink" : "text-edu-ink/40 group-hover:text-edu-ink/70"
                }`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </span>
              <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-edu-ink/10">
                {isActive && (
                  <motion.span
                    key={active}
                    className="absolute inset-y-0 left-0 rounded-full bg-edu-indigo"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Browser-chrome frame with a gentle continuous float */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="overflow-hidden rounded-[1.75rem] border border-edu-ink/10 bg-white shadow-[0_30px_60px_-20px_rgba(79,70,229,0.25)]"
      >
        <div className="flex items-center gap-1.5 border-b border-edu-ink/5 bg-edu-bg px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-edu-coral/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-edu-highlight" />
          <span className="h-2.5 w-2.5 rounded-full bg-edu-mint-fg/50" />
          <span className="ml-3 text-[11px] font-medium text-edu-ink/40">leap.ai/dashboard</span>
        </div>
        <div className="relative h-[220px] sm:h-[240px]">
          <AnimatePresence initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16, position: "absolute" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <ActiveScene />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
