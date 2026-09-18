import { useRef, useState } from "react";
import { Code2, MessagesSquare, Sparkles, Target } from "lucide-react";

/** Real product surfaces, not fake stats — each chip maps to a live feature. */
const chips = [
  { icon: MessagesSquare, label: "AI career coach", pos: "-right-2 top-6 sm:-right-6", tint: "bg-white" },
  { icon: Code2, label: "Real code judge", pos: "-left-4 top-1/3 sm:-left-8", tint: "bg-white" },
  { icon: Target, label: "Goals & insights", pos: "-right-4 bottom-10 sm:-right-8", tint: "bg-white" },
];

/**
 * Hero portrait — an AI-generated (not stock/scraped) photo of a happy
 * African professional, composited on a gradient blob backdrop inside a
 * fully round (50% border-radius) frame, with floating chips for real, live
 * product features. Tilts gently toward the cursor for a light 3D feel;
 * disabled for touch/reduced-motion implicitly since it only binds to mouse
 * events.
 */
export const HeroIllustration = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -6, y: px * 8 });
  };

  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      {/* Decorative sparkle accents */}
      <Sparkles className="absolute -top-4 left-2 h-5 w-5 text-edu-coral/70" aria-hidden="true" />
      <span className="absolute -bottom-2 right-10 h-3 w-3 rounded-full bg-edu-indigo/40" aria-hidden="true" />
      <span className="absolute right-0 top-1/4 h-2 w-2 rounded-full bg-edu-coral/50" aria-hidden="true" />

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        className="relative aspect-square [perspective:1000px]"
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-full transition-transform duration-200 ease-out"
          style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        >
          {/* Gradient blob backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-edu-indigo to-edu-coral shadow-[0_40px_80px_-20px_rgba(79,70,229,0.4)]" />
          <img
            src="/images/hero-portrait.webp"
            alt="A happy Leap.ai user, a young African professional in business casual attire"
            className="absolute inset-0 h-full w-full object-cover object-top"
            width={900}
            height={900}
          />
        </div>
      </div>

      {chips.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className={`absolute ${c.pos} hidden items-center gap-2 rounded-2xl ${c.tint} px-3.5 py-2.5 shadow-lg sm:flex`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-edu-lavender text-edu-lavender-fg">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold text-edu-ink">{c.label}</span>
          </div>
        );
      })}
    </div>
  );
};
