import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Branch, Applicant, Agent } from '../../types';

interface MetricsData {
  applicationSuccess: number;
  processingTime: number;
  agentPerformance: {
    agentId: string;
    agentName: string;
    applicants: number;
    successRate: number;
  }[];
  commissionTrends: {
    month: string;
    amount: number;
  }[];
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export const BranchMetrics: React.FC = () => {
  const { id } = useParams();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetricsData = async () => {
      if (!id) return;

      try {
        // Fetch branch details
        const branchRef = doc(firestore, 'branches', id);
        const branchSnap = await getDoc(branchRef);

        if (!branchSnap.exists()) {
          setError('Branch not found');
          setLoading(false);
          return;
        }

        setBranch({ id: branchSnap.id, ...branchSnap.data() } as Branch);

        // Fetch agents
        const agentsQuery = query(
          collection(firestore, 'agents'),
          where('branchId', '==', id),
          where('status', '==', 'active')
        );
        const agentsSnap = await getDocs(agentsQuery);
        const agents = agentsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as Agent);

        // Fetch applicants
        const applicantsQuery = query(
          collection(firestore, 'applicants'),
          where('branchId', '==', id)
        );
        const applicantsSnap = await getDocs(applicantsQuery);
        const applicants = applicantsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as Applicant);

        // Calculate metrics
        const agentPerformance = agents.map(agent => {
          const agentApplicants = applicants.filter(app => app.agentId === agent.id);
          const successfulApplicants = agentApplicants.filter(app => app.currentStage === 'deployed');
          
          return {
            agentId: agent.id,
            agentName: agent.agentName,
            applicants: agentApplicants.length,
            successRate: agentApplicants.length > 0
              ? (successfulApplicants.length / agentApplicants.length) * 100
              : 0,
          };
        });

        // Calculate success rate
        const deployedApplicants = applicants.filter(app => app.currentStage === 'deployed');
        const applicationSuccess = applicants.length > 0
          ? (deployedApplicants.length / applicants.length) * 100
          : 0;

        // Mock commission trends data (replace with actual data)
        const commissionTrends = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return {
            month: date.toLocaleString('default', { month: 'short' }),
            amount: Math.floor(Math.random() * 10000),
          };
        }).reverse();

        setMetrics({
          applicationSuccess,
          processingTime: 30, // Mock data - replace with actual calculation
          agentPerformance,
          commissionTrends,
        });

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch metrics data');
        setLoading(false);
      }
    };

    fetchMetricsData();
  }, [id, dateRange]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !branch || !metrics) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error || 'Failed to load metrics'}</h3>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{branch.branchName} Metrics</h1>
            <p className="mt-2 text-sm text-gray-700">
              Detailed performance metrics and analytics
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="flex space-x-3">
              <input
                type="date"
                value={dateRange.startDate.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({
                  ...prev,
                  startDate: new Date(e.target.value)
                }))}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              <input
                type="date"
                value={dateRange.endDate.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({
                  ...prev,
                  endDate: new Date(e.target.value)
                }))}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Application Success Rate
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {metrics.applicationSuccess.toFixed(1)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg. Processing Time
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {metrics.processingTime} days
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Agent Performance</h2>
          <div className="mt-4 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Agent Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Total Applicants
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Success Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {metrics.agentPerformance.map((agent) => (
                        <tr key={agent.agentId}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {agent.agentName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {agent.applicants}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {agent.successRate.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Trends */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Commission Trends</h2>
          <div className="mt-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-64">
                {/* Replace with actual chart component */}
                <div className="flex h-full items-end space-x-2">
                  {metrics.commissionTrends.map((trend) => (
                    <div
                      key={trend.month}
                      className="flex-1 bg-primary-200 rounded-t"
                      style={{
                        height: `${(trend.amount / 10000) * 100}%`,
                      }}
                    >
                      <div className="text-xs text-center mt-2">{trend.month}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
