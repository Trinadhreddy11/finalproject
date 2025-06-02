import React, { createContext, useContext, useState } from 'react';
import type { Course } from '../types';

interface CourseContextType {
  courses: Course[];
  enrolledCourses: string[];
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  enrollInCourse: (courseId: string) => void;
  unenrollFromCourse: (courseId: string) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const initialCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Python Programming',
    description: 'Learn the fundamentals of Python programming language.',
    instructor: 'Dr. Sarah Wilson',
    duration: '8 weeks',
    level: 'Beginner',
    topics: [
      'Variables and Data Types',
      'Control Flow (if/else, loops)',
      'Functions and Modules',
      'Object-Oriented Programming',
      'File Handling',
      'Exception Handling',
      'Basic Data Structures',
      'Python Libraries (NumPy, Pandas)'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=500',
    videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
    enrolled: false
  },
  {
    id: '2',
    title: 'Advanced JavaScript Development',
    description: 'Master modern JavaScript features and frameworks.',
    instructor: 'Prof. Michael Chen',
    duration: '10 weeks',
    level: 'Advanced',
    topics: [
      'ES6+ Features',
      'Async Programming (Promises, async/await)',
      'React Fundamentals',
      'State Management',
      'Node.js and Express',
      'RESTful APIs',
      'Testing with Jest',
      'Performance Optimization',
      'TypeScript Integration',
      'Security Best Practices'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=500',
    videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
    enrolled: false
  },
  {
    id: '3',
    title: 'Data Structures and Algorithms',
    description: 'Comprehensive guide to essential CS concepts.',
    instructor: 'Dr. Emily Brooks',
    duration: '12 weeks',
    level: 'Intermediate',
    topics: [
      'Arrays and Strings',
      'Linked Lists',
      'Stacks and Queues',
      'Trees and Graphs',
      'Sorting Algorithms',
      'Searching Algorithms',
      'Dynamic Programming',
      'Big O Notation',
      'Hash Tables',
      'Algorithm Design Techniques'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=500',
    videoUrl: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
    enrolled: false
  },
  {
    id: '4',
    title: 'Java Programming Masterclass',
    description: 'Complete Java development from basics to advanced concepts.',
    instructor: 'Prof. Robert Martinez',
    duration: '14 weeks',
    level: 'Intermediate',
    topics: [
      'Java Basics',
      'Object-Oriented Programming',
      'Collections Framework',
      'Multithreading',
      'Exception Handling',
      'File I/O',
      'JDBC',
      'Spring Framework',
      'Design Patterns',
      'Unit Testing'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=500',
    videoUrl: 'https://www.youtube.com/watch?v=grEKMHGYyns',
    enrolled: false
  },
  {
    id: '5',
    title: 'C++ Programming and System Design',
    description: 'Learn C++ programming and low-level system design.',
    instructor: 'Dr. Lisa Wang',
    duration: '16 weeks',
    level: 'Advanced',
    topics: [
      'C++ Fundamentals',
      'Memory Management',
      'STL Library',
      'Templates',
      'Operator Overloading',
      'System Architecture',
      'Concurrent Programming',
      'Network Programming',
      'Design Patterns',
      'Performance Optimization'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=500',
    videoUrl: 'https://www.youtube.com/watch?v=ZzaPdXTrSb8',
    enrolled: false
  }
];

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

  const addCourse = (course: Course) => {
    setCourses(prev => [...prev, { ...course, id: String(Date.now()) }]);
  };

  const updateCourse = (course: Course) => {
    setCourses(prev => prev.map(c => c.id === course.id ? course : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
  };

  const enrollInCourse = (courseId: string) => {
    setEnrolledCourses(prev => [...prev, courseId]);
    setCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, enrolled: true }
          : course
      )
    );
  };

  const unenrollFromCourse = (courseId: string) => {
    setEnrolledCourses(prev => prev.filter(id => id !== courseId));
    setCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, enrolled: false }
          : course
      )
    );
  };

  return (
    <CourseContext.Provider value={{
      courses,
      enrolledCourses,
      addCourse,
      updateCourse,
      deleteCourse,
      enrollInCourse,
      unenrollFromCourse,
    }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
}