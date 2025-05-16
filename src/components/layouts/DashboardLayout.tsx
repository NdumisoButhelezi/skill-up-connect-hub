
import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const DashboardLayout = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out");
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
      toast.error("Failed to log out");
    }
  };

  // Determine navigation links based on user role
  const navLinks = userRole === "jobSeeker" 
    ? [
        { name: "Workshops", path: "/dashboard" },
        { name: "My Progress", path: "/dashboard/progress" },
        { name: "Leaderboard", path: "/dashboard/leaderboard" },
        { name: "Profile", path: "/dashboard/profile" }
      ]
    : [
        { name: "Manage Workshops", path: "/dashboard" },
        { name: "Learner Profiles", path: "/dashboard/learners" },
        { name: "Analytics", path: "/dashboard/analytics" }
      ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-sidebar w-full md:w-64 md:min-h-screen p-4 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold">SkillUp Connect</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={() => document.querySelector('aside')?.classList.toggle('hidden')}
          >
            ☰
          </Button>
        </div>
        
        <nav className="space-y-2 flex-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block p-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "hover:bg-sidebar-accent/80"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div className="text-sm">
            <p className="font-medium">{currentUser?.email}</p>
            <p className="text-sidebar-foreground/70 capitalize">
              {userRole || "User"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
