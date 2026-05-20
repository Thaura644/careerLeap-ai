import { PageLayout } from ".";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Mail } from "lucide-react";


// =============================================
// Support Page (pages/support.js)
// =============================================
export function SupportPage() {
    return (
        <PageLayout title="Support Center" description="Need help? Find resources or contact our dedicated support team.">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {/* Card 1: FAQ */}
               <Card className="dark:bg-cyan-900/50 dark:border-cyan-800 hover:shadow-md transition-shadow duration-200 flex flex-col">
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-xl font-semibold dark:text-white">Knowledge Base & FAQs</CardTitle>
                       <HelpCircle className="h-8 w-8 text-cyan-500 dark:text-cyan-400"/>
                   </CardHeader>
                   <CardContent className="flex-grow">
                       <p className="text-gray-600 dark:text-gray-300 mb-4">Find quick answers to common questions about features, billing, and account management.</p>
                   </CardContent>
                    <CardFooter>
                       <Button variant="outline" asChild className="w-full dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">
                           <a href="/faq">Browse FAQs <ArrowRight className="ml-2 h-4 w-4"/></a>
                       </Button>
                   </CardFooter>
               </Card>

                {/* Card 2: Contact Support */}
                <Card className="dark:bg-cyan-900/50 dark:border-cyan-800 hover:shadow-md transition-shadow duration-200 flex flex-col">
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-xl font-semibold dark:text-white">Contact Support</CardTitle>
                       <Mail className="h-8 w-8 text-cyan-500 dark:text-cyan-400"/>
                   </CardHeader>
                   <CardContent className="flex-grow">
                       <p className="text-gray-600 dark:text-gray-300 mb-4">Can't find what you need? Reach out via our contact form for personalized assistance.</p>
                   </CardContent>
                    <CardFooter>
                       <Button variant="outline" asChild className="w-full dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">
                           <a href="/contact">Submit a Request <ArrowRight className="ml-2 h-4 w-4"/></a>
                       </Button>
                   </CardFooter>
               </Card>

                {/* Card 3: Community Link */}
                <Card className="dark:bg-cyan-900/50 dark:border-cyan-800 hover:shadow-md transition-shadow duration-200 flex flex-col">
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-xl font-semibold dark:text-white">Community Forum</CardTitle>
                       <Users className="h-8 w-8 text-cyan-500 dark:text-cyan-400"/>
                   </CardHeader>
                   <CardContent className="flex-grow">
                       <p className="text-gray-600 dark:text-gray-300 mb-4">Ask questions and find solutions from fellow Leap.ai users and moderators.</p>
                   </CardContent>
                    <CardFooter>
                       <Button variant="outline" asChild className="w-full dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">
                           <a href="/community">Visit Community <ArrowRight className="ml-2 h-4 w-4"/></a>
                       </Button>
                   </CardFooter>
               </Card>

                {/* Optional: Add cards for Guides/Tutorials, System Status etc. */}
           </div>
           <div className="mt-12 text-center border-t dark:border-cyan-800 pt-8">
               <p className="text-gray-500 dark:text-gray-400">Our support team typically responds within 24 business hours.</p>
           </div>
        </PageLayout>
   );
}


export default SupportPage;