// import React, { useState, useEffect, createContext, useContext } from 'react';

// // Assume icons are available via lucide-react
// import {
//   Moon, Sun, Menu, X, Target, BrainCircuit, Users, MessageSquare,
//   HeartHandshake, Lightbulb, Zap, CheckCircle, ArrowRight, Quote,
//   LogIn, UserPlus, Mail, Lock, Building, Phone, MapPin, ChevronRight,
//   Search, BookOpen, CalendarDays, UserCircle, Briefcase, FileText, ShieldCheck, HelpCircle, LifeBuoy
// } from 'lucide-react';

// // Assume shadcn/ui components are set up and imported correctly
// // You might need to add: dialog, input, textarea, accordion, select
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // If needed for forms

// // --- Re-use Theme Context & Hook (from landing page) ---
// // In a real app, this would likely live in a shared context file or _app.js
// const ThemeContext = createContext({
//   theme: 'light',
//   toggleTheme: () => {},
// });
// const useTheme = () => useContext(ThemeContext);

// // --- Re-use Header & Footer Components (Import from landing page structure) ---
// // For this example, we assume Header and Footer are imported from shared components
// // const Header = () => <div>Header Placeholder</div>; // Replace with actual import
// // const Footer = () => <div>Footer Placeholder</div>; // Replace with actual import

// // --- Helper: Page Layout Component ---
// // Wraps page content with Header, Footer, and basic padding
// // Assumes Header and Footer components are available/imported
// const PageLayout = ({ children, title, description }) => (
//     // Assuming ThemeProvider wraps the entire app in _app.js
//     // If not, wrap this layout with ThemeProvider
//     <div className="flex flex-col min-h-screen bg-white dark:bg-cyan-950 transition-colors duration-300">
//         {/* <Header /> */} {/* Import and use your actual Header */}
//         <main className="flex-grow py-12 sm:py-16 lg:py-20">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 {title && (
//                     <div className="mb-8 text-center">
//                         <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">{title}</h1>
//                         {description && <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">{description}</p>}
//                     </div>
//                 )}
//                 {children}
//             </div>
//         </main>
//         {/* <Footer /> */} {/* Import and use your actual Footer */}
//     </div>
// );


// // --- Modals ---

// // Login Modal Component
// const LoginModal = () => {
//   // Add state for form handling if needed
//   return (
//     <DialogContent className="sm:max-w-[425px] dark:bg-cyan-900 dark:border-cyan-800">
//       <DialogHeader>
//         <DialogTitle className="text-center text-2xl font-bold dark:text-white">Log In</DialogTitle>
//         <DialogDescription className="text-center dark:text-gray-400">
//           Access your Leap.ai account.
//         </DialogDescription>
//       </DialogHeader>
//       <div className="grid gap-4 py-4">
//         <div className="grid grid-cols-4 items-center gap-4">
//           <Label htmlFor="email-login" className="text-right dark:text-gray-300">
//             Email
//           </Label>
//           <Input id="email-login" type="email" placeholder="you@example.com" className="col-span-3 dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400" />
//         </div>
//         <div className="grid grid-cols-4 items-center gap-4">
//           <Label htmlFor="password-login" className="text-right dark:text-gray-300">
//             Password
//           </Label>
//           <Input id="password-login" type="password" placeholder="••••••••" className="col-span-3 dark:bg-cyan-800 dark:border-cyan-700 dark:text-white" />
//         </div>
//         <div className="text-right text-sm">
//             <a href="#" className="text-cyan-600 hover:underline dark:text-cyan-400">Forgot password?</a>
//         </div>
//       </div>
//       <DialogFooter className="sm:justify-center">
//         <Button type="submit" className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">
//           Log In <LogIn className="ml-2 h-4 w-4" />
//         </Button>
//       </DialogFooter>
//        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
//           Don't have an account?{' '}
//           {/* This should ideally trigger the SignUp modal */}
//           <DialogClose asChild>
//              <Button variant="link" className="p-0 h-auto font-medium text-cyan-600 dark:text-cyan-400 hover:underline">
//                 Sign Up
//              </Button>
//           </DialogClose>
//         </p>
//     </DialogContent>
//   );
// };

