import { Link } from "react-router-dom";
import { PenLine } from "lucide-react";
import StaticPageShell from "./StaticPageShell";

const Blog = () => (
  <StaticPageShell>
    <section className="border-b border-edu-ink/5">
      <div className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8 sm:py-20">
        <span className="inline-flex items-center rounded-full bg-edu-peach px-4 py-1.5 text-xs font-semibold text-edu-peach-fg">
          Resources · Blog
        </span>
        <h1 className="mx-auto mt-4 max-w-xl font-marketing text-4xl font-extrabold tracking-tight text-edu-ink sm:text-5xl">
          The first post is coming soon.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-edu-ink/70">
          Leap.ai is built and written by one person — no ghostwritten filler while the shelf is
          empty. When there's something worth saying about career strategy or skill-building,
          it'll show up here.
        </p>
        <div className="mt-10 rounded-3xl border border-edu-ink/10 bg-white p-8 shadow-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-edu-lavender text-edu-lavender-fg">
            <PenLine className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm text-edu-ink/60">No posts yet.</p>
        </div>
        <Link
          to="/"
          className="mt-8 inline-block text-sm font-semibold text-edu-indigo hover:text-edu-ink"
        >
          ← Back to home
        </Link>
      </div>
    </section>
  </StaticPageShell>
);

export default Blog;
