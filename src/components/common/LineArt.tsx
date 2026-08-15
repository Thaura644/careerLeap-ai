import React from "react";

/**
 * Hand-drawn style line-art illustrations (a single stroke weight, one accent
 * color) used for dashboard empty states. Keeping one consistent set — same
 * line weight, same palette — is what makes a page feel designed rather than
 * assembled. These are inline SVGs, so no external assets and no attribution.
 */
interface LineArtProps {
  variant?: "climb" | "roadmap" | "network" | "goals" | "resources";
  className?: string;
}

export const LineArt: React.FC<LineArtProps> = ({ variant = "climb", className }) => {
  const common = "h-24 w-24";
  const stroke = "currentColor";
  const sw = 2;

  switch (variant) {
    case "roadmap":
      return (
        <svg viewBox="0 0 96 96" fill="none" className={`${common} ${className || ""}`} aria-hidden="true">
          {/* A path with waypoint flags rising to the right */}
          <path d="M14 78 C 30 70, 26 56, 42 54 C 58 52, 54 38, 70 34 C 78 32, 84 26, 86 18" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeDasharray="1 5" />
          <circle cx="42" cy="54" r="3.5" stroke={stroke} strokeWidth={sw} />
          <circle cx="70" cy="34" r="3.5" stroke={stroke} strokeWidth={sw} />
          <path d="M70 34 v-9 l6 4.5 l-6 4.5 z" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />
          <path d="M42 54 v-9 l6 4.5 l-6 4.5 z" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />
          <circle cx="16" cy="78" r="2.5" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "network":
      return (
        <svg viewBox="0 0 96 96" fill="none" className={`${common} ${className || ""}`} aria-hidden="true">
          {/* Three nodes joined by a simple graph */}
          <circle cx="48" cy="30" r="7" stroke={stroke} strokeWidth={sw} />
          <circle cx="22" cy="66" r="7" stroke={stroke} strokeWidth={sw} />
          <circle cx="74" cy="66" r="7" stroke={stroke} strokeWidth={sw} />
          <path d="M48 37 C 40 47, 30 56, 26 61" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M48 37 C 56 47, 66 56, 70 61" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M29 66 L 67 66" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "goals":
      return (
        <svg viewBox="0 0 96 96" fill="none" className={`${common} ${className || ""}`} aria-hidden="true">
          {/* A target with a small flag on top */}
          <circle cx="48" cy="52" r="24" stroke={stroke} strokeWidth={sw} />
          <circle cx="48" cy="52" r="14" stroke={stroke} strokeWidth={sw} />
          <circle cx="48" cy="52" r="5" stroke={stroke} strokeWidth={sw} fill="currentColor" />
          <path d="M48 28 V 16 M48 16 l7 5 l-7 5 l-7 -5 z" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "resources":
      return (
        <svg viewBox="0 0 96 96" fill="none" className={`${common} ${className || ""}`} aria-hidden="true">
          {/* An open book */}
          <path d="M14 34 C 26 28, 40 28, 48 34 C 56 28, 70 28, 82 34 V 70 C 70 64, 56 64, 48 70 C 40 64, 26 64, 14 70 Z" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M48 34 V 70" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "climb":
    default:
      return (
        <svg viewBox="0 0 96 96" fill="none" className={`${common} ${className || ""}`} aria-hidden="true">
          {/* A figure climbing a rising line — the career trajectory */}
          <circle cx="30" cy="30" r="8" stroke={stroke} strokeWidth={sw} />
          <path d="M30 38 C 28 48, 30 56, 32 66 M30 44 L 20 50 M30 46 L 42 52 M32 66 L 22 78 M32 66 L 44 74" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M48 78 C 58 74, 64 66, 74 58 C 80 52, 84 44, 86 32" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeDasharray="1 5" />
          <circle cx="86" cy="32" r="2.5" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
  }
};
