
import React from "react";
import { BrainCircuit, Compass, Users, BookOpen, Zap, Shield } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="feature-card group">
      <div className="mb-4 text-leap-purple group-hover:text-leap-teal transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      icon: <BrainCircuit size={36} />,
      title: "AI-Powered Roadmaps",
      description: "Craft a personalized learning plan tailored to your unique career objectives and preferred learning style.",
    },
    {
      icon: <Compass size={36} />,
      title: "AI-Driven Insights",
      description: "Leverage AI insights to streamline your skill development and make informed career strategy decisions.",
    },
    {
      icon: <Users size={36} />,
      title: "Mentor Network",
      description: "Connect with seasoned professionals for guidance, shared experiences, and support as you navigate your journey.",
    },
    {
      icon: <BookOpen size={36} />,
      title: "Skill Development",
      description: "Access resources and workshops designed to help you acquire the essential skills needed for advancement.",
    },
    {
      icon: <Zap size={36} />,
      title: "Community Support",
      description: "Join a dynamic community to share successes, seek advice, and foster connections that empower growth.",
    },
    {
      icon: <Shield size={36} />,
      title: "Overcome Challenges",
      description: "Tools and support to confront imposter syndrome, build confidence, and tackle professional hurdles.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600">
            Personalized tools and community support to guide your career growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
