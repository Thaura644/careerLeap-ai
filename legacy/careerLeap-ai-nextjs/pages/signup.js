import { PageLayout } from ".";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from ".";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
// Sign Up Page (pages/signup.js)
// =============================================
export default function SignUpPage() {
    // Add state for form handling
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState('');
  
     const handleSignUp = (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
  
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!agreedToTerms) {
            setError('You must agree to the terms and conditions.');
            return;
        }
        // --- Add your actual sign-up logic here ---
        // Example: Call an API endpoint
        console.log('Attempting sign up with:', { name, email, password });
        // On success, redirect the user (e.g., to login or dashboard)
        // router.push('/login');
         alert('Sign up successful (placeholder)! Please log in.'); // Replace with actual redirect
    };
  
    return (
      <PageLayout title="Create Your Account" description="Join Leap.ai and start transforming your career journey.">
        <div className="flex justify-center">
          <Card className="w-full max-w-md dark:bg-cyan-900/50 dark:border-cyan-800">
            <CardHeader className="text-center">
               <CardTitle className="text-2xl font-bold dark:text-white">Get Started</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name-signup" className="dark:text-gray-300">Full Name</Label>
                  <Input
                      id="name-signup"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="dark:text-gray-300">Email</Label>
                  <Input
                      id="email-signup"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup" className="dark:text-gray-300">Password</Label>
                  <Input
                      id="password-signup"
                      type="password"
                      placeholder="Create a password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full dark:bg-cyan-800 dark:border-cyan-700 dark:text-white" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="confirm-password-signup" className="dark:text-gray-300">Confirm Password</Label>
                  <Input
                      id="confirm-password-signup"
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full dark:bg-cyan-800 dark:border-cyan-700 dark:text-white" />
                </div>
  
                <div className="items-top flex space-x-2 pt-2">
                   {/* Using shadcn Checkbox might require installation: npx shadcn-ui@latest add checkbox */}
                   {/* Using native checkbox for simplicity here */}
                   <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground mt-1"
                   />
                   <div className="grid gap-1.5 leading-none">
                       <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300">
                          Accept terms and conditions
                       </label>
                       <p className="text-sm text-muted-foreground dark:text-gray-400">
                          You agree to our{' '}
                          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-600 dark:hover:text-cyan-400">Terms of Service</a> and{' '}
                          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-600 dark:hover:text-cyan-400">Privacy Policy</a>.
                       </p>
                   </div>
               </div>
  
                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
  
                <div>
                  <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">
                    Create Account <UserPlus className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="justify-center">
               <p className="text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-cyan-600 dark:text-cyan-400 hover:underline">
                  Log In
                </a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </PageLayout>
    );
  }
  