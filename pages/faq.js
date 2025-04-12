import { PageLayout } from ".";
import { Accordion } from "@radix-ui/react-accordion";
import { AccordionItem } from "@radix-ui/react-accordion";
import { AccordionTrigger } from "@radix-ui/react-accordion";
import { AccordionContent } from "@radix-ui/react-accordion";
import { Button } from "@/components/ui/button";
// =============================================
// FAQ Page (pages/faq.js)
// =============================================
export default function FaqPage() {
    // FAQ data - can be fetched from a CMS or API
    const faqData = [
      {
        id: "faq-1",
        question: "What is Leap.ai?",
        answer: "Leap.ai is an AI-powered platform designed to help individuals navigate their career paths effectively. We provide personalized roadmaps, AI-driven insights, mentorship connections, and community support to foster professional growth and help overcome challenges like career uncertainty or imposter syndrome."
      },
      {
        id: "faq-2",
        question: "How does the AI create personalized roadmaps?",
        answer: "Our AI analyzes your stated career goals, current skills (which you can input or we can help assess), interests, and preferred learning styles. Based on this data and insights from successful career paths in various industries, it generates a customized step-by-step roadmap, suggesting skills to acquire, resources to use, potential mentors, and relevant milestones."
      },
      {
        id: "faq-3",
        question: "Who is Leap.ai for?",
        answer: "Leap.ai is designed for anyone looking to take control of their professional development, whether you're a recent graduate, considering a career change, aiming for a promotion, or simply seeking more clarity and confidence in your current path. It's particularly helpful for those facing career uncertainty or imposter syndrome."
      },
      {
        id: "faq-4",
        question: "How does the mentorship program work?",
        answer: "Subscribers to our Professional or Ultimate plans gain access to our network of vetted mentors. You can browse profiles, filter by industry or expertise, and request connections. Mentorship formats vary and can include scheduled calls, Q&A sessions, or project feedback, based on mutual agreement."
      },
      {
        id: "faq-5",
        question: "What kind of community support is available?",
        answer: "Our community platform (accessible to all members) includes forums for discussion, Q&A sections, groups based on interests or industries, and opportunities to share successes and challenges. It's a space to connect with peers, learn from others, and build a supportive professional network."
      },
       {
        id: "faq-6",
        question: "What are the subscription plans and pricing?",
        answer: "We offer three main plans: Starter (14-day free trial with basic features), Professional (monthly subscription with enhanced features and mentorship access), and Ultimate (monthly subscription with premium features, one-on-one mentorship, and exclusive content). Please visit our <a href='/#pricing' class='text-cyan-600 dark:text-cyan-400 hover:underline'>Pricing section</a> for detailed comparisons and current costs."
      },
       {
        id: "faq-7",
        question: "Is my personal data secure?",
        answer: "Absolutely. Data security and privacy are paramount. We employ industry-standard encryption and security measures to protect your information. For full details, please review our <a href='/privacy' class='text-cyan-600 dark:text-cyan-400 hover:underline'>Privacy Policy</a>."
      },
       {
        id: "faq-8",
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, you can easily cancel your subscription at any time from your account settings page. Your access will continue until the end of your current paid billing cycle."
      }
    ];
  
    return (
      <PageLayout title="Frequently Asked Questions" description="Find answers to common questions about Leap.ai features, pricing, and more.">
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="border-b dark:border-cyan-800">
                <AccordionTrigger className="text-left text-lg font-medium hover:no-underline dark:text-white dark:hover:text-cyan-300 py-4">
                  {item.question}
                </AccordionTrigger>
                {/* Use dangerouslySetInnerHTML for answers containing HTML links */}
                <AccordionContent
                   className="text-base text-gray-600 dark:text-gray-300 pt-1 pb-4"
                >
                <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-12 text-center border-t dark:border-cyan-800 pt-8">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Still have questions?</p>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Our support team is ready to help.</p>
              <Button asChild className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">
                  <a href="/contact">Contact Support</a>
              </Button>
          </div>
        </div>
      </PageLayout>
    );
  }