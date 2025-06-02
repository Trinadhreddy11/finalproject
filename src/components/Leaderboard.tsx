import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star } from 'lucide-react';
import { authorizedUsers } from '../contexts/AuthContext';
import { usePerformance } from '../contexts/PerformanceContext';

export default function Leaderboard() {
  const { getStudentPerformance } = usePerformance();

  const studentPerformances = authorizedUsers.students.map(student => ({
    id: student.id,
    name: student.email.split('@')[0],
    email: student.email,
    performance: getStudentPerformance(student.id),
  }));

  // Sort students by overall progress
  const rankedStudents = studentPerformances
    .sort((a, b) => b.performance.overallProgress - a.performance.overallProgress)
    .map((student, index) => ({
      ...student,
      rank: index + 1,
    }));

  const getTopPerformer = (metric: keyof typeof studentPerformances[0]['performance']) => {
    return studentPerformances.reduce((prev, current) => 
      current.performance[metric] > prev.performance[metric] ? current : prev
    );
  };

  const topPerformers = {
    coding: getTopPerformer('codingProficiency'),
    attendance: getTopPerformer('assignmentCompletion'),
    assignments: getTopPerformer('assignmentCompletion'),
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
        Student Leaderboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-700 font-medium">Top Coder</span>
            <Medal className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {topPerformers.coding.name}
          </div>
          <div className="text-sm text-gray-600">
            Proficiency: {topPerformers.coding.performance.codingProficiency}%
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-700 font-medium">Best Attendance</span>
            <Star className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {topPerformers.attendance.name}
          </div>
          <div className="text-sm text-gray-600">
            Attendance: {topPerformers.attendance.performance.assignmentCompletion}%
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700 font-medium">Assignment Master</span>
            <Trophy className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {topPerformers.assignments.name}
          </div>
          <div className="text-sm text-gray-600">
            Completion: {topPerformers.assignments.performance.assignmentCompletion}%
          </div>
        </motion.div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Overall Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coding
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignments
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rankedStudents.map((student, index) => (
              <motion.tr
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {index < 3 ? (
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {index + 1}
                      </span>
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                        {index + 1}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  <div className="text-sm text-gray-500">{student.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${student.performance.overallProgress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-900">
                      {student.performance.overallProgress}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {student.performance.codingProficiency}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {student.performance.assignmentCompletion}%
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}