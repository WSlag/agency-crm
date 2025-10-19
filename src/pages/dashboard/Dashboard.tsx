import { useAuth } from '../../contexts/AuthContext';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { DashboardSkeleton } from '../../components/dashboard/DashboardSkeleton';
import { DashboardError } from '../../components/dashboard/DashboardError';
import { PendingApprovals } from '../../components/applicants/PendingApprovals';
import { BarChart } from '../../components/dashboard/BarChart';
import { PieChart } from '../../components/dashboard/PieChart';
import { QuickStats } from '../../components/dashboard/EnhancedDashboard';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import {
  SparklesIcon,
  ClockIcon,
  ArrowPathIcon,
  PlusIcon,
  DocumentPlusIcon,
  UserPlusIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  DocumentDuplicateIcon,
  UsersIcon,
  UserGroupIcon,
  BriefcaseIcon,
  TrophyIcon,
  FireIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

// Time-based greeting helper
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', icon: '🌅', color: 'from-yellow-400 to-orange-500' };
  if (hour < 17) return { text: 'Good Afternoon', icon: '☀️', color: 'from-blue-400 to-indigo-500' };
  return { text: 'Good Evening', icon: '🌙', color: 'from-indigo-500 to-purple-600' };
};

// Performance Insights Widget
const PerformanceInsights: React.FC<{ role: string }> = ({ role }) => {
  const insights = [
    {
      icon: TrophyIcon,
      title: 'Top Performer',
      description: 'Great work this week!',
      color: 'from-yellow-400 to-orange-500',
      stat: '+25%',
    },
    {
      icon: FireIcon,
      title: 'Hot Streak',
      description: '7 days of activity',
      color: 'from-red-500 to-pink-500',
      stat: '🔥',
    },
    {
      icon: ArrowTrendingUpIcon,
      title: 'Trending Up',
      description: 'Productivity boost',
      color: 'from-green-500 to-emerald-500',
      stat: '+18%',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <RocketLaunchIcon className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-900">Performance Insights</h3>
      </div>
      <div className="space-y-2">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`group relative bg-gradient-to-r ${insight.color} p-3 rounded-lg text-white hover:shadow-md transform hover:scale-[1.02] transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <insight.icon className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold">{insight.title}</p>
                  <p className="text-xs opacity-90">{insight.description}</p>
                </div>
              </div>
              <span className="text-lg font-bold">{insight.stat}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Quick Tips Widget
const QuickTipsWidget: React.FC = () => {
  const tips = [
    'Use Quick Actions for faster navigation',
    'Check pending approvals regularly',
    'Keep applicant data up to date',
    'Review financial reports weekly',
    'Collaborate with your team',
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tips.length]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg border-2 border-indigo-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <LightBulbIcon className="h-5 w-5 text-yellow-500 animate-pulse" />
        <h3 className="text-sm font-semibold text-gray-900">💡 Quick Tip</h3>
      </div>
      <div className="relative overflow-hidden">
        <p className="text-sm text-gray-700 font-medium leading-relaxed animate-fade-in">
          {tips[currentTip]}
        </p>
      </div>
      <div className="flex justify-center space-x-1 mt-3">
        {tips.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentTip ? 'w-6 bg-indigo-600' : 'w-1.5 bg-indigo-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Today's Agenda Widget
const TodaysAgenda: React.FC = () => {
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
  const date = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const events = [
    { time: '09:00 AM', title: 'Team Meeting', color: 'bg-blue-500' },
    { time: '02:00 PM', title: 'Review Applications', color: 'bg-green-500' },
    { time: '04:30 PM', title: 'Financial Check', color: 'bg-purple-500' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <CalendarDaysIcon className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-900">Today's Agenda</h3>
      </div>
      
      <div className="mb-3 pb-3 border-b border-gray-200">
        <p className="text-lg font-bold text-gray-900">{dayOfWeek}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>

      <div className="space-y-2">
        {events.map((event, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-all cursor-pointer group"
          >
            <div className={`w-1 h-10 ${event.color} rounded-full group-hover:w-2 transition-all`} />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-900">{event.title}</p>
              <p className="text-xs text-gray-500">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="mt-3 w-full text-xs text-indigo-600 hover:text-indigo-700 font-medium text-center py-2 hover:bg-indigo-50 rounded-lg transition-all">
        View Full Calendar →
      </button>
    </div>
  );
};

// Goal Progress Widget
const GoalProgressWidget: React.FC<{ role: string }> = ({ role }) => {
  const goals = [
    { label: 'Monthly Target', progress: 75, color: 'bg-blue-500', target: 100 },
    { label: 'Applications', progress: 60, color: 'bg-green-500', target: 80 },
    { label: 'Approvals', progress: 85, color: 'bg-purple-500', target: 90 },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg border-2 border-purple-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <BoltIcon className="h-4 w-4 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900">Goal Progress</h3>
      </div>
      
      <div className="space-y-3">
        {goals.map((goal, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">{goal.label}</span>
              <span className="text-xs font-bold text-gray-900">{goal.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`${goal.color} h-full rounded-full transition-all duration-500 ease-out relative`}
                style={{ width: `${goal.progress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-30 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-purple-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Overall Progress</span>
          <span className="text-sm font-bold text-purple-600">73%</span>
        </div>
      </div>
    </div>
  );
};

// Stage Distribution Widget - Shows pipeline distribution
const StageDistributionWidget: React.FC<{ branchId?: string | null }> = ({ branchId }) => {
  const [stageData, setStageData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStageData = async () => {
      try {
        const applicantsRef = collection(firestore, 'applicants');
        // Filter by branch if branchId is provided (for Branch Managers)
        const applicantsQuery = branchId
          ? query(applicantsRef, where('branchId', '==', branchId))
          : applicantsRef;
        const snapshot = await getDocs(applicantsQuery);
        
        const stageCounts = snapshot.docs.reduce((acc, doc) => {
          const stage = doc.data().currentStage || 'registration';
          acc[stage] = (acc[stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const data = [
          { stage: 'Registration', count: stageCounts['registration'] || 0, color: 'bg-gray-500' },
          { stage: 'Interview', count: stageCounts['interview'] || 0, color: 'bg-blue-500' },
          { stage: 'Medical', count: stageCounts['medical'] || 0, color: 'bg-green-500' },
          { stage: 'Processing', count: stageCounts['processing'] || 0, color: 'bg-purple-500' },
          { stage: 'Deployment', count: stageCounts['deployment'] || 0, color: 'bg-orange-500' },
          { stage: 'Deployed', count: stageCounts['deployed'] || 0, color: 'bg-teal-500' },
        ];

        setStageData(data.filter(d => d.count > 0));
      } catch (error) {
        console.error('Error fetching stage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStageData();
  }, [branchId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const total = stageData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <ChartBarIcon className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-900">Pipeline Distribution</h3>
      </div>
      
      <div className="mb-3 text-center">
        <p className="text-2xl font-bold text-indigo-600">{total}</p>
        <p className="text-xs text-gray-500">Total in Pipeline</p>
      </div>

      <div className="space-y-2">
        {stageData.map((item, index) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={index} className="group cursor-pointer">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">{item.stage}</span>
                <span className="font-bold text-gray-900">{item.count}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-500 ease-out group-hover:shadow-lg`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Quick Actions Panel Component
const QuickActionsPanel: React.FC<{ role: string }> = ({ role }) => {
  const getQuickActions = () => {
    const actions: Record<string, any[]> = {
      admin: [
        { label: 'Add User', icon: UserPlusIcon, href: '/users/new', color: 'from-blue-500 to-blue-600' },
        { label: 'Add Branch', icon: PlusIcon, href: '/branches/new', color: 'from-green-500 to-green-600' },
        { label: 'Manage Agents', icon: UsersIcon, href: '/agents', color: 'from-teal-500 to-teal-600' },
        { label: 'Documents', icon: DocumentDuplicateIcon, href: '/applicants/documents', color: 'from-emerald-500 to-emerald-600' },
        { label: 'Job Postings', icon: BriefcaseIcon, href: '/jobs', color: 'from-cyan-500 to-cyan-600' },
        { label: 'View Transfers', icon: ArrowsRightLeftIcon, href: '/applicants/transfers', color: 'from-purple-500 to-purple-600' },
        { label: 'View Reports', icon: DocumentPlusIcon, href: '/reports', color: 'from-indigo-500 to-indigo-600' },
        { label: 'Financial', icon: BanknotesIcon, href: '/financial-dashboard', color: 'from-orange-500 to-orange-600' },
      ],
      president: [
        { label: 'View Agents', icon: UsersIcon, href: '/agents', color: 'from-teal-500 to-teal-600' },
        { label: 'Documents', icon: DocumentDuplicateIcon, href: '/applicants/documents', color: 'from-emerald-500 to-emerald-600' },
        { label: 'Job Postings', icon: BriefcaseIcon, href: '/jobs', color: 'from-cyan-500 to-cyan-600' },
        { label: 'View Transfers', icon: ArrowsRightLeftIcon, href: '/applicants/transfers', color: 'from-purple-500 to-purple-600' },
        { label: 'View Reports', icon: DocumentPlusIcon, href: '/reports', color: 'from-indigo-500 to-indigo-600' },
        { label: 'Financial', icon: BanknotesIcon, href: '/financial-dashboard', color: 'from-orange-500 to-orange-600' },
        { label: 'Officers', icon: UserPlusIcon, href: '/officers', color: 'from-blue-500 to-blue-600' },
        { label: 'Branches', icon: ChartBarIcon, href: '/branches', color: 'from-green-500 to-green-600' },
      ],
      branch_manager: [
        { label: 'New Applicant', icon: UserPlusIcon, href: '/applicants/register', color: 'from-indigo-500 to-indigo-600' },
        { label: 'My Agents', icon: UsersIcon, href: '/agents', color: 'from-teal-500 to-teal-600' },
        { label: 'Documents', icon: DocumentDuplicateIcon, href: '/applicants/documents', color: 'from-emerald-500 to-emerald-600' },
        { label: 'Available Jobs', icon: BriefcaseIcon, href: '/jobs', color: 'from-cyan-500 to-cyan-600' },
        { label: 'Submit Expense', icon: BanknotesIcon, href: '/expenses/new', color: 'from-green-500 to-green-600' },
        { label: 'View Pipeline', icon: ArrowPathIcon, href: '/applicants', color: 'from-purple-500 to-purple-600' },
        { label: 'Commissions', icon: BanknotesIcon, href: '/commissions', color: 'from-blue-500 to-blue-600' },
      ],
      ho_accountant: [
        { label: 'Pending Expenses', icon: ClockIcon, href: '/expenses?status=pending', color: 'from-red-500 to-red-600' },
        { label: 'Pending Commissions', icon: ClockIcon, href: '/commissions?status=pending', color: 'from-yellow-500 to-yellow-600' },
        { label: 'Financial Reports', icon: DocumentPlusIcon, href: '/reports/financial', color: 'from-blue-500 to-blue-600' },
        { label: 'Financial Dashboard', icon: ChartBarIcon, href: '/financial-dashboard', color: 'from-green-500 to-green-600' },
      ],
      ho_recruitment_officer: [
        { label: 'All Applicants', icon: UserGroupIcon, href: '/ho-applicants/all', color: 'from-indigo-500 to-indigo-600' },
        { label: 'Job Postings', icon: BriefcaseIcon, href: '/jobs', color: 'from-cyan-500 to-cyan-600' },
        { label: 'Documents', icon: DocumentDuplicateIcon, href: '/applicants/documents', color: 'from-green-500 to-green-600' },
        { label: 'Reports', icon: ChartBarIcon, href: '/reports', color: 'from-blue-500 to-blue-600' },
      ],
    };
    return actions[role] || [];
  };

  const actions = getQuickActions();

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <SparklesIcon className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className={`group relative bg-gradient-to-r ${action.color} p-3 rounded-lg text-white hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 flex items-center space-x-2`}
          >
            <action.icon className="h-4 w-4 flex-shrink-0" />
            <p className="text-xs font-medium">{action.label}</p>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Pending Tasks Widget Component
const PendingTasksWidget: React.FC<{ role: string; userId: string; branchId?: string | null }> = ({ role, userId, branchId }) => {
  const [tasks, setTasks] = useState({
    pendingExpenses: 0,
    pendingCommissions: 0,
    pendingTransfers: 0,
    pendingDocuments: 0,
    pendingStageAdvancements: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];
    let loadedCount = 0;
    
    // Calculate expected loads
    let expectedLoads = 0;
    if (role === 'ho_accountant' || role === 'admin' || role === 'president' || role === 'branch_manager') {
      expectedLoads += 2; // expenses and commissions
    }
    if (role === 'admin' || role === 'president') {
      expectedLoads += 1; // transfers
    }
    if (role === 'admin' || role === 'president' || role === 'ho_recruitment_officer' || role === 'branch_manager') {
      expectedLoads += 2; // documents and stage advancements
    }
    
    setLoading(true);

    const checkLoadingComplete = () => {
      loadedCount++;
      if (loadedCount >= expectedLoads) {
        setLoading(false);
      }
    };

    try {
      // Listen to pending expenses
      if (role === 'ho_accountant' || role === 'admin' || role === 'president' || role === 'branch_manager') {
        // Branch Managers only see expenses from their branch
        const expensesQuery = role === 'branch_manager' && branchId
          ? query(
              collection(firestore, 'expenses'),
              where('status', '==', 'pending'),
              where('branchId', '==', branchId),
              limit(100)
            )
          : query(
              collection(firestore, 'expenses'),
              where('status', '==', 'pending'),
              limit(100)
            );
        const unsubExpenses = onSnapshot(
          expensesQuery,
          (snapshot) => {
            setTasks(prev => ({ ...prev, pendingExpenses: snapshot.size }));
            checkLoadingComplete();
          },
          (error) => {
            console.error('Error listening to pending expenses:', error);
            checkLoadingComplete();
          }
        );
        unsubscribers.push(unsubExpenses);
      }

      // Listen to pending commissions
      if (role === 'ho_accountant' || role === 'admin' || role === 'president' || role === 'branch_manager') {
        // Branch Managers only see commissions from their branch
        const commissionsQuery = role === 'branch_manager' && branchId
          ? query(
              collection(firestore, 'commissions'),
              where('status', '==', 'pending'),
              where('branchId', '==', branchId),
              limit(100)
            )
          : query(
              collection(firestore, 'commissions'),
              where('status', '==', 'pending'),
              limit(100)
            );
        const unsubCommissions = onSnapshot(
          commissionsQuery,
          (snapshot) => {
            setTasks(prev => ({ ...prev, pendingCommissions: snapshot.size }));
            checkLoadingComplete();
          },
          (error) => {
            console.error('Error listening to pending commissions:', error);
            checkLoadingComplete();
          }
        );
        unsubscribers.push(unsubCommissions);
      }

      // Listen to pending transfers
      if (role === 'admin' || role === 'president') {
        const transfersQuery = query(
          collection(firestore, 'transfers'),
          where('status', '==', 'pending'),
          limit(100)
        );
        const unsubTransfers = onSnapshot(
          transfersQuery,
          (snapshot) => {
            setTasks(prev => ({ ...prev, pendingTransfers: snapshot.size }));
            checkLoadingComplete();
          },
          (error) => {
            console.error('Error listening to pending transfers:', error);
            checkLoadingComplete();
          }
        );
        unsubscribers.push(unsubTransfers);
      }

      // Listen to pending documents (need verification)
      if (role === 'admin' || role === 'president' || role === 'ho_recruitment_officer') {
        const documentsQuery = query(
          collection(firestore, 'documents'),
          where('status', '==', 'pending'),
          limit(100)
        );
        const unsubDocuments = onSnapshot(
          documentsQuery,
          (snapshot) => {
            setTasks(prev => ({ ...prev, pendingDocuments: snapshot.size }));
            checkLoadingComplete();
          },
          (error) => {
            console.error('Error listening to pending documents:', error);
            checkLoadingComplete();
          }
        );
        unsubscribers.push(unsubDocuments);
      }

      // Listen to pending stage advancements
      if (role === 'admin' || role === 'president' || role === 'ho_recruitment_officer') {
        const stageAdvancementsQuery = query(
          collection(firestore, 'stage_history'),
          where('status', '==', 'pending'),
          limit(100)
        );
        const unsubStageAdvancements = onSnapshot(
          stageAdvancementsQuery,
          (snapshot) => {
            setTasks(prev => ({ ...prev, pendingStageAdvancements: snapshot.size }));
            checkLoadingComplete();
          },
          (error) => {
            console.error('Error listening to pending stage advancements:', error);
            checkLoadingComplete();
          }
        );
        unsubscribers.push(unsubStageAdvancements);
      }

      // If no listeners were added, stop loading immediately
      if (unsubscribers.length === 0) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error setting up listeners:', error);
      setLoading(false);
    }

      // Cleanup function to unsubscribe from all listeners
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [role, userId, branchId]);

  const hasPendingTasks = tasks.pendingExpenses > 0 || 
                          tasks.pendingCommissions > 0 || 
                          tasks.pendingTransfers > 0 || 
                          tasks.pendingDocuments > 0 || 
                          tasks.pendingStageAdvancements > 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!hasPendingTasks) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg border-2 border-green-200 p-4">
        <div className="text-center">
          <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">All Caught Up!</h3>
          <p className="text-xs text-gray-600">No pending tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg border-2 border-orange-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <ExclamationTriangleIcon className="h-4 w-4 text-orange-600 animate-pulse" />
        <h3 className="text-sm font-semibold text-gray-900">Pending Tasks</h3>
      </div>
      <div className="space-y-2">
        {tasks.pendingExpenses > 0 && (
          <Link
            to="/expenses?status=pending"
            className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-md transition-all"
          >
            <span className="text-xs font-medium text-gray-700">
              Expenses
            </span>
            <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full">
              {tasks.pendingExpenses}
            </span>
          </Link>
        )}
        {tasks.pendingCommissions > 0 && (
          <Link
            to="/commissions?status=pending"
            className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-md transition-all"
          >
            <span className="text-xs font-medium text-gray-700">
              Commissions
            </span>
            <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
              {tasks.pendingCommissions}
            </span>
          </Link>
        )}
        {tasks.pendingTransfers > 0 && (
          <Link
            to="/applicants?transfers=pending"
            className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-md transition-all"
          >
            <span className="text-xs font-medium text-gray-700">
              Transfers
            </span>
            <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
              {tasks.pendingTransfers}
            </span>
          </Link>
        )}
        {tasks.pendingDocuments > 0 && (
          <Link
            to="/applicants/documents"
            className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-md transition-all"
          >
            <span className="text-xs font-medium text-gray-700">
              Documents
            </span>
            <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full">
              {tasks.pendingDocuments}
            </span>
          </Link>
        )}
        {tasks.pendingStageAdvancements > 0 && (
          <Link
            to="/applicants"
            className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-md transition-all"
          >
            <span className="text-xs font-medium text-gray-700">
              Stage Approvals
            </span>
            <span className="px-2 py-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold rounded-full">
              {tasks.pendingStageAdvancements}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};

// Role-specific dashboard components
const AdminDashboard = () => {
  const { metrics, breakdowns, isLoading, error } = useDashboardMetrics('admin');
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;
  
  return (
    <div className="space-y-6">
      {/* Grid Layout for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart for Stages */}
        {breakdowns?.applicantsByStage && breakdowns.applicantsByStage.length > 0 && (
          <PieChart 
            title="Pipeline Stages"
            data={breakdowns.applicantsByStage}
          />
        )}
        
        {/* Bar Chart for Statuses */}
        {breakdowns?.applicantsByStatus && breakdowns.applicantsByStatus.length > 0 && (
          <BarChart 
            title="Applicants By Status"
            data={breakdowns.applicantsByStatus}
          />
        )}
      </div>
    </div>
  );
};

const BranchManagerDashboard = ({ branchId }: { branchId: string | null }) => {
  const { metrics, breakdowns, isLoading, error } = useDashboardMetrics('branch_manager', branchId);
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;
  
  return (
    <div className="space-y-6">
      <QuickStats metrics={metrics} />
      
      {/* Bar Chart for Applicants by Status */}
      {breakdowns?.applicantsByStatus && breakdowns.applicantsByStatus.length > 0 && (
        <BarChart 
          title="Branch Applicants By Status"
          data={breakdowns.applicantsByStatus}
        />
      )}
    </div>
  );
};

const RecruitmentOfficerDashboard = () => {
  const { metrics, breakdowns, isLoading, error } = useDashboardMetrics('ho_recruitment_officer');
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;
  
  return (
    <div className="space-y-6">
      <QuickStats metrics={metrics} />
      
      {/* Bar Chart if available */}
      {breakdowns?.applicantsByStatus && breakdowns.applicantsByStatus.length > 0 && (
        <BarChart 
          title="Recruitment Pipeline Status"
          data={breakdowns.applicantsByStatus}
        />
      )}
    </div>
  );
};

const AccountantDashboard = () => {
  const { metrics, breakdowns, isLoading, error } = useDashboardMetrics('ho_accountant');
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;
  
  return (
    <div className="space-y-6">
      <QuickStats metrics={metrics} />
      
      {/* Bar Chart for expenses by type if available */}
      {breakdowns?.expensesByType && breakdowns.expensesByType.length > 0 && (
        <BarChart 
          title="Expenses By Type"
          data={breakdowns.expensesByType}
        />
      )}
    </div>
  );
};

const DefaultDashboard = () => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12">
    <div className="text-center">
      <div className="mx-auto h-16 w-16 text-indigo-600 mb-4">
        <SparklesIcon className="h-full w-full animate-pulse" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome to Agency CRM
      </h3>
      <p className="text-gray-600">
        Your dashboard will appear here once your role is assigned.
      </p>
    </div>
  </div>
);

export const Dashboard = () => {
  const { user, customClaims, loading } = useAuth();
  const greeting = getTimeBasedGreeting();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <SparklesIcon className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const renderRoleSpecificContent = () => {
    switch (customClaims?.role) {
      case 'admin':
      case 'president':
        return <AdminDashboard />;
      case 'branch_manager':
        return <BranchManagerDashboard branchId={customClaims.branchId || null} />;
      case 'ho_recruitment_officer':
        return <RecruitmentOfficerDashboard />;
      case 'ho_accountant':
        return <AccountantDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Compact Header with Inline System Status */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="h-7 w-7 text-white animate-pulse" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{greeting.icon}</span>
                  <h1 className="text-2xl font-bold text-white">
                    {greeting.text}, {user?.displayName || 'User'}!
                  </h1>
                </div>
                <p className="text-indigo-100 text-sm">
                  Here's your overview for today
                </p>
              </div>
            </div>
            
            {/* Inline System Status */}
            <div className="hidden sm:flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <CheckCircleIcon className="h-4 w-4 text-green-300" />
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-white font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Enhanced Dashboard Layout */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Pending Approvals Section - Full Width - For all approvers */}
        {(customClaims?.role === 'admin' || 
          customClaims?.role === 'president' || 
          customClaims?.role === 'branch_manager' || 
          customClaims?.role === 'ho_recruitment_officer') && (
          <div className="mb-6">
            <PendingApprovals />
          </div>
        )}
        
        {/* Main Dashboard Content */}
        <div className="space-y-6">
          {/* Primary Charts Section - Full Width */}
          <div className="w-full">
            {renderRoleSpecificContent()}
          </div>

          {/* Secondary Widgets Grid - Organized Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Section - Performance & Goals (8 columns) */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <PerformanceInsights role={customClaims?.role || ''} />
              <GoalProgressWidget role={customClaims?.role || ''} />
            </div>

            {/* Right Section - Quick Actions & Tools (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              <QuickActionsPanel role={customClaims?.role || ''} />
              <PendingTasksWidget 
                role={customClaims?.role || ''} 
                userId={user?.uid || ''} 
                branchId={customClaims?.role === 'branch_manager' ? customClaims.branchId : null}
              />
            </div>
          </div>

          {/* Tertiary Widgets Row - Information & Updates */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StageDistributionWidget branchId={customClaims?.role === 'branch_manager' ? customClaims.branchId : null} />
            <QuickTipsWidget />
            <TodaysAgenda />
          </div>
        </div>
      </div>
    </div>
  );
};