import { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Brain, AlertCircle, CheckCircle, Play, Clock, Save, RefreshCw } from 'lucide-react';
import type { CodeError, CodeOutput } from '../types';

interface CodeEditorProps {
  language: 'python' | 'javascript' | 'java' | 'cpp';
}

const languageTemplates = {
  python: '',
  javascript: '',
  java: `public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`
};

const practiceExercises = {
  python: [
    {
      title: 'Hello World',
      description: 'Write a program that prints "Hello, World!"',
      template: 'print("Hello, World!")',
      solution: 'print("Hello, World!")',
      hints: ['Use the print() function']
    },
    {
      title: 'Sum of Two Numbers',
      description: 'Write a function that returns the sum of two numbers',
      template: 'def add_numbers(a, b):\n    # Write your code here\n    pass',
      solution: 'def add_numbers(a, b):\n    return a + b',
      hints: ['Use the return keyword', 'Add the parameters together']
    }
  ],
  javascript: [
    {
      title: 'String Reversal',
      description: 'Write a function that reverses a string',
      template: 'function reverseString(str) {\n    // Write your code here\n}',
      solution: 'function reverseString(str) {\n    return str.split("").reverse().join("");\n}',
      hints: ['Split the string into an array', 'Use array reverse method']
    }
  ],
  java: [
    {
      title: 'Array Sum',
      description: 'Calculate the sum of all elements in an array',
      template: 'public class Main {\n    public static int arraySum(int[] arr) {\n        // Write your code here\n    }\n}',
      solution: 'public class Main {\n    public static int arraySum(int[] arr) {\n        int sum = 0;\n        for(int num : arr) {\n            sum += num;\n        }\n        return sum;\n    }\n}',
      hints: ['Use a for-each loop', 'Initialize a sum variable']
    }
  ],
  cpp: [
    {
      title: 'Find Maximum',
      description: 'Find the maximum element in an array',
      template: '#include <iostream>\nusing namespace std;\n\nint findMax(int arr[], int size) {\n    // Write your code here\n}',
      solution: '#include <iostream>\nusing namespace std;\n\nint findMax(int arr[], int size) {\n    int max = arr[0];\n    for(int i = 1; i < size; i++) {\n        if(arr[i] > max) max = arr[i];\n    }\n    return max;\n}',
      hints: ['Initialize max with first element', 'Use a loop to compare elements']
    }
  ]
};

const languageExecutors = {
  python: (code: string): CodeOutput => {
    try {
      // Simulate Python execution
      const output = code
        .split('\n')
        .filter(line => line.trim().startsWith('print'))
        .map(line => {
          const match = line.match(/print\((.*)\)/);
          return match ? eval(match[1]) : '';
        })
        .join('\n');

      return {
        result: output,
        executionTime: Math.random() * 100
      };
    } catch (error) {
      return {
        result: '',
        error: error instanceof Error ? error.message : 'An error occurred',
        executionTime: Math.random() * 100
      };
    }
  },
  javascript: (code: string): CodeOutput => {
    try {
      const console = {
        log: (...args: any[]) => args.join(' '),
        error: (...args: any[]) => args.join(' '),
        warn: (...args: any[]) => args.join(' ')
      };
      
      const result = new Function('console', code)(console);
      return {
        result: String(result),
        executionTime: Math.random() * 100
      };
    } catch (error) {
      return {
        result: '',
        error: error instanceof Error ? error.message : 'An error occurred',
        executionTime: Math.random() * 100
      };
    }
  },
  java: (code: string): CodeOutput => {
    try {
      const output = code
        .split('\n')
        .filter(line => line.trim().startsWith('System.out.println'))
        .map(line => {
          const match = line.match(/System\.out\.println\((.*)\)/);
          return match ? eval(match[1]) : '';
        })
        .join('\n');

      return {
        result: output,
        executionTime: Math.random() * 100
      };
    } catch (error) {
      return {
        result: '',
        error: error instanceof Error ? error.message : 'An error occurred',
        executionTime: Math.random() * 100
      };
    }
  },
  cpp: (code: string): CodeOutput => {
    try {
      const output = code
        .split('\n')
        .filter(line => line.trim().startsWith('cout'))
        .map(line => {
          const match = line.match(/cout << (.*) << endl/);
          return match ? eval(match[1]) : '';
        })
        .join('\n');

      return {
        result: output,
        executionTime: Math.random() * 100
      };
    } catch (error) {
      return {
        result: '',
        error: error instanceof Error ? error.message : 'An error occurred',
        executionTime: Math.random() * 100
      };
    }
  }
};

