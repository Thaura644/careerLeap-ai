import { PageLayout } from ".";// Login Page (pages/login.js)
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from ".";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
// =============================================
export default function LoginPage() {
    // Add state for form handling if needed
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // For login errors
  
    const handleLogin = (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        // --- Add your actual login logic here ---
        // Example: Call an API endpoint
        console.log('Attempting login with:', { email, password });
        // Simulate an error for demonstration
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        // On success, redirect the user (e.g., using Next.js router)
        // router.push('/dashboard');
        alert('Login successful (placeholder)!'); // Replace with actual redirect
    };
  
    return (
      <PageLayout title="Log In" description="Access your Leap.ai account.">
        <div className="flex justify-center">
          <Card className="w-full max-w-md dark:bg-cyan-900/50 dark:border-cyan-800">
            <CardHeader className="text-center">
              {/* Optional: Logo or Icon */}
              <CardTitle className="text-2xl font-bold dark:text-white">Welcome Back!</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email-login" className="dark:text-gray-300">Email</Label>
                  <Input
                    id="email-login"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <Label htmlFor="password-login" className="dark:text-gray-300">Password</Label>
                      <a href="#" className="text-sm text-cyan-600 hover:underline dark:text-cyan-400">Forgot password?</a>
                   </div>
                  <Input
                    id="password-login"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full dark:bg-cyan-800 dark:border-cyan-700 dark:text-white"
                  />
                </div>
                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
                <div>
                  <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">
                    Log In <LogIn className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <a href="/signup" className="font-medium text-cyan-600 dark:text-cyan-400 hover:underline">
                  Sign Up
                </a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </PageLayout>
    );
  }