// // Sign Up Modal Component
// const SignUpModal = () => {
//   // Add state for form handling if needed
//   return (
//     <DialogContent className="sm:max-w-[425px] dark:bg-cyan-900 dark:border-cyan-800">
//       <DialogHeader>
//         <DialogTitle className="text-center text-2xl font-bold dark:text-white">Sign Up</DialogTitle>
//         <DialogDescription className="text-center dark:text-gray-400">
//           Create your Leap.ai account to start your journey.
//         </DialogDescription>
//       </DialogHeader>
//       <div className="grid gap-4 py-4">
//          <div className="grid grid-cols-4 items-center gap-4">
//           <Label htmlFor="name-signup" className="text-right dark:text-gray-300">
//             Name
//           </Label>
//           <Input id="name-signup" placeholder="Your Name" className="col-span-3 dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400" />
//         </div>
//         <div className="grid grid-cols-4 items-center gap-4">
//           <Label htmlFor="email-signup" className="text-right dark:text-gray-300">
//             Email
//           </Label>
//           <Input id="email-signup" type="email" placeholder="you@example.com" className="col-span-3 dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400" />
//         </div>
//         <div className="grid grid-cols-4 items-center gap-4">
//           <Label htmlFor="password-signup" className="text-right dark:text-gray-300">
//             Password
//           </Label>
//           <Input id="password-signup" type="password" placeholder="Create a password" className="col-span-3 dark:bg-cyan-800 dark:border-cyan-700 dark:text-white" />
//         </div>
//          {/* Add Confirm Password field if desired */}
//          <div className="items-top flex space-x-2 mt-2">
//              <input type="checkbox" id="terms" className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground mt-1"/>
//              <div className="grid gap-1.5 leading-none">
//                  <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300">
//                     Accept terms and conditions
//                  </label>
//                  <p className="text-sm text-muted-foreground dark:text-gray-400">
//                     You agree to our <a href="/terms" target="_blank" className="underline hover:text-cyan-600 dark:hover:text-cyan-400">Terms of Service</a> and <a href="/privacy" target="_blank" className="underline hover:text-cyan-600 dark:hover:text-cyan-400">Privacy Policy</a>.
//                  </p>
//              </div>
//          </div>
//       </div>
//       <DialogFooter className="sm:justify-center">
//         <Button type="submit" className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">
//           Create Account <UserPlus className="ml-2 h-4 w-4" />
//         </Button>
//       </DialogFooter>
//       <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
//           Already have an account?{' '}
//            {/* This should ideally trigger the Login modal */}
//           <DialogClose asChild>
//              <Button variant="link" className="p-0 h-auto font-medium text-cyan-600 dark:text-cyan-400 hover:underline">
//                 Log In
//              </Button>
//           </DialogClose>
//         </p>
//     </DialogContent>
//   );
// };

// // --- Page Components ---

// // About Us Page
// const AboutUsPage = () => (
//   <PageLayout title="About Leap.ai" description="Empowering career journeys through personalized guidance and AI.">
//     <div className="prose prose-lg dark:prose-invert max-w-none lg:prose-xl mx-auto text-gray-600 dark:text-gray-300">
//       {/* Use prose classes for nice typography on text-heavy pages */}
//       <h2>Our Mission</h2>
//       <p>At Leap.ai, our mission is to empower individuals to navigate their career paths with clarity, confidence, and purpose. We believe everyone deserves the opportunity to reach their full professional potential, and we leverage the power of AI and community to make that happen.</p>

//       <h2>Our Vision</h2>
//       <p>We envision a world where career development is personalized, accessible, and effective for everyone. We aim to be the leading platform for AI-driven career guidance, helping people overcome challenges like uncertainty and imposter syndrome, acquire necessary skills, and build meaningful professional connections.</p>

//       <h2>What We Do</h2>
//       <p>Leap.ai provides a suite of tools and resources designed to support your career growth:</p>
//       <ul>
//         <li><strong>Personalized Roadmaps:</strong> AI algorithms analyze your goals, skills, and preferences to create tailored career paths and learning plans.</li>
//         <li><strong>AI-Driven Insights:</strong> Get recommendations for skills, courses, and connections relevant to your desired trajectory.</li>
//         <li><strong>Mentorship Network:</strong> Connect with experienced professionals in your field for guidance and support.</li>
//         <li><strong>Supportive Community:</strong> Engage with peers, share experiences, ask questions, and celebrate successes in our dynamic community forums.</li>
//         <li><strong>Resource Hub:</strong> Access curated articles, workshops, and tools to help you develop skills and overcome challenges.</li>
//       </ul>

