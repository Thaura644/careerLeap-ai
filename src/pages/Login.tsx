
import React from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Github, Twitter } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, implement actual authentication
    toast({
      title: "Login successful",
      description: "Redirecting to your dashboard...",
    });
    
    // Simulate a delay before redirecting
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <AuthLayout
      title="Log in to your account"
      description="Welcome back! Enter your credentials to access your account."
      linkText="Don't have an account? Sign up"
      linkHref="/signup"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="/forgot-password"
                className="text-sm text-leap-purple hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label
              htmlFor="remember"
              className="text-sm font-normal text-gray-500"
            >
              Remember me for 30 days
            </Label>
          </div>
        </div>

        <Button type="submit" className="w-full bg-leap-purple hover:bg-opacity-90">
          Log in
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

export default Login;
