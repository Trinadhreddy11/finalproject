import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import { 
  Book, 
  Clock, 
  Award,
  Plus,
  Pencil,
  Trash2,
  X,
  Filter,
  Play,
  FileText,
  Upload
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { Course } from '../types';
import { useCourses } from '../contexts/CourseContext';
import { useAuth } from '../contexts/AuthContext';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function CourseList() {
  const { courses, addCourse, updateCourse, deleteCourse } = useCourses();
  const { userRole } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    level: 'Beginner',
    topics: [],
    thumbnail: '',
    videoUrl: ''
  });

  const filteredCourses = selectedLevel
    ? courses.filter(course => course.level === selectedLevel)
    : courses;

  const handleAddOrUpdateCourse = () => {
    if (!newCourse.title || !newCourse.description || !newCourse.instructor) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingCourse) {
      updateCourse({ ...editingCourse, ...newCourse as Course });
    } else {
      addCourse(newCourse as Course);
    }

    setNewCourse({
      title: '',
      description: '',
      instructor: '',
      duration: '',
      level: 'Beginner',
      topics: [],
      thumbnail: '',
      videoUrl: ''
    });
    setEditingCourse(null);
    setShowAddModal(false);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setNewCourse(course);
    setShowAddModal(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteCourse(courseId);
    }
  };

  const handlePlayVideo = (course: Course) => {
    setSelectedCourse(course);
    setShowVideoModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <motion.h2 
          className="text-3xl font-bold text-gray-900"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {userRole === 'faculty' ? 'Manage Courses' : 'Available Courses'}
        </motion.h2>
        <div className="flex gap-4">
          <div className="relative">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <Filter className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          {userRole === 'faculty' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Course
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <motion.div
            key={course.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative group">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              {course.videoUrl && (
                <button
                  onClick={() => handlePlayVideo(course)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Play className="w-16 h-16 text-white" />
                </button>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                  course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.level}
                </span>
                {course.enrolled && (
                  <span className="text-indigo-600 text-sm font-medium">Enrolled</span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">{course.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <Book className="w-4 h-4 mr-2" />
                  <span className="text-sm">Instructor: {course.instructor}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">Duration: {course.duration}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Award className="w-4 h-4 mr-2" />
                  <span className="text-sm">Topics: {course.topics.join(', ')}</span>
                </div>
              </div>

              {userRole === 'faculty' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {userRole === 'faculty' && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Course Materials</h4>
                  <label className="cursor-pointer bg-indigo-50 text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload PDF
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const newMaterial = {
                              id: Date.now().toString(),
                              title: file.name,
                              type: 'pdf' as const,
                              url: event.target?.result as string,
                              uploadedAt: new Date().toISOString()
                            };
                            updateCourse({
                              ...course,
                              materials: [...(course.materials || []), newMaterial]
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                
                {course.materials && course.materials.length > 0 && (
                  <div className="space-y-2">
                    {course.materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-indigo-600 mr-2" />
                          <span className="text-sm">{material.title}</span>
                        </div>
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {userRole === 'student' && course.materials && course.materials.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <h4 className="text-lg font-medium mb-4">Course Materials</h4>
                <div className="space-y-2">
                  {course.materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-indigo-600 mr-2" />
                        <span className="text-sm">{material.title}</span>
                      </div>
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold">{selectedCourse.title}</h3>
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setSelectedCourse(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative pt-[56.25%]">
              <ReactPlayer
                url={selectedCourse.videoUrl}
                width="100%"
                height="100%"
                controls
                playing
                className="absolute top-0 left-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <motion.div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h3>
                <button onClick={() => {
                  setShowAddModal(false);
                  setEditingCourse(null);
                  setNewCourse({
                    title: '',
                    description: '',
                    instructor: '',
                    duration: '',
                    level: 'Beginner',
                    topics: [],
                    thumbnail: '',
                    videoUrl: ''
                  });
                }}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor
                  </label>
                  <input
                    type="text"
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, instructor: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., 8 weeks"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, level: e.target.value as Course['level'] }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topics (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newCourse.topics?.join(', ')}
                    onChange={(e) => setNewCourse(prev => ({ 
                      ...prev, 
                      topics: e.target.value.split(',').map(topic => topic.trim()) 
                    }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., Variables, Functions, OOP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail URL
                  </label>
                  <input
                    type="text"
                    value={newCourse.thumbnail}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, thumbnail: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter image URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL
                  </label>
                  <input
                    type="text"
                    value={newCourse.videoUrl}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter YouTube or Vimeo URL"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCourse(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddOrUpdateCourse}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {editingCourse ? 'Update Course' : 'Add Course'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}