import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { type Commission } from '../../types/commission';
import { useAuthStore } from '../../stores/authStore';
import { useAgentStore } from '../../stores/agentStore';
import { useApplicantStore } from '../../stores/applicantStore';
import { 
  UserIcon, 
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface CommissionRequestFormProps {
  initialData?: Partial<Commission>;
  onSubmit: (data: Partial<Commission>) => Promise<void>;
  onCancel: () => void;
}

export const CommissionRequestForm: React.FC<CommissionRequestFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { user, customClaims } = useAuthStore();
  const { agents, fetchActiveAgents } = useAgentStore();
  const { applicants, fetchApplicants } = useApplicantStore();
  const [filteredAgents, setFilteredAgents] = React.useState<any[]>([]);
  const [filteredApplicants, setFilteredApplicants] = React.useState<any[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    defaultValues: {
      ...initialData,
      branchId: initialData?.branchId || '',  // Will be set in useEffect
      currency: initialData?.currency || 'PHP',
      commissionType: initialData?.commissionType || 'medical',
      amount: initialData?.amount || undefined, // Start with empty field
    },
  });

  // Set branchId from customClaims once loaded
  React.useEffect(() => {
    if (customClaims?.branchId && !initialData?.branchId) {
      setValue('branchId', customClaims.branchId);
      console.log('✅ Commission Form: Branch ID set from custom claims:', customClaims.branchId);
    } else if (customClaims?.role === 'branch_manager' && !customClaims?.branchId) {
      console.error('❌ Commission Form: Branch Manager has no branchId in custom claims!');
    }
  }, [customClaims, initialData, setValue]);

  // Fetch agents and applicants on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Commission Form: Loading agents and applicants...');
        await Promise.all([
          fetchActiveAgents(),
          fetchApplicants()
        ]);
        console.log('✅ Commission Form: Data loaded successfully');
      } catch (error) {
        console.error('❌ Commission Form: Error loading data:', error);
      }
    };
    
    loadData();
  }, [fetchActiveAgents, fetchApplicants]);

  // Filter agents and applicants by branch for Branch Managers
  React.useEffect(() => {
    if (!customClaims?.branchId) {
      // If no branch filter, show all
      setFilteredAgents(agents);
      setFilteredApplicants(applicants);
      return;
    }

    // For Branch Managers, filter by their branch
    if (customClaims.role === 'branch_manager') {
      const branchAgents = agents.filter(agent => agent.branchId === customClaims.branchId);
      const branchApplicants = applicants.filter(applicant => applicant.branchId === customClaims.branchId);
      
      setFilteredAgents(branchAgents);
      setFilteredApplicants(branchApplicants);
      
      console.log('🔍 Commission Form: Filtered for branch', customClaims.branchId, {
        totalAgents: agents.length,
        filteredAgents: branchAgents.length,
        totalApplicants: applicants.length,
        filteredApplicants: branchApplicants.length
      });
    } else {
      // For other roles (Admin, HO Accountant), show all
      setFilteredAgents(agents);
      setFilteredApplicants(applicants);
    }
  }, [agents, applicants, customClaims]);

  const handleFormSubmit = async (data: any) => {
    try {
      // Validate required fields
      if (!data.agentId) {
        alert('Please select an agent');
        return;
      }
      if (!data.applicantId) {
        alert('Please select an applicant');
        return;
      }
      if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
        alert('Please enter a valid commission amount greater than 0');
        return;
      }
      if (!data.branchId) {
        alert('Branch ID is missing. Please try again.');
        return;
      }

      console.log('📤 Submitting commission request:', {
        agentId: data.agentId,
        applicantId: data.applicantId,
        amount: data.amount,
        branchId: data.branchId,
      });

      await onSubmit({
        ...data,
        requestedBy: user?.uid || '',
        requestedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to submit commission request:', error);
      alert('Failed to submit commission request. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Commission Request Form */}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-6"
      >
        <div className="flex items-center space-x-2 mb-6">
          <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">Commission Request Details</h3>
        </div>

        {/* Agent Selection */}
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
            Agent
          </label>
          <Controller
            name="agentId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
              >
                <option value="">Select Agent</option>
                {filteredAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.agentName}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.agentId && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              ⚠ {errors.agentId.message as string}
            </p>
          )}
          {filteredAgents.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              No agents available for your branch
            </p>
          )}
        </div>

        {/* Applicant Selection */}
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
            Applicant
          </label>
          <Controller
            name="applicantId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
              >
                <option value="">Select Applicant</option>
                {filteredApplicants.map((applicant) => (
                  <option key={applicant.id} value={applicant.id}>
                    {applicant.fullName} - {applicant.currentStage}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.applicantId && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              ⚠ {errors.applicantId.message as string}
            </p>
          )}
          {filteredApplicants.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              No applicants available for your branch
            </p>
          )}
        </div>

        {/* Commission Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Commission Amount (PHP)
          </label>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                {...field}
                value={field.value || ''} // Show empty string instead of 0
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                  field.onChange(value);
                }}
                className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                placeholder="Enter commission amount"
                min={0}
                step="0.01"
              />
            )}
          />
          {errors.amount && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              ⚠ {errors.amount.message as string}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Notes
          </label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={4}
                className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                placeholder="Add any additional notes..."
              />
            )}
          />
          {errors.notes && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              ⚠ {errors.notes.message as string}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:scale-105 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 border-2 border-transparent rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : initialData ? (
              'Update Request'
            ) : (
              'Submit Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
