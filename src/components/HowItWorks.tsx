
import React from "react";
import { MapPin, BookOpen, Users, Network } from "lucide-react";

interface StepCardProps {
  icon: React.ReactNode;
  number: number;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ icon, number, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-leap-purple/10 flex items-center justify-center">
          <div className="text-leap-purple">
            {icon}
          </div>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-leap-teal flex items-center justify-center text-white font-bold">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      icon: <MapPin size={28} />,
      number: 1,
      title: "Craft Your Career Path",
      description: "Define your aspirations and design a personalized roadmap for your career trajectory.",
    },
    {
      icon: <BookOpen size={28} />,
      number: 2,
      title: "Tailor Your Learning",
      description: "Use AI insights to create a learning plan aligned with your goals and style.",
    },
    {
      icon: <Users size={28} />,
      number: 3,
      title: "Engage with Mentors",
      description: "Connect with experienced professionals for guidance and support.",
    },
    {
      icon: <Network size={28} />,
      number: 4,
      title: "Join the Network",
      description: "Become part of a thriving community for advice, support, and connections.",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How Leap.ai Works
          </h2>
          <p className="text-xl text-gray-600">
            Empower your career journey in four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              icon={step.icon}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