//       <h2>Our Team</h2>
//       <p>We are a passionate team of technologists, career coaches, and educators dedicated to building a platform that makes a real difference in people's professional lives. [Optional: Add brief team bios or photos here].</p>

//       <h2>Join Us</h2>
//       <p>Ready to take the leap? <a href="/#pricing" className="text-cyan-600 dark:text-cyan-400 hover:underline">Explore our plans</a> and start transforming your career journey today!</p>
//     </div>
//   </PageLayout>
// );

// // Contact Us Page
// const ContactUsPage = () => {
//   // Add state for form handling
//   const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
//   const [isSubmitted, setIsSubmitted] = useState(false);

//   const handleChange = (e) => {
//     const { id, value } = e.target;
//     setFormData(prev => ({ ...prev, [id]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Handle form submission logic (e.g., send data to API)
//     console.log('Form submitted:', formData);
//     setIsSubmitted(true);
//     // Reset form after a delay or navigate
//     // setTimeout(() => setIsSubmitted(false), 5000);
//   };

//   return (
//     <PageLayout title="Contact Us" description="We'd love to hear from you. Reach out with questions or feedback.">
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
//         {/* Contact Info Column */}
//         <div className="md:col-span-1 space-y-6">
//           <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Get in Touch</h2>
//           <p className="text-gray-600 dark:text-gray-300">
//             Use the form or contact us directly through the details below.
//           </p>
//           <div className="space-y-4">
//             <div className="flex items-start space-x-3">
//               <MapPin className="h-6 w-6 text-cyan-600 dark:text-cyan-400 mt-1 flex-shrink-0" />
//               <div>
//                 <h3 className="font-medium text-gray-900 dark:text-white">Address</h3>
//                 <p className="text-gray-600 dark:text-gray-300">123 Innovation Drive<br />Tech City, TC 54321</p>
//               </div>
//             </div>
//             <div className="flex items-start space-x-3">
//               <Mail className="h-6 w-6 text-cyan-600 dark:text-cyan-400 mt-1 flex-shrink-0" />
//               <div>
//                 <h3 className="font-medium text-gray-900 dark:text-white">Email</h3>
//                 <a href="mailto:support@Leap.ai" className="text-cyan-600 dark:text-cyan-400 hover:underline">support@Leap.ai</a>
//               </div>
//             </div>
//             <div className="flex items-start space-x-3">
//               <Phone className="h-6 w-6 text-cyan-600 dark:text-cyan-400 mt-1 flex-shrink-0" />
//               <div>
//                 <h3 className="font-medium text-gray-900 dark:text-white">Phone</h3>
//                 <a href="tel:+1234567890" className="text-cyan-600 dark:text-cyan-400 hover:underline">+1 (234) 567-890</a>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Contact Form Column */}
//         <div className="md:col-span-2">
//           {isSubmitted ? (
//              <Card className="dark:bg-cyan-900/50 dark:border-cyan-800">
//                 <CardContent className="p-6 text-center">
//                     <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4"/>
//                     <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
//                     <p className="text-gray-600 dark:text-gray-300">Thank you for contacting us. We'll get back to you shortly.</p>
//                 </CardContent>
//              </Card>
//           ) : (
//             <Card className="dark:bg-cyan-900/50 dark:border-cyan-800">
//               <CardHeader>
//                 <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Send us a Message</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                     <div>
//                       <Label htmlFor="name" className="dark:text-gray-300">Full Name</Label>
//                       <Input type="text" id="name" value={formData.name} onChange={handleChange} required className="mt-1 dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400" />
//                     </div>
//                     <div>
//                       <Label htmlFor="email" className="dark:text-gray-300">Email Address</Label>
//                       <Input type="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400" />
//                     </div>
//                   </div>
//                   <div>
//                     <Label htmlFor="subject" className="dark:text-gray-300">Subject</Label>
//                     <Input type="text" id="subject" value={formData.subject} onChange={handleChange} required className="mt-1 dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400" />
//                   </div>
//                   <div>
//                     <Label htmlFor="message" className="dark:text-gray-300">Message</Label>
//                     <Textarea id="message" rows={5} value={formData.message} onChange={handleChange} required className="mt-1 dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400" />
//                   </div>
//                   <div>
//                     <Button type="submit" className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">
//                       Send Message <Mail className="ml-2 h-4 w-4" />
//                     </Button>
//                   </div>
//                 </form>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>
//     </PageLayout>
//   );
// };


