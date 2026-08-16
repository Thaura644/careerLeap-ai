import React, { useEffect, useState } from "react";
import { Brain, Maximize2, Minimize2, X } from "lucide-react";
import { AIAgentChat } from "./AIAgentChat";
import { cn } from "@/lib/utils";

/** Floating AI assistant: a fixed action button that opens a right-side
 *  overlay drawer. The drawer is position:fixed — it never pushes or disturbs
 *  the rest of the page, it just slides over it. A toggle expands the drawer
 *  to full screen (and back), and the message list scrolls independently. */
export const FloatingAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Esc closes the drawer (also exits fullscreen mode first).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (expanded) setExpanded(false);
        else setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, expanded]);

  // Entering fullscreen should not be prevented by the body scrollbar.
  useEffect(() => {
    if (!open || !expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, expanded]);

  return (
    <>
      {/* Floating action button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className={cn(
          "fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform",
          open
            ? "bg-muted text-muted-foreground hover:scale-105"
            : "bg-leap-purple text-white hover:scale-105"
        )}
      >
        {open ? <X className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
      </button>

      {/* Drawer + backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/30 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex flex-col border-l bg-background shadow-2xl transition-all duration-300",
          expanded
            ? "inset-0 w-full max-w-none"
            : "w-full max-w-[400px]",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label="AI Assistant"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-leap-purple" />
            <span className="text-sm font-semibold">AI Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label={expanded ? "Collapse AI assistant" : "Expand AI assistant"}
              title={expanded ? "Collapse" : "Expand to full screen"}
            >
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Close AI assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <AIAgentChat
            compact
            showHeader={false}
            maxHeight={expanded ? "none" : "calc(100vh - 220px)"}
            className="h-full border-0 shadow-none"
          />
        </div>
      </div>
    </>
  );
};
