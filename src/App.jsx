// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import Login from './components/login'
// import AdminDashboard from './pages/AdminDashboard'
// import NewUser from './components/admin/NewUser'
// import NewProject from './components/admin/NewProject'
// import EditRole from './components/admin/EditRole'
// import DrawRect from './components/annotator/DrawRect'
// //import AnnotationPage from './components/annotator/AnnotationPage'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <div>
   
//         { <AdminDashboard/> }
//         <Login/>
     
//     </div>
//   )
// }

// export default App



// import React, { useEffect } from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import LoginPage from './pages/LoginPage.jsx';
// import EmployeePage from './pages/user/EmployeePage.jsx';
// import ITSupportPage from './pages/itsupport/ITSupportPage.jsx';
// import useAuth from './hooks/login_context_hook.js';
// import Detail from "./pages/user/detail";
// import AdminPage from './pages/admin/AdminPage.jsx';
// import EmployeeRegistrationForm from './pages/admin/addusers.jsx';
// import ForgotPassword from './pages/forgot.jsx';
// import { ProtectedRoute } from "./protected/pro";
// import UserTickets from "./pages/user/ticket.jsx";
// import { IssueProvider } from './context/issueContext';
// import Test from './pages/test.jsx';




import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
// import NewUser from './components/admin/NewUser'
// import NewProject from './components/admin/NewProject'
// import EditRole from './components/admin/EditRole'
import DrawRect from './components/annotator/DrawRect'
//import AnnotationPage from './components/annotator/AnnotationPage'
function App() {
  // const { dispatch } = useAuth();

  // useEffect(() => {
  //   const handleUnload = () => {
  //     dispatch({ type: 'LOGOUT' });
  //   };
  //   window.addEventListener('unload', handleUnload);
  //   return () => {
  //     window.removeEventListener('unload', handleUnload);
  //   };
  // }, [dispatch]);

  return (
    <BrowserRouter>
     
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/admin" element={<AdminDashboard/>} />
          <Route path="/draw" element={<DrawRect/>} />
          {/* <Route path="/itsupport" element={
            <ProtectedRoute allowedRoles={["IT Support"]}>
              <ITSupportPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/userdetails" element={<Detail />} />
          <Route path="/changepassword" element={<ForgotPassword />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/test" element={<Test />} />
          <Route path="/employeeticketinfo" element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <UserTickets />
            </ProtectedRoute>
          } /> */}
        </Routes>
      
    </BrowserRouter>
  );
}

export default App;
