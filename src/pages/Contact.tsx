import { useState } from "react";
import { Link } from "react-router-dom";
import { apiPost } from "@/lib/api";
import StaticPageShell from "./StaticPageShell";

const inputClass =
  "w-full rounded-none border border-stone-300 bg-white px-3 py-2 text-[14px] text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — humans never see this
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await apiPost<{ ok: boolean; error?: string; message?: string }>("/contact", {
        name,
        email,
        subject,
        message,
        website,
      });
      setStatus("sent");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      const msg = err instanceof Error && /failed: 400/.test(err.message)
        ? "Please fill in your name, a valid email, a subject, and a message."
        : "Couldn't send right now — the server may be waking up. Please try again in a minute.";
      setError(msg);
      setStatus("error");
    }
  };

  return (
    <StaticPageShell>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C2410C]">
          Contact
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          Talk to a human
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-stone-600">
          This form goes straight to the person who builds Leap.ai — it's stored and read, not
          sent to a void. For bugs, include the page you were on and what happened.
        </p>

        {status === "sent" ? (
          <div className="mt-10 border border-stone-900 bg-white p-8">
            <h2 className="text-lg font-semibold tracking-tight">Message received ✓</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-stone-600">
              Thanks {name || "friend"} — it's in the inbox and will get a human reply. If it's
              urgent, mention it in the subject next time.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-5 text-[13px] text-[#C2410C] underline hover:text-stone-900"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium text-stone-700">
                  Your name
                </label>
                <input
                  id="name"
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  minLength={2}
                  maxLength={120}
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-stone-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                  maxLength={200}
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="mb-1.5 block text-[13px] font-medium text-stone-700">
                Subject
              </label>
              <input
                id="subject"
                className={inputClass}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Billing question, bug report, feedback"
                required
                minLength={3}
                maxLength={200}
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-[13px] font-medium text-stone-700">
                Message
              </label>
              <textarea
                id="message"
                className={`${inputClass} min-h-[140px] resize-y`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                required
                minLength={10}
                maxLength={5000}
              />
            </div>

            {/* Honeypot: hidden from humans, bots fill it in */}
            <div className="absolute left-[-9999px]" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {status === "error" && (
              <p className="text-[13px] text-red-700" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="h-11 rounded-none bg-stone-900 px-6 text-sm text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
          </form>
        )}

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          <div className="border border-stone-300 bg-[#FAF9F7] p-6">
            <h2 className="text-[15px] font-semibold tracking-tight">Before you write</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-stone-600">
              Many questions are already answered — pricing, plans, and how generation works.
            </p>
            <Link
              to="/faq"
              className="mt-4 inline-block border border-stone-300 px-4 py-2 text-[13px] text-stone-800 hover:bg-stone-100"
            >
              Read the FAQ
            </Link>
          </div>
          <div className="border border-stone-300 bg-[#FAF9F7] p-6">
            <h2 className="text-[15px] font-semibold tracking-tight">For partners</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-stone-600">
              Early access means every serious piece of feedback shapes the product. Use the
              same form — subject line "partnership".
            </p>
            <Link
              to="/community"
              className="mt-4 inline-block border border-stone-300 px-4 py-2 text-[13px] text-stone-800 hover:bg-stone-100"
            >
              Join the community
            </Link>
          </div>
        </div>
      </div>
    </StaticPageShell>
  );
};

export default Contact;
