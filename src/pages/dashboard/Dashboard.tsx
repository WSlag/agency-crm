import { useAuth } from '../../contexts/AuthContext';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { DashboardSkeleton } from '../../components/dashboard/DashboardSkeleton';
import { DashboardError } from '../../components/dashboard/DashboardError';
import { EnhancedDashboard, QuickStats } from '../../components/dashboard/EnhancedDashboard';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import {
  SparklesIcon,
  ClockIcon,
  ArrowPathIcon,
  PlusIcon,
  DocumentPlusIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  DocumentDuplicateIcon,
  UsersIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

// Time-based greeting helper
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', icon: '🌅', color: 'from-yellow-400 to-orange-500' };
  if (hour < 17) return { text: 'Good Afternoon', icon: '☀️', color: 'from-blue-400 to-indigo-500' };
  return { text: 'Good Evening', icon: '🌙', color: 'from-indigo-500 to-purple-600' };
};

// Recent Activity Feed Component
const RecentActivityFeed: React.FC<{ userId: string; role: string }> = ({ userId }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const activitiesRef = collection(firestore, 'audit_logs');
        const q = query(
          activitiesRef,
          orderBy('performedAt', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentActivities();
  }, [userId]);

  const getActivityIcon = (action: string) => {
    if (action.includes('approved')) return '✅';
    if (action.includes('rejected')) return '❌';
    if (action.includes('created')) return '➕';
    if (action.includes('updated')) return '🔄';
    if (action.includes('transferred')) return '📤';
    return '📝';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <ClockIcon className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="space-y-2">
        {activities.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <ClockIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">No recent activity</p>
          </div>
        ) : (
          activities.slice(0, 3).map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-2 p-2 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-lg transition-all"
            >
              <span className="text-lg">{getActivityIcon(activity.action)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {activity.action?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {activity.performedAt?.toDate ? new Date(activity.performedAt.toDate()).toLocaleTimeString() : 'Recently'}
                </p>
              </div>
            </div>
          ))
        )}
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
        { label: 'Job Postings', icon: BriefcaseIcon, href: '/jobs', color: 'from-cyan-500 to-cyan-600' },
        { label: 'View Transfers', icon: ArrowsRightLeftIcon, href: '/applicants/transfers', color: 'from-purple-500 to-purple-600' },
        { label: 'View Reports', icon: DocumentPlusIcon, href: '/reports', color: 'from-indigo-500 to-indigo-600' },
        { label: 'Financial', icon: CurrencyDollarIcon, href: '/financial-dashboard', color: 'from-orange-500 to-orange-600' },
      ],
      president: [
        { label: 'View Agents', icon: UsersIcon, href: '/agents', color: 'from-teal-500 to-teal-600' },
        { label: 'Job Postings', icon: BriefcaseIcon, href: '/jobs', color: 'from-cyan-500 to-cyan-600' },
        { label: 'View Transfers', icon: ArrowsRightLeftIcon, href: '/applicants/transfers', color: 'from-purple-500 to-purple-600' },
        { label: 'View Reports', icon: DocumentPlusIcon, href: '/reports', color: 'from-indigo-500 to-indigo-600' },
        { label: 'Financial', icon: CurrencyDollarIcon, href: '/financial-dashboard', color: 'from-orange-500 to-orange-600' },
        { label: 'Officers', icon: UserPlusIcon, href: '/officers', color: 'from-blue-500 to-blue-600' },
        { label: 'Branches', icon: ChartBarIcon, href: '/branches', color: 'from-green-500 to-green-600' },
      ],
      branch_manager: [
        { label: 'New Applicant', icon: UserPlusIcon, href: '/applicants/register', color: 'from-indigo-500 to-indigo-600' },
        { label: 'My Agents', icon: UsersIcon, href: '/agents', color: 'from-teal-500 to-teal-600' },
        { label: 'Available Jobs', icon: BriefcaseIcon, href: '/jobs', color: 'from-cyan-500 to-cyan-600' },
        { label: 'Submit Expense', icon: CurrencyDollarIcon, href: '/expenses/new', color: 'from-green-500 to-green-600' },
        { label: 'View Pipeline', icon: ArrowPathIcon, href: '/applicants', color: 'from-purple-500 to-purple-600' },
        { label: 'Commissions', icon: CurrencyDollarIcon, href: '/commissions', color: 'from-blue-500 to-blue-600' },
      ],
      ho_accountant: [
        { label: 'Pending Expenses', icon: ClockIcon, href: '/expenses?status=pending', color: 'from-red-500 to-red-600' },
        { label: 'Pending Commissions', icon: ClockIcon, href: '/commissions?status=pending', color: 'from-yellow-500 to-yellow-600' },
        { label: 'Financial Reports', icon: DocumentPlusIcon, href: '/reports/financial', color: 'from-blue-500 to-blue-600' },
        { label: 'Financial Dashboard', icon: ChartBarIcon, href: '/financial-dashboard', color: 'from-green-500 to-green-600' },
      ],
      ho_recruitment_officer: [
        { label: 'My Applicants', icon: UserPlusIcon, href: '/officers', color: 'from-purple-500 to-purple-600' },
        { label: 'All Applicants', icon: UserPlusIcon, href: '/applicants', color: 'from-indigo-500 to-indigo-600' },
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
const PendingTasksWidget: React.FC<{ role: string; userId: string }> = ({ role, userId }) => {
  const [tasks, setTasks] = useState({
    pendingExpenses: 0,
    pendingCommissions: 0,
    pendingTransfers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingTasks = async () => {
      try {
        // Fetch pending expenses
        if (role === 'ho_accountant' || role === 'admin' || role === 'president') {
          const expensesQuery = query(
            collection(firestore, 'expenses'),
            where('status', '==', 'pending'),
            limit(100)
          );
          const expensesSnapshot = await getDocs(expensesQuery);
          setTasks(prev => ({ ...prev, pendingExpenses: expensesSnapshot.size }));
        }

        // Fetch pending commissions
        if (role === 'ho_accountant' || role === 'admin' || role === 'president') {
          const commissionsQuery = query(
            collection(firestore, 'commissions'),
            where('status', '==', 'pending'),
            limit(100)
          );
          const commissionsSnapshot = await getDocs(commissionsQuery);
          setTasks(prev => ({ ...prev, pendingCommissions: commissionsSnapshot.size }));
        }

        // Fetch pending transfers
        if (role === 'admin' || role === 'president') {
          const transfersQuery = query(
            collection(firestore, 'transfers'),
            where('status', '==', 'pending'),
            limit(100)
          );
          const transfersSnapshot = await getDocs(transfersQuery);
          setTasks(prev => ({ ...prev, pendingTransfers: transfersSnapshot.size }));
        }
      } catch (error) {
        console.error('Error fetching pending tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingTasks();
  }, [role, userId]);

  const hasPendingTasks = tasks.pendingExpenses > 0 || tasks.pendingCommissions > 0 || tasks.pendingTransfers > 0;

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
      </div>
    </div>
  );
};

// Role-specific dashboard components
const AdminDashboard = () => {
  const { metrics, breakdowns, isLoading, error } = useDashboardMetrics('admin');
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;
  
  // Assign color schemes to metrics
  const coloredMetrics = metrics.map((metric, index) => ({
    ...metric,
    colorScheme: (['blue', 'green', 'purple', 'orange', 'pink'] as const)[index % 5]
  }));
  
  return (
    <div className="space-y-6">
      <QuickStats metrics={metrics} />
      <EnhancedDashboard 
        metrics={coloredMetrics} 
        breakdowns={breakdowns}
      />
    </div>
  );
};

const BranchManagerDashboard = ({ branchId }: { branchId: string | null }) => {
  const { metrics, breakdowns, isLoading, error } = useDashboardMetrics('branch_manager', branchId);
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;
  
  // Assign color schemes to metrics
  const coloredMetrics = metrics.map((metric, index) => ({
    ...metric,
    colorScheme: (['indigo', 'green', 'orange', 'purple'] as const)[index % 4]
  }));
  
  return (
    <div className="space-y-6">
      <QuickStats metrics={metrics} />
      <EnhancedDashboard 
        metrics={coloredMetrics} 
        breakdowns={breakdowns}
        title="Branch Performance Overview"
      />
    </div>
  );
};

const RecruitmentOfficerDashboard = () => {
  const { metrics, breakdowns, isLoading, error } = useDashboardMetrics('ho_recruitment_officer');
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;
  
  // Assign color schemes to metrics
  const coloredMetrics = metrics.map((metric, index) => ({
    ...metric,
    colorScheme: (['purple', 'blue', 'green', 'orange'] as const)[index % 4]
  }));
  
  return (
    <div className="space-y-6">
      <QuickStats metrics={metrics} />
      <EnhancedDashboard 
        metrics={coloredMetrics} 
        breakdowns={breakdowns}
        title="Recruitment Activities"
      />
    </div>
  );
};

const AccountantDashboard = () => {
  const { metrics, breakdowns, isLoading, error } = useDashboardMetrics('ho_accountant');
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;
  
  // Assign color schemes to metrics
  const coloredMetrics = metrics.map((metric, index) => ({
    ...metric,
    colorScheme: (['green', 'blue', 'orange', 'indigo'] as const)[index % 4]
  }));
  
  return (
    <div className="space-y-6">
      <QuickStats metrics={metrics} />
      <EnhancedDashboard 
        metrics={coloredMetrics} 
        breakdowns={breakdowns}
        title="Financial Overview"
      />
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

      {/* Content - Optimized 4-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Main Grid Layout - 4 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Left Column - Main Dashboard (3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            {renderRoleSpecificContent()}
          </div>

          {/* Right Column - Widgets (1 column) */}
          <div className="space-y-4">
            {/* Quick Actions - Compact */}
            <QuickActionsPanel role={customClaims?.role || ''} />
            
            {/* Pending Tasks - Compact */}
            <PendingTasksWidget 
              role={customClaims?.role || ''} 
              userId={user?.uid || ''} 
            />
            
            {/* Recent Activity - Compact */}
            <RecentActivityFeed 
              userId={user?.uid || ''} 
              role={customClaims?.role || ''} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};