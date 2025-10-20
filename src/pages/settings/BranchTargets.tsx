import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  TrophyIcon, 
  BuildingOfficeIcon,
  CalendarIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

interface BranchTarget {
  branchId: string;
  branchName: string;
  targets: {
    applicants: number;
    medical: number;
    transferToHO: number;
    deployed: number;
  };
}

export const BranchTargets: React.FC = () => {
  const { customClaims } = useAuth();
  const [branches, setBranches] = useState<any[]>([]);
  const [targets, setTargets] = useState<Record<string, BranchTarget>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadBranchesAndTargets();
  }, [selectedMonth, selectedYear]);

  const loadBranchesAndTargets = async () => {
    try {
      setLoading(true);
      
      // Load all branches
      const branchesQuery = query(collection(firestore, 'branches'));
      const branchesSnapshot = await getDocs(branchesQuery);
      const branchesData = branchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBranches(branchesData);

      // Load targets for each branch
      const targetsData: Record<string, BranchTarget> = {};
      
      for (const branch of branchesData) {
        const targetDoc = await getDoc(
          doc(firestore, 'branch_targets', `${branch.id}_${selectedYear}_${selectedMonth}`)
        );
        
        if (targetDoc.exists()) {
          const data = targetDoc.data();
          targetsData[branch.id] = {
            branchId: branch.id,
            branchName: branch.name,
            targets: data.targets
          };
        } else {
          // Initialize with undefined/0 values that will display as empty
          targetsData[branch.id] = {
            branchId: branch.id,
            branchName: branch.name,
            targets: {
              applicants: 0,
              medical: 0,
              transferToHO: 0,
              deployed: 0
            }
          };
        }
      }
      
      setTargets(targetsData);
      setHasUnsavedChanges(false); // Reset unsaved changes after loading
    } catch (error) {
      console.error('Error loading targets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTargetChange = (branchId: string, field: string, value: number) => {
    setTargets(prev => ({
      ...prev,
      [branchId]: {
        ...prev[branchId],
        targets: {
          ...prev[branchId].targets,
          [field]: value
        }
      }
    }));
    setHasUnsavedChanges(true); // Mark as having unsaved changes
  };

  const handleSaveTargets = async () => {
    try {
      setSaving(true);
      
      for (const [branchId, targetData] of Object.entries(targets)) {
        await setDoc(
          doc(firestore, 'branch_targets', `${branchId}_${selectedYear}_${selectedMonth}`),
          {
            branchId,
            branchName: targetData.branchName,
            year: selectedYear,
            month: selectedMonth,
            targets: targetData.targets,
            updatedAt: new Date(),
            updatedBy: customClaims?.email || 'system'
          }
        );
      }
      
      alert('Targets saved successfully!');
      setHasUnsavedChanges(false); // Reset unsaved changes after successful save
    } catch (error) {
      console.error('Error saving targets:', error);
      alert('Failed to save targets');
    } finally {
      setSaving(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      {/* Header - Mobile Optimized */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
          <TrophyIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 flex-shrink-0" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Branch Monthly Targets</h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600">Set monthly recruitment pipeline targets for each branch office</p>
      </div>

      {/* Month/Year Selector - Mobile Optimized */}
      <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <label className="block text-sm font-semibold text-gray-700">Period:</label>
          </div>
          <div className="flex gap-3 flex-1">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all"
            >
              {monthNames.map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-24 sm:w-auto px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Info Card - Mobile Optimized */}
      <div className="mb-4 sm:mb-6 bg-blue-50 border-l-4 border-blue-400 p-3 sm:p-4 rounded-r-xl">
        <div className="flex items-start gap-2 sm:gap-3">
          <ChartBarIcon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Pipeline Stage Targets</h3>
            <div className="text-xs sm:text-sm text-blue-700 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[100px] sm:min-w-[120px]">📝 Applicants:</span>
                <span>Total new applicants to register</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[100px] sm:min-w-[120px]">🏥 Medical:</span>
                <span>Applicants to reach medical stage</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[100px] sm:min-w-[120px]">🔄 Transfer to HO:</span>
                <span>Applicants to transfer to Head Office</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold min-w-[100px] sm:min-w-[120px]">✈️ Deployed:</span>
                <span>Applicants to successfully deploy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Targets - Responsive Layout */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Mobile Card View - Show on screens < 768px */}
        <div className="md:hidden p-3 space-y-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
            >
              {/* Branch Name Header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-200">
                <BuildingOfficeIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                <h3 className="text-base font-bold text-gray-900 flex-1">{branch.name}</h3>
              </div>

              {/* Target Inputs Grid */}
              <div className="space-y-3">
                {/* Applicants */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1.5">
                    <span>📝</span>
                    <span>Applicants</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={targets[branch.id]?.targets.applicants || ''}
                    onChange={(e) => handleTargetChange(branch.id, 'applicants', Number(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all"
                    placeholder="Enter target"
                  />
                </div>

                {/* Medical */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1.5">
                    <span>🏥</span>
                    <span>Medical</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={targets[branch.id]?.targets.medical || ''}
                    onChange={(e) => handleTargetChange(branch.id, 'medical', Number(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-medium transition-all"
                    placeholder="Enter target"
                  />
                </div>

                {/* Transfer to HO */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1.5">
                    <span>🔄</span>
                    <span>Transfer to HO</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={targets[branch.id]?.targets.transferToHO || ''}
                    onChange={(e) => handleTargetChange(branch.id, 'transferToHO', Number(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium transition-all"
                    placeholder="Enter target"
                  />
                </div>

                {/* Deployed */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1.5">
                    <span>✈️</span>
                    <span>Deployed</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={targets[branch.id]?.targets.deployed || ''}
                    onChange={(e) => handleTargetChange(branch.id, 'deployed', Number(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium transition-all"
                    placeholder="Enter target"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View - Show on screens >= 768px */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Branch Office
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>📝</span>
                    <span>Applicants</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>🏥</span>
                    <span>Medical</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>🔄</span>
                    <span>Transfer to HO</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>✈️</span>
                    <span>Deployed</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {branches.map((branch, index) => (
                <tr key={branch.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{branch.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      value={targets[branch.id]?.targets.applicants || ''}
                      onChange={(e) => handleTargetChange(branch.id, 'applicants', Number(e.target.value) || 0)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder=""
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      value={targets[branch.id]?.targets.medical || ''}
                      onChange={(e) => handleTargetChange(branch.id, 'medical', Number(e.target.value) || 0)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder=""
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      value={targets[branch.id]?.targets.transferToHO || ''}
                      onChange={(e) => handleTargetChange(branch.id, 'transferToHO', Number(e.target.value) || 0)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder=""
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      value={targets[branch.id]?.targets.deployed || ''}
                      onChange={(e) => handleTargetChange(branch.id, 'deployed', Number(e.target.value) || 0)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder=""
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Buttons - Mobile Optimized */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <button
          onClick={loadBranchesAndTargets}
          className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Reset
        </button>
        <button
          onClick={handleSaveTargets}
          disabled={saving || !hasUnsavedChanges}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-semibold"
        >
          {saving ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Save Targets'
          )}
        </button>
      </div>
    </div>
  );
};

