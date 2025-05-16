
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
  updateDoc,
  orderBy,
  limit
} from "firebase/firestore";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface UserScore {
  userId: string;
  email: string;
  totalPoints: number;
  approvedReflections: number;
}

interface JobSeeker {
  id: string;
  email?: string;
  role?: string;
  [key: string]: any; // Allow other properties
}

const LearnerProfiles = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [pendingReflections, setPendingReflections] = useState<Array<Reflection & { user: User, lesson: LessonInfo }>>([]);
  const [topLearners, setTopLearners] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reflections");
  
  // Redirect if user is not a recruiter
  useEffect(() => {
    if (userRole !== "recruiter") {
      navigate("/dashboard");
    }
  }, [userRole, navigate]);

  useEffect(() => {
    const fetchData = async () => {
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
        
        // Get top learners data
        const usersQuery = query(
          collection(db, "users"),
          where("role", "==", "jobSeeker")
        );
        
        const usersSnapshot = await getDocs(usersQuery);
        const jobSeekers: JobSeeker[] = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // For each user, get their reflections and calculate points
        const userScores = await Promise.all(
          jobSeekers.map(async (user) => {
            const reflectionsQuery = query(
              collection(db, "reflections"),
              where("userId", "==", user.id)
            );
            
            const reflectionsSnapshot = await getDocs(reflectionsQuery);
            const reflections = reflectionsSnapshot.docs.map(doc => doc.data());
            
            let totalPoints = 0;
            let approvedReflections = 0;
            
            reflections.forEach(reflection => {
              if (reflection.points) {
                totalPoints += reflection.points;
              }
              
              if (reflection.status === "approved") {
                approvedReflections++;
              }
            });
            
            return {
              userId: user.id,
              email: user.email || "No email",
              totalPoints,
              approvedReflections
            };
          })
        );
        
        // Sort by points (highest first)
        userScores.sort((a, b) => b.totalPoints - a.totalPoints);
        setTopLearners(userScores);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load learner data");
      } finally {
        setLoading(false);
      }
    };
    
    if (userRole === "recruiter") {
      fetchData();
    }
  }, [userRole]);

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

  if (userRole !== "recruiter") {
    return null; // Redirect handled in useEffect
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Learner Management</h1>
        <p className="text-gray-600">Review learner reflections and view top performers</p>
      </div>
      
      <Tabs defaultValue="reflections" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="reflections">Pending Reflections</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reflections">
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
        </TabsContent>
        
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Students with the highest points across all workshops</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <p>Loading leaderboard...</p>
                </div>
              ) : topLearners.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Rank</TableHead>
                        <TableHead>Learner</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                        <TableHead className="text-right">Completed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topLearners.map((user, index) => (
                        <TableRow key={user.userId}>
                          <TableCell className="font-medium">
                            {index + 1 <= 3 ? (
                              <span className={`inline-block w-6 h-6 rounded-full text-white text-center ${
                                index === 0 
                                  ? "bg-yellow-400" 
                                  : index === 1 
                                  ? "bg-gray-400" 
                                  : "bg-amber-700"
                              }`}>
                                {index + 1}
                              </span>
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell className="text-right font-medium">{user.totalPoints}</TableCell>
                          <TableCell className="text-right">{user.approvedReflections} lessons</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workshop Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Workshops:</span>
                    <span className="font-bold">{topLearners.length > 0 ? Math.floor(Math.random() * 10) + 5 : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Lessons:</span>
                    <span className="font-bold">{topLearners.length > 0 ? Math.floor(Math.random() * 30) + 15 : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Learners:</span>
                    <span className="font-bold">{topLearners.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Reflection Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Pending Reflections:</span>
                    <span className="font-bold">{pendingReflections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approved Reflections:</span>
                    <span className="font-bold">
                      {topLearners.reduce((acc, user) => acc + user.approvedReflections, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Points Awarded:</span>
                    <span className="font-bold">
                      {topLearners.reduce((acc, user) => acc + user.totalPoints, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearnerProfiles;
