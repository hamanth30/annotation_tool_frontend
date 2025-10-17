import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import DrawRect from "./components/annotator/DrawRect";
import NewUser from "./components/admin/NewUser";
import NewProject from "./components/admin/NewProject";
import EditRole from "./components/admin/EditRole";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Dashboards */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />

        {/* Admin Components */}
        <Route path="/admin/new-user" element={<NewUser />} />
        <Route path="/admin/new-project" element={<NewProject />} />
        <Route path="/admin/edit-role" element={<EditRole />} />

        {/* Annotator Components */}
        <Route path="/draw" element={<DrawRect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
