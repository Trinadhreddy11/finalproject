import React, { createContext, useContext, useState } from 'react';
import type { Assessment } from '../types';

const mockAssessments: Assessment[] = [
  {
    id: '1',
    title: 'JavaScript Fundamentals Quiz',
    description: 'Test your knowledge of JavaScript core concepts and features',
    courseId: '1',
    dueDate: '2024-04-15',
    totalPoints: 100,
    questions: [
      {
        id: '1',
        question: 'What is the output of: typeof null?',
        type: 'multiple-choice',
        options: [
          'object',
          'null',
          'undefined',
          'number'
        ],
        correctAnswer: 'object',
        points: 20
      },
      {
        id: '2',
        question: 'Which method is used to add elements to the end of an array?',
        type: 'multiple-choice',
        options: [
          'push()',
          'unshift()',
          'append()',
          'add()'
        ],
        correctAnswer: 'push()',
        points: 20
      },
      {
        id: '3',
        question: 'What is the correct way to check if a variable is an array?',
        type: 'multiple-choice',
        options: [
          'Array.isArray(variable)',
          'typeof variable === "array"',
          'variable instanceof Array',
          'variable.isArray()'
        ],
        correctAnswer: 'Array.isArray(variable)',
        points: 20
      },
      {
        id: '4',
        question: 'Which statement creates a closure in JavaScript?',
        type: 'multiple-choice',
        options: [
          'A function defined inside another function',
          'A function with a return statement',
          'A function with parameters',
          'A function using this keyword'
        ],
        correctAnswer: 'A function defined inside another function',
        points: 20
      },
      {
        id: '5',
        question: 'What is the output of: 3 + "3"?',
        type: 'multiple-choice',
        options: [
          '"33"',
          '6',
          'undefined',
          'NaN'
        ],
        correctAnswer: '"33"',
        points: 20
      }
    ],
    status: 'pending'
  },
  {
    id: '2',
    title: 'Python Programming Concepts',
    description: 'Comprehensive assessment of Python programming fundamentals',
    courseId: '2',
    dueDate: '2024-04-20',
    totalPoints: 100,
    questions: [
      {
        id: '1',
        question: 'What is the correct way to create a list comprehension in Python?',
        type: 'multiple-choice',
        options: [
          '[x for x in range(10)]',
          'for x in range(10): [x]',
          'list(x for x in range(10))',
          '[x in range(10)]'
        ],
        correctAnswer: '[x for x in range(10)]',
        points: 20
      },
      {
        id: '2',
        question: 'Which of the following is immutable in Python?',
        type: 'multiple-choice',
        options: [
          'Tuple',
          'List',
          'Dictionary',
          'Set'
        ],
        correctAnswer: 'Tuple',
        points: 20
      },
      {
        id: '3',
        question: 'What is the output of: len(set([1, 2, 2, 3, 3, 3]))?',
        type: 'multiple-choice',
        options: [
          '3',
          '6',
          '1',
          '4'
        ],
        correctAnswer: '3',
        points: 20
      },
      {
        id: '4',
        question: 'Which method is used to remove and return the last element from a list?',
        type: 'multiple-choice',
        options: [
          'pop()',
          'remove()',
          'delete()',
          'discard()'
        ],
        correctAnswer: 'pop()',
        points: 20
      },
      {
        id: '5',
        question: 'What is the correct way to catch multiple exceptions in Python?',
        type: 'multiple-choice',
        options: [
          'except (TypeError, ValueError):',
          'catch TypeError, ValueError:',
          'except TypeError or ValueError:',
          'catch (TypeError | ValueError):'
        ],
        correctAnswer: 'except (TypeError, ValueError):',
        points: 20
      }
    ],
    status: 'pending'
  }
];

interface AssessmentContextType {
  assessments: Assessment[];
  addAssessment: (assessment: Assessment) => void;
  removeAssessment: (id: string) => void;
  updateAssessment: (assessment: Assessment) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments);

  const addAssessment = (assessment: Assessment) => {
    setAssessments(prev => [...prev, assessment]);
  };

  const removeAssessment = (id: string) => {
    setAssessments(prev => prev.filter(assessment => assessment.id !== id));
  };

  const updateAssessment = (updatedAssessment: Assessment) => {
    setAssessments(prev => 
      prev.map(assessment => 
        assessment.id === updatedAssessment.id ? updatedAssessment : assessment
      )
    );
  };

  return (
    <AssessmentContext.Provider value={{
      assessments,
      addAssessment,
      removeAssessment,
      updateAssessment,
    }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessments() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessments must be used within an AssessmentProvider');
  }
  return context;
}