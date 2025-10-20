import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrophyIcon,
  ChartBarIcon,
  UserGroupIcon,
  ChevronRightIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useAgentLeaderboard } from '../../hooks/useAgentLeaderboard';

const getTierStyles = (tier: 'gold' | 'silver' | 'bronze' | 'none') => {
  switch (tier) {
    case 'gold':
      return {
        bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
        border: 'border-yellow-400',
        icon: '🥇',
        textColor: 'text-yellow-700'
      };
    case 'silver':
      return {
        bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
        border: 'border-gray-400',
        icon: '🥈',
        textColor: 'text-gray-700'
      };
    case 'bronze':
      return {
        bg: 'bg-gradient-to-r from-orange-50 to-amber-50',
        border: 'border-orange-400',
        icon: '🥉',
        textColor: 'text-orange-700'
      };
    default:
      return {
        bg: 'bg-white',
        border: 'border-gray-200',
        icon: '📊',
        textColor: 'text-gray-700'
      };
  }
};

interface AgentLeaderboardProps {
  branchId?: string;
}

export const AgentLeaderboard: React.FC<AgentLeaderboardProps> = ({ branchId }) => {
  const [branchFilter, setBranchFilter] = useState<string | undefined>(undefined);
  const { agents, loading, error } = useAgentLeaderboard(branchId || branchFilter, 10);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
            <div className="h-6 w-40 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <p className="text-red-600 text-sm">Failed to load leaderboard</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <TrophyIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Top Performers</h3>
              <p className="text-xs sm:text-sm text-teal-100">Agent leaderboard by deployments</p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <FunnelIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="p-3 sm:p-4">
        {agents.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm sm:text-base font-medium text-gray-900">No agents found</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Start adding agents to see rankings</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {agents.map((agent, index) => {
              const tierStyles = getTierStyles(agent.tier);

              return (
                <Link
                  key={agent.id}
                  to={`/agents/${agent.id}`}
                  className={`
                    block ${tierStyles.bg} border-2 ${tierStyles.border} rounded-xl p-3 sm:p-4
                    hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]
                    group relative overflow-hidden
                  `}
                >
                  {/* Rank Badge */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-lg sm:text-xl">{tierStyles.icon}</span>
                      <span className={`text-xs sm:text-sm font-bold ${tierStyles.textColor}`}>
                        #{agent.rank}
                      </span>
                    </div>
                  </div>

                  <div className="pr-12 sm:pr-16">
                    {/* Agent Info */}
                    <div className="mb-2 sm:mb-3">
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                        {agent.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">{agent.branchName}</p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold text-teal-600">
                          {agent.deploymentCount}
                        </div>
                        <div className="text-xs text-gray-500">Deployed</div>
                      </div>
                      <div className="text-center border-l border-r border-gray-200">
                        <div className="text-lg sm:text-2xl font-bold text-blue-600">
                          {agent.successRate}%
                        </div>
                        <div className="text-xs text-gray-500">Success</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm sm:text-lg font-bold text-purple-600">
                          ₱{(agent.totalCommissions / 1000).toFixed(0)}K
                        </div>
                        <div className="text-xs text-gray-500">Earned</div>
                      </div>
                    </div>

                    {/* Mini Sparkline */}
                    <div className="flex items-end space-x-0.5 h-6 sm:h-8 mb-2">
                      {agent.trend.map((value, idx) => {
                        const maxValue = Math.max(...agent.trend);
                        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                        return (
                          <div
                            key={idx}
                            className="flex-1 bg-teal-400 rounded-sm transition-all hover:bg-teal-500"
                            style={{ height: `${Math.max(height, 10)}%` }}
                          />
                        );
                      })}
                    </div>

                    {/* View Details */}
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-500">{agent.totalApplicants} total applicants</span>
                      <span className="inline-flex items-center font-medium text-teal-600 group-hover:text-teal-800">
                        View Profile
                        <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* View All Link */}
        {agents.length > 0 && (
          <Link
            to="/agents"
            className="block mt-4 text-center py-2 sm:py-3 text-xs sm:text-sm font-medium text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-all"
          >
            View All Agents →
          </Link>
        )}
      </div>
    </div>
  );
};

