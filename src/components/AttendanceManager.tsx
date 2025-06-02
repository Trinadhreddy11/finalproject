import { useState } from 'react';
import { Check, X, Search } from 'lucide-react';
import { authorizedUsers } from '../contexts/AuthContext';
import { useAttendance } from '../contexts/AttendanceContext';

interface Student {
  id: string;
  email: string;
  name: string;
}

// Create students data from authorized student emails
const students: Student[] = authorizedUsers.students.map(student => ({
  id: student.id,
  email: student.email,
  name: student.email.split('@')[0].replace(/[0-9]/g, '').charAt(0).toUpperCase() + 
       student.email.split('@')[0].replace(/[0-9]/g, '').slice(1),
}));

export default function AttendanceManager() {
  const { getStudentAttendance, saveAttendanceForDate } = useAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAttendanceChange = (studentId: string, present: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: present
    }));
  };

  const saveAttendance = () => {
    saveAttendanceForDate(selectedDate, attendance);
    alert('Attendance saved successfully!');
    setAttendance({});
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Attendance Management</h2>
          <div className="flex space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={saveAttendance}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Save Attendance
            </button>
          </div>
        </div>

        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance History
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Today's Attendance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const studentAttendance = getStudentAttendance(student.id);
                return (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        Present: {studentAttendance.filter(a => a.present).length}/{studentAttendance.length} days
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAttendanceChange(student.id, true)}
                          className={`p-2 rounded-full ${
                            attendance[student.id] === true
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500'
                          }`}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student.id, false)}
                          className={`p-2 rounded-full ${
                            attendance[student.id] === false
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
                          }`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}