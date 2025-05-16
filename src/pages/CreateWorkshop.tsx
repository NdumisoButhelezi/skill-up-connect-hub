
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CreateWorkshop = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user is not a recruiter
  if (userRole !== "recruiter") {
    navigate("/dashboard");
    return null;
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || skills.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const workshopData = {
        title,
        description,
        skills,
        difficulty,
        createdBy: currentUser?.uid,
        createdAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, "workshops"), workshopData);
      
      toast.success("Workshop created successfully!");
      navigate(`/dashboard/workshop/${docRef.id}`);
    } catch (error) {
      console.error("Error creating workshop:", error);
      toast.error("Failed to create workshop");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Workshop</h1>
        <p className="text-gray-600">Design a new learning experience for job seekers</p>
      </div>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Workshop Details</CardTitle>
          <CardDescription>
            Fill in the information below to create your workshop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to React"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of this workshop..."
                rows={4}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <Select 
                value={difficulty} 
                onValueChange={(value: "beginner" | "intermediate" | "advanced") => setDifficulty(value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skills">Skills Covered *</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g., JavaScript"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddSkill}
                  disabled={!skillInput.trim() || isSubmitting}
                >
                  Add
                </Button>
              </div>
              
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-slate-100 rounded-full flex items-center gap-1"
                    >
                      <span className="text-sm">{skill}</span>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => handleRemoveSkill(skill)}
                        disabled={isSubmitting}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="pt-4 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-teal-600 hover:bg-teal-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Workshop"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateWorkshop;
