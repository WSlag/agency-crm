import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../config/firebase';

export interface AgentPerformance {
  id: string;
  name: string;
  branchId: string;
  branchName?: string;
  deploymentCount: number;
  totalApplicants: number;
  successRate: number;
  totalCommissions: number;
  rank: number;
  tier: 'gold' | 'silver' | 'bronze' | 'none';
  trend: number[];
}

export const useAgentLeaderboard = (branchFilter?: string, limit: number = 10) => {
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all agents
        const agentsQuery = branchFilter
          ? query(collection(firestore, 'agents'), where('branchId', '==', branchFilter))
          : collection(firestore, 'agents');
        
        const agentsSnapshot = await getDocs(agentsQuery);
        
        // Fetch all applicants
        const applicantsSnapshot = await getDocs(collection(firestore, 'applicants'));
        
        // Fetch branches for names
        const branchesSnapshot = await getDocs(collection(firestore, 'branches'));
        const branchesMap = new Map();
        branchesSnapshot.forEach(doc => {
          branchesMap.set(doc.id, doc.data().name);
        });

        // Calculate performance for each agent
        const performances: AgentPerformance[] = [];

        agentsSnapshot.forEach(agentDoc => {
          const agentData = agentDoc.data();
          const agentId = agentDoc.id;

          // Filter applicants for this agent
          const agentApplicants = applicantsSnapshot.docs.filter(
            doc => doc.data().agentId === agentId
          );

          const totalApplicants = agentApplicants.length;
          const deployedApplicants = agentApplicants.filter(
            doc => doc.data().currentStage === 'deployed'
          ).length;

          const successRate = totalApplicants > 0
            ? (deployedApplicants / totalApplicants) * 100
            : 0;

          // Generate trend data (mock for now, could be enhanced with historical data)
          const trend = Array.from({ length: 7 }, () => 
            Math.floor(Math.random() * deployedApplicants) + deployedApplicants * 0.7
          );

          performances.push({
            id: agentId,
            name: agentData.agentName || 'Unknown',
            branchId: agentData.branchId,
            branchName: branchesMap.get(agentData.branchId) || 'Unknown Branch',
            deploymentCount: deployedApplicants,
            totalApplicants,
            successRate: Math.round(successRate),
            totalCommissions: agentData.totalCommissions || 0,
            rank: 0,
            tier: 'none',
            trend
          });
        });

        // Sort by deployment count
        performances.sort((a, b) => b.deploymentCount - a.deploymentCount);

        // Assign ranks and tiers
        performances.forEach((perf, index) => {
          perf.rank = index + 1;
          if (index < 3) perf.tier = 'gold';
          else if (index < 6) perf.tier = 'silver';
          else if (index < 10) perf.tier = 'bronze';
        });

        // Apply limit
        setAgents(performances.slice(0, limit));
      } catch (err) {
        console.error('Error fetching agent leaderboard:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch leaderboard'));
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [branchFilter, limit]);

  return { agents, loading, error };
};

