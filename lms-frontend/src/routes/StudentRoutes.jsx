import { Route } from "react-router-dom";
import StudentDashboard from "../pages/student/StudentDashboard/StudentDashboard";
import ExploreCoursesList from "../components/dashboard/ExploreCoursesList";
import FullExplorePage from "../components/dashboard/FullExplorePage";
import ProtectedRoute from "../components/common/ProtectedRoute/ProtectedRoute";
import MyCourses from "../components/dashboard/MyCourses";
import CoursePlayer from "../components/dashboard/CoursePlayer";
import DashboardHome from "../pages/student/StudentDashboard/DashboardHome";
import AIAssistant from "../pages/student/AIAssistant/AIAssistant";
import StudentSettings from "../pages/student/Settings/StudentSettings";
import Certificates from "../pages/student/Certificates/Certificates";
import Quizzes from "../pages/student/Quizzes/Quizzes";

const StudentRoutes = [
  <Route 
    key="std-dash" 
    path="/student-dashboard" 
    element={
      <ProtectedRoute allowedRole="student">
        <StudentDashboard />
      </ProtectedRoute>
    } 
  >
    {/* Dashboard home  */}
    <Route index element={<DashboardHome />} /> 
    <Route path="explore" element={<ExploreCoursesList />} />
    <Route path="full-explore" element={<FullExplorePage />} />
    <Route path="my-courses" element={<MyCourses />} />
    <Route path="course-details/:id" element={<CoursePlayer />} />
    <Route path="ai-assistant" element={<AIAssistant />} />
    <Route path="settings" element={<StudentSettings />} />
    <Route path="certificates" element={<Certificates />} />
    <Route path="quizzes" element={<Quizzes />} />
  </Route>
];

export default StudentRoutes;