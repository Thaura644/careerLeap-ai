import { Link } from "react-router-dom";
import StaticPageShell from "./StaticPageShell";

const topics: { title: string; body: string }[] = [
  {
    title: "I can't sign up or log in",
    body: "Check you're using the same email you signed up with. If the page feels slow, it's probably the backend waking from a cold start — give it up to a minute and refresh. Passwords are hashed, so if you forget yours, we can reset it via the contact form.",
  },
  {
    title: "My roadmap didn't generate",
    body: "Roadmaps take about 30 seconds. Occasionally the free AI model we use is rate-limited, and the roadmap falls back to our built-in generator — you'll still get a real, useful plan, just not AI-crafted. Try again in a few minutes for an AI one.",
  },
  {
    title: "Upgrading & billing",
    body: "Upgrades are handled securely by Paystack in NGN, USD, GHS, ZAR, or KES. If a payment went through but your plan didn't update, wait a minute and check Settings — if it's still wrong, contact us and we'll fix it (we can see and verify the payment on our side).",
  },
  {
    title: "Practice problems won't run",
    body: "The judge compiles and runs your Java solution with strict time and memory limits. If you get a compile error, the message shows exactly what's wrong. Time-limit failures mean your solution is too slow for the hidden tests — try a more efficient approach.",
  },
  {
    title: "Delete my account or export my data",
    body: "Account deletion permanently removes your profile, roadmaps, chat history, and submissions. To delete your account or request a copy of your data, use the contact form and we'll handle it — usually within a day.",
  },
];

const Support = () => (
  <StaticPageShell>
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
      <span className="inline-flex items-center rounded-full bg-edu-mint px-4 py-1.5 text-xs font-semibold text-edu-mint-fg">
        Help
      </span>
      <h1 className="mt-4 font-marketing text-4xl font-extrabold tracking-tight text-edu-ink sm:text-5xl">
        Support
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-edu-ink/70">
        Leap.ai is built and maintained by one person, so support is human and honest — not a
        bot. Here's how to help yourself, and how to reach a human when you can't.
      </p>

      <div className="mt-10 space-y-8">
        {topics.map((t) => (
          <section key={t.title} className="border-t border-edu-ink/10 pt-6">
            <h2 className="text-[15px] font-semibold tracking-tight text-edu-ink">{t.title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-edu-ink/70">{t.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border border-edu-ink/10 bg-white p-7 shadow-sm">
          <h2 className="text-[15px] font-semibold tracking-tight text-edu-ink">Still stuck?</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-edu-ink/70">
            Send a message through the contact form — include your account email and as much
            detail as you can.
          </p>
          <Link
            to="/contact"
            className="mt-4 inline-block rounded-full bg-edu-coral px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-edu-coral-dark"
          >
            Contact support
          </Link>
        </div>
        <div className="rounded-3xl border border-edu-ink/10 bg-edu-bg p-7">
          <h2 className="text-[15px] font-semibold tracking-tight text-edu-ink">Common questions</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-edu-ink/70">
            Pricing, plans, and how the roadmap generator works — answers are on the FAQ.
          </p>
          <Link
            to="/faq"
            className="mt-4 inline-block rounded-full border border-edu-ink/15 px-5 py-2.5 text-[13px] font-semibold text-edu-ink hover:bg-white"
          >
            Read the FAQ
          </Link>
        </div>
      </div>

      <p className="mt-10 border-t border-edu-ink/10 pt-6 text-xs text-edu-ink/40">
        Service status: the backend runs on a free tier and can cold-start slowly — if a
        request hangs, waiting a minute and retrying usually resolves it.
      </p>
    </div>
  </StaticPageShell>
);

export default Support;