// // FAQ Page
// const FaqPage = () => {
//   const faqData = [
//     {
//       question: "What is Leap.ai?",
//       answer: "Leap.ai is an AI-powered platform designed to help individuals navigate their career paths effectively. We provide personalized roadmaps, AI-driven insights, mentorship connections, and community support to foster professional growth."
//     },
//     {
//       question: "How does the AI create personalized roadmaps?",
//       answer: "Our AI analyzes your stated career goals, current skills (which you can input or we can help assess), interests, and preferred learning styles. Based on this data and insights from successful career paths in various industries, it generates a customized step-by-step roadmap, suggesting skills to acquire, resources to use, and potential milestones."
//     },
//     {
//       question: "Is my data secure?",
//       answer: "Yes, data security and privacy are our top priorities. We use industry-standard encryption and security protocols to protect your personal information. Please refer to our Privacy Policy for detailed information."
//     },
//     {
//       question: "How does the mentorship program work?",
//       answer: "Once you subscribe to a relevant plan (Professional or Ultimate), you gain access to our network of vetted mentors. You can browse mentor profiles, filter by industry or expertise, and request connections. Mentorship can take various forms, including scheduled calls, Q&A sessions, or project feedback, depending on the mentor's availability and your agreement."
//     },
//     {
//       question: "What kind of community support is available?",
//       answer: "Our community platform includes forums for discussion, Q&A sections, groups based on interests or industries, and opportunities to share successes and challenges. It's a space to connect with peers, learn from others, and build a supportive professional network."
//     },
//      {
//       question: "What are the different subscription plans?",
//       answer: "We offer three plans: Starter (14-day free trial with basic features), Professional (monthly subscription with enhanced features and mentorship access), and Ultimate (monthly subscription with premium features, one-on-one mentorship, and exclusive content). You can find detailed comparisons on our Pricing page."
//     },
//      {
//       question: "Can I cancel my subscription anytime?",
//       answer: "Yes, you can cancel your subscription at any time through your account settings. If you cancel, your access will continue until the end of your current billing period."
//     }
//   ];

//   return (
//     <PageLayout title="Frequently Asked Questions" description="Find answers to common questions about Leap.ai.">
//       <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
//         {faqData.map((item, index) => (
//           <AccordionItem key={index} value={`item-${index}`} className="border-b dark:border-cyan-800">
//             <AccordionTrigger className="text-left text-lg font-medium hover:no-underline dark:text-white dark:hover:text-cyan-300">
//               {item.question}
//             </AccordionTrigger>
//             <AccordionContent className="text-base text-gray-600 dark:text-gray-300 pt-2 pb-4">
//               {item.answer}
//             </AccordionContent>
//           </AccordionItem>
//         ))}
//       </Accordion>
//       <div className="mt-12 text-center">
//           <p className="text-lg text-gray-600 dark:text-gray-300">Can't find the answer you're looking for?</p>
//           <Button asChild variant="link" className="text-lg text-cyan-600 dark:text-cyan-400 px-1">
//               <a href="/contact">Contact our support team</a>
//           </Button>
//       </div>
//     </PageLayout>
//   );
// };

