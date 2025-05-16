
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  content: string;
  workshopId: string;
  createdAt: string;
}

interface Workshop {
  id: string;
  title: string;
}

interface Reflection {
  id?: string;
  lessonId: string;
  userId: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  points?: number;
}

const LessonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [reflection, setReflection] = useState("");
  const [existingReflection, setExistingReflection] = useState<Reflection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessonAndWorkshop = async () => {
      if (!id || !currentUser) return;
      
      try {
        // Fetch lesson
        const lessonDoc = await getDoc(doc(db, "lessons", id));
        
        if (lessonDoc.exists()) {
          const lessonData = { id: lessonDoc.id, ...lessonDoc.data() } as Lesson;
          setLesson(lessonData);
          
          // Fetch workshop
          const workshopDoc = await getDoc(doc(db, "workshops", lessonData.workshopId));
          
          if (workshopDoc.exists()) {
            setWorkshop({
              id: workshopDoc.id,
              title: workshopDoc.data().title
            });
          }
          
          // Check for existing reflection
          const reflectionsQuery = query(
            collection(db, "reflections"),
            where("lessonId", "==", id),
            where("userId", "==", currentUser.uid)
          );
          
          const reflectionsSnapshot = await getDocs(reflectionsQuery);
          
          if (!reflectionsSnapshot.empty) {
            const reflectionData = {
              id: reflectionsSnapshot.docs[0].id,
              ...reflectionsSnapshot.docs[0].data()
            } as Reflection;
            
            setExistingReflection(reflectionData);
          }
        } else {
          toast.error("Lesson not found");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching lesson details:", error);
        toast.error("Failed to load lesson details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessonAndWorkshop();
  }, [id, currentUser, navigate]);

  const handleSubmitReflection = async () => {
    if (!currentUser || !lesson || !reflection.trim()) {
      toast.error("Please write a reflection before submitting");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reflectionData: Reflection = {
        lessonId: lesson.id,
        userId: currentUser.uid,
        content: reflection,
        status: "pending",
        submittedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "reflections"), reflectionData);
      
      setExistingReflection({
        ...reflectionData,
        id: docRef.id
      });
      
      setReflection("");
      
      toast.success("Reflection submitted successfully!");
    } catch (error) {
      console.error("Error submitting reflection:", error);
      toast.error("Failed to submit reflection");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <p>Loading lesson...</p>
      </div>
    );
  }

  if (!lesson || !workshop) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-500">Lesson not found</h2>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Button
              variant="link"
              className="p-0 h-auto text-gray-500"
              onClick={() => navigate(`/dashboard/workshop/${workshop.id}`)}
            >
              {workshop.title}
            </Button>
            <span>/</span>
            <span>{lesson.title}</span>
          </div>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{lesson.content}</p>
          </div>
        </CardContent>
      </Card>
      
      {userRole === "jobSeeker" && (
        <>
          <h2 className="text-xl font-bold mb-4">Your Reflection</h2>
          
          {existingReflection ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Submitted Reflection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{existingReflection.content}</p>
                
                <div className="mt-4 p-3 rounded-md flex items-center justify-between">
                  <div>
                    <p className="font-medium">Status: 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        existingReflection.status === "approved" 
                          ? "bg-green-100 text-green-800" 
                          : existingReflection.status === "rejected" 
                          ? "bg-red-100 text-red-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {existingReflection.status === "approved" 
                          ? "Approved" 
                          : existingReflection.status === "rejected" 
                          ? "Needs Improvement" 
                          : "Pending Review"}
                      </span>
                    </p>
                    {existingReflection.points !== undefined && (
                      <p className="text-sm mt-1">
                        Points: {existingReflection.points > 0 ? `+${existingReflection.points}` : existingReflection.points}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submit Your Reflection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Write a reflection on what you've learned from this lesson. Your reflection will be reviewed by recruiters.
                </p>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Share your thoughts, insights, and what you've learned from this lesson..."
                  rows={6}
                  disabled={isSubmitting}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSubmitReflection}
                  disabled={isSubmitting || !reflection.trim()}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Reflection"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default LessonDetail;
