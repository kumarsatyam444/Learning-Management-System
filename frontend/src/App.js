import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonPlayer from './pages/LessonPlayer';
import Progress from './pages/Progress';
import CreatorApply from './pages/CreatorApply';
import CreatorDashboard from './pages/CreatorDashboard';
import AdminCourseReview from './pages/AdminCourseReview';
import AdminCreatorApplications from './pages/AdminCreatorApplications';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            
            <Route
              path="/learn/:lessonId"
              element={
                <ProtectedRoute roles={['learner']}>
                  <LessonPlayer />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/progress"
              element={
                <ProtectedRoute roles={['learner']}>
                  <Progress />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/creator/apply"
              element={
                <ProtectedRoute roles={['learner']}>
                  <CreatorApply />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/creator/dashboard"
              element={
                <ProtectedRoute roles={['creator']}>
                  <CreatorDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/review/courses"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminCourseReview />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/creator-applications"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminCreatorApplications />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
