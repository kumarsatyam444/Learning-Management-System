import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const generateIdempotencyKey = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const CreatorApply = () => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkApplication = async () => {
      try {
        const response = await api.get('/creator/apply');
        setApplication(response.data);
      } catch (err) {
        if (err.response?.status !== 404) {
          setError(err.response?.data?.error?.message || 'Failed to check application status');
        }
      } finally {
        setChecking(false);
      }
    };

    checkApplication();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/creator/apply', { reason }, {
        headers: {
          'Idempotency-Key': generateIdempotencyKey()
        }
      });
      setSuccess('Application submitted successfully!');
      setApplication(response.data);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    );
  }

  if (application) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Creator Application Status
          </h1>
          
          <div className={`p-4 rounded-md mb-4 ${
            application.status === 'approved' ? 'bg-green-50' :
            application.status === 'rejected' ? 'bg-red-50' :
            'bg-yellow-50'
          }`}>
            <p className={`font-semibold ${
              application.status === 'approved' ? 'text-green-800' :
              application.status === 'rejected' ? 'text-red-800' :
              'text-yellow-800'
            }`}>
              Status: {application.status.toUpperCase()}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Your Reason:</p>
              <p className="text-gray-900">{application.reason}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Submitted:</p>
              <p className="text-gray-900">
                {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </div>
            {application.reviewedAt && (
              <div>
                <p className="text-sm text-gray-600">Reviewed:</p>
                <p className="text-gray-900">
                  {new Date(application.reviewedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {application.status === 'approved' && (
            <div className="mt-6">
              <p className="text-green-700 mb-4">
                Congratulations! Your application has been approved. You are now a creator!
              </p>
              <button
                onClick={() => navigate('/creator/dashboard')}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-semibold"
              >
                Go to Creator Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Apply to Become a Creator
        </h1>
        <p className="text-gray-600 mb-6">
          Share your knowledge with learners around the world. Tell us why you want to become a creator.
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-4 mb-4">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why do you want to become a creator?
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tell us about your expertise and why you want to create courses..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-semibold disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatorApply;
