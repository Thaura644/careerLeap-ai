import { Link } from "react-router-dom";
import StaticPageShell from "./StaticPageShell";

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "What we collect",
    body: (
      <div className="space-y-3 text-[14px] leading-relaxed text-edu-ink/70">
        <p>
          Leap.ai stores only what the product needs to work. Here is everything, plainly:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-edu-ink">Account details</strong> — your name, email
            address, and a hashed password. We never store plaintext passwords.
          </li>
          <li>
            <strong className="text-edu-ink">Career profile</strong> — current role, target
            role, industry, location, years of experience, and aspirations. These drive your
            personalized roadmap.
          </li>
          <li>
            <strong className="text-edu-ink">Content you generate</strong> — roadmaps we
            create for you, chat messages, and code you submit in the practice problems.
          </li>
          <li>
            <strong className="text-edu-ink">Payment details</strong> — processed entirely by
            our payment provider, Paystack. Card numbers never pass through or touch our
            servers; we only receive the payment confirmation and your plan status.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "How we use it",
    body: (
      <div className="space-y-3 text-[14px] leading-relaxed text-edu-ink/70">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>To generate your personalized roadmap and career insights.</li>
          <li>To answer you in the AI chat and run your practice submissions.</li>
          <li>To process payments and grant plan access.</li>
          <li>To provide support and fix things when they break.</li>
        </ul>
        <p>
          We do <strong className="text-edu-ink">not</strong> sell your data, show you
          targeted ads, or share your information with anyone beyond the providers needed to
          run the service.
        </p>
      </div>
    ),
  },
  {
    title: "Third-party services",
    body: (
      <div className="space-y-3 text-[14px] leading-relaxed text-edu-ink/70">
        <p>To run Leap.ai we use a small set of providers. Each one only sees what its job requires:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-edu-ink">Paystack</strong> — payment processing. They
            handle the checkout page and card data; we never see or store card numbers.
          </li>
          <li>
            <strong className="text-edu-ink">OpenRouter</strong> — generates roadmaps and
            chat answers from free-tier language models. Your profile and messages are sent to
            their API for that purpose.
          </li>
          <li>
            <strong className="text-edu-ink">Managed Postgres database</strong> (Supabase) —
            stores the account and product data described above.
          </li>
          <li>
            <strong className="text-edu-ink">Hosting</strong> — the backend runs on Render
            and the frontend is served by Vercel, so both process and briefly hold your
            requests as they travel through.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Retention & deletion",
    body: (
      <div className="space-y-3 text-[14px] leading-relaxed text-edu-ink/70">
        <p>
          Your data stays for as long as your account exists, so your roadmaps and progress
          are there when you come back. You can delete your account at any time — deleting an
          account <strong className="text-edu-ink">permanently removes</strong> your profile,
          roadmaps, chat history, practice submissions, and personal details from our systems.
        </p>
        <p>
          To delete your account or request a copy of your data, use the{" "}
          <Link to="/contact" className="text-edu-indigo underline hover:text-edu-ink">
            contact form
          </Link>{" "}
          and we'll handle it.
        </p>
      </div>
    ),
  },
  {
    title: "Security",
    body: (
      <p className="text-[14px] leading-relaxed text-edu-ink/70">
        Passwords are hashed, sessions use signed tokens, and payment data never touches our
        servers. We practice the honest version of security: no exaggerated claims, and if a
        breach ever happens you'll hear about it here and by email.
      </p>
    ),
  },
  {
    title: "Changes",
    body: (
      <p className="text-[14px] leading-relaxed text-edu-ink/70">
        If this policy changes in a meaningful way, we'll update it here and note it. Since
        Leap.ai is early access, the honest promise is this: we will never start selling your
        data or tracking you without telling you first.
      </p>
    ),
  },
];

const Privacy = () => (
  <StaticPageShell>
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
      <span className="inline-flex items-center rounded-full bg-edu-sky px-4 py-1.5 text-xs font-semibold text-edu-sky-fg">
        Legal
      </span>
      <h1 className="mt-4 font-marketing text-4xl font-extrabold tracking-tight text-edu-ink sm:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-edu-ink/70">
        Last updated: August 2026. This is what Leap.ai actually does with your data — no
        boilerplate, no burying the lede.
      </p>

      <div className="mt-10 space-y-10">
        {sections.map((s) => (
          <section key={s.title} className="border-t border-edu-ink/10 pt-6">
            <h2 className="text-[15px] font-semibold tracking-tight text-edu-ink">{s.title}</h2>
            <div className="mt-3">{s.body}</div>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border border-edu-ink/10 bg-white p-7 shadow-sm">
        <h2 className="text-[15px] font-semibold tracking-tight text-edu-ink">Questions?</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-edu-ink/70">
          Reach out through the{" "}
          <Link to="/contact" className="text-edu-indigo underline hover:text-edu-ink">
            contact form
          </Link>{" "}
          and we'll answer.
        </p>
      </div>
    </div>
  </StaticPageShell>
);

export default Privacy;