// // Blog Index Page (Resources)
// const BlogIndexPage = () => {
//   // Placeholder blog post data - fetch from API in real app
//   const posts = [
//     { id: 1, title: "Mastering Skills for Career Advancement", excerpt: "Explore actionable steps to develop essential skills that can set you apart...", date: "2023-02-15", category: "Skill Development", slug: "mastering-skills" },
//     { id: 2, title: "Overcoming Imposter Syndrome", excerpt: "Identify strategies to combat feelings of self-doubt and build confidence...", date: "2023-02-20", category: "Mindset", slug: "overcoming-imposter-syndrome" },
//     { id: 3, title: "Building a Supportive Network", excerpt: "Discover the importance of mentorship and community in your career development...", date: "2023-02-25", category: "Networking", slug: "building-supportive-network" },
//     { id: 4, title: "AI in Career Planning: Hype vs. Reality", excerpt: "How can artificial intelligence genuinely help you map out your future?...", date: "2023-03-05", category: "Technology", slug: "ai-in-career-planning" },
//     { id: 5, title: "Negotiating Your Salary Like a Pro", excerpt: "Tips and techniques to confidently negotiate for the compensation you deserve...", date: "2023-03-10", category: "Career Growth", slug: "negotiating-salary" },
//   ];

//   // Add state for search/filter if needed
//   const [searchTerm, setSearchTerm] = useState('');

//   const filteredPosts = posts.filter(post =>
//     post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <PageLayout title="Leap Insights" description="Articles, tips, and resources to empower your professional journey.">
//        {/* Search Bar */}
//       <div className="mb-8 max-w-lg mx-auto">
//         <div className="relative">
//           <Input
//             type="search"
//             placeholder="Search articles..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10 dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400"
//           />
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//         </div>
//          {/* Optional: Category filters */}
//       </div>

//       {/* Blog Post Grid */}
//       <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
//         {filteredPosts.length > 0 ? filteredPosts.map((post) => (
//           <Card key={post.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-cyan-900/50 dark:border-cyan-800 flex flex-col">
//             {/* Optional Placeholder Image */}
//             {/* <img src={`https://placehold.co/600x400/E0F2FE/0E7490?text=${post.category}`} alt="" className="h-48 w-full object-cover"/> */}
//             <CardContent className="p-6 flex-grow flex flex-col">
//               <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mb-1">{post.category}</p>
//               <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
//                 <a href={`/blog/${post.slug}`} className="hover:text-cyan-600 dark:hover:text-cyan-400">{post.title}</a>
//               </CardTitle>
//               <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">{post.excerpt}</p>
//               <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t dark:border-cyan-800">
//                  <span>
//                     <CalendarDays className="inline-block h-4 w-4 mr-1" />
//                     {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
//                  </span>
//                  <a href={`/blog/${post.slug}`} className="text-cyan-600 dark:text-cyan-400 font-medium hover:underline">
//                     Read More <span aria-hidden="true">&rarr;</span>
//                 </a>
//               </div>
//             </CardContent>
//           </Card>
//         )) : (
//              <p className="md:col-span-2 lg:col-span-3 text-center text-gray-500 dark:text-gray-400">No articles found matching your search.</p>
//         )}
//       </div>
//        {/* Optional: Pagination */}
//     </PageLayout>
//   );
// };

// // Blog Post Detail Page (Template)
// // In Next.js, this would use getStaticProps/getServerSideProps to fetch post data based on slug
// const BlogPostPage = ({ post }) => {
//   // Default placeholder post if none is passed via props
//   const defaultPost = {
//     title: "Blog Post Title Placeholder",
//     author: "Leap Team",
//     date: new Date().toISOString(),
//     category: "Category",
//     content: `
//       <p>This is placeholder content for a blog post. Replace this with the actual content fetched based on the post slug.</p>
//       <h2>Section Heading</h2>
//       <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
//       <ul>
//         <li>List item one</li>
//         <li>List item two</li>
//         <li>List item three</li>
//       </ul>
//       <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
//       <img src="https://placehold.co/800x400/E0F2FE/0E7490?text=Blog+Image" alt="Placeholder Image" class="rounded-lg my-6"/>
//       <h2>Another Section</h2>
//       <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
//     `,
//     slug: 'placeholder-post'
//   };

//   const currentPost = post || defaultPost;

//   return (
//     <PageLayout>
//       <article className="max-w-3xl mx-auto">
//         {/* Post Header */}
//         <header className="mb-8">
//           <p className="text-base text-cyan-600 dark:text-cyan-400 font-semibold tracking-wide uppercase mb-2">{currentPost.category}</p>
//           <h1 className="block text-3xl leading-tight font-extrabold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl mb-4">
//             {currentPost.title}
//           </h1>
//           <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
//             <UserCircle className="h-5 w-5 mr-2" />
//             <span>By {currentPost.author}</span>
//             <span className="mx-2">|</span>
//             <CalendarDays className="h-5 w-5 mr-2" />
//             <span>{new Date(currentPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
//           </div>
//         </header>

