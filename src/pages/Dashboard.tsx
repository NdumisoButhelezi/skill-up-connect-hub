
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Workshop {
  id: string;
  title: string;
  description: string;
  skills: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  createdBy: string;
  createdAt: string;
}

const Dashboard = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const workshopsRef = collection(db, "workshops");
        const workshopsSnapshot = await getDocs(workshopsRef);
        
        const workshopsData = workshopsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Workshop));
        
        setWorkshops(workshopsData);
      } catch (error) {
        console.error("Error fetching workshops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const JobSeekerDashboard = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Workshops</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 animate-pulse">
              <CardHeader className="bg-gray-200 h-24" />
              <CardContent className="mt-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : workshops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <WorkshopCard 
              key={workshop.id}
              workshop={workshop}
              userRole={userRole}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-500">No workshops available yet</h3>
          <p className="text-gray-400">Check back later for new learning opportunities</p>
        </div>
      )}
    </div>
  );

  const RecruiterDashboard = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Workshops</h1>
        <Button 
          className="bg-teal-600 hover:bg-teal-700"
          onClick={() => navigate("/dashboard/create-workshop")}
        >
          Create Workshop
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 animate-pulse">
              <CardHeader className="bg-gray-200 h-24" />
              <CardContent className="mt-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : workshops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <WorkshopCard 
              key={workshop.id}
              workshop={workshop}
              userRole={userRole}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-500">No workshops created yet</h3>
          <p className="text-gray-400 mb-4">Start creating workshops to help job seekers build skills</p>
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => navigate("/dashboard/create-workshop")}
          >
            Create Your First Workshop
          </Button>
        </div>
      )}
    </div>
  );

  const WorkshopCard = ({ workshop, userRole }: { workshop: Workshop, userRole: string | null }) => (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
        <CardTitle>{workshop.title}</CardTitle>
        <CardDescription className="text-teal-100">{workshop.difficulty} level</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow py-4">
        <p className="text-sm text-gray-600 line-clamp-3">{workshop.description}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {workshop.skills.map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-800"
            >
              {skill}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {userRole === "jobSeeker" ? (
          <Button 
            className="w-full bg-teal-600 hover:bg-teal-700"
            onClick={() => navigate(`/dashboard/workshop/${workshop.id}`)}
          >
            View Workshop
          </Button>
        ) : (
          <div className="w-full flex gap-2">
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/dashboard/workshop/${workshop.id}`)}
            >
              View
            </Button>
            <Button 
              className="flex-1 bg-teal-600 hover:bg-teal-700"
              onClick={() => navigate(`/dashboard/edit-workshop/${workshop.id}`)}
            >
              Edit
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );

  if (userRole === "recruiter") {
    return <RecruiterDashboard />;
  }

  return <JobSeekerDashboard />;
};

export default Dashboard;
