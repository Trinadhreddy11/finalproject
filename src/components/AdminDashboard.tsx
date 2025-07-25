import React, { useState } from 'react';
import { Users, BookOpen, ClipboardList, Settings, Plus, Trash2, X, Trophy, Bell, Send } from 'lucide-react';
import { useCourses } from '../contexts/CourseContext';
import { useAssessments } from '../contexts/AssessmentContext';
import { authorizedUsers } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import { useMessageStore } from '../store/messageStore';
import Leaderboard from './Leaderboard';

export default function AdminDashboard() {
  const { courses } = useCourses();
  const { assessments } = useAssessments();
  const { updateUsers, removeUser } = useAuth();
  const { addNotification } = useMessageStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'leaderboard'>('users');
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'student' as 'student' | 'faculty'
  });
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    recipients: [] as ('students' | 'faculty')[]
  });
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });

  const stats = {
    totalStudents: authorizedUsers.students.length,
    totalFaculty: authorizedUsers.faculty.length,
    totalCourses: courses.length,
    totalAssessments: assessments.length,
  };

  const handleAddUser = () => {
    if (!newUser.email || !newUser.password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      updateUsers(newUser.email, newUser.password, newUser.role);
      setShowAddModal(false);
      setNewUser({ email: '', password: '', role: 'student' });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add user');
    }
  };

  const handleRemoveUser = (id: string, role: 'student' | 'faculty') => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        removeUser(id, role);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to remove user');
      }
    }
  };

  const handleSendNotification = () => {
    if (!notification.title || !notification.message || notification.recipients.length === 0) {
      alert('Please fill in all fields and select at least one recipient group');
      return;
    }

    try {
      // Send to students
      if (notification.recipients.includes('students')) {
        authorizedUsers.students.forEach(student => {
          addNotification(
            student.id,
            notification.title,
            notification.message,
            notification.type
          );
        });
      }

      // Send to faculty
      if (notification.recipients.includes('faculty')) {
        authorizedUsers.faculty.forEach(faculty => {
          addNotification(
            faculty.id,
            notification.title,
            notification.message,
            notification.type
          );
        });
      }

      setShowNotificationModal(false);
      setNotification({
        title: '',
        message: '',
        type: 'info',
        recipients: []
      });

      alert('Notification sent successfully!');
    } catch (error) {
      alert('Failed to send notification');
    }
  };

  const handleAddCourse = () => {
    if (!newCourse.title || !newCourse.description) {
      alert('Please fill in all fields');
      return;
    }
    addCourse(newCourse.title, newCourse.description);
    setShowCourseModal(false);
    setNewCourse({ title: '', description: '' });
    alert('Course added successfully!');
  };

  const toggleRecipient = (recipient: 'students' | 'faculty') => {
    setNotification(prev => ({
      ...prev,
      recipients: prev.recipients.includes(recipient)
        ? prev.recipients.filter(r => r !== recipient)
        : [...prev.recipients, recipient]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={() => setShowNotificationModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Bell className="w-5 h-5 mr-2" />
          Send Notification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-8 h-8 text-blue-600" />}
          title="Total Students"
          value={stats.totalStudents}
          description="Enrolled students"
        />
        <StatCard
          icon={<Users className="w-8 h-8 text-purple-600" />}
          title="Total Faculty"
          value={stats.totalFaculty}
          description="Active faculty members"
        />
        <StatCard
          icon={<BookOpen className="w-8 h-8 text-green-600" />}
          title="Total Courses"
          value={stats.totalCourses}
          description="Available courses"
        />
        <StatCard
          icon={<ClipboardList className="w-8 h-8 text-red-600" />}
          title="Total Assessments"
          value={stats.totalAssessments}
          description="Created assessments"
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-indigo-800 mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={() => setShowCourseModal(true)}
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            Create Course
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2 inline" />
            Create Assessment
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            <Users className="w-4 h-4 mr-2 inline" />
            Bulk Import Users
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <ClipboardList className="w-4 h-4 mr-2 inline" />
            Export Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="w-5 h-5 inline-block mr-2" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Trophy className="w-5 h-5 inline-block mr-2" />
            Student Leaderboard
          </button>
        </div>

        {activeTab === 'users' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Students</h2>
                <button
                  onClick={() => {
                    setNewUser({ email: '', password: '', role: 'student' });
                    setShowAddModal(true);
                  }}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {authorizedUsers.students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleRemoveUser(student.id, 'student')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Faculty</h2>
                <button
                  onClick={() => {
                    setNewUser({ email: '', password: '', role: 'faculty' });
                    setShowAddModal(true);
                  }}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Faculty
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {authorizedUsers.faculty.map((faculty) => (
                      <tr key={faculty.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {faculty.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {faculty.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleRemoveUser(faculty.id, 'faculty')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <Leaderboard />
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Add New {newUser.role === 'student' ? 'Student' : 'Faculty'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter password"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className={`px-4 py-2 text-white rounded-md ${
                    newUser.role === 'student'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  Add {newUser.role === 'student' ? 'Student' : 'Faculty'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Send Notification</h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
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
                  value={notification.title}
                  onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={notification.message}
                  onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Enter notification message"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={notification.type}
                  onChange={(e) => setNotification({ 
                    ...notification, 
                    type: e.target.value as 'info' | 'success' | 'warning' | 'error'
                  })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="info">Information</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notification.recipients.includes('students')}
                      onChange={() => toggleRecipient('students')}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2">All Students</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notification.recipients.includes('faculty')}
                      onChange={() => toggleRecipient('faculty')}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2">All Faculty</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Course</h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
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
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Enter course description"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCourse}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-indigo-800 mb-4">Admin Tools</h2>
        <p className="text-slate-700">Here you can manage users, courses, and view platform statistics.</p>
        {/* Add more admin features/components here */}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
}

function StatCard({ icon, title, value, description }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-gray-50">{icon}</div>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}