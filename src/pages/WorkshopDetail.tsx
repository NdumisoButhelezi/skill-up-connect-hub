
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
  deleteDoc,
  orderBy
} from "firebase/firestore";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Workshop {
  id: string;
  title: string;
  description: string;
  skills: string[];
  difficulty: string;
  createdBy: string;
  createdAt: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  workshopId: string;
  createdAt: string;
}

interface Registration {
  id: string;
  userId: string;
  workshopId: string;
  status: "registered" | "completed";
  registeredAt: string;
}

const WorkshopDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonContent, setNewLessonContent] = useState("");
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);

  useEffect(() => {
    const fetchWorkshopAndLessons = async () => {
      if (!id) {
        console.error("No workshop ID provided");
        toast.error("Workshop ID is missing");
        navigate("/dashboard");
        return;
      }
      
      try {
        console.log("Fetching workshop with ID:", id);
        
        // Fetch workshop details
        const workshopDoc = await getDoc(doc(db, "workshops", id));
        
        if (workshopDoc.exists()) {
          const workshopData = { id: workshopDoc.id, ...workshopDoc.data() } as Workshop;
          console.log("Workshop data:", workshopData);
          setWorkshop(workshopData);
          
          // Fetch lessons
          const lessonsQuery = query(
            collection(db, "lessons"),
            where("workshopId", "==", id),
            orderBy("createdAt", "asc")
          );
          
          const lessonsSnapshot = await getDocs(lessonsQuery);
          const lessonsData = lessonsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Lesson[];
          
          console.log("Lessons:", lessonsData);
          setLessons(lessonsData);
          
          // Check if user is registered
          if (currentUser) {
            const registrationsQuery = query(
              collection(db, "registrations"),
              where("userId", "==", currentUser.uid),
              where("workshopId", "==", id)
            );
            
            const registrationsSnapshot = await getDocs(registrationsQuery);
            
            if (!registrationsSnapshot.empty) {
              console.log("User is registered for this workshop");
              setIsRegistered(true);
              setRegistrationId(registrationsSnapshot.docs[0].id);
            } else {
              console.log("User is not registered for this workshop");
            }
          }
        } else {
          console.error("Workshop not found for ID:", id);
          toast.error("Workshop not found");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching workshop details:", error);
        toast.error("Failed to load workshop details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkshopAndLessons();
  }, [id, currentUser, navigate]);

  const handleRegisterForWorkshop = async () => {
    if (!currentUser || !workshop) return;
    
    try {
      const registration = {
        userId: currentUser.uid,
        workshopId: workshop.id,
        status: "registered",
        registeredAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "registrations"), registration);
      
      setIsRegistered(true);
      setRegistrationId(docRef.id);
      
      toast.success("Successfully registered for this workshop!");
    } catch (error) {
      console.error("Error registering for workshop:", error);
      toast.error("Failed to register for this workshop");
    }
  };

  const handleUnregister = async () => {
    if (!registrationId) return;
    
    try {
      await deleteDoc(doc(db, "registrations", registrationId));
      
      setIsRegistered(false);
      setRegistrationId(null);
      
      toast.success("Successfully unregistered from this workshop");
    } catch (error) {
      console.error("Error unregistering from workshop:", error);
      toast.error("Failed to unregister from this workshop");
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workshop || !newLessonTitle || !newLessonContent) {
      toast.error("Please fill in all lesson fields");
      return;
    }
    
    setIsSubmittingLesson(true);
    
    try {
      const lessonData = {
        title: newLessonTitle,
        content: newLessonContent,
        workshopId: workshop.id,
        createdAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, "lessons"), lessonData);
      
      const newLesson = {
        id: docRef.id,
        ...lessonData
      };
      
      setLessons([...lessons, newLesson]);
      setNewLessonTitle("");
      setNewLessonContent("");
      setIsAddingLesson(false);
      
      toast.success("Lesson added successfully!");
    } catch (error) {
      console.error("Error adding lesson:", error);
      toast.error("Failed to add lesson");
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <p>Loading workshop details...</p>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-500">Workshop not found</h2>
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{workshop.title}</h1>
          <p className="text-gray-600 capitalize">
            {workshop.difficulty} level • {workshop.skills.join(", ")}
          </p>
        </div>
        
        {userRole === "jobSeeker" && (
          <div>
            {isRegistered ? (
              <Button 
                variant="outline" 
                onClick={handleUnregister}
              >
                Unregister
              </Button>
            ) : (
              <Button 
                className="bg-teal-600 hover:bg-teal-700"
                onClick={handleRegisterForWorkshop}
              >
                Register for Workshop
              </Button>
            )}
          </div>
        )}
        
        {userRole === "recruiter" && (
          <Button
            onClick={() => navigate(`/dashboard/edit-workshop/${workshop.id}`)}
          >
            Edit Workshop
          </Button>
        )}
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>About This Workshop</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{workshop.description}</p>
        </CardContent>
      </Card>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-bold">Lessons</h2>
        
        {userRole === "recruiter" && !isAddingLesson && (
          <Button 
            onClick={() => setIsAddingLesson(true)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Add Lesson
          </Button>
        )}
      </div>
      
      {userRole === "recruiter" && isAddingLesson && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Lesson</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="lessonTitle" className="font-medium">
                  Lesson Title
                </label>
                <input 
                  type="text"
                  id="lessonTitle"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Enter lesson title"
                  className="w-full p-2 border rounded"
                  disabled={isSubmittingLesson}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="lessonContent" className="font-medium">
                  Lesson Content
                </label>
                <Textarea
                  id="lessonContent"
                  value={newLessonContent}
                  onChange={(e) => setNewLessonContent(e.target.value)}
                  placeholder="Enter lesson content"
                  rows={6}
                  disabled={isSubmittingLesson}
                  required
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddingLesson(false)}
              disabled={isSubmittingLesson}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddLesson}
              disabled={isSubmittingLesson}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isSubmittingLesson ? "Adding..." : "Add Lesson"}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {lessons.length > 0 ? (
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id} className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Lesson {index + 1}: {lesson.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 whitespace-pre-line">{lesson.content}</p>
              </CardContent>
              {userRole === "jobSeeker" ? (
                <CardFooter className="flex justify-end">
                  {isRegistered ? (
                    <Button 
                      onClick={() => navigate(`/dashboard/lesson/${lesson.id}`)}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      Start Lesson
                    </Button>
                  ) : (
                    <Button
                      onClick={handleRegisterForWorkshop}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      Register to Access
                    </Button>
                  )}
                </CardFooter>
              ) : (
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={() => navigate(`/dashboard/lesson/${lesson.id}`)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    View Lesson
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-500">No lessons available yet</h3>
          {userRole === "recruiter" ? (
            <p className="text-gray-400">Add your first lesson to get started</p>
          ) : (
            <p className="text-gray-400">Check back later for new lessons</p>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkshopDetail;
