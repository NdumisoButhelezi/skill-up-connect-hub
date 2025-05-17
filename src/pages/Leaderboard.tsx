
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
import BadgeDisplay from "@/components/BadgeDisplay";
import { calculateUserBadges } from "@/utils/badgeSystem";

interface UserScore {
  userId: string;
  email: string;
  totalPoints: number;
  approvedReflections: number;
  completedWorkshops: number;
  badges: any[]; // Will store calculated badges
}

// Define the JobSeeker interface to match what we get from Firestore
interface JobSeeker {
  id: string;
  email?: string;
  role?: string;
  [key: string]: any; // Allow other properties
}

const Leaderboard = () => {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Get all users with job seeker role
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
            
            // Track unique workshops with approved reflections
            const uniqueWorkshops = new Set();
            
            reflections.forEach(reflection => {
              if (reflection.points) {
                totalPoints += reflection.points;
              }
              
              if (reflection.status === "approved") {
                approvedReflections++;
                if (reflection.workshopId) {
                  uniqueWorkshops.add(reflection.workshopId);
                }
              }
            });
            
            const completedWorkshops = uniqueWorkshops.size;
            
            // Calculate badges
            const badges = calculateUserBadges(
              totalPoints,
              approvedReflections,
              completedWorkshops
            );
            
            return {
              userId: user.id,
              email: user.email || "No email",
              totalPoints,
              approvedReflections,
              completedWorkshops,
              badges
            };
          })
        );
        
        // Sort by points (highest first)
        userScores.sort((a, b) => b.totalPoints - a.totalPoints);
        
        setLeaderboard(userScores);
        
        // Find current user's rank
        if (currentUser) {
          const userIndex = userScores.findIndex(user => user.userId === currentUser.uid);
          if (userIndex !== -1) {
            setCurrentUserRank(userIndex + 1);
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [currentUser]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-gray-600">See how you rank against other learners</p>
      </div>
      
      {currentUserRank && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Your Rank</p>
                <p className="text-2xl font-bold">#{currentUserRank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Your Points</p>
                <p className="text-2xl font-bold">
                  {leaderboard.find(user => user.userId === currentUser?.uid)?.totalPoints || 0}
                </p>
              </div>
            </div>
            {/* Show user's badges */}
            {currentUser && (
              <div className="mt-4">
                <BadgeDisplay 
                  badges={leaderboard.find(user => user.userId === currentUser.uid)?.badges || []} 
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Top Learners</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <p>Loading leaderboard...</p>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Rank</th>
                    <th className="text-left py-3 px-4">Learner</th>
                    <th className="text-center py-3 px-4">Badges</th>
                    <th className="text-right py-3 px-4">Points</th>
                    <th className="text-right py-3 px-4">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => (
                    <tr 
                      key={user.userId} 
                      className={`border-b last:border-0 ${
                        user.userId === currentUser?.uid 
                          ? "bg-teal-50" 
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="py-3 px-4">
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
                      </td>
                      <td className="py-3 px-4">
                        {user.email}
                        {user.userId === currentUser?.uid && " (You)"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center">
                          {user.badges && user.badges.length > 0 ? (
                            <div className="flex space-x-1">
                              {user.badges.slice(0, 3).map((badge, i) => (
                                <span key={i} title={badge.name} className="text-lg">
                                  {badge.icon}
                                </span>
                              ))}
                              {user.badges.length > 3 && (
                                <span className="text-xs text-gray-500 self-end">
                                  +{user.badges.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {user.totalPoints}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {user.approvedReflections} lessons
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
