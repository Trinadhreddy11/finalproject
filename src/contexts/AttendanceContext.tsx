import React, { createContext, useContext, useState } from 'react';
import { authorizedUsers } from './AuthContext';

export interface AttendanceRecord {
  studentId: string;
  date: string;
  present: boolean;
}

interface AttendanceContextType {
  attendance: Record<string, AttendanceRecord[]>;
  updateAttendance: (studentId: string, date: string, present: boolean) => void;
  getStudentAttendance: (studentId: string) => AttendanceRecord[];
  saveAttendanceForDate: (date: string, records: Record<string, boolean>) => void;
}

// Initialize attendance data for all students
const initialAttendance: Record<string, AttendanceRecord[]> = {};
authorizedUsers.students.forEach(student => {
  initialAttendance[student.id] = [
    { studentId: student.id, date: '2024-03-10', present: Math.random() > 0.2 },
    { studentId: student.id, date: '2024-03-11', present: Math.random() > 0.2 },
    { studentId: student.id, date: '2024-03-12', present: Math.random() > 0.2 },
  ];
});

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord[]>>(initialAttendance);

  const updateAttendance = (studentId: string, date: string, present: boolean) => {
    setAttendance(prev => {
      const studentAttendance = prev[studentId] || [];
      const existingIndex = studentAttendance.findIndex(record => record.date === date);
      
      if (existingIndex >= 0) {
        const updatedAttendance = [...studentAttendance];
        updatedAttendance[existingIndex] = { studentId, date, present };
        return { ...prev, [studentId]: updatedAttendance };
      } else {
        return {
          ...prev,
          [studentId]: [...studentAttendance, { studentId, date, present }]
        };
      }
    });
  };

  const getStudentAttendance = (studentId: string) => {
    return attendance[studentId] || [];
  };

  const saveAttendanceForDate = (date: string, records: Record<string, boolean>) => {
    Object.entries(records).forEach(([studentId, present]) => {
      updateAttendance(studentId, date, present);
    });
  };

  return (
    <AttendanceContext.Provider value={{
      attendance,
      updateAttendance,
      getStudentAttendance,
      saveAttendanceForDate,
    }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}