import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ArrowRight, CalendarIcon, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiPost, ApiError, ApiTimeoutError } from "@/lib/api";

interface BookDemoModalProps {
  trigger?: React.ReactNode;
  /** Button label when no custom trigger is given. */
  label?: string;
  /** Style the default trigger as a filled pill (hero) or quiet text link. */
  appearance?: "button" | "link";
  className?: string;
}

/**
 * "Contact sales" modal — the visitor's message lands in the founder's inbox
 * (CONTACT_SALES_EMAIL on the backend) and is persisted in demo_requests so
 * nothing is silently dropped. Demo date/time is optional: some buyers just
 * want pricing for a team, others want a live walkthrough.
 */
export const BookDemoModal: React.FC<BookDemoModalProps> = ({
  trigger,
  label = "Contact sales",
  appearance = "button",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — humans never see this
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Missing information",
        description: "Please add your name and email so we can reply.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost<{ ok: boolean; message?: string }>("/demo-requests", {
        name: name.trim(),
        email: email.trim(),
        companyName: companyName.trim(),
        message: message.trim(),
        // Optional fields — sent empty when the visitor skips them.
        demoDate: date ? format(date, "yyyy-MM-dd") : "",
        timeSlot,
        website, // honeypot
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setOpen(false);
        setName("");
        setEmail("");
        setCompanyName("");
        setMessage("");
        setDate(undefined);
        setTimeSlot("");
      }, 2400);
    } catch (error) {
      toast({
        title: "Something went wrong",
        description:
          error instanceof ApiTimeoutError
            ? "The server is waking up — try again in a few seconds."
            : error instanceof ApiError && error.message
              ? error.message
              : "Couldn't send right now — please try again in a minute.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "4:30 PM"];

  const defaultTrigger =
    appearance === "link" ? (
      <button type="button" className={cn("text-sm font-semibold text-edu-ink hover:text-edu-indigo", className)}>
        {label} →
      </button>
    ) : (
      <button
        type="button"
        className={cn(
          "text-sm font-semibold text-edu-ink hover:text-edu-indigo",
          className
        )}
      >
        {label}
      </button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="rounded-[1.75rem] bg-white p-0 sm:max-w-[520px]">
        {isSuccess ? (
          <div className="px-8 py-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-edu-mint text-edu-mint-fg">
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </span>
            <h3 className="mt-5 font-marketing text-xl font-extrabold tracking-tight text-edu-ink">
              Message sent.
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-edu-ink/60">
              It's in our inbox — expect a reply within one business day.
            </p>
          </div>
        ) : (
          <div className="p-7 sm:p-8">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="font-marketing text-2xl font-extrabold tracking-tight text-edu-ink">
                Contact sales
              </DialogTitle>
              <DialogDescription className="text-[14px] leading-relaxed text-edu-ink/60">
                Tell us what your team or org needs — team pricing, a live walkthrough,
                or a custom plan. A human replies, not a bot.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sales-name" className="text-[13px] font-semibold">
                    Name *
                  </Label>
                  <Input
                    id="sales-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Obi"
                    required
                    className="h-10 rounded-xl border-edu-ink/15 bg-edu-bg/50 focus-visible:ring-edu-indigo/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sales-email" className="text-[13px] font-semibold">
                    Work email *
                  </Label>
                  <Input
                    id="sales-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ada@company.com"
                    required
                    className="h-10 rounded-xl border-edu-ink/15 bg-edu-bg/50 focus-visible:ring-edu-indigo/30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sales-company" className="text-[13px] font-semibold">
                  Company <span className="font-normal text-edu-ink/40">(optional)</span>
                </Label>
                <Input
                  id="sales-company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company or team name"
                  className="h-10 rounded-xl border-edu-ink/15 bg-edu-bg/50 focus-visible:ring-edu-indigo/30"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sales-message" className="text-[13px] font-semibold">
                  What do you need? *
                </Label>
                <Textarea
                  id="sales-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                  placeholder="e.g. We'd like Leap.ai Pro for a 12-person engineering team — what does pricing look like? A walkthrough would help too."
                  className="min-h-[96px] resize-none rounded-xl border-edu-ink/15 bg-edu-bg/50 focus-visible:ring-edu-indigo/30"
                />
                <p className="text-right text-[11px] text-edu-ink/40">{message.length}/2000</p>
              </div>

              {/* Optional live walkthrough — collapsed into one quiet row */}
              <div className="rounded-2xl border border-dashed border-edu-ink/15 bg-edu-bg/40 p-4">
                <p className="text-[13px] font-semibold text-edu-ink">
                  Want a live walkthrough? <span className="font-normal text-edu-ink/50">(optional)</span>
                </p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-10 justify-start rounded-xl border-edu-ink/15 bg-white font-normal",
                          !date && "text-edu-ink/40"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-edu-indigo" />
                        {date ? format(date, "MMM d, yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(d) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const day = d.getDay();
                          return d < today || day === 0 || day === 6;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="h-10 rounded-xl border border-edu-ink/15 bg-white px-3 text-sm text-edu-ink focus:border-edu-indigo focus:outline-none focus:ring-2 focus:ring-edu-indigo/20"
                  >
                    <option value="">Pick a time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Honeypot: hidden from humans, bots fill it in */}
              <div className="absolute left-[-9999px]" aria-hidden="true">
                <label htmlFor="sales-website">Website</label>
                <input
                  id="sales-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-full bg-edu-coral text-sm font-semibold shadow-lg shadow-edu-coral/25 hover:bg-edu-coral-dark"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Send message <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <p className="text-center text-[11px] text-edu-ink/40">
                Goes straight to the Leap.ai team — no newsletters, no sharing.
              </p>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
