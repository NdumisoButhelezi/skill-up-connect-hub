
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc 
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Reflection {
  id: string;
  lessonId: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  points?: number;
}

interface Lesson {
  id: string;
  title: string;
  workshopId: string;
}

interface Workshop {
  id: string;
  title: string;
}

interface ReflectionWithDetails extends Reflection {
  lesson: Lesson;
  workshop: Workshop;
}

const Progress = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [reflections, setReflections] = useState<ReflectionWithDetails[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Redirect if user is not a job seeker
  if (userRole !== "jobSeeker") {
    navigate("/dashboard");
    return null;
  }

  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!currentUser) return;
      
      try {
        // Get all user reflections
        const reflectionsQuery = query(
          collection(db, "reflections"),
          where("userId", "==", currentUser.uid)
        );
        
        const reflectionsSnapshot = await getDocs(reflectionsQuery);
        const reflectionsData = reflectionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Reflection));
        
        // Calculate total points
        let points = 0;
        reflectionsData.forEach(reflection => {
          if (reflection.points) {
            points += reflection.points;
          }
        });
        
        setTotalPoints(points);
        
        // Fetch lesson and workshop details for each reflection
        const reflectionsWithDetails = await Promise.all(
          reflectionsData.map(async (reflection) => {
            // Get lesson info
            const lessonDoc = await getDoc(doc(db, "lessons", reflection.lessonId));
            const lessonData = {
              id: lessonDoc.id,
              ...lessonDoc.data()
            } as Lesson;
            
            // Get workshop info
            const workshopDoc = await getDoc(doc(db, "workshops", lessonData.workshopId));
            const workshopData = {
              id: workshopDoc.id,
              ...workshopDoc.data()
            } as Workshop;
            
            return {
              ...reflection,
              lesson: lessonData,
              workshop: workshopData
            };
          })
        );
        
        // Sort by submission date (newest first)
        reflectionsWithDetails.sort((a, b) => 
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        
        setReflections(reflectionsWithDetails);
      } catch (error) {
        console.error("Error fetching user progress:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [currentUser]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
            Needs Improvement
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
            Pending
          </span>
        );
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Progress</h1>
          <p className="text-gray-600">Track your learning journey and accomplishments</p>
        </div>
        
        <Card className="w-full md:w-auto">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Points</p>
              <p className="text-2xl font-bold">{totalPoints}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-bold mb-4">Your Reflections</h2>
      
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <p>Loading your progress...</p>
        </div>
      ) : reflections.length > 0 ? (
        <div className="space-y-4">
          {reflections.map((reflection) => (
            <Card key={reflection.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{reflection.lesson.title}</CardTitle>
                    <p className="text-sm text-gray-500">{reflection.workshop.title}</p>
                  </div>
                  <div className="flex items-center">
                    {getStatusBadge(reflection.status)}
                    {reflection.points && (
                      <span className={`ml-2 ${
                        reflection.points > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {reflection.points > 0 ? `+${reflection.points}` : reflection.points}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-gray-50 rounded-md mb-3">
                  <p className="whitespace-pre-line line-clamp-3">{reflection.content}</p>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <p>Submitted: {new Date(reflection.submittedAt).toLocaleDateString()}</p>
                  {reflection.reviewedAt && (
                    <p>Reviewed: {new Date(reflection.reviewedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-500">No reflections submitted yet</h3>
          <p className="text-gray-400 mb-4">Start exploring workshops and submitting reflections</p>
          <Button 
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => navigate("/dashboard")}
          >
            Browse Workshops
          </Button>
        </div>
      )}
    </div>
  );
};

export default Progress;
