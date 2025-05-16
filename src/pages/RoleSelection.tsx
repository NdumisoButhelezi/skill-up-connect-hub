
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const RoleSelection = () => {
  const { setUserRoleAndSave, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelection = async (role: "jobSeeker" | "recruiter") => {
    if (!currentUser) {
      toast.error("You must be logged in to select a role");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    
    try {
      await setUserRoleAndSave(role);
      toast.success(`You've been registered as a ${role === "jobSeeker" ? "Job Seeker" : "Recruiter"}!`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error setting user role:", error);
      toast.error("Failed to set user role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-slate-50 p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Choose Your Role</CardTitle>
          <CardDescription className="text-center">
            Select the role that best describes you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Card className="border-2 hover:border-teal-500 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle>Job Seeker</CardTitle>
                <CardDescription>
                  I want to learn new skills and find job opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Access skill-building workshops</li>
                  <li>Track your learning progress</li>
                  <li>Earn badges and certifications</li>
                  <li>Connect with recruiters</li>
                </ul>
                <Button 
                  onClick={() => handleRoleSelection("jobSeeker")}
                  className="w-full mt-4 bg-teal-600 hover:bg-teal-700"
                  disabled={isLoading}
                >
                  Select Job Seeker
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-teal-500 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle>Recruiter</CardTitle>
                <CardDescription>
                  I want to create learning content and find talented candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Create skill-building workshops</li>
                  <li>Review learner submissions</li>
                  <li>Track candidate progress</li>
                  <li>Connect with potential hires</li>
                </ul>
                <Button 
                  onClick={() => handleRoleSelection("recruiter")}
                  className="w-full mt-4 bg-teal-600 hover:bg-teal-700"
                  disabled={isLoading}
                >
                  Select Recruiter
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelection;
