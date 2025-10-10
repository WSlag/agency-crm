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
      currency: currency
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
            className="hover:bg-gray-50 cursor-pointer"
            onClick={() => onCommissionClick?.(commission)}
          >
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <div className="flex text-sm">
                    <p className="font-medium text-primary-600 truncate">
                      {formatAmount(commission.amount, commission.currency)}
                    </p>
                    <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                      {new Date(commission.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2 flex">
                    <div className="flex items-center text-sm text-gray-500">
                      <p>Requested by: {commission.requestedBy}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-2 flex flex-shrink-0">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                      commission.status
                    )}`}
                  >
                    {commission.status}
                  </span>
                </div>
              </div>
              {commission.notes && (
                <div className="mt-2 text-sm text-gray-500">
                  {commission.notes}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommissionList;
