import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent hover:scale-105 transition-transform">
              ✨ MicroCourses
            </Link>
            {user && (
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/courses"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white hover:bg-opacity-20 transition-all duration-300"
                >
                  📚 Courses
                </Link>
                {user.role === 'learner' && (
                  <Link
                    to="/progress"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    My Progress
                  </Link>
                )}
                {user.role === 'creator' && (
                  <Link
                    to="/creator/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Creator Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/review/courses"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                      Review Courses
                    </Link>
                    <Link
                      to="/admin/creator-applications"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                      Creator Applications
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-md text-sm font-medium glow-button transition-all duration-300"
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-white hover:bg-opacity-20 transition-all duration-300"
                >
                  🔑 Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:shadow-lg glow-button transition-all duration-300"
                >
                  ✨ Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