//          {/* Optional Featured Image */}
//          {/* <img src="featured-image.jpg" alt="" className="w-full h-auto rounded-lg mb-8" /> */}

//         {/* Post Content */}
//         <div
//           className="prose prose-lg dark:prose-invert lg:prose-xl max-w-none text-gray-600 dark:text-gray-300"
//           dangerouslySetInnerHTML={{ __html: currentPost.content }} // Be careful with dangerouslySetInnerHTML - ensure content is sanitized
//         />

//         {/* Optional: Author Bio, Share Buttons, Related Posts */}
//         <footer className="mt-12 pt-8 border-t dark:border-cyan-800">
//             <Button variant="outline" asChild className="dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">
//                 <a href="/blog"> &larr; Back to Blog</a>
//             </Button>
//             {/* Add share buttons or related posts here */}
//         </footer>
//       </article>
//     </PageLayout>
//   );
// };


// // Careers Page
// const CareersPage = () => {
//     // Placeholder job openings - fetch from API
//     const jobOpenings = [
//         { id: 1, title: "Senior Frontend Engineer", location: "Remote", department: "Engineering", type: "Full-time", description: "Build and maintain our user-facing applications using React, Next.js, and Tailwind CSS...", link: "#" },
//         { id: 2, title: "AI/ML Engineer", location: "Tech City Hub or Remote", department: "Engineering", type: "Full-time", description: "Develop and deploy machine learning models for personalized career recommendations...", link: "#" },
//         { id: 3, title: "Product Manager - Growth", location: "Remote", department: "Product", type: "Full-time", description: "Lead product initiatives focused on user acquisition, activation, and retention...", link: "#" },
//         { id: 4, title: "Community Manager", location: "Remote", department: "Marketing", type: "Part-time", description: "Engage and grow the Leap.ai user community across various platforms...", link: "#" },
//     ];

//     return (
//         <PageLayout title="Join Our Team" description="Help us empower career journeys worldwide. Explore open positions at Leap.ai.">
//              <div className="mb-12 text-center max-w-3xl mx-auto">
//                 <p className="text-lg text-gray-600 dark:text-gray-300">
//                     We're a passionate team building the future of personalized career guidance. If you're driven by impact and innovation, we'd love to hear from you.
//                 </p>
//                 {/* Optional: Link to company values or culture page */}
//             </div>

//             <div className="space-y-8">
//                  <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-6">Current Openings</h2>
//                 {jobOpenings.length > 0 ? jobOpenings.map(job => (
//                     <Card key={job.id} className="dark:bg-cyan-900/50 dark:border-cyan-800 hover:shadow-md transition-shadow duration-200">
//                         <CardContent className="p-6">
//                             <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
//                                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">{job.title}</h3>
//                                 <div className="flex space-x-3 text-sm text-gray-500 dark:text-gray-400">
//                                     <span className="inline-flex items-center"><MapPin className="h-4 w-4 mr-1"/> {job.location}</span>
//                                     <span className="inline-flex items-center"><Briefcase className="h-4 w-4 mr-1"/> {job.department}</span>
//                                     <span className="inline-flex items-center"><Clock className="h-4 w-4 mr-1"/> {job.type}</span> {/* Assuming Clock icon */}
//                                 </div>
//                             </div>
//                             <p className="text-gray-600 dark:text-gray-300 mb-4">{job.description}</p>
//                             <Button asChild variant="outline" className="dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">
//                                 <a href={job.link}>Learn More & Apply <ArrowRight className="ml-2 h-4 w-4"/></a>
//                             </Button>
//                         </CardContent>
//                     </Card>
//                 )) : (
//                     <p className="text-center text-gray-500 dark:text-gray-400">No open positions at the moment. Check back soon!</p>
//                 )}
//             </div>

