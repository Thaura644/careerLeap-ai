
import React from "react";
import { Check } from "lucide-react";

const About = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pioneering AI-Driven Career Acceleration Platform
            </h2>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3">Redefining Professional Development</h3>
              <p className="text-gray-600 mb-4">
                At Leap.ai, we combine advanced artificial intelligence with human expertise to deliver transformative career solutions for ambitious professionals.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mr-3 mt-1 bg-leap-purple/10 p-1 rounded-full text-leap-purple">
                  <Check size={18} />
                </div>
                <div>
                  <h4 className="font-semibold">Strategic Career Planning</h4>
                  <p className="text-gray-600">AI-powered roadmaps aligned with market trends and personal aspirations</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-3 mt-1 bg-leap-purple/10 p-1 rounded-full text-leap-purple">
                  <Check size={18} />
                </div>
                <div>
                  <h4 className="font-semibold">Intelligent Skill Analysis</h4>
                  <p className="text-gray-600">Machine learning-driven competency assessments and gap identification</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-3 mt-1 bg-leap-purple/10 p-1 rounded-full text-leap-purple">
                  <Check size={18} />
                </div>
                <div>
                  <h4 className="font-semibold">Expert Mentorship</h4>
                  <p className="text-gray-600">Direct access to industry leaders and career development specialists</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-3 mt-1 bg-leap-purple/10 p-1 rounded-full text-leap-purple">
                  <Check size={18} />
                </div>
                <div>
                  <h4 className="font-semibold">Curated Resources</h4>
                  <p className="text-gray-600">Comprehensive library of professional development materials and courses</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-2xl font-semibold mb-6">Our Value Proposition</h3>
            <p className="text-gray-600 mb-6">
              Leap.ai delivers measurable outcomes through our proprietary three-pillar methodology:
            </p>

            <div className="space-y-6">
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-semibold text-leap-purple mb-2">Predictive Analytics for Career Trajectory</h4>
                <p className="text-gray-600">Using AI to forecast optimal career paths based on your skills and market trends</p>
              </div>

              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-semibold text-leap-purple mb-2">Competency-Based Development Frameworks</h4>
                <p className="text-gray-600">Structured approach to identifying and filling skill gaps efficiently</p>
              </div>

              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-semibold text-leap-purple mb-2">Strategic Professional Connections</h4>
                <p className="text-gray-600">AI-matched networking opportunities with relevant industry professionals</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <p className="text-3xl font-bold text-leap-purple">92%</p>
                <p className="text-gray-600">User Satisfaction Rate</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <p className="text-3xl font-bold text-leap-purple">3.8x</p>
                <p className="text-gray-600">Career Progression Acceleration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
