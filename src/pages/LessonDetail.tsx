
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
  getDocs,
  updateDoc
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, Award, CheckCircle, Clock, XCircle } from "lucide-react";

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
  feedback?: string;
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
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [points, setPoints] = useState<number>(0);
  const [isUpdatingReflection, setIsUpdatingReflection] = useState(false);

  useEffect(() => {
    const fetchLessonAndWorkshop = async () => {
      if (!id || !currentUser) {
        console.error("Missing lesson ID or user");
        setLoading(false);
        return;
      }
      
      try {
        console.log("Fetching lesson with ID:", id);
        
        // Fetch lesson
        const lessonDoc = await getDoc(doc(db, "lessons", id));
        
        if (lessonDoc.exists()) {
          const lessonData = { id: lessonDoc.id, ...lessonDoc.data() } as Lesson;
          console.log("Lesson data:", lessonData);
          setLesson(lessonData);
          
          // Fetch workshop
          const workshopId = lessonData.workshopId;
          if (!workshopId) {
            console.error("Lesson is missing workshopId");
            setError("Invalid lesson data");
            toast.error("Lesson data is incomplete");
            return;
          }
          
          console.log("Fetching workshop with ID:", workshopId);
          const workshopDoc = await getDoc(doc(db, "workshops", workshopId));
          
          if (workshopDoc.exists()) {
            const workshopData = workshopDoc.data();
            setWorkshop({
              id: workshopDoc.id,
              title: workshopData.title
            });
            
            // Check if user is registered for this workshop
            if (userRole === "jobSeeker") {
              const registrationsQuery = query(
                collection(db, "registrations"),
                where("userId", "==", currentUser.uid),
                where("workshopId", "==", lessonData.workshopId)
              );
              
              const registrationsSnapshot = await getDocs(registrationsQuery);
              const isUserRegistered = !registrationsSnapshot.empty;
              setIsRegistered(isUserRegistered);
              
              if (!isUserRegistered && userRole === "jobSeeker") {
                toast.warning("Please register for the workshop to access lessons");
              }
            } else {
              // Recruiters always have access
              setIsRegistered(true);
            }
          } else {
            console.error("Workshop not found for lesson:", id);
            setError("Workshop not found");
            toast.error("Workshop details could not be loaded");
          }
          
          // Check for existing reflection
          if (currentUser) {
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
              console.log("Found existing reflection:", reflectionData);
            }
          }
        } else {
          console.error("Lesson not found for ID:", id);
          setError("Lesson not found");
          toast.error("Lesson not found");
        }
      } catch (error) {
        console.error("Error fetching lesson details:", error);
        setError("Failed to load lesson details");
        toast.error("Failed to load lesson details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessonAndWorkshop();
  }, [id, currentUser, navigate, userRole]);

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

  const handleUpdateReflectionStatus = async (status: "approved" | "rejected") => {
    if (!existingReflection?.id) {
      toast.error("No reflection to update");
      return;
    }
    
    setIsUpdatingReflection(true);
    
    try {
      const reflectionRef = doc(db, "reflections", existingReflection.id);
      
      // Fix: Define the update data with the correct type that includes optional points
      const updateData: {
        status: "approved" | "rejected";
        feedback: string | undefined;
        points?: number;
      } = {
        status: status,
        feedback: feedback.trim() || undefined
      };
      
      // Only add points if approved and points > 0
      if (status === "approved" && points > 0) {
        updateData.points = points;
      }
      
      await updateDoc(reflectionRef, updateData);
      
      setExistingReflection({
        ...existingReflection,
        status: status,
        points: status === "approved" ? points : 0,
        feedback: feedback
      });
      
      toast.success(`Reflection ${status === "approved" ? "approved" : "rejected"} successfully`);
    } catch (error) {
      console.error("Error updating reflection:", error);
      toast.error("Failed to update reflection status");
    } finally {
      setIsUpdatingReflection(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <Clock className="mx-auto h-10 w-10 text-gray-400 animate-pulse mb-4" />
          <p className="text-lg">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center justify-center gap-2 mb-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <h2 className="text-xl font-medium text-red-500">{error}</h2>
        </div>
        <p className="text-gray-500 mb-6">
          There was an error loading the lesson. This could be due to network issues or missing permissions.
        </p>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
        <Button 
          className="mt-4 ml-2" 
          onClick={() => {
            setLoading(true);
            setError(null);
            window.location.reload();
          }}
        >
          Try Again
        </Button>
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

  // If user is a job seeker and not registered for the workshop, redirect to workshop page
  if (userRole === "jobSeeker" && !isRegistered) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-500">Registration Required</h2>
        <p className="mb-6 text-gray-400">You need to register for this workshop to access its lessons</p>
        <Button 
          className="mt-4" 
          onClick={() => navigate(`/dashboard/workshop/${lesson.workshopId}`)}
        >
          Go to Workshop
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
              className="p-0 h-auto text-gray-500 flex items-center gap-1"
              onClick={() => navigate(`/dashboard/workshop/${workshop.id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
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
                <CardTitle className="text-lg flex items-center gap-2">
                  Submitted Reflection
                  {existingReflection.status === "approved" && <CheckCircle className="text-green-500 h-5 w-5" />}
                  {existingReflection.status === "pending" && <Clock className="text-yellow-500 h-5 w-5" />}
                  {existingReflection.status === "rejected" && <XCircle className="text-red-500 h-5 w-5" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{existingReflection.content}</p>
                
                <div className="mt-4 p-3 rounded-md flex items-center justify-between bg-gray-50">
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
                    {existingReflection.points !== undefined && existingReflection.points > 0 && (
                      <p className="text-sm mt-1 flex items-center gap-1">
                        <Award className="h-4 w-4 text-teal-600" />
                        Points: +{existingReflection.points}
                      </p>
                    )}
                  </div>
                </div>
                
                {existingReflection.feedback && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-medium mb-2">Feedback:</h3>
                    <p className="text-gray-700">{existingReflection.feedback}</p>
                  </div>
                )}
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

      {userRole === "recruiter" && existingReflection && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Review Reflection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Student Reflection:</h3>
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="whitespace-pre-line">{existingReflection.content}</p>
                </div>
              </div>
              
              <div>
                <label htmlFor="feedback" className="font-medium block mb-2">
                  Provide Feedback:
                </label>
                <Textarea 
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback on this reflection..."
                  rows={4}
                  disabled={isUpdatingReflection || existingReflection.status !== "pending"}
                />
              </div>
              
              <div>
                <label htmlFor="points" className="font-medium block mb-2">
                  Award Points (if approving):
                </label>
                <Input
                  id="points"
                  type="number"
                  min={0}
                  max={100}
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                  disabled={isUpdatingReflection || existingReflection.status !== "pending"}
                  className="max-w-xs"
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button
                  onClick={() => handleUpdateReflectionStatus("rejected")}
                  disabled={isUpdatingReflection || existingReflection.status !== "pending"}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleUpdateReflectionStatus("approved")}
                  disabled={isUpdatingReflection || existingReflection.status !== "pending"}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LessonDetail;
