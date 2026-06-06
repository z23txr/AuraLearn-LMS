import { Route } from "react-router-dom";
import InstructorDashboard from "../pages/instructor/InstructorDashboard/InstructorDashboard";
import MyCourses from "../components/instructor/MyCourses";
import EnrollmentRequests from "../components/instructor/EnrollmentRequests"; 
import ProtectedRoute from "../components/common/ProtectedRoute/ProtectedRoute";
import StudentDirectory from "../components/instructor/StudentDirectory"; 
import GradingCenter from "../components/instructor/GradingCenter"; 

const InstructorRoutes = [
  <Route 
    key="inst-dash"
    path="/instructor-dashboard" 
    element={
      <ProtectedRoute allowedRole="instructor">
        <InstructorDashboard />
      </ProtectedRoute>
    } 
  >
    {/* 2. My Courses */}
    <Route path="my-courses" element={<MyCourses />} />

    {/* 3. Enrollment Requests */}
    <Route path="approvals" element={<EnrollmentRequests />} />
<Route path="students" element={<StudentDirectory />} />
    {/*  */}
   
    <Route path="grading-center" element={<GradingCenter />} />
    <Route path="ai-assistant" element={<div>AI Command Center Component</div>} />
  </Route>
];

export default InstructorRoutes;