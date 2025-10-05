import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const LessonPlayer = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [transcript, setTranscript] = useState({ text: '', status: 'pending' });
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const lessonResponse = await api.get(`/lessons/${lessonId}/transcript`);
        setTranscript(lessonResponse.data);

        const progressResponse = await api.get('/progress');
        const enrollment = progressResponse.data.items.find(item => 
          item.courseId === lesson?.courseId
        );
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load lesson');
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  const handleComplete = async () => {
    setCompleting(true);
    setError('');

    try {
      const response = await api.post(`/learn/${lessonId}/complete`);
      setCompleted(true);
      alert(`Progress: ${response.data.progressPercent}% (${response.data.completedLessonsCount}/${response.data.totalLessons} lessons)`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to mark as complete');
    } finally {
      setCompleting(false);
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
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-indigo-600 hover:text-indigo-800"
      >
        ← Back to Course
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg mb-6">
          <div className="flex items-center justify-center text-white">
            <p>Video Player (Lesson ID: {lessonId})</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Lesson</h1>
          <button
            onClick={handleComplete}
            disabled={completing || completed}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {completed ? '✓ Completed' : completing ? 'Marking...' : 'Mark as Complete'}
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Transcript
          </h2>
          {transcript.status === 'pending' && (
            <p className="text-gray-500 italic">Transcript generation pending...</p>
          )}
          {transcript.status === 'processing' && (
            <p className="text-gray-500 italic">Transcript is being generated...</p>
          )}
          {transcript.status === 'failed' && (
            <p className="text-red-500 italic">Transcript generation failed</p>
          )}
          {transcript.status === 'completed' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{transcript.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;
