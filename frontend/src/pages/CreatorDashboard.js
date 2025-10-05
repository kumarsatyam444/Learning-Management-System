import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const generateIdempotencyKey = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const CreatorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [error, setError] = useState('');

  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    thumbnailUrl: ''
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    videoUrl: '',
    order: 1,
    duration: 0
  });

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const response = await api.get('/courses', { params: { limit: 100 } });
      setCourses(response.data.items);
      setLoading(false);
    } catch (err) {
      setError('Failed to load courses');
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/lessons`);
      setLessons(response.data.items);
      setSelectedCourse(courseId);
    } catch (err) {
      setError('Failed to load lessons');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', courseForm, {
        headers: { 'Idempotency-Key': generateIdempotencyKey() }
      });
      setShowCourseModal(false);
      setCourseForm({ title: '', description: '', thumbnailUrl: '' });
      fetchMyCourses();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create course');
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      await api.post(`/courses/${selectedCourse}/lessons`, lessonForm, {
        headers: { 'Idempotency-Key': generateIdempotencyKey() }
      });
      setShowLessonModal(false);
      setLessonForm({ title: '', videoUrl: '', order: lessons.length + 1, duration: 0 });
      fetchLessons(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create lesson');
    }
  };

  const handleSubmitForReview = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/submit-for-review`);
      alert('Course submitted for review!');
      fetchMyCourses();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to submit course');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedLessons = items.map((lesson, index) => ({
      ...lesson,
      order: index + 1
    }));

    setLessons(updatedLessons);

    try {
      for (const lesson of updatedLessons) {
        await api.put(`/courses/${selectedCourse}/lessons/${lesson.id}`, {
          order: lesson.order
        });
      }
    } catch (err) {
      setError('Failed to reorder lessons');
      fetchLessons(selectedCourse);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
        <button
          onClick={() => setShowCourseModal(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          Create New Course
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Courses</h2>
          {courses.length === 0 ? (
            <p className="text-gray-600">No courses yet. Create your first course!</p>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg"
                  onClick={() => fetchLessons(course.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                      <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
                        course.status === 'published' ? 'bg-green-100 text-green-800' :
                        course.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                        course.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                  {course.status === 'draft' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubmitForReview(course.id);
                      }}
                      className="mt-3 text-sm bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
                    >
                      Submit for Review
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Lessons</h2>
            {selectedCourse && (
              <button
                onClick={() => {
                  setLessonForm({ ...lessonForm, order: lessons.length + 1 });
                  setShowLessonModal(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
              >
                Add Lesson
              </button>
            )}
          </div>
          
          {!selectedCourse ? (
            <p className="text-gray-600">Select a course to view lessons</p>
          ) : lessons.length === 0 ? (
            <p className="text-gray-600">No lessons yet. Add your first lesson!</p>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="lessons">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {lessons.map((lesson, index) => (
                      <Draggable
                        key={lesson.id}
                        draggableId={lesson.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-4 rounded-lg shadow"
                          >
                            <div className="flex items-center">
                              <div className="mr-3 text-gray-400">⋮⋮</div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                  {lesson.order}. {lesson.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Transcript: {lesson.transcriptStatus}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>

      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create New Course</h3>
            <form onSubmit={handleCreateCourse}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={courseForm.thumbnailUrl}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add New Lesson</h3>
            <form onSubmit={handleCreateLesson}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                <input
                  type="url"
                  required
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={lessonForm.order}
                  onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (seconds)</label>
                <input
                  type="number"
                  min="0"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;
