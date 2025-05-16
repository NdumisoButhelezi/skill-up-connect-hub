
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface UserProfile {
  displayName?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  linkedIn?: string;
}

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({});
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setProfile(userData);
          setFormData(userData);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);

  const handleAddSkill = () => {
    if (skillInput.trim() && (!formData.skills || !formData.skills.includes(skillInput.trim()))) {
      const updatedSkills = [...(formData.skills || []), skillInput.trim()];
      setFormData({
        ...formData,
        skills: updatedSkills
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = formData.skills?.filter(skill => skill !== skillToRemove) || [];
    setFormData({
      ...formData,
      skills: updatedSkills
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      await updateDoc(doc(db, "users", currentUser.uid), formData);
      
      setProfile(formData);
      setIsEditing(false);
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-gray-600">Manage your personal information and skills</p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <p>Loading profile...</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Profile Information</CardTitle>
            {!isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="displayName" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="displayName"
                    value={formData.displayName || ""}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    value={formData.bio || ""}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="City, Country"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="linkedIn" className="text-sm font-medium">
                    LinkedIn Profile
                  </label>
                  <Input
                    id="linkedIn"
                    value={formData.linkedIn || ""}
                    onChange={(e) => setFormData({...formData, linkedIn: e.target.value})}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="skills" className="text-sm font-medium">
                    Skills
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSkill}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {formData.skills && formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.skills.map((skill, index) => (
                        <div
                          key={index}
                          className="px-3 py-1 bg-slate-100 rounded-full flex items-center gap-1"
                        >
                          <span className="text-sm">{skill}</span>
                          <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => handleRemoveSkill(skill)}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(profile);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p>{currentUser?.email}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p>{profile.displayName || "Not set"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                  <p className="whitespace-pre-line">{profile.bio || "No bio added"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p>{profile.location || "Not specified"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">LinkedIn</h3>
                  {profile.linkedIn ? (
                    <a 
                      href={profile.linkedIn} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.linkedIn}
                    </a>
                  ) : (
                    <p>Not provided</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Skills</h3>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-slate-100 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>No skills added</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
