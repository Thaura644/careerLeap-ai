import React, { useState, useEffect, createContext, useContext } from 'react';

// Assume these icons are available via lucide-react
// npm install lucide-react
// If not, replace with appropriate SVG or other icon library
import {
  Moon, Sun, Menu, X, Target, BrainCircuit, Users, MessageSquare,
  HeartHandshake, Lightbulb, Zap, CheckCircle, ArrowRight, Quote
} from 'lucide-react';

// Assume shadcn/ui components are set up
// npx shadcn-ui@latest init
// npx shadcn-ui@latest add button card label switch avatar
// You might need to adjust imports based on your actual setup
import { Button } from "@/components/ui/button"; // Adjust path if needed
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"; // Adjust path if needed
import { Label } from "@/components/ui/label"; // Adjust path if needed
import { Switch } from "@/components/ui/switch"; // Adjust path if needed
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Adjust path if needed
import Image from "next/image";
import Link from 'next/link';


// --- Theme Context ---
// Provides theme state (light/dark) and toggle function to components
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // Default theme

  // Load theme from local storage or system preference on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Apply theme class to body and save preference
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// --- Reusable Components ---

// Navigation Bar
const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Features', href: '/#features' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Resources', href: '/#resources' },
    { name: 'Community', href: '/community' }, // Added
    { name: 'FAQ', href: '/faq' }, // Added
    { name: 'Contact', href: '/contact' },
  ];

  // Base colors (adjust tan as needed)
  const lightBg = 'bg-white';
  const darkBg = 'dark:bg-cyan-950'; // Darker cyan for dark bg
  const lightText = 'text-cyan-900';
  const darkText = 'dark:text-cyan-100'; // Light text for dark bg
  const lightHoverText = 'hover:text-cyan-600';
  const darkHoverText = 'dark:hover:text-cyan-300';
  const lightBorder = 'border-gray-200';
  const darkBorder = 'dark:border-cyan-800'; // Slightly lighter border for dark

  return (
    <header className={`sticky top-0 z-50 shadow-sm ${lightBg} ${darkBg} ${lightBorder} dark:border-b ${darkBorder}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-5 md:px7 lg:px-9">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className={`text-2xl font-bold ${lightText} ${darkText}`}>
              Leap.ai
            </a>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className={`text-base font-medium ${lightText} ${darkText} ${lightHoverText} ${darkHoverText}`}>
                {link.name}
              </a>
            ))}
          </div>

          {/* Actions & Theme Toggle (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
             <Button variant="outline" className="dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">Log In</Button>
             <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">Sign Up</Button>
            {/* <ThemeToggle /> */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
             {/* <ThemeToggle /> */}
             <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)} className={`ml-2 ${lightText} ${darkText}`}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`md:hidden absolute top-20 inset-x-0 p-2 transition transform origin-top-right ${lightBg} ${darkBg} shadow-lg ring-1 ring-black ring-opacity-5`}>
          <div className="rounded-lg shadow-lg overflow-hidden">
             <div className={`px-5 pt-4 pb-6 space-y-6 ${lightBg} ${darkBg}`}>
                <div className="space-y-1">
                 {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)} // Close menu on link click
                      className={`block px-3 py-2 rounded-md text-base font-medium ${lightText} ${darkText} ${lightHoverText} ${darkHoverText}`}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
                <div className="flex flex-col space-y-3">
                
                  <Button variant="outline" className="w-full dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800" href="/login">Log In</Button>
                

                  <Button href="/signup" className="w-full bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">Sign Up</Button>
                 </div>
             </div>
          </div>
        </div>
      )}
    </header>
  );
};

// Simple Theme Toggle Component using shadcn/ui Switch
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500 dark:text-gray-400" />
      <Switch
        id="theme-mode"
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
      />
      <Moon className="h-[1.2rem] w-[1.2rem] text-gray-400 dark:text-blue-300" />
    </div>
  );
};


// Hero Section
const HeroSection = () => (
  <div className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-purple-50 dark:from-cyan-900 dark:via-cyan-950 dark:to-purple-900 py-24 sm:py-32">
    {/* Subtle background shapes */}
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      <svg className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-cyan-200 dark:stroke-cyan-700 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]" aria-hidden="true">
        <defs>
          <pattern id="e813992c-7d03-4cc4-a2bd-151760b470a0" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
            <path d="M100 200V.5M.5 .5H200" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth="0" fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
      </svg>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block xl:inline">Transform Your</span>{' '}
            <span className="block text-cyan-600 dark:text-cyan-400 xl:inline">Career Journey</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl">
            Unlock your potential with personalized career roadmaps and AI-driven insights. Leap.ai empowers you to navigate your path effectively and gain the skills to thrive.
          </p>
          <div className="mt-10">
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Image with Testimonial */}
        <div className="relative">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-xl">
          <Image
    src="/career.webp" // Your image path
    alt="Happy professional"
    fill // Tells the image to fill its parent
    className="object-cover" // Your class for styling (e.g., cropping)
    priority // Keep if it's above the fold
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" //  <-- ADD THIS LINE (ADJUST VALUES)
  />
          </div>
          
          {/* Testimonial Overlay */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <blockquote className="text-gray-600 dark:text-gray-300 italic">
              "Leap.ai has given me the clarity and confidence to pursue opportunities I once thought were out of reach."
            </blockquote>
            <div className="mt-4 flex items-center font-medium text-gray-900 dark:text-white">
  <Avatar className="h-12 w-12 mr-4">
    <AvatarImage src="/jm.jpg" />
  </Avatar>
  <div className="flex flex-col justify-center">
    <p>James Thaura</p>
    <p className="text-sm text-gray-500 dark:text-gray-400">Software Engineer</p>
  </div>
</div>
            
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description }) => (
  <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-cyan-900/50 dark:border-cyan-800">
    <CardHeader className="items-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-800 text-cyan-600 dark:text-cyan-300">
        <Icon className="h-6 w-6" />
      </div>
      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </CardContent>
  </Card>
);

// Features Section
const FeaturesSection = () => (
  <section id="features" className="py-16 sm:py-24 bg-white dark:bg-cyan-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-base font-semibold text-cyan-600 dark:text-cyan-400 tracking-wide uppercase">Features</h2>
        <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Everything You Need to Succeed
        </p>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Personalized tools and community support to guide your career growth.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={Target}
          title="AI-Powered Roadmaps"
          description="Craft a personalized learning plan tailored to your unique career objectives and preferred learning style."
        />
        <FeatureCard
          icon={BrainCircuit}
          title="AI-Driven Insights"
          description="Leverage AI insights to streamline your skill development and make informed career strategy decisions."
        />
         <FeatureCard
          icon={HeartHandshake}
          title="Mentor Network"
          description="Connect with seasoned professionals for guidance, shared experiences, and support as you navigate your journey."
        />
        <FeatureCard
          icon={Users}
          title="Community Support"
          description="Join a dynamic community to share successes, seek advice, and foster connections that empower growth."
        />
         <FeatureCard
          icon={Lightbulb}
          title="Skill Development"
          description="Access resources and workshops designed to help you acquire the essential skills needed for advancement."
        />
         <FeatureCard
          icon={Zap}
          title="Overcome Challenges"
          description="Tools and support to confront imposter syndrome, build confidence, and tackle professional hurdles."
        />
      </div>
    </div>
  </section>
);

// How It Works Section
const HowItWorksSection = () => (
  <section id="how-it-works" className="py-16 sm:py-24 bg-gradient-to-b from-cyan-50 to-white dark:from-cyan-900 dark:to-cyan-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          How Leap.ai Works
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Empower your career journey in four simple steps.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 lg:grid-cols-4 md:gap-x-8">
        {[
          { step: 1, title: "Craft Your Career Path", description: "Define your aspirations and design a personalized roadmap for your career trajectory.", icon: Target },
          { step: 2, title: "Tailor Your Learning", description: "Use AI insights to create a learning plan aligned with your goals and style.", icon: BrainCircuit },
          { step: 3, title: "Engage with Mentors", description: "Connect with experienced professionals for guidance and support.", icon: HeartHandshake },
          { step: 4, title: "Join the Network", description: "Become part of a thriving community for advice, support, and connections.", icon: Users },
        ].map((item) => (
          <div key={item.step} className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-600 dark:bg-cyan-500 text-white">
                <item.icon className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
            <p className="text-base text-gray-600 dark:text-gray-300">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Testimonial Card
const TestimonialCard = ({ quote, name, title, avatarSrc }) => (
  <Card className="shadow-lg dark:bg-cyan-900/50 dark:border-cyan-800">
    <CardContent className="pt-6">
      <Quote className="h-8 w-8 text-cyan-300 dark:text-cyan-600 mb-4" aria-hidden="true" />
      <blockquote className="text-gray-600 dark:text-gray-300 italic mb-6">
        "{quote}"
      </blockquote>
      <div className="flex items-center">
        <Avatar className="h-12 w-12 mr-4">
          <AvatarImage src={avatarSrc || `https://placehold.co/48x48/E0E7FF/4F46E5?text=${name.charAt(0)}`} alt={name} />
          <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Testimonials Section
const TestimonialsSection = () => (
  <section className="py-16 sm:py-24 bg-white dark:bg-cyan-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Success Stories
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Hear from professionals who transformed their careers with Leap.ai.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <TestimonialCard
          quote="Leap.ai has given me the clarity and confidence to pursue opportunities I once thought were out of reach."
          name="James Thaura"
          title="Software Engineer"
          // Add avatarSrc if available
        />
        <TestimonialCard
          quote="Provided me with the tools to confront my imposter syndrome head-on. I now have the confidence to pursue my aspirations!"
          name="Robert Johnson"
          title="Marketing Specialist"
          // Add avatarSrc if available
        />
        <TestimonialCard
          quote="Leap.ai transformed my professional trajectory, providing the direction and support I needed to succeed!"
          name="David Thompson"
          title="Data Analyst"
          // Add avatarSrc if available
        />
      </div>
    </div>
  </section>
);

// Pricing Card
const PricingCard = ({ plan, price, description, features, popular = false }) => (
  <Card className={`flex flex-col h-full shadow-lg transition-transform duration-300 ${popular ? 'border-2 border-cyan-500 dark:border-cyan-400 scale-105' : 'dark:border-cyan-800'} dark:bg-cyan-900/50`}>
     {popular && (
        <div className="absolute top-0 right-0 -mt-3 mr-3">
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-700 dark:text-cyan-100">
            Most Popular
          </span>
        </div>
      )}
    <CardHeader className="items-center text-center pt-8">
      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{plan} Plan</CardTitle>
      <div className="mt-4">
        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${price}</span>
        <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
      </div>
      <CardDescription className="mt-4 text-gray-600 dark:text-gray-300">{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="flex-shrink-0 h-6 w-6 text-green-500 dark:text-green-400 mr-3" />
            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter className="mt-auto p-6">
      <Button size="lg" className={`w-full ${popular ? 'bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950' : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-800 dark:text-cyan-100 dark:hover:bg-cyan-700'}`}>
        {plan === 'Starter' ? 'Start Your Trial' : 'Choose This Plan'}
      </Button>
    </CardFooter>
  </Card>
);


// Pricing Section
const PricingSection = () => (
  <section id="pricing" className="py-16 sm:py-24 bg-gradient-to-b from-white to-cyan-50 dark:from-cyan-950 dark:to-cyan-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Choose the Perfect Plan
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Join a community of ambitious individuals elevating their professional journeys.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
        <PricingCard
          plan="Starter"
          price="0"
          description="Begin your journey with a 14-day free trial. Cancel anytime."
          features={[
            "14-Day Free Trial",
            "Access to Essential Resources",
            "Basic Learning Plan Creation",
            "Community Access",
            "Support from Peers",
          ]}
        />
        <PricingCard
          plan="Professional"
          price="29"
          description="Perfect for those ready to take significant strides in their careers."
          features={[
            "All Starter Features",
            "Enhanced Learning Plans",
            "Direct Access to Mentorship",
            "Skill Development Workshops",
            "Community Events Participation",
          ]}
          popular={true}
        />
        <PricingCard
          plan="Ultimate"
          price="99"
          description="Premium features for ambitious professionals investing fully in their development."
          features={[
            "All Professional Features",
            "Unlimited Access to All Resources",
            "One-on-One Mentorship Sessions",
            "Exclusive Workshops and Events",
            "Tailored Career Support",
          ]}
        />
      </div>
       <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
        All prices are in USD. Plans auto-renew unless cancelled.
      </p>
    </div>
  </section>
);

// Blog Card
const BlogCard = ({ title, excerpt, date, link }) => (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-cyan-900/50 dark:border-cyan-800">
        {/* Placeholder for image if needed */}
        {/* <img src="placeholder.jpg" alt="" className="h-48 w-full object-cover"/> */}
        <CardContent className="p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{date}</p>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-3 hover:text-cyan-600 dark:hover:text-cyan-400">
                <a href={link}>{title}</a>
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{excerpt}</p>
            <a href={link} className="text-cyan-600 dark:text-cyan-400 font-medium hover:underline">
                Read More <span aria-hidden="true">&rarr;</span>
            </a>
        </CardContent>
    </Card>
);

// Blog Section (Resources)
const BlogSection = () => (
    <section id="resources" className="py-16 sm:py-24 bg-white dark:bg-cyan-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                    Unlock Your Career Potential
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                    Dive into our insightful articles designed to empower you in your professional journey.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <BlogCard
                    title="Mastering Skills for Career Advancement"
                    excerpt="Explore actionable steps to develop essential skills that can set you apart in the competitive job market..."
                    date="15 FEB 2023"
                    link="#"
                />
                <BlogCard
                    title="Overcoming Imposter Syndrome"
                    excerpt="Identify strategies to combat feelings of self-doubt and build the confidence necessary to take bold steps..."
                    date="20 FEB 2023"
                    link="#"
                />
                <BlogCard
                    title="Building a Supportive Network"
                    excerpt="Discover the importance of mentorship and community in your career development. Learn how to leverage connections..."
                    date="25 FEB 2023"
                    link="#"
                />
            </div>
        </div>
    </section>
);


// Call to Action Section
const CTASection = () => (
  <section className="bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-700 dark:to-purple-700 py-16 sm:py-24">
    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
        Ready to Empower Your Career Journey?
      </h2>
      <p className="mt-4 text-lg text-cyan-100 dark:text-cyan-200">
        Take control of your professional growth. Our platform offers tailored learning paths and AI-enhanced guidance to help you overcome uncertainties and propel your career forward.
      </p>
      <div className="mt-8">
        <Button size="lg" variant="outline" className="text-cyan-700 bg-white border-transparent hover:bg-gray-100 dark:text-white dark:bg-cyan-900 dark:hover:bg-cyan-800">
          Discover Your Path <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="bg-gray-900 dark:bg-black text-gray-400">
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Column 1: Logo & Description (Optional) */}
        <div className="col-span-2 md:col-span-1 mb-6 md:mb-0">
          <a href="#" className="text-xl font-bold text-white mb-2 block">
            Leap.ai
          </a>
          <p className="text-sm">Empowering your career journey with AI.</p>
          {/* Social Icons Placeholder */}
          <div className="flex space-x-4 mt-4">
             {/* Add social icons here (e.g., LinkedIn, Twitter) */}
             {/* <a href="#" className="hover:text-white"><span className="sr-only">LinkedIn</span><LinkedinIcon /></a> */}
          </div>
        </div>

        {/* Column 2: Company Links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Company</h3>
          <ul className="space-y-3">
            <li><a href="/about" className="hover:text-white">About Us</a></li>
            <li><a href="#features" className="hover:text-white">Features</a></li>
            <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
            <li><a href="/career" className="hover:text-white">Careers</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* Column 3: Resources Links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Resources</h3>
          <ul className="space-y-3">
            <li><a href="/#how-it-works" className="hover:text-white">How It Works</a></li>
            <li><a href="/blog" className="hover:text-white">Blog</a></li>
            <li><a href="community" className="hover:text-white">Community</a></li>
            <li><a href="faq" className="hover:text-white">FAQ</a></li>
             <li><a href="/support" className="hover:text-white">Support</a></li>
          </ul>
        </div>

        {/* Column 4: Legal Links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Legal</h3>
          <ul className="space-y-3">
            <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
             <li><a href="/cookies" className="hover:text-white">Cookie Policy</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-8 border-t border-gray-700 dark:border-gray-800 pt-8 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Leap.ai. All rights reserved.</p>
      </div>
    </div>
  </footer>
);
const PageLayout = ({ children, title, description, fullWidth = false }) => (
  // Assuming ThemeProvider wraps the entire app in _app.js
  <div className="flex flex-col min-h-screen bg-white dark:bg-cyan-950 transition-colors duration-300">
      <Header /> {/* Use your actual Header component */}
      <main className="flex-grow py-12 sm:py-16 lg:py-20">
          <div className={`${fullWidth ? 'w-full' : 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8`}>
              {title && (
                  <div className="mb-8 text-center">
                      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">{title}</h1>
                      {description && <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">{description}</p>}
                  </div>
              )}
              {children}
          </div>
      </main>
      <Footer /> {/* Use your actual Footer component */}
  </div>
);


// --- Main App Component ---
// This component orchestrates the sections and provides the theme context
function App() {
  return (
    <ThemeProvider>
       {/* The body/html tag will have dark class applied by ThemeProvider */}
       {/* Ensure global styles handle dark mode background */}
      <div className="flex flex-col min-h-screen bg-white dark:bg-cyan-950 transition-colors duration-300">
        <Header />
        <main className="flex-grow">
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <PricingSection />
          <BlogSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App; // Export the main App component

export { PageLayout };


// --- Placeholder shadcn/ui components ---
// You should replace these with actual imports after running `npx shadcn-ui@latest add ...`
// This is just to make the code runnable for demonstration without the full setup.


// Define placeholder components in the global scope if needed for imports
// This part is only needed if you are not actually setting up shadcn/ui
// and want the code to be syntactically correct for a preview.
// In a real Next.js app, these imports would come from your actual component library.
const components = { ui: { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Label, Switch, Avatar, AvatarImage, AvatarFallback } };
globalThis.components = components; // Make accessible for "@/components/ui" imports

// Mock "@/components/ui" imports for environments where it's not configured
// In a real Next.js app with aliases set up, this wouldn't be necessary.
if (typeof require === 'undefined') { // Simple check if in browser-like environment
  globalThis['@/components/ui'] = components.ui;
}

export const Input = ({ className, ...props }) => <input className={`border p-2 rounded ${className}`} {...props} />; // Simplified placeholder
export const Textarea = ({ className, ...props }) => <textarea className={`border p-2 rounded ${className}`} {...props} />; // Simplified placeholder

export const Accordion = ({ children }) => <div>{children}</div>; // Simplified placeholder
export const AccordionItem = ({ children, value }) => <div data-value={value}>{children}</div>; // Simplified placeholder
export const AccordionTrigger = ({ children }) => <button>{children}</button>; // Simplified placeholder
export const AccordionContent = ({ children }) => <div>{children}</div>; // Simplified placeholder

