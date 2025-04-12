import { PageLayout } from ".";
import { Users } from 'lucide-react'; // Assuming Users icon is imported

// Add 'default' keyword here
export default function AboutUsPage() {
    return (
      <PageLayout title="About CareerLeap.ai" description="Empowering career journeys through personalized guidance and AI.">
        {/* Content using prose for typography */}
        <div className="prose prose-lg dark:prose-invert max-w-4xl lg:prose-xl mx-auto text-gray-600 dark:text-gray-300">
          <h2>Our Mission</h2>
          <p>At CareerLeap.ai, our mission is to empower individuals to navigate their career paths with clarity, confidence, and purpose. We believe everyone deserves the opportunity to reach their full professional potential, and we leverage the power of AI and community to make that happen.</p>

          <h2>Our Vision</h2>
          <p>We envision a world where career development is personalized, accessible, and effective for everyone. We aim to be the leading platform for AI-driven career guidance, helping people overcome challenges like uncertainty and imposter syndrome, acquire necessary skills, and build meaningful professional connections.</p>

          <h2>What We Do</h2>
          <p>CareerLeap.ai provides a suite of tools and resources designed to support your career growth:</p>
          <ul>
            <li><strong>Personalized Roadmaps:</strong> AI algorithms analyze your goals, skills, and preferences to create tailored career paths and learning plans.</li>
            <li><strong>AI-Driven Insights:</strong> Get recommendations for skills, courses, and connections relevant to your desired trajectory.</li>
            <li><strong>Mentorship Network:</strong> Connect with experienced professionals in your field for guidance and support (available on Professional/Ultimate plans).</li>
            <li><strong>Supportive Community:</strong> Engage with peers, share experiences, ask questions, and celebrate successes in our dynamic community forums.</li>
            <li><strong>Resource Hub:</strong> Access curated articles, workshops, and tools to help you develop skills and overcome challenges.</li>
          </ul>

          {/* Optional Team Section */}
          {/* <h2>Our Team</h2>
          <p>We are a passionate team of technologists, career coaches, and educators dedicated to building a platform that makes a real difference in people's professional lives. [Add more details or team photos here].</p> */}

          <h2>Join Us</h2>
          <p>Ready to take the leap? <a href="/#pricing" className="text-cyan-600 dark:text-cyan-400 hover:underline">Explore our plans</a> and start transforming your career journey today!</p>
        </div>

        {/* Optional: Add visual elements like images or icons */}
         <div className="mt-16 text-center">
             <Users className="h-12 w-12 text-cyan-500 dark:text-cyan-400 mx-auto mb-4"/>
             <p className="text-xl font-medium text-gray-700 dark:text-gray-200">Let's build your future, together.</p>
         </div>
      </PageLayout>
    );
}

