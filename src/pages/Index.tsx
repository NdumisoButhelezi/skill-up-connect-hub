
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section */}
      <div className="bg-gradient-to-b from-teal-500 to-teal-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">SkillUp Connect</h1>
            <p className="text-xl md:text-2xl mb-8 text-teal-100">
              Building bridges between job seekers and recruiters through skill development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-white text-teal-700 hover:bg-teal-100 px-8 py-6 text-lg"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-teal-600 px-8 py-6 text-lg"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-teal-100 text-teal-700 flex items-center justify-center rounded-full text-xl font-bold mb-4">1</div>
            <h3 className="text-xl font-bold mb-2">Choose Your Role</h3>
            <p className="text-gray-600">
              Sign up as a job seeker to gain new skills, or as a recruiter to find talented candidates.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-teal-100 text-teal-700 flex items-center justify-center rounded-full text-xl font-bold mb-4">2</div>
            <h3 className="text-xl font-bold mb-2">Learn & Teach</h3>
            <p className="text-gray-600">
              Job seekers take workshops and submit reflections. Recruiters create content and provide feedback.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-teal-100 text-teal-700 flex items-center justify-center rounded-full text-xl font-bold mb-4">3</div>
            <h3 className="text-xl font-bold mb-2">Connect & Grow</h3>
            <p className="text-gray-600">
              Track your progress, earn points, and build relationships that lead to career opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Role benefits section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits For Everyone</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold mb-4 text-teal-700">For Job Seekers</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2 text-teal-600">✓</span>
                  <span>Build in-demand skills through structured workshops</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-teal-600">✓</span>
                  <span>Get personalized feedback from industry professionals</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-teal-600">✓</span>
                  <span>Showcase your achievements with badges and certifications</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-teal-600">✓</span>
                  <span>Connect with recruiters actively looking for talent</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold mb-4 text-teal-700">For Recruiters</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2 text-teal-600">✓</span>
                  <span>Discover motivated candidates based on skill performance</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-teal-600">✓</span>
                  <span>Share your expertise and train future employees</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-teal-600">✓</span>
                  <span>Evaluate practical skills beyond traditional resumes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-teal-600">✓</span>
                  <span>Build your brand as an employer of choice</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join our community of learners and recruiters building the future of skills-based hiring.
        </p>
        <Button 
          className="bg-teal-600 hover:bg-teal-700 px-8 py-6 text-lg"
          onClick={() => navigate("/signup")}
        >
          Create Your Account
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="font-bold text-white text-lg">SkillUp Connect</h3>
              <p className="text-sm">Building bridges through skills</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">About</a>
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-800 text-sm text-center">
            &copy; {new Date().getFullYear()} SkillUp Connect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
