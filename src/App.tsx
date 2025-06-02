import React, { useState } from 'react';
import { Layers, Code, Users, BarChart, LogOut, UserCircle, BookOpen, ClipboardList, Menu } from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import Dashboard from './components/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import { AssessmentProvider } from './contexts/AssessmentContext';
import { CourseProvider } from './contexts/CourseContext';
import { AttendanceProvider } from './contexts/AttendanceContext';
import { PerformanceProvider } from './contexts/PerformanceContext';
import Auth from './components/Auth';
import { useAuth } from './contexts/AuthContext';
import AttendanceManager from './components/AttendanceManager';
import CourseList from './components/CourseList';
import AssessmentList from './components/AssessmentList';
import AdminDashboard from './components/AdminDashboard';
import NotificationCenter from './components/NotificationCenter';
import ChatBot from './components/ChatBot';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'java' | 'cpp'>('python');
  const { user, userRole, loading, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-indigo-900">
        <div className="glass-card p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent"></div>
          <p className="mt-4 text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleLogout = async () => {
    await signOut();
  };

  const getNavigationItems = () => {
    if (userRole === 'student') {
      return [
        {
          id: 'dashboard',
          icon: <BarChart className="w-5 h-5" />,
          text: 'Dashboard'
        },
        {
          id: 'editor',
          icon: <Code className="w-5 h-5" />,
          text: 'Code Editor'
        },
        {
          id: 'courses',
          icon: <BookOpen className="w-5 h-5" />,
          text: 'Courses'
        },
        {
          id: 'assessments',
          icon: <ClipboardList className="w-5 h-5" />,
          text: 'Assessments'
        }
      ];
    } else if (userRole === 'faculty') {
      return [
        {
          id: 'courses',
          icon: <BookOpen className="w-5 h-5" />,
          text: 'Manage Courses'
        },
        {
          id: 'assessments',
          icon: <ClipboardList className="w-5 h-5" />,
          text: 'Assessments'
        },
        {
          id: 'attendance',
          icon: <Users className="w-5 h-5" />,
          text: 'Attendance'
        }
      ];
    } else if (userRole === 'admin') {
      return [
        {
          id: 'dashboard',
          icon: <BarChart className="w-5 h-5" />,
          text: 'Dashboard'
        }
      ];
    }
    return [];
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0`}>
        <div className="h-full bg-gradient-to-b from-slate-900 to-indigo-900 text-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <Code className="h-8 w-8" />
              <span className="text-xl font-bold">CodeMentor AI</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-white/80 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="mt-6 px-4">
            {getNavigationItems().map((item) => (
              <NavButton
                key={item.id}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                icon={item.icon}
                text={item.text}
              />
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center space-x-3 mb-4">
                <UserCircle className="w-8 h-8" />
                <div>
                  <div className="text-sm font-medium">{user.email}</div>
                  <div className="text-xs text-white/60">{userRole}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex-1"></div>

            <div className="flex items-center space-x-4">
              {activeTab === 'editor' && userRole === 'student' && (
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  className="block w-40 pl-3 pr-10 py-2 text-base border-0 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm rounded-lg"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              )}
              
              {user && <NotificationCenter userId={user.id} />}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50">
          {activeTab === 'editor' && userRole === 'student' && (
            <div className="h-[calc(100vh-4rem)]">
              <CodeEditor language={selectedLanguage} />
            </div>
          )}
          {activeTab === 'courses' && (
            <CourseList />
          )}
          {activeTab === 'assessments' && (
            <AssessmentList isTeacher={userRole === 'faculty'} />
          )}
          {activeTab === 'dashboard' && userRole === 'student' && (
            <Dashboard
              student={mockStudent}
              metrics={mockMetrics}
              jobMatches={mockJobMatches}
            />
          )}
          {activeTab === 'dashboard' && userRole === 'admin' && (
            <AdminDashboard />
          )}
          {activeTab === 'attendance' && userRole === 'faculty' && (
            <AttendanceManager />
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PerformanceProvider>
        <AttendanceProvider>
          <CourseProvider>
            <AssessmentProvider>
              <AppContent />
              <ChatBot />
            </AssessmentProvider>
          </CourseProvider>
        </AttendanceProvider>
      </PerformanceProvider>
    </AuthProvider>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
}

function NavButton({ active, onClick, icon, text }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-2 mb-2 rounded-lg transition-colors ${
        active
          ? 'bg-white/10 text-white'
          : 'text-white/60 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

const mockStudent = {
  id: '1',
  name: 'John Doe',
  skills: ['Python', 'JavaScript', 'Java', 'C++'],
  completedAssignments: 15,
  attendance: 90,
  performance: 85
};

const mockMetrics = {
  codingProficiency: 85,
  attendance: 90,
  assignmentCompletion: 88,
  overallProgress: 87
};

const mockJobMatches = [
  {
    role: 'Junior Software Developer',
    company: 'Tech Corp',
    matchScore: 92,
    recommendation: 'Strong match based on your Python and JavaScript skills. Recent projects demonstrate solid problem-solving abilities.'
  },
  {
    role: 'Frontend Developer Intern',
    company: 'Web Solutions Inc',
    matchScore: 88,
    recommendation: 'Your recent focus on React and modern JavaScript makes you a great fit for this role.'
  }
];

export default App;