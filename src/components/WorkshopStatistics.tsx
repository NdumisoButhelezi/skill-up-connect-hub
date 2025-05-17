
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy 
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface WorkshopStatsProps {
  workshopId: string;
}

const WorkshopStatistics = ({ workshopId }: WorkshopStatsProps) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalReflections: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalPending: 0,
    averagePoints: 0,
    lessonsData: [] as {title: string, reflections: number}[],
  });

  useEffect(() => {
    const fetchWorkshopStats = async () => {
      if (!workshopId) return;
      
      try {
        // Get all registrations for this workshop
        const registrationsQuery = query(
          collection(db, "registrations"),
          where("workshopId", "==", workshopId)
        );
        
        const registrationsSnapshot = await getDocs(registrationsQuery);
        const totalRegistrations = registrationsSnapshot.size;
        
        // Get lessons for this workshop
        const lessonsQuery = query(
          collection(db, "lessons"),
          where("workshopId", "==", workshopId)
        );
        
        const lessonsSnapshot = await getDocs(lessonsQuery);
        const lessons = lessonsSnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          reflections: 0
        }));
        
        // Get all reflections for this workshop's lessons
        let totalReflections = 0;
        let totalApproved = 0;
        let totalRejected = 0;
        let totalPending = 0;
        let totalPoints = 0;
        
        for (const lesson of lessons) {
          const reflectionsQuery = query(
            collection(db, "reflections"),
            where("lessonId", "==", lesson.id)
          );
          
          const reflectionsSnapshot = await getDocs(reflectionsQuery);
          const reflections = reflectionsSnapshot.docs;
          
          lesson.reflections = reflections.length;
          totalReflections += reflections.length;
          
          reflections.forEach(reflection => {
            const data = reflection.data();
            if (data.status === "approved") {
              totalApproved++;
              if (data.points) {
                totalPoints += data.points;
              }
            } else if (data.status === "rejected") {
              totalRejected++;
            } else {
              totalPending++;
            }
          });
        }
        
        const averagePoints = totalApproved > 0 ? Math.round(totalPoints / totalApproved) : 0;
        
        setStats({
          totalRegistrations,
          totalReflections,
          totalApproved,
          totalRejected,
          totalPending,
          averagePoints,
          lessonsData: lessons.map(l => ({ 
            title: l.title,
            reflections: l.reflections
          }))
        });
      } catch (error) {
        console.error("Error fetching workshop stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkshopStats();
  }, [workshopId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center">Loading workshop statistics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Reflections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalReflections}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.totalReflections > 0 
                ? Math.round((stats.totalApproved / stats.totalReflections) * 100)
                : 0}%
            </p>
            <Progress 
              value={stats.totalReflections > 0 
                ? (stats.totalApproved / stats.totalReflections) * 100
                : 0
              }
              className="mt-2"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Points</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.averagePoints}</p>
          </CardContent>
        </Card>
      </div>
      
      {stats.lessonsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reflections per Lesson</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.lessonsData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="title"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reflections" fill="#4b9bd4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Reflection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-yellow-500">{stats.totalPending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-500">{stats.totalApproved}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-500">{stats.totalRejected}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkshopStatistics;