//              <div className="mt-12 text-center bg-cyan-50 dark:bg-cyan-900/30 p-8 rounded-lg">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Don't see the right fit?</h3>
//                 <p className="text-gray-600 dark:text-gray-300 mb-4">We're always looking for talented individuals. Send us your resume and tell us how you can contribute.</p>
//                  <Button asChild className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">
//                     <a href="mailto:careers@Leap.ai">Submit General Application</a>
//                  </Button>
//             </div>
//         </PageLayout>
//     );
// };


// // --- Placeholder Pages (Privacy, Terms, Community, Support) ---

// const PlaceholderPolicyPage = ({ title, lastUpdated }) => (
//      <PageLayout title={title}>
//         <div className="prose prose-lg dark:prose-invert max-w-none lg:prose-xl mx-auto text-gray-600 dark:text-gray-300">
//             <p><em>Last Updated: {lastUpdated || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
//             <p>This is placeholder content for the {title}. Please replace this with your actual policy details.</p>
//             <h2>1. Introduction</h2>
//             <p>Details about the policy...</p>
//             <h2>2. Information We Collect</h2>
//             <p>Details about data collection...</p>
//             <h2>3. How We Use Information</h2>
//             <p>Details about data usage...</p>
//             {/* Add more sections as needed */}
//             <h2>Contact Us</h2>
//             <p>If you have questions about this {title}, please <a href="/contact" className="text-cyan-600 dark:text-cyan-400 hover:underline">contact us</a>.</p>
//         </div>
//      </PageLayout>
// );

// const PrivacyPolicyPage = () => <PlaceholderPolicyPage title="Privacy Policy" />;
// const TermsOfServicePage = () => <PlaceholderPolicyPage title="Terms of Service" />;
// const CookiePolicyPage = () => <PlaceholderPolicyPage title="Cookie Policy" />;


// const CommunityPage = () => (
//     <PageLayout title="Leap.ai Community" description="Connect, share, and grow with fellow professionals.">
//         <div className="text-center max-w-3xl mx-auto">
//              <Users className="h-16 w-16 text-cyan-500 dark:text-cyan-400 mx-auto mb-6"/>
//              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
//                 Our community features are currently under development and launching soon! Join our platform to be notified when you can:
//             </p>
//             <ul className="list-disc list-inside text-left space-y-2 mb-8 inline-block text-gray-600 dark:text-gray-300">
//                 <li>Participate in discussion forums based on industry and interests.</li>
//                 <li>Ask questions and get advice from peers and mentors.</li>
//                 <li>Join groups focused on specific skills or career paths.</li>
//                 <li>Share your successes and learn from others' experiences.</li>
//                 <li>Attend community-exclusive events and workshops.</li>
//             </ul>
//             <div>
//                  <Button size="lg" asChild className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">
//                     <a href="/#pricing">Sign Up to Get Notified</a>
//                  </Button>
//             </div>
//         </div>
//     </PageLayout>
// );

// const SupportPage = () => (
//      <PageLayout title="Support Center" description="Need help? Find resources or contact our support team.">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             {/* Option 1: FAQ Link */}
//             <Card className="dark:bg-cyan-900/50 dark:border-cyan-800 hover:shadow-md transition-shadow duration-200">
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-xl font-semibold dark:text-white">FAQs</CardTitle>
//                     <HelpCircle className="h-6 w-6 text-cyan-500 dark:text-cyan-400"/>
//                 </CardHeader>
//                 <CardContent>
//                     <p className="text-gray-600 dark:text-gray-300 mb-4">Find answers to common questions about using Leap.ai.</p>
//                     <Button variant="outline" asChild className="dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">
//                         <a href="/faq">Browse FAQs <ArrowRight className="ml-2 h-4 w-4"/></a>
//                     </Button>
//                 </CardContent>
//             </Card>

//              {/* Option 2: Contact Form Link */}
//              <Card className="dark:bg-cyan-900/50 dark:border-cyan-800 hover:shadow-md transition-shadow duration-200">
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-xl font-semibold dark:text-white">Contact Support</CardTitle>
//                     <Mail className="h-6 w-6 text-cyan-500 dark:text-cyan-400"/>
//                 </CardHeader>
//                 <CardContent>
//                     <p className="text-gray-600 dark:text-gray-300 mb-4">Can't find what you need? Reach out to our support team directly.</p>
//                     <Button variant="outline" asChild className="dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">
//                         <a href="/contact">Contact Us <ArrowRight className="ml-2 h-4 w-4"/></a>
//                     </Button>
//                 </CardContent>
//             </Card>

