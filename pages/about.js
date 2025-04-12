import { PageLayout } from ".";
import { Users, Target, BrainCircuit, HeartHandshake, BookOpen } from 'lucide-react';

export default function AboutUsPage() {
  const features = [
    {
      icon: Target,
      title: "Strategic Career Planning",
      description: "AI-powered roadmaps aligned with market trends and personal aspirations"
    },
    {
      icon: BrainCircuit,
      title: "Intelligent Skill Analysis",
      description: "Machine learning-driven competency assessments and gap identification"
    },
    {
      icon: HeartHandshake,
      title: "Expert Mentorship",
      description: "Direct access to industry leaders and career development specialists"
    },
    {
      icon: BookOpen,
      title: "Curated Resources",
      description: "Comprehensive library of professional development materials and courses"
    }
  ];

  return (
    <PageLayout 
      title="About CareerLeap.ai" 
      description="Pioneering AI-Driven Career Acceleration Platform"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission Statement */}
        <section className="text-center mb-20">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-6">
            Redefining Professional Development
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            At CareerLeap.ai, we combine advanced artificial intelligence with human expertise 
            to deliver transformative career solutions for ambitious professionals.
          </p>
        </section>

        {/* Core Features Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-all hover:shadow-xl"
            >
              <feature.icon className="h-12 w-12 text-cyan-600 dark:text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        {/* Value Proposition */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Our Value Proposition</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  CareerLeap.ai delivers measurable outcomes through our proprietary 
                  three-pillar methodology:
                </p>
                <ul className="space-y-4 list-disc pl-6">
                  <li>Predictive Analytics for Career Trajectory Optimization</li>
                  <li>Competency-Based Skill Development Frameworks</li>
                  <li>Network Effects Through Strategic Professional Connections</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Scientific Approach */}
        <section className="mb-20">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Evidence-Based Methodology
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our platform integrates findings from organizational psychology, 
                labor market analytics, and adult learning theory to create 
                actionable career strategies.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    92% User Satisfaction Rate
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <BrainCircuit className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    3.8x Career Progression Acceleration
                  </span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 bg-gray-100 dark:bg-gray-700 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4">Key Differentiators</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li>• Real-time Labor Market Intelligence Integration</li>
                <li>• Adaptive Learning Path Personalization</li>
                <li>• Enterprise-Grade Security Protocols</li>
                <li>• Continuous Professional Feedback Loops</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready for Transformative Career Growth?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join industry leaders and ambitious professionals who trust CareerLeap.ai 
            for their career development needs.
          </p>
          <a 
            href="/#pricing"
            className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
          >
            Explore Enterprise Solutions
          </a>
        </section>
      </div>
    </PageLayout>
  );
}