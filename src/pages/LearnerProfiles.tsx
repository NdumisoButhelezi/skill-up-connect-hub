
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc
} from "firebase/firestore";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: string;
}

interface Reflection {
  id: string;
  lessonId: string;
  userId: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

interface LessonInfo {
  id: string;
  title: string;
  workshopTitle: string;
  workshopId: string;
}

const LearnerProfiles = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [pendingReflections, setPendingReflections] = useState<Array<Reflection & { user: User, lesson: LessonInfo }>>([]);
  const [loading, setLoading] = useState(true);
  
  // Redirect if user is not a recruiter
  if (userRole !== "recruiter") {
    navigate("/dashboard");
    return null;
  }

  useEffect(() => {
    const fetchPendingReflections = async () => {
      try {
        // Get all pending reflections
        const reflectionsQuery = query(
          collection(db, "reflections"),
          where("status", "==", "pending")
        );
        
        const reflectionsSnapshot = await getDocs(reflectionsQuery);
        const reflectionsData = reflectionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Reflection));
        
        // Fetch user and lesson info for each reflection
        const reflectionsWithDetails = await Promise.all(
          reflectionsData.map(async (reflection) => {
            // Get user info
            const userDoc = await getDoc(doc(db, "users", reflection.userId));
            const userData = {
              id: userDoc.id,
              ...userDoc.data()
            } as User;
            
            // Get lesson info
            const lessonDoc = await getDoc(doc(db, "lessons", reflection.lessonId));
            const lessonData = lessonDoc.data();
            
            // Get workshop info
            const workshopDoc = await getDoc(doc(db, "workshops", lessonData?.workshopId));
            const workshopData = workshopDoc.data();
            
            return {
              ...reflection,
              user: userData,
              lesson: {
                id: lessonDoc.id,
                title: lessonData?.title,
                workshopTitle: workshopData?.title,
                workshopId: lessonData?.workshopId
              }
            };
          })
        );
        
        setPendingReflections(reflectionsWithDetails);
      } catch (error) {
        console.error("Error fetching reflections:", error);
        toast.error("Failed to load learner reflections");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingReflections();
  }, []);

  const handleApproveReflection = async (reflectionId: string) => {
    try {
      // Update reflection status and add points
      await updateDoc(doc(db, "reflections", reflectionId), {
        status: "approved",
        points: 50,
        reviewedAt: new Date().toISOString(),
      });
      
      // Remove the reflection from the list
      setPendingReflections(prev => 
        prev.filter(reflection => reflection.id !== reflectionId)
      );
      
      toast.success("Reflection approved and points awarded");
    } catch (error) {
      console.error("Error approving reflection:", error);
      toast.error("Failed to approve reflection");
    }
  };

  const handleRejectReflection = async (reflectionId: string) => {
    try {
      // Update reflection status and deduct points
      await updateDoc(doc(db, "reflections", reflectionId), {
        status: "rejected",
        points: -30,
        reviewedAt: new Date().toISOString(),
      });
      
      // Remove the reflection from the list
      setPendingReflections(prev => 
        prev.filter(reflection => reflection.id !== reflectionId)
      );
      
      toast.success("Reflection marked for improvement");
    } catch (error) {
      console.error("Error rejecting reflection:", error);
      toast.error("Failed to reject reflection");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Learner Reflections</h1>
        <p className="text-gray-600">Review and provide feedback on learner reflections</p>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <p>Loading reflections...</p>
        </div>
      ) : pendingReflections.length > 0 ? (
        <div className="space-y-6">
          {pendingReflections.map((reflection) => (
            <Card key={reflection.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{reflection.user.email}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Workshop: {reflection.lesson.workshopTitle} | 
                      Lesson: {reflection.lesson.title}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(reflection.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-gray-50 rounded-md">
                  <p className="whitespace-pre-line">{reflection.content}</p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleRejectReflection(reflection.id)}
                  >
                    Needs Improvement (-30 pts)
                  </Button>
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={() => handleApproveReflection(reflection.id)}
                  >
                    Approve (+50 pts)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-500">No pending reflections</h3>
          <p className="text-gray-400">All learner reflections have been reviewed</p>
        </div>
      )}
    </div>
  );
};

export default LearnerProfiles;
