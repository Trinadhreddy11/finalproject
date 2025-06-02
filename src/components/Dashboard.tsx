import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  Briefcase, 
  Users, 
  BookOpen, 
  Trophy,
  Bell,
  ChevronRight,
  Star,
  TrendingUp,
  Calendar
} from 'lucide-react';
import type { Student, PerformanceMetrics, JobMatch, CourseAttendance } from '../types';
import { useAttendance } from '../contexts/AttendanceContext';
import { useAuth } from '../contexts/AuthContext';
import { usePerformance } from '../contexts/PerformanceContext';
import { useCourses } from '../contexts/CourseContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  student: Student;
  metrics: PerformanceMetrics;
  jobMatches: JobMatch[];
}

export default function Dashboard({ student, metrics, jobMatches }: DashboardProps) {
  const { user } = useAuth();
  const { getStudentAttendance } = useAttendance();
  const { getStudentPerformance } = usePerformance();
  const { courses } = useCourses();
  
  if (!user) {
    return null;
  }

  const studentAttendance = getStudentAttendance(user.id);
  const attendancePercentage = studentAttendance.length > 0
    ? (studentAttendance.filter(record => record.present).length / studentAttendance.length) * 100
    : 0;

  const performance = getStudentPerformance(user.id);

  const updatedMetrics = {
    codingProficiency: performance.codingProficiency,
    attendance: Math.round(attendancePercentage),
    assignmentCompletion: performance.assignmentCompletion,
    overallProgress: performance.overallProgress
  };

  const updatedStudent = {
    ...student,
    skills: performance.skills,
    completedAssignments: performance.completedAssignments,
    attendance: Math.round(attendancePercentage),
    performance: performance.overallProgress
  };

  const skillProficiencyLevels = performance.skills.map(() => 
    Math.floor(Math.random() * 30) + 70
  );

  const updatedSkillData = {
    labels: performance.skills,
    datasets: [
      {
        label: 'Skill Level',
        data: skillProficiencyLevels,
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(34, 197, 94, 0.7)',
        ],
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 lg:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <MetricCard
            icon={<Trophy className="w-5 h-5 text-indigo-600" />}
            title="Coding Proficiency"
            value={updatedMetrics.codingProficiency}
            color="indigo"
          />
          <MetricCard
            icon={<Users className="w-5 h-5 text-purple-600" />}
            title="Attendance"
            value={updatedMetrics.attendance}
            color="purple"
          />
          <MetricCard
            icon={<BookOpen className="w-5 h-5 text-blue-600" />}
            title="Assignments"
            value={updatedMetrics.assignmentCompletion}
            color="blue"
          />
          <MetricCard
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
            title="Overall Progress"
            value={updatedMetrics.overallProgress}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-3 w-[204%]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="dashboard-title flex items-center mb-3">
              <Star className="w-4 h-4 mr-2 text-purple-600" />
              Skill Distribution
            </h2>
            <div className="h-56">
              <Bar data={updatedSkillData} options={chartOptions} />
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="bg-white rounded-lg shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="dashboard-title p-3 border-b border-gray-100 flex items-center">
            <Briefcase className="w-4 h-4 mr-2 text-indigo-600" />
            Recommended Job Matches
          </h2>
          <div className="divide-y divide-gray-100">
            {jobMatches.map((match, index) => (
              <motion.div 
                key={index}
                className="p-3 hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="dashboard-subtitle font-medium text-gray-900">{match.role}</h3>
                    <p className="text-xs text-gray-600">{match.company}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="w-10 h-10">
                        <CircularProgressbar
                          value={match.matchScore}
                          text={`${match.matchScore}%`}
                          styles={buildStyles({
                            textSize: '24px',
                            pathColor: `rgba(99, 102, 241, ${match.matchScore / 100})`,
                            textColor: '#4F46E5',
                            trailColor: '#E5E7EB'
                          })}
                        />
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-600">{match.recommendation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, color }: { 
  icon: React.ReactNode; 
  title: string; 
  value: number;
  color: 'indigo' | 'purple' | 'blue' | 'green';
}) {
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm p-3 hover:shadow transition-shadow"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="p-1.5 rounded-lg bg-gray-50">{icon}</div>
        <div className="w-10 h-10">
          <CircularProgressbar
            value={value}
            text={`${value}%`}
            styles={buildStyles({
              textSize: '22px',
              pathColor: `url(#${color}Gradient)`,
              textColor: '#1F2937',
              trailColor: '#E5E7EB'
            })}
          />
          <svg style={{ height: 0 }}>
            <defs>
              <linearGradient id={`${color}Gradient`} gradientTransform="rotate(90)">
                <stop offset="0%" stopColor={`var(--${color}-500)`} />
                <stop offset="100%" stopColor={`var(--${color}-600)`} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <h3 className="dashboard-subtitle">{title}</h3>
    </motion.div>
  );
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 10,
        },
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 10,
        },
      },
    },
  },
};