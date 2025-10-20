import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../config/firebase';

export interface BranchMetric {
  id: string;
  name: string;
  totalApplicants: number;
  deployedApplicants: number;
  deploymentRate: number;
  averageProcessingTime: number;
  activeAgents: number;
}

export const useBranchMetrics = () => {
  const [branches, setBranches] = useState<BranchMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBranchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all branches
        const branchesSnapshot = await getDocs(collection(firestore, 'branches'));
        
        // Fetch all applicants
        const applicantsSnapshot = await getDocs(collection(firestore, 'applicants'));
        
        // Fetch all agents
        const agentsSnapshot = await getDocs(collection(firestore, 'agents'));

        const metrics: BranchMetric[] = [];

        branchesSnapshot.forEach(branchDoc => {
          const branchData = branchDoc.data();
          const branchId = branchDoc.id;

          // Filter applicants for this branch
          const branchApplicants = applicantsSnapshot.docs.filter(
            doc => doc.data().branchId === branchId
          );

          const totalApplicants = branchApplicants.length;
          const deployedApplicants = branchApplicants.filter(
            doc => doc.data().currentStage === 'deployed'
          ).length;

          const deploymentRate = totalApplicants > 0
            ? (deployedApplicants / totalApplicants) * 100
            : 0;

          // Calculate average processing time (mock calculation)
          // In real implementation, this would track time from registration to deployment
          const processingTimes = branchApplicants
            .filter(doc => doc.data().currentStage === 'deployed' && doc.data().createdAt)
            .map(doc => {
              const created = doc.data().createdAt?.toDate();
              const deployed = doc.data().deployedAt?.toDate() || new Date();
              if (created) {
                return Math.floor((deployed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
              }
              return 0;
            })
            .filter(time => time > 0);

          const averageProcessingTime = processingTimes.length > 0
            ? Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length)
            : 0;

          // Count active agents in this branch
          const activeAgents = agentsSnapshot.docs.filter(
            doc => doc.data().branchId === branchId && doc.data().status === 'active'
          ).length;

          metrics.push({
            id: branchId,
            name: branchData.name || 'Unknown Branch',
            totalApplicants,
            deployedApplicants,
            deploymentRate: Math.round(deploymentRate),
            averageProcessingTime,
            activeAgents
          });
        });

        // Sort by total applicants
        metrics.sort((a, b) => b.totalApplicants - a.totalApplicants);

        setBranches(metrics);
      } catch (err) {
        console.error('Error fetching branch metrics:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch branch metrics'));
      } finally {
        setLoading(false);
      }
    };

    fetchBranchMetrics();
  }, []);

  return { branches, loading, error };
};

