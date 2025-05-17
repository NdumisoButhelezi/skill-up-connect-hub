
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, getDocs, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Award } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import BadgeDisplay from "@/components/BadgeDisplay";
import { calculateRecruiterBadges } from "@/utils/badgeSystem";

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
  const { userRole, currentUser } = useAuth();
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [workshopCount, setWorkshopCount] = useState(0);
  const [recruiterBadges, setRecruiterBadges] = useState([]);
  const [showPaymentAlert, setShowPaymentAlert] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const workshopsRef = collection(db, "workshops");
        let workshopsQuery;
        
        // For recruiters, only show their workshops
        if (userRole === "recruiter" && currentUser) {
          workshopsQuery = query(workshopsRef, where("createdBy", "==", currentUser.uid));
          
          // Get count of workshops
          const countSnapshot = await getCountFromServer(workshopsQuery);
          const count = countSnapshot.data().count;
          setWorkshopCount(count);
          
          // Calculate badges
          const badges = calculateRecruiterBadges(count);
          setRecruiterBadges(badges);
          
          // Check if payment alert should be shown
          if (count >= 5 && !hasPaid) {
            setShowPaymentAlert(true);
          }
        } else {
          workshopsQuery = workshopsRef;
        }
        
        const workshopsSnapshot = await getDocs(workshopsQuery);
        
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
  }, [userRole, currentUser, hasPaid]);

  const handlePayment = () => {
    // Simulate successful payment
    toast.success("Payment processed successfully!");
    setHasPaid(true);
    setShowPaymentAlert(false);
  };

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
      {showPaymentAlert && (
        <Alert className="mb-6 border-yellow-400 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Workshop Limit Reached</AlertTitle>
          <AlertDescription>
            You've created 5 workshops, which is the free limit. Subscribe to create unlimited workshops.
            <div className="mt-4">
              <Button 
                onClick={handlePayment}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Subscribe - $29.99/month
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Workshops</h1>
          <p className="text-gray-600">You have created {workshopCount} workshop{workshopCount !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {recruiterBadges && recruiterBadges.length > 0 && (
            <BadgeDisplay badges={recruiterBadges} />
          )}
          <Button 
            className="bg-teal-600 hover:bg-teal-700 whitespace-nowrap"
            onClick={() => navigate("/dashboard/create-workshop")}
            disabled={workshopCount >= 5 && !hasPaid}
          >
            Create Workshop
          </Button>
        </div>
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
