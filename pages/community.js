import { PageLayout } from ".";
import { Users } from "lucide-react";
import { MessageSquare } from "lucide-react";
import { HelpCircle } from "lucide-react";
import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
// =============================================
// Community Page (pages/community.js)
// =============================================
export default function CommunityPage() {
    return (
        <PageLayout title="Leap.ai Community" description="Connect, share experiences, ask questions, and grow together with fellow professionals and mentors.">
            <div className="text-center max-w-4xl mx-auto">
                 <Users className="h-16 w-16 text-cyan-500 dark:text-cyan-400 mx-auto mb-6"/>
                 <p className="text-xl text-gray-700 dark:text-gray-200 mb-6">
                    Welcome to the heart of Leap.ai! Our community is the place to find support, inspiration, and valuable connections on your career journey.
                </p>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
                    <div className="p-6 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
                        <MessageSquare className="h-10 w-10 text-cyan-600 dark:text-cyan-400 mx-auto mb-4"/>
                        <h3 className="text-lg font-semibold mb-2 dark:text-white">Discussion Forums</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Engage in conversations based on industry, skills, or career challenges.</p>
                    </div>
                     <div className="p-6 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                        <HelpCircle className="h-10 w-10 text-purple-600 dark:text-purple-400 mx-auto mb-4"/>
                        <h3 className="text-lg font-semibold mb-2 dark:text-white">Q&A Hub</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Ask questions and get answers from peers, mentors, and career experts.</p>
                    </div>
                     <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <HeartHandshake className="h-10 w-10 text-green-600 dark:text-green-400 mx-auto mb-4"/>
                        <h3 className="text-lg font-semibold mb-2 dark:text-white">Groups & Mentorship</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Join focused groups and connect with mentors for targeted guidance (plan dependent).</p>
                    </div>
                </div>

                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    Access to the community requires an active Leap.ai account. Log in or sign up to participate!
                </p>
                <div className="flex justify-center gap-4">
                     <Button size="lg" asChild className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">
                        <a href="/login">Log In to Community</a>
                     </Button>
                      <Button size="lg" variant="outline" asChild className="dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">
                        <a href="/signup">Sign Up Now</a>
                     </Button>
                </div>
                 {/* Placeholder: Could show snippets of recent discussions if logged in */}
            </div>
        </PageLayout>
    );
}
