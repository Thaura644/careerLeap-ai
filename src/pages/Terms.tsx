import { Link } from "react-router-dom";
import StaticPageShell from "./StaticPageShell";

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "The service",
    body: (
      <p className="text-[14px] leading-relaxed text-stone-600">
        Leap.ai is an AI-guided career planning tool. It generates personalized roadmaps based
        on the career profile you provide, answers career questions in chat, and offers
        coding practice problems with an automated judge. We're an early-access, solo-built
        product — the service is provided "as is" and may change as it matures.
      </p>
    ),
  },
  {
    title: "Accounts",
    body: (
      <div className="space-y-3 text-[14px] leading-relaxed text-stone-600">
        <p>
          You're responsible for keeping your sign-in details private and for the activity on
          your account. One person, one account — don't share logins. You may delete your
          account at any time, which permanently removes your data (see the{" "}
          <Link to="/privacy" className="text-[#C2410C] underline hover:text-stone-900">
            Privacy Policy
          </Link>
          ).
        </p>
      </div>
    ),
  },
  {
    title: "Acceptable use",
    body: (
      <div className="space-y-3 text-[14px] leading-relaxed text-stone-600">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Use the service for anything unlawful or harmful.</li>
          <li>
            Abuse the practice judge (for example, attempting to break the sandbox or disrupt
            the service).
          </li>
          <li>Scrape, resell, or redistribute Leap.ai output as your own product.</li>
          <li>Attempt to access another user's account or data.</li>
        </ul>
        <p>We may suspend accounts that break these rules — no second-guessing needed.</p>
      </div>
    ),
  },
  {
    title: "Plans, payments & refunds",
    body: (
      <div className="space-y-3 text-[14px] leading-relaxed text-stone-600">
        <p>
          The free plan costs nothing and stays free. Paid plans (Pro monthly, Pro annual,
          and the one-time Career Audit) are billed securely through{" "}
          <strong className="text-stone-800">Paystack</strong> in the currency you choose.
          Payment details are handled entirely by Paystack — we never store your card.
        </p>
        <p>
          Subscriptions renew automatically until you cancel. We offer refunds on a
          case-by-case, honest basis: if a paid feature didn't work as described, tell us and
          we'll make it right.
        </p>
      </div>
    ),
  },
  {
    title: "What you own",
    body: (
      <p className="text-[14px] leading-relaxed text-stone-600">
        You own the input you give us — your profile, your code, your messages. Roadmaps and
        answers generated for you are yours to use however you like. The Leap.ai product, its
        code, and its branding remain ours.
      </p>
    ),
  },
  {
    title: "Disclaimers & liability",
    body: (
      <div className="space-y-3 text-[14px] leading-relaxed text-stone-600">
        <p>
          Roadmaps and AI answers are planning tools, not guarantees. Career outcomes depend on
          far more than a plan, and we make no promise that following a roadmap produces a
          promotion, offer, or any specific result.
        </p>
        <p>
          To the fullest extent permitted by law, Leap.ai is provided "as is" without
          warranties of any kind, and our total liability for any claim is limited to the
          amount you paid us in the 12 months before the claim.
        </p>
      </div>
    ),
  },
  {
    title: "Changes",
    body: (
      <p className="text-[14px] leading-relaxed text-stone-600">
        We may update these terms as the product grows. Material changes will be announced
        here; continuing to use Leap.ai after a change means you accept the updated terms.
      </p>
    ),
  },
  {
    title: "Contact",
    body: (
      <p className="text-[14px] leading-relaxed text-stone-600">
        Questions about these terms? Use the{" "}
        <Link to="/contact" className="text-[#C2410C] underline hover:text-stone-900">
          contact form
        </Link>
        .
      </p>
    ),
  },
];

const Terms = () => (
  <StaticPageShell>
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C2410C]">
        Legal
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
        Terms of Service
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-stone-600">
        Last updated: August 2026. The short version: use Leap.ai honestly, pay for what you
        use, and don't break it. The details below are the real terms.
      </p>

      <div className="mt-10 space-y-10">
        {sections.map((s) => (
          <section key={s.title} className="border-t border-stone-200 pt-6">
            <h2 className="text-[15px] font-semibold tracking-tight">{s.title}</h2>
            <div className="mt-3">{s.body}</div>
          </section>
        ))}
      </div>
    </div>
  </StaticPageShell>
);

export default Terms;
