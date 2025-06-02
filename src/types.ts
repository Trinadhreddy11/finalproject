import { ReactNode } from 'react';

export interface CodeError {
  line: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface Student {
  id: string;
  name: string;
  skills: string[];
  completedAssignments: number;
  attendance: number;
  performance: number;
  courseAttendance: CourseAttendance[];
}

export interface CourseAttendance {
  courseId: string;
  courseName: string;
  totalClasses: number;
  attendedClasses: number;
  lastAttendance: string;
}

export interface JobMatch {
  role: string;
  company: string;
  matchScore: number;
  recommendation: string;
}

export interface PerformanceMetrics {
  codingProficiency: number;
  attendance: number;
  assignmentCompletion: number;
  overallProgress: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
  thumbnail: string;
  videoUrl?: string;
  enrolled?: boolean;
  materials?: CourseMaterial[];
}

export interface CourseMaterial {
  id: string;
  title: string;
  type: 'pdf';
  url: string;
  uploadedAt: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  dueDate: string;
  totalPoints: number;
  questions: AssessmentQuestion[];
  status?: 'pending' | 'completed';
  score?: number;
  answers?: string[];
  feedback?: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'coding';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export interface CodeOutput {
  result: string;
  error?: string;
  executionTime?: number;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}