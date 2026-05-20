import { Link } from "react-router-dom";

type MarketingPageTemplateProps = {
  title: string;
  description: string;
};

const MarketingPageTemplate = ({ title, description }: MarketingPageTemplateProps) => {
  return (
    <main className="min-h-screen bg-white px-4 py-16 text-slate-900 dark:bg-cyan-950 dark:text-cyan-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-cyan-100/80">{description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/" className="rounded-md bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700">Back to Home</Link>
          <Link to="/dashboard" className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50 dark:border-cyan-800 dark:hover:bg-cyan-900">Open Dashboard</Link>
        </div>
      </div>
    </main>
  );
};

export default MarketingPageTemplate;
