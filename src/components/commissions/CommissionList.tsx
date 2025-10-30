import React, { useEffect, useState } from 'react';
import { Commission } from '../../types/commission';
import { CommissionService } from '../../services/commissionService';
import LoadingSpinner from '../common/LoadingSpinner';

interface CommissionListProps {
  agentId?: string;
  branchId?: string;
  onCommissionClick?: (commission: Commission) => void;
}

const CommissionList: React.FC<CommissionListProps> = ({
  agentId,
  branchId,
  onCommissionClick
}) => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCommissions();
  }, [agentId, branchId]);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      let data: Commission[];
      
      if (agentId) {
        data = await CommissionService.getAgentCommissions(agentId);
      } else if (branchId) {
        data = await CommissionService.getBranchCommissions(branchId);
      } else {
        throw new Error('Either agentId or branchId must be provided');
      }

      setCommissions(data);
      setError(null);
    } catch (err) {
      setError('Failed to load commissions');
      console.error('Error loading commissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Commission['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'verified':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  if (commissions.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No commissions found
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {commissions.map((commission) => (
          <li
            key={commission.id}
            className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            onClick={() => onCommissionClick?.(commission)}
          >
            <div className="px-4 py-4 sm:px-6">
              {/* Mobile-Optimized Layout */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                {/* Amount and Date Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                    <p className="text-lg sm:text-base font-semibold text-primary-600 truncate">
                      {formatAmount(commission.amount, commission.currency)}
                    </p>
                    <p className="text-sm font-normal text-gray-500 flex-shrink-0">
                      {new Date(commission.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Requested by:</span> {commission.requestedBy}
                    </p>
                  </div>
                  {commission.notes && (
                    <div className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {commission.notes}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0 self-start sm:self-center">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5 ${getStatusColor(
                      commission.status
                    )}`}
                  >
                    {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommissionList;
