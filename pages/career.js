import { PageLayout } from ".";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Briefcase, Clock, ArrowRight } from "lucide-react";
// =============================================
// Careers Page (pages/careers.js)
// =============================================
export default function CareersPage() {
    // Placeholder job openings - fetch from API/CMS
    const jobOpenings = [
        { id: 1, title: "Senior Frontend Engineer (React/Next.js)", location: "Remote (Global)", department: "Engineering", type: "Full-time", description: "Lead the development of our user-facing applications, focusing on performance, accessibility, and user experience using React, Next.js, and Tailwind CSS.", link: "#job-1" },
        { id: 2, title: "AI/ML Engineer - NLP Specialist", location: "Tech City Hub or Remote (Remote or Nairobi Kenya/EMEA)", department: "Engineering", type: "Full-time", description: "Design, develop, and deploy machine learning models, particularly focusing on Natural Language Processing for personalized career recommendations and insights.", link: "#job-2" },
        { id: 3, title: "Product Manager - Platform Growth", location: "Remote (Remote or Nairobi Kenya)", department: "Product", type: "Full-time", description: "Own the product strategy and roadmap for user acquisition, activation, retention, and monetization. Drive growth through data-informed decisions.", link: "#job-3" },
        { id: 4, title: "Content Marketing Manager", location: "Remote (Global)", department: "Marketing", type: "Full-time", description: "Develop and execute a content strategy that drives brand awareness, user engagement, and thought leadership in the career development space.", link: "#job-4" },
    ];

    return (
        <PageLayout title="Join Our Mission" description="Help us empower career journeys worldwide. Explore open positions at CareerLeap.ai and shape the future of work.">
             <div className="mb-16 text-center max-w-3xl mx-auto space-y-4">
                <p className="text-lg text-gray-600 dark:text-gray-300">
                    We are a diverse, remote-first team passionate about leveraging technology to make a positive impact on people's professional lives. If you thrive in collaborative environments and are driven by innovation and purpose, we'd love for you to join us.
                </p>
                 {/* Optional: Link to company values or culture video/page */}
                 <Button variant="outline" href="/about" className="dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">Learn About Our Culture</Button>
            </div>

            <div className="space-y-8">
                 <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-8">Current Openings</h2>
                {jobOpenings.length > 0 ? jobOpenings.map(job => (
                    <Card key={job.id} className="dark:bg-cyan-900/50 dark:border-cyan-800 hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                                <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400">
                                    <a href={job.link}>{job.title}</a>
                                </h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="inline-flex items-center whitespace-nowrap"><MapPin className="h-4 w-4 mr-1.5 text-cyan-500"/> {job.location}</span>
                                    <span className="inline-flex items-center whitespace-nowrap"><Briefcase className="h-4 w-4 mr-1.5 text-cyan-500"/> {job.department}</span>
                                    <span className="inline-flex items-center whitespace-nowrap"><Clock className="h-4 w-4 mr-1.5 text-cyan-500"/> {job.type}</span>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">{job.description}</p>
                            <Button asChild variant="outline" className="dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">
                            {/* href={job.link} */}
                                <a href="/contact">This feature is not ready just check my contact & Apply <ArrowRight className="ml-2 h-4 w-4"/></a>
                            </Button>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="text-center py-16">
                        <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4"/>
                        <p className="text-xl text-gray-500 dark:text-gray-400">No open positions at the moment.</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Check back soon or submit a general application!</p>
                    </div>
                )}
            </div>

             <div className="mt-16 text-center bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-900/30 dark:to-purple-900/30 p-8 md:p-12 rounded-lg">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Don't See Your Ideal Role?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">We're always looking for passionate and talented individuals to join our mission. If you believe you can contribute, send us your resume and tell us why you'd be a great fit.</p>
                 <Button size="lg" asChild className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">
                    <a href="mailto:jamesmweni52@gmail.com?subject=General Application||CareeLeap.ai">Submit General Application</a>
                 </Button>
            </div>
        </PageLayout>
    );
}

