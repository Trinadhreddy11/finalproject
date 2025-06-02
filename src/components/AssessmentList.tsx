import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, Plus, X, Eye, Minimize2, Maximize2 } from 'lucide-react';
import type { Assessment, AssessmentQuestion } from '../types';
import { useAssessments } from '../contexts/AssessmentContext';

interface NewQuestion {
  question: string;
  type: 'multiple-choice' | 'coding';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface NewAssessment {
  title: string;
  description: string;
  dueDate: string;
  questions: NewQuestion[];
}

export default function AssessmentList({ isTeacher = false }) {
  const { assessments, addAssessment, removeAssessment, updateAssessment } = useAssessments();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isResultMinimized, setIsResultMinimized] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [newAssessment, setNewAssessment] = useState<NewAssessment>({
    title: '',
    description: '',
    dueDate: '',
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState<NewQuestion>({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 10
  });
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const handleAddQuestion = () => {
    if (currentQuestion.question.trim() === '') return;
    
    setNewAssessment(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion, id: String(Date.now()) }]
    }));
    
    setCurrentQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10
    });
    
    setShowQuestionForm(false);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const handleCreateAssessment = () => {
    if (!newAssessment.title || !newAssessment.description || !newAssessment.dueDate || newAssessment.questions.length === 0) {
      alert('Please fill in all required fields and add at least one question.');
      return;
    }

    const totalPoints = newAssessment.questions.reduce((sum, q) => sum + q.points, 0);
    
    const assessment: Assessment = {
      id: String(Date.now()),
      ...newAssessment,
      courseId: '1',
      totalPoints
    };

    addAssessment(assessment);
    setNewAssessment({
      title: '',
      description: '',
      dueDate: '',
      questions: []
    });
    setShowAddModal(false);
  };

  const handleRemoveAssessment = (id: string) => {
    removeAssessment(id);
  };

  const handleStartAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setAnswers({});
    setShowAssessmentModal(true);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitAssessment = () => {
    if (!selectedAssessment) return;

    const unansweredQuestions = selectedAssessment.questions.filter(
      question => !answers[question.id]
    );

    if (unansweredQuestions.length > 0) {
      alert(`Please answer all questions before submitting. ${unansweredQuestions.length} questions remaining.`);
      return;
    }

    let correctAnswers = 0;
    let totalPoints = 0;

    selectedAssessment.questions.forEach(question => {
      totalPoints += question.points;
      if (question.correctAnswer === answers[question.id]) {
        correctAnswers += question.points;
      }
    });

    const score = Math.round((correctAnswers / totalPoints) * 100);

    const updatedAssessment = {
      ...selectedAssessment,
      status: 'completed' as const,
      score,
      answers: Object.values(answers)
    };

    updateAssessment(updatedAssessment);
    setShowAssessmentModal(false);
    setSelectedAssessment(null);
    setAnswers({});
  };

  const handleViewResult = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setShowResultModal(true);
    setIsResultMinimized(false);
  };

  const handleCloseResult = () => {
    setShowResultModal(false);
    setSelectedAssessment(null);
    setIsResultMinimized(false);
  };

  const toggleResultMinimize = () => {
    setIsResultMinimized(!isResultMinimized);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {isTeacher ? 'Manage Assessments' : 'Your Assessments'}
        </h2>
        {isTeacher && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Assessment
          </button>
        )}
      </div>

      <div className="grid gap-6">
        {assessments.map((assessment) => (
          <div key={assessment.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {assessment.title}
                </h3>
                <p className="text-gray-600 mb-4">{assessment.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Due: {new Date(assessment.dueDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Points: {assessment.totalPoints}
                  </div>
                  <div className="flex items-center">
                    {assessment.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-green-500">
                          Completed - Score: {assessment.score}%
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                        <span className="text-yellow-500">Pending</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {isTeacher ? (
                  <button
                    onClick={() => handleRemoveAssessment(assessment.id)}
                    className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-md"
                  >
                    Remove
                  </button>
                ) : assessment.status === 'completed' ? (
                  <button
                    onClick={() => handleViewResult(assessment)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Results
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartAssessment(assessment)}
                    className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md"
                  >
                    Start Assessment
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assessment Modal */}
      {showAssessmentModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold">{selectedAssessment.title}</h3>
                <p className="text-gray-600">{selectedAssessment.description}</p>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
                    setShowAssessmentModal(false);
                    setSelectedAssessment(null);
                    setAnswers({});
                  }
                }} 
                className="text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-8">
              {selectedAssessment.questions.map((question, index) => (
                <div key={question.id} className="border-b pb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-medium">
                      Question {index + 1} of {selectedAssessment.questions.length}
                    </h4>
                    <span className="text-sm text-gray-500">{question.points} points</span>
                  </div>
                  
                  <p className="text-gray-800 mb-4">{question.question}</p>
                  
                  {question.type === 'multiple-choice' ? (
                    <div className="space-y-2">
                      {question.options?.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          onClick={() => handleAnswerChange(question.id, option)}
                          className={`w-full p-3 text-left border rounded-md transition-colors ${
                            answers[question.id] === option
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full h-32 p-3 border rounded-md font-mono"
                      placeholder="Write your code here..."
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {Object.keys(answers).length} of {selectedAssessment.questions.length} questions answered
              </div>
              <button
                onClick={handleSubmitAssessment}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Submit Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`bg-white rounded-lg w-full max-w-2xl transition-all duration-300 ${
            isResultMinimized ? 'h-16' : 'max-h-[90vh]'
          }`}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-2xl font-bold">Assessment Results</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleResultMinimize}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  {isResultMinimized ? (
                    <Maximize2 className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Minimize2 className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={handleCloseResult}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {!isResultMinimized && (
              <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6">
                <div className="text-center mb-8">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">
                    {selectedAssessment.score}%
                  </div>
                  <p className="text-gray-600">Final Score</p>
                </div>
                
                <div className="space-y-4">
                  {selectedAssessment.questions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{question.question}</div>
                        <div className="text-sm text-gray-500">{question.points} points</div>
                      </div>
                      <div className="text-sm space-y-2">
                        <div className="text-gray-600">
                          Your answer: {selectedAssessment.answers?.[index]}
                        </div>
                        {question.correctAnswer && (
                          <div className={`${
                            selectedAssessment.answers?.[index] === question.correctAnswer
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            Correct answer: {question.correctAnswer}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedAssessment.feedback && (
                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-medium text-indigo-900 mb-2">Instructor Feedback</h4>
                    <p className="text-indigo-800">{selectedAssessment.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Assessment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Create New Assessment</h3>
                <button onClick={() => {
                  setShowAddModal(false);
                  setNewAssessment({
                    title: '',
                    description: '',
                    dueDate: '',
                    questions: []
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
                    value={newAssessment.title}
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter assessment title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newAssessment.description}
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    placeholder="Enter assessment description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newAssessment.dueDate}
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Questions ({newAssessment.questions.length})
                    </label>
                    <button
                      onClick={() => setShowQuestionForm(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      + Add Question
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {newAssessment.questions.map((q, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between">
                          <span className="font-medium">{q.question}</span>
                          <span className="text-gray-500">{q.points} points</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Type: {q.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {showQuestionForm && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-lg font-medium mb-4">Add Question</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Text
                        </label>
                        <input
                          type="text"
                          value={currentQuestion.question}
                          onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="Enter question"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Type
                        </label>
                        <select
                          value={currentQuestion.type}
                          onChange={(e) => setCurrentQuestion(prev => ({
                            ...prev,
                            type: e.target.value as 'multiple-choice' | 'coding'
                          }))}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="coding">Coding</option>
                        </select>
                      </div>

                      {currentQuestion.type === 'multiple-choice' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Options
                          </label>
                          <div className="space-y-2">
                            {currentQuestion.options?.map((option, index) => (
                              <input
                                key={index}
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder={`Option ${index + 1}`}
                              />
                            ))}
                          </div>
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Correct Answer
                            </label>
                            <select
                              value={currentQuestion.correctAnswer}
                              onChange={(e) => setCurrentQuestion(prev => ({
                                ...prev,
                                correctAnswer: e.target.value
                              }))}
                              className="w-full px-3 py-2 border rounded-md"
                            >
                              <option value="">Select correct answer</option>
                              {currentQuestion.options?.map((option, index) => (
                                <option key={index} value={option}>
                                  {option || `Option ${index + 1}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points
                        </label>
                        <input
                          type="number"
                          value={currentQuestion.points}
                          onChange={(e) => setCurrentQuestion(prev => ({
                            ...prev,
                            points: parseInt(e.target.value) || 0
                          }))}
                          className="w-full px-3 py-2 border rounded-md"
                          min="0"
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowQuestionForm(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddQuestion}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Add Question
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAssessment}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Create Assessment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}