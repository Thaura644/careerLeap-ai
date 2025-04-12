import { PageLayout } from ".";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { Mail } from "lucide-react";
import { LifeBuoy } from "lucide-react";
import { Phone } from "lucide-react";
import { Card, CardContent, CardTitle, CardHeader  } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from ".";
import { Textarea } from ".";
import { Button } from "@/components/ui/button";

// =============================================
// Contact Us Page (pages/contact.js)
// =============================================
export default function ContactUsPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
  
    const handleChange = (e) => {
      const { id, value } = e.target;
      setFormData(prev => ({ ...prev, [id]: value }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setIsSubmitted(false);
    
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          throw new Error(data.message || 'Failed to send message.');
        }
    
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } catch (err) {
        setError(err.message || 'An error occurred. Please try again.');
      }
    };
  
    return (
      <PageLayout title="Contact Us" description="We'd love to hear from you. Reach out with questions, feedback, or inquiries.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Contact Info Column */}
          <div className="md:col-span-1 space-y-8">
            <div>
               <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Get in Touch</h2>
               <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Use the form to send us a message, or contact us directly using the details below. We aim to respond within 24 business hours.
               </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-6 w-6 text-cyan-600 dark:text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Address</h3>
                  <p className="text-gray-600 dark:text-gray-300">CDB Nairobi<br />N/A</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-6 w-6 text-cyan-600 dark:text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">General Inquiries</h3>
                  <a href="mailto:info@careerleap.ai" className="text-cyan-600 dark:text-cyan-400 hover:underline">jamesmweni52@gmail.com</a>
                </div>
              </div>
               <div className="flex items-start space-x-3">
                <LifeBuoy className="h-6 w-6 text-cyan-600 dark:text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Support</h3>
                  <a href="mailto:support@careerleap.ai" className="text-cyan-600 dark:text-cyan-400 hover:underline">coming soon</a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-6 w-6 text-cyan-600 dark:text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Phone</h3>
                  <a href="tel:+1234567890" className="text-cyan-600 dark:text-cyan-400 hover:underline">+254111403346</a>
                   <p className="text-xs text-gray-500 dark:text-gray-400">(Mon-Fri, 9am-5pm EAT)</p>
                </div>
              </div>
            </div>
          </div>
  
          {/* Contact Form Column */}
          <div className="md:col-span-2">
            <Card className="dark:bg-cyan-900/50 dark:border-cyan-800">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                   <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4"/>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Message Sent Successfully!</h3>
                      <p className="text-gray-600 dark:text-gray-300">Thank you for reaching out. We'll get back to you as soon as possible.</p>
                      <Button variant="outline" onClick={() => setIsSubmitted(false)} className="mt-6 dark:text-cyan-100 dark:border-cyan-700 dark:hover:bg-cyan-800">Send Another Message</Button>
                   </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="dark:text-gray-300 mr-4">Full Name</Label>
                        <Input type="text" id="name" value={formData.name} onChange={handleChange} required className="dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="dark:text-gray-300 mr-4">Email Address</Label>
                        <Input type="email" id="email" value={formData.email} onChange={handleChange} required className="dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400 w-full" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="dark:text-gray-300 mr-4">Subject</Label>
                      <Input type="text" id="subject" value={formData.subject} onChange={handleChange} required className="dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="dark:text-gray-300 mr-4">Message</Label>
                      <Textarea id="message" rows={5} value={formData.message} onChange={handleChange} required className="w-full dark:bg-cyan-800 dark:border-cyan-700 dark:text-white dark:placeholder:text-gray-400" />
                    </div>
                     {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                     )}
                    <div>
                      <Button type="submit" className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-cyan-950">
                        Send Message <Mail className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }
  