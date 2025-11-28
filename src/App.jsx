import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import NewUser from "./components/admin/NewUser";
import NewProject from "./components/admin/NewProject";
import EditRole from "./components/admin/EditRole";
import AnnotateFile from "./components/employee/AnnotateFiles";
import DrawRect from "./components/employee/DrawRect";
import ProjectFiles from "./components/admin/listannotatorassign";
import ProjectUnassignedReviews from "./components/admin/listreviewerassign";
import ViewProjects from "./components/admin/ViewProjects";
import AnnotatorsPage from "./components/admin/available_annotators";
import AddUserPage from "./components/admin/add_user";
import Removeuser from "./components/admin/removeuser";
import PromoteReviewer from "./components/admin/promotereviewer";
import ProjectEditors from "./components/admin/available_reviewer";
import AssignedAdminFiles from "./components/employee/showadminfiles";
import RandomAssignedFiles from "./components/employee/showrandomfile";
import ProjectAnalytics from "./components/admin/ProjectAnalytics";
import RandomAssignedFilesReview from "./components/reviewer/showrandomfiles"
import ReviewFile from "./components/reviewer/Reviewercanvas"
function App() {
  return (
    <>
      <ToastContainer />
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/employee" element={<EmployeeDashboard />} />




          {/* admin routes */}

          <Route path="/admin/new-user" element={<NewUser />} />
          <Route path="/admin/new-project" element={<NewProject />} />
          <Route path="/admin/edit-role" element={<EditRole />} />
          <Route path="/admin/project/:projectId/files" element={<ProjectFiles />} />
          <Route path="/admin/project/:projectId/reviewfiles" element={<ProjectUnassignedReviews />} />
          <Route path="/admin/ongoingprojects" element={<ViewProjects />} />
          <Route path="/admin/viewannotatorsinaproject/:projectId" element={<AnnotatorsPage />} />
          <Route path="/admin/project/:projectId/add-users" element={<AddUserPage />} />
          <Route path="/admin/project/:projectId/annotators" element={<Removeuser />} />
          <Route path="/admin/project/:projectId/promotereviewer" element={<PromoteReviewer />} />
          <Route path="/admin/reviewfileassign/:projectId" element={<ProjectEditors />} />





          {/* employee routess */}

          {/* <Route path="/employee/annotate/:project_id" element={<AnnotateFile />} /> */}
          <Route path="/employee/annotate/random/start/:projectId/:fileId" element={<AnnotateFile />} />
          <Route path="/draw" element={<DrawRect />} />
          <Route path="/employee/adminfiles/:projectId/:employeeId" element={<AssignedAdminFiles />} />
          <Route path="/employee/randomfiles/:projectId/:employeeId" element={<RandomAssignedFiles />} />






        {/* reviewer routes */}
         <Route path="/reviewer/randomfiles/:projectId/:employeeId" element={<RandomAssignedFilesReview />} />
         <Route path="/reviewer/annotate/start/:projectId/:fileId" element={< ReviewFile />} />


        </Routes>
      </BrowserRouter>


    </>
  );
}

export default App;
