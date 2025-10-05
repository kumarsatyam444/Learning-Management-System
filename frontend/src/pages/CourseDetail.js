import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const generateIdempotencyKey = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data);
        
        if (user) {
          const progressResponse = await api.get('/progress');
          const isEnrolled = progressResponse.data.items.some(
            item => item.courseId === id
          );
          setEnrolled(isEnrolled);
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user]);

  const handleEnroll = async () => {
    setEnrolling(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/courses/${id}/enroll`, {}, {
        headers: {
          'Idempotency-Key': generateIdempotencyKey()
        }
      });
      setEnrolled(true);
      setSuccess('Successfully enrolled in the course!');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {course.thumbnailUrl && (
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="w-full h-96 object-cover rounded-lg mb-8"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {course.title}
          </h1>
          <p className="text-gray-600 mb-4">by {course.creator.name}</p>
          <p className="text-gray-700 mb-8">{course.description}</p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Course Content
          </h2>
          <div className="space-y-3">
            {course.lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="bg-white p-4 rounded-lg shadow border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Lesson {lesson.order}: {lesson.title}
                    </p>
                    {lesson.duration > 0 && (
                      <p className="text-sm text-gray-500">
                        {Math.floor(lesson.duration / 60)} min
                      </p>
                    )}
                  </div>
                  {enrolled && (
                    <Link
                      to={`/learn/${lesson.id}`}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
                    >
                      Start
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-lg sticky top-8">
            {success && (
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            {user && user.role === 'learner' && !enrolled && (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-bold text-lg glow-button disabled:opacity-50"
              >
                {enrolling ? '⏳ Enrolling...' : '🎯 Enroll Now'}
              </button>
            )}
            
            {user && user.role === 'learner' && enrolled && (
              <div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl text-center font-bold mb-4 pulse-glow">
                  ✓ Enrolled Successfully!
                </div>
                {course.lessons.length > 0 && (
                  <Link
                    to={`/learn/${course.lessons[0].id}`}
                    className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-bold text-lg glow-button text-center"
                  >
                    ▶️ Continue Learning
                  </Link>
                )}
              </div>
            )}

            {!user && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Sign in to enroll</p>
                <Link
                  to="/login"
                  className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-semibold text-center"
                >
                  Sign In
                </Link>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Course Details
              </h3>
              <p className="text-sm text-gray-600">
                {course.lessons.length} lessons
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
