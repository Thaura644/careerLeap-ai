
import React from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Github, Twitter } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, implement actual user registration
    toast({
      title: "Account created successfully",
      description: "Welcome to Leap.ai! Redirecting to onboarding...",
    });
    
    // Simulate a delay before redirecting
    setTimeout(() => {
      navigate("/onboarding");
    }, 1500);
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Start your career acceleration journey with Leap.ai"
      linkText="Already have an account? Log in"
      linkHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                placeholder="John"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Must be at least 8 characters and include a number and a symbol
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="terms" className="mt-1" />
            <Label
              htmlFor="terms"
              className="text-sm font-normal text-gray-500"
            >
              By creating an account, you agree to our{" "}
              <a href="/terms" className="text-leap-purple hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-leap-purple hover:underline">
                Privacy Policy
              </a>
            </Label>
          </div>
        </div>

        <Button type="submit" className="w-full bg-leap-purple hover:bg-opacity-90">
          Create account
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button" className="w-full">
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button variant="outline" type="button" className="w-full">
            <Twitter className="mr-2 h-4 w-4" />
            Twitter
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
