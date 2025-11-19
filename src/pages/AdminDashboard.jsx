import React, { useState } from "react";
import {
  UserPlus,
  Users,
  FolderPlus,
  FolderOpen,
  FolderX,
  UserX,
  LayoutDashboard,
} from "lucide-react";
import { TbUserEdit } from "react-icons/tb";
import { TbUsersPlus } from "react-icons/tb";
import NewUser from "../components/admin/NewUser";
import NewProject from "../components/admin/NewProject";
import EditRole from "../components/admin/EditRole";
import ViewProjects from "../components/admin/ViewProjects";
import RemoveUser from "../components/admin/removeuser";

const AdminDashboard = () => {
  const [active, setActive] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "addUser", label: "Add New User", icon: <UserPlus size={20} /> },
    { id: "createProject", label: "Create New Project", icon: <FolderPlus size={20} /> },
    { id: "ongoingProjects", label: "Ongoing Projects", icon: <FolderOpen size={20} /> },
    { id: "removeUser", label: "Remove User", icon: <UserX size={20} /> },
    { id: "deleteProject", label: "Delete Project", icon: <FolderX size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h2 className="text-2xl font-bold text-indigo-600 mb-6 text-center">
          Admin Panel
        </h2>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                active === item.id
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 hover:bg-indigo-50"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto text-center text-xs text-gray-400">
          © 2025 Vision Annotator
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          {menuItems.find((item) => item.id === active)?.label}
        </h1>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Placeholder for selected section */}
          {active === "dashboard" && (
            <p className="text-gray-600">
              Welcome to the Admin Dashboard. Use the sidebar to manage users,
              teams, and projects.
            </p>
          )}
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
          {active === "editRole" && (
            <EditRole/>
          )}
          
        
          
          {active === "deleteProject" && (
            <p className="text-gray-600">Option to delete a project goes here.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