//              {/* Option 3: Documentation/Guides (If applicable) */}
//              {/* <Card className="dark:bg-cyan-900/50 dark:border-cyan-800 hover:shadow-md transition-shadow duration-200 md:col-span-2">
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-xl font-semibold dark:text-white">Guides & Tutorials</CardTitle>
//                     <BookOpen className="h-6 w-6 text-cyan-500 dark:text-cyan-400"/>
//                 </CardHeader>
//                 <CardContent>
//                     <p className="text-gray-600 dark:text-gray-300 mb-4">Explore detailed guides on using platform features.</p>
//                     <Button variant="outline" asChild className="dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">
//                         <a href="/guides">View Guides <ArrowRight className="ml-2 h-4 w-4"/></a>
//                     </Button>
//                 </CardContent>
//             </Card> */}
//         </div>
//      </PageLayout>
// );


// // --- Example Usage in Header (Triggering Modals) ---
// // You would integrate DialogTrigger within your actual Header component

// const ExampleHeaderWithModals = () => {
//     // ... (rest of Header component logic) ...
//     return (
//         <header>
//             <nav>
//                 {/* ... other nav items ... */}
//                 <Dialog>
//                     <DialogTrigger asChild>
//                          <Button variant="outline" className="dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">Log In</Button>
//                     </DialogTrigger>
//                     <LoginModal />
//                 </Dialog>
//                  <Dialog>
//                     <DialogTrigger asChild>
//                         <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">Sign Up</Button>
//                     </DialogTrigger>
//                     <SignUpModal />
//                  </Dialog>
//                 {/* ... theme toggle etc ... */}
//             </nav>
//         </header>
//     );
// };


// // --- Placeholder shadcn/ui components (if not properly installed/imported) ---
// // Add placeholders for Dialog, Input, Textarea, Accordion if needed, similar to the landing page code.
// // Example:
// const Dialog = ({ children }) => <div>{children}</div>; // Simplified placeholder
// const DialogContent = ({ children, className }) => <div className={`modal-content ${className}`}>{children}</div>; // Simplified placeholder
// const DialogHeader = ({ children }) => <div>{children}</div>; // Simplified placeholder
// const DialogTitle = ({ children }) => <h2>{children}</h2>; // Simplified placeholder
// const DialogDescription = ({ children }) => <p>{children}</p>; // Simplified placeholder
// const DialogFooter = ({ children }) => <div>{children}</div>; // Simplified placeholder
// const DialogTrigger = ({ children, asChild }) => asChild ? React.cloneElement(children, { onClick: () => console.log('Trigger modal') }) : <button onClick={() => console.log('Trigger modal')}>{children}</button>; // Simplified placeholder
// const DialogClose = ({ children, asChild }) => asChild ? React.cloneElement(children, { onClick: () => console.log('Close modal') }) : <button onClick={() => console.log('Close modal')}>{children}</button>; // Simplified placeholder

// export const Input = ({ className, ...props }) => <input className={`border p-2 rounded ${className}`} {...props} />; // Simplified placeholder
// export const Textarea = ({ className, ...props }) => <textarea className={`border p-2 rounded ${className}`} {...props} />; // Simplified placeholder

// export const Accordion = ({ children }) => <div>{children}</div>; // Simplified placeholder
// export const AccordionItem = ({ children, value }) => <div data-value={value}>{children}</div>; // Simplified placeholder
// export const AccordionTrigger = ({ children }) => <button>{children}</button>; // Simplified placeholder
// export const AccordionContent = ({ children }) => <div>{children}</div>; // Simplified placeholder

// // --- Exports (for use in Next.js pages directory) ---
// // You wouldn't typically export everything like this, but structure them into separate files.
// // export { AboutUsPage, ContactUsPage, FaqPage, BlogIndexPage, BlogPostPage, CareersPage, PrivacyPolicyPage, TermsOfServicePage, CookiePolicyPage, CommunityPage, SupportPage, LoginModal, SignUpModal };

// // Example default export for one page (e.g., pages/about.js)
// // export default AboutUsPage;

