import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Progress = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await api.get('/progress');
        setEnrollments(response.data.items);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load progress');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const downloadCertificate = async (serial) => {
    try {
      const response = await api.get(`/certificates/${serial}`);
      alert(`Certificate for ${response.data.course.title}\nSerial: ${serial}\nIssued: ${new Date(response.data.issuedAt).toLocaleDateString()}`);
    } catch (err) {
      alert('Failed to load certificate');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Learning Progress</h1>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {enrollments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet</p>
          <Link
            to="/courses"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.courseId}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {enrollment.courseTitle}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {enrollment.courseDescription}
                  </p>
                </div>
                {enrollment.courseThumbnail && (
                  <img
                    src={enrollment.courseThumbnail}
                    alt={enrollment.courseTitle}
                    className="w-32 h-20 object-cover rounded ml-4"
                  />
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Progress</span>
                  <span className="font-bold text-indigo-600">{enrollment.progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 h-4 rounded-full transition-all progress-glow"
                    style={{ width: `${enrollment.progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {enrollment.completedLessons} of {enrollment.totalLessons} lessons completed
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                  <p>Last accessed: {new Date(enrollment.lastAccessedAt).toLocaleDateString()}</p>
                </div>
                <div className="space-x-3">
                  {enrollment.certificateSerial ? (
                    <button
                      onClick={() => downloadCertificate(enrollment.certificateSerial)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg glow-button text-sm font-semibold pulse-glow"
                    >
                      🏆 View Certificate
                    </button>
                  ) : (
                    <Link
                      to={`/courses/${enrollment.courseId}`}
                      className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg glow-button text-sm font-semibold"
                    >
                      ▶️ Continue Learning
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Progress;
