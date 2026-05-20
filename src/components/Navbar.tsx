
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-leap-navy to-leap-purple bg-clip-text text-transparent">
                Leap.ai
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-leap-purple">
                Features <ChevronDown size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>AI-Powered Roadmaps</DropdownMenuItem>
                <DropdownMenuItem>AI-Driven Insights</DropdownMenuItem>
                <DropdownMenuItem>Mentor Network</DropdownMenuItem>
                <DropdownMenuItem>Skill Development</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/how-it-works" className="hover:text-leap-purple">
              How It Works
            </Link>
            <Link to="/pricing" className="hover:text-leap-purple">
              Pricing
            </Link>
            <Link to="/resources" className="hover:text-leap-purple">
              Resources
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" className="border-leap-navy text-leap-navy hover:bg-leap-navy hover:text-white">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-leap-purple hover:bg-opacity-90 text-white">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-leap-navy">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-3">
              <Link to="/features" className="py-2 hover:text-leap-purple" onClick={toggleMenu}>
                Features
              </Link>
              <Link to="/how-it-works" className="py-2 hover:text-leap-purple" onClick={toggleMenu}>
                How It Works
              </Link>
              <Link to="/pricing" className="py-2 hover:text-leap-purple" onClick={toggleMenu}>
                Pricing
              </Link>
              <Link to="/resources" className="py-2 hover:text-leap-purple" onClick={toggleMenu}>
                Resources
              </Link>
              <div className="pt-2 flex flex-col space-y-3">
                <Link to="/login" onClick={toggleMenu}>
                  <Button variant="outline" className="w-full border-leap-navy text-leap-navy">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup" onClick={toggleMenu}>
                  <Button className="w-full bg-leap-purple text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
