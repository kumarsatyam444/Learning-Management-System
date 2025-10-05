import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1">
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 float-animation">
              <span className="gradient-text">Welcome to</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                MicroCourses
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Empower your future with world-class online courses. 
              Learn from the best creator, earn certificates, and transform your career.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/courses"
                  className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold glow-button"
                >
                  🚀 Explore Courses
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold glow-button"
                  >
                    ✨ Get Started Free
                  </Link>
                  <Link
                    to="/courses"
                    className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-all"
                  >
                    📚 Browse Courses
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg glow-card text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Quality Courses</h3>
              <p className="text-gray-600">
                Access hundreds of courses created by expert instructors worldwide
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg glow-card text-center">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Earn Certificates</h3>
              <p className="text-gray-600">
                Get verified certificates upon course completion to boost your career
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg glow-card text-center">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your learning journey with detailed progress tracking
              </p>
            </div>
          </div>

          <div className="mt-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white text-center glow-card">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-xl mb-8 text-indigo-100">
              Join thousands of learners and take your skills to the next level
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user && (
                <>
                  <Link
                    to="/register"
                    className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all"
                  >
                    🎉 Sign Up Now
                  </Link>
                  <Link
                    to="/creator/apply"
                    className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all"
                  >
                    👨‍🏫 Become a Creator
                  </Link>
                </>
              )}
              {user && user.role === 'learner' && (
                <Link
                  to="/creator/apply"
                  className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all"
                >
                  👨‍🏫 Become a Creator
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