export default function CodeEditor({ language }: CodeEditorProps) {
  const [code, setCode] = useState(languageTemplates[language]);
  const [errors, setErrors] = useState<CodeError[]>([]);
  const [output, setOutput] = useState<CodeOutput | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<number>(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setCode(languageTemplates[language]);
    setSelectedExercise(0);
    setShowSolution(false);
    setShowHint(false);
  }, [language]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!value) return;
    setCode(value);
    analyzeCode(value, language);
  }, [language]);

  const loadExercise = (index: number) => {
    setSelectedExercise(index);
    setCode(practiceExercises[language][index].template);
    setShowSolution(false);
    setShowHint(false);
  };

  const toggleSolution = () => {
    setShowSolution(!showSolution);
    if (!showSolution) {
      setCode(practiceExercises[language][selectedExercise].solution);
    } else {
      setCode(practiceExercises[language][selectedExercise].template);
    }
  };

  const analyzeCode = (content: string, lang: string) => {
    const newErrors: CodeError[] = [];
    
    // Language-specific analysis
    switch (lang) {
      case 'python':
        if (content.includes('console.log')) {
          newErrors.push({
            line: content.split('\n').findIndex(line => line.includes('console.log')),
            message: 'console.log is not valid in Python',
            severity: 'error',
            suggestion: 'Use print() instead'
          });
        }
        break;
      case 'javascript':
        if (content.includes('print(')) {
          newErrors.push({
            line: content.split('\n').findIndex(line => line.includes('print(')),
            message: 'print() is not valid in JavaScript',
            severity: 'error',
            suggestion: 'Use console.log() instead'
          });
        }
        break;
      case 'java':
        if (content.includes('console.log')) {
          newErrors.push({
            line: content.split('\n').findIndex(line => line.includes('console.log')),
            message: 'console.log is not valid in Java',
            severity: 'error',
            suggestion: 'Use System.out.println() instead'
          });
        }
        break;
      case 'cpp':
        if (content.includes('console.log')) {
          newErrors.push({
            line: content.split('\n').findIndex(line => line.includes('console.log')),
            message: 'console.log is not valid in C++',
            severity: 'error',
            suggestion: 'Use std::cout << value << std::endl instead'
          });
        }
        break;
    }

    setErrors(newErrors);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput(null);

    try {
      const result = languageExecutors[language](code);
      setOutput(result);
    } catch (error) {
      setOutput({
        result: '',
        error: error instanceof Error ? error.message : 'An error occurred',
        executionTime: 0
      });
    }

    setIsRunning(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <Brain className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold text-white">AI-Powered Code Assistant</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-400">Language: {language}</span>
          <button
            onClick={runCode}
            disabled={isRunning || !code.trim()}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isRunning || !code.trim()
                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            } transition-colors`}
          >
            <Play className="w-4 h-4" />
            <span>Run</span>
          </button>
        </div>
      </div>
      
      <div className="flex flex-1">
        <div className="w-1/4 bg-slate-800/30 border-r border-slate-700 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Practice Exercises</h3>
            <div className="space-y-2">
              {practiceExercises[language].map((exercise, index) => (
                <button
                  key={index}
                  onClick={() => loadExercise(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedExercise === index
                      ? 'bg-indigo-600/20 text-indigo-400'
                      : 'hover:bg-slate-700/50 text-slate-300'
                  }`}
                >
                  <div className="font-medium">{exercise.title}</div>
                  <div className="text-sm text-slate-400">{exercise.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-1/2 h-full border-r border-slate-700">
          <Editor
            height="100%"
            defaultLanguage={language}
            value={code}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              automaticLayout: true,
              wordWrap: 'on',
              suggestOnTriggerCharacters: true,
              formatOnPaste: true,
              formatOnType: true,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
            }}
          />
        </div>
        
        <div className="w-1/4 bg-slate-800/30 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Exercise Help</h3>
              <div className="space-x-2">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-3 py-1 text-sm bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20"
                >
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                <button
                  onClick={toggleSolution}
                  className="px-3 py-1 text-sm bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20"
                >
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </button>
              </div>
            </div>
            
            {showHint && (
              <div className="bg-yellow-500/10 p-3 rounded-lg mb-4">
                <p className="text-yellow-400">
                  {practiceExercises[language][selectedExercise].hints[0]}
                </p>
              </div>
            )}

            {errors.length > 0 && (
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="bg-red-500/10 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                      <span className="font-medium text-red-400">Line {error.line + 1}</span>
                    </div>
                    <p className="text-red-400 text-sm">{error.message}</p>
                    {error.suggestion && (
                      <p className="text-green-400 text-sm mt-1">
                        Suggestion: {error.suggestion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 flex-1">
            <h3 className="text-lg font-semibold text-white mb-4">Output</h3>
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              {isRunning ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
                  <span>Running code...</span>
                </div>
              ) : output ? (
                <div>
                  {output.error ? (
                    <div className="text-red-400">{output.error}</div>
                  ) : (
                    <div>
                      <div className="mb-2">{output.result}</div>
                      <div className="text-slate-500 text-xs flex items-center mt-2">
                        <Clock className="w-4 h-4 mr-1" />
                        Execution time: {output.executionTime?.toFixed(2)}ms
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                'Run your code to see the output here...'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}