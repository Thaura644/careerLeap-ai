// pages/waitlist.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { PageLayout } from '.';

// 1. Type-safe default props
const DEFAULT_META = {
  title: 'Join Waitlist - CareerLeap.ai',
  description: 'Get early access to AI-powered career growth tools'
};

// 2. Professional-grade static props handling
export async function getStaticProps() {
  return {
    props: {
      meta: DEFAULT_META,
      content: {
        header: 'Priority Access Waitlist',
        subheader: 'Be first to experience our career acceleration platform'
      }
    },
    revalidate: 3600
  };
}

// 3. Component with proper prop validation
const WaitlistPage = ({ meta = DEFAULT_META, content }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', role: '' });

  // 4. Robust form handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/waitlist/confirmation');
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <PageLayout
      title={meta.title}
      description={meta.description}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {content.header}
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            {content.subheader}
          </p>
        </div>

        {/* Professional form implementation */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          {/* Form fields */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300">Professional Email</span>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </label>
            
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300">Role</span>
              <input
                type="role"
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
          >
            Join Priority List
          </button>
        </form>
      </div>
    </PageLayout>
  );
};

export default WaitlistPage;