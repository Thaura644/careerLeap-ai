
import React from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  description,
  linkText,
  linkHref,
}) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-16">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="inline-block mb-8">
            <span className="text-2xl font-bold bg-gradient-to-r from-leap-navy to-leap-purple bg-clip-text text-transparent">
              Leap.ai
            </span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-gray-600 mb-8">{description}</p>

          {children}

          <div className="mt-8 text-center text-gray-500">
            {linkText.split(' ')[0]}{' '}
            <Link to={linkHref} className="text-leap-purple hover:underline font-medium">
              {linkText.split(' ').slice(1).join(' ')}
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Illustration/Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg"></div>
        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center p-12 text-white">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-4">
              Accelerate your career with AI-powered insights
            </h2>
            <p className="text-lg mb-8">
              Join thousands of professionals who are advancing their careers faster with personalized AI guidance and mentorship.
            </p>
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20"></div>
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20"></div>
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20"></div>
              </div>
              <p className="font-medium">Joined by 10,000+ professionals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
