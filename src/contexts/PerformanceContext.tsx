import React, { createContext, useContext, useState } from 'react';
import { authorizedUsers } from './AuthContext';

export interface StudentPerformance {
  codingProficiency: number;
  assignmentCompletion: number;
  overallProgress: number;
  completedAssignments: number;
  skills: string[];
}

interface PerformanceContextType {
  performance: Record<string, StudentPerformance>;
  updatePerformance: (studentId: string, data: Partial<StudentPerformance>) => void;
  getStudentPerformance: (studentId: string) => StudentPerformance;
}

// Initialize performance data for all students
const initialPerformance: Record<string, StudentPerformance> = {};
authorizedUsers.students.forEach(student => {
  initialPerformance[student.id] = {
    codingProficiency: Math.floor(Math.random() * 30) + 70, // 70-100
    assignmentCompletion: Math.floor(Math.random() * 20) + 80, // 80-100
    overallProgress: Math.floor(Math.random() * 25) + 75, // 75-100
    completedAssignments: Math.floor(Math.random() * 10) + 10, // 10-20
    skills: ['Python', 'JavaScript', 'Java', 'C++'].sort(() => Math.random() - 0.5).slice(0, 3)
  };
});

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [performance, setPerformance] = useState<Record<string, StudentPerformance>>(initialPerformance);

  const updatePerformance = (studentId: string, data: Partial<StudentPerformance>) => {
    setPerformance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...data
      }
    }));
  };

  const getStudentPerformance = (studentId: string): StudentPerformance => {
    return performance[studentId] || {
      codingProficiency: 0,
      assignmentCompletion: 0,
      overallProgress: 0,
      completedAssignments: 0,
      skills: []
    };
  };

  return (
    <PerformanceContext.Provider value={{
      performance,
      updatePerformance,
      getStudentPerformance,
    }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}