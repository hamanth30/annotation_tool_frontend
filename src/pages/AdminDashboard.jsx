import React, { useState } from "react";
import {
  UserPlus,
  Users,
  FolderPlus,
  FolderOpen,
  FolderX,
  UserX,
  LayoutDashboard,
  BarChart3,
} from "lucide-react";
import { TbUserEdit } from "react-icons/tb";
import { TbUsersPlus } from "react-icons/tb";
import NewUser from "../components/admin/NewUser";
import NewProject from "../components/admin/NewProject";
import ViewProjects from "../components/admin/ViewProjects";
import RemoveUser from "../components/admin/removeuser";
import ProjectAnalytics from "../components/admin/ProjectAnalytics";
import EditRole from "../components/admin/EditRole";

// Custom SVG Icons
const LayoutDashboard = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const UserPlus = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

const FolderPlus = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    <line x1="12" y1="11" x2="12" y2="17"></line>
    <line x1="9" y1="14" x2="15" y2="14"></line>
  </svg>
);

const FolderOpen = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const UserX = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="18" y1="8" x2="23" y2="13"></line>
    <line x1="23" y1="8" x2="18" y2="13"></line>
  </svg>
);

const FolderX = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    <line x1="10" y1="11" x2="14" y2="15"></line>
    <line x1="14" y1="11" x2="10" y2="15"></line>
  </svg>
);

const AdminDashboard = () => {
  const [active, setActive] = useState("dashboard");
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "addUser", label: "Add New User", icon: <UserPlus size={20} /> },
    { id: "createProject", label: "Create New Project", icon: <FolderPlus size={20} /> },
    { id: "ongoingProjects", label: "Ongoing Projects", icon: <FolderOpen size={20} /> },

    // { id: "removeUser", label: "Remove User", icon: <UserX size={20} /> },

    { id: "projectAnalytics", label: "Project Analytics", icon: <BarChart3 size={20} /> },
    { id: "removeUser", label: "Remove User", icon: <UserX size={20} /> },

    { id: "deleteProject", label: "Delete Project", icon: <FolderX size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 bg-gradient-to-br from-amber-500 to-yellow-600 p-3 rounded-lg shadow-xl hover:scale-110 transition-all"
      >
        <div className="flex flex-col gap-1.5 w-5 h-5">
          <span className={`w-5 h-0.5 bg-black transition-all ${isOpen ? "rotate-45 translate-y-2" : ""}`}></span>
          <span className={`w-5 h-0.5 bg-black transition-all ${isOpen ? "opacity-0" : ""}`}></span>
          <span className={`w-5 h-0.5 bg-black transition-all ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
        </div>
      </button>

      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-gray-900 to-black border-r border-amber-500/20 p-6 fixed h-full transition-all duration-500
        ${isOpen ? "w-72 left-0" : "w-0 -left-72 overflow-hidden"}`}
      >
        <div className={`${isOpen ? "opacity-100 delay-300" : "opacity-0"} transition-opacity duration-500`}>
          <h2 className="text-2xl ml-10 mt-2 font-bold bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent mb-8 text-center">
            ADMIN PANEL
          </h2>

          <nav className="flex-1 space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center w-full px-5 py-3 text-sm font-semibold rounded-xl transition-all
                  ${active === item.id
                    ? "bg-gradient-to-r from-amber-300 to-yellow-600 text-black shadow-lg"
                    : "text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30"
                  }`}
              >
                <span className="mr-4">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-amber-500/20 text-center text-xs text-amber-400/60">
            © 2025 VISION ANNOTATOR
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-8 transition-all duration-500 ${isOpen ? "ml-72" : "ml-0"}`}>
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-8 border border-amber-500/20">

          {active === "dashboard" && (
            <h1 className="text-amber-100 text-3xl">Dashboard</h1>
          )}


          {active === "addUser" && <NewUser />}
          {active === "createProject" && <NewProject />}
          {active === "ongoingProjects" && <ViewProjects />}
          {active === "removeUser" && <RemoveUser />}


          {active === "addUser" && (
            <NewUser/>
          )}
          {active === "createProject" && (
            <NewProject/>
          )}
          {active === "createTeam" && (
            <p className="text-gray-600">Form to create a new team goes here.</p>
          )}
          {active === "ongoingTeams" && (
                <p className="text-gray-600">List of ongoing teams goes here.</p>
          )}
          {active === "ongoingProjects" && (
            <ViewProjects/>
          )}
          {active === "projectAnalytics" && (
            <ProjectAnalytics/>
          )}
          {active === "editRole" && (
            <EditRole/>
          )}
          
        
          

          {active === "deleteProject" && (
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent mb-4">
                Delete Project
              </h1>
              <p className="text-amber-100">Project deletion module goes here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
