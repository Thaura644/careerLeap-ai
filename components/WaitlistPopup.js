import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function WaitlistPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup after 5 seconds
    const timer = setTimeout(() => {
      const hasSeenPopup = localStorage.getItem("hasSeenWaitlistPopup");
      if (!hasSeenPopup) {
        setIsOpen(true);
        localStorage.setItem("hasSeenWaitlistPopup", "true");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Join Our Waiting List!
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Get early access to CareerLeap.ai and be the first to experience AI-powered career growth!
        </p>
        <Link href="/contact" passHref>
          <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg">
            Join Now
          </button>
        </Link>
      </div>
    </div>
  );
}