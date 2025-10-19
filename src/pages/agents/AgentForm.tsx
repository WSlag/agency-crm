import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAgentStore } from '../../stores/agentStore';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { CreateAgentData } from '../../types/agent';

export const AgentForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customClaims } = useAuth();
  const { selectedAgent, loading, error, fetchAgentById, createAgent, updateAgent } = useAgentStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateAgentData>({
    agentName: '',
    email: '',
    contactNumber: '',
    address: '',
    branchId: '',  // Will be set in useEffect after customClaims load
    commissionAmount: undefined as any,
    licenseNumber: '',
    licenseExpiry: undefined,
    status: 'active',
  });

  const isEdit = Boolean(id);

  // Set branchId from customClaims once loaded
  useEffect(() => {
    if (customClaims?.branchId && !isEdit) {
      setFormData(prev => ({ ...prev, branchId: customClaims.branchId! }));
      console.log('✅ Agent Form: Branch ID set from custom claims:', customClaims.branchId);
    } else if (customClaims?.role === 'branch_manager' && !customClaims?.branchId) {
      console.error('❌ Agent Form: Branch Manager has no branchId in custom claims!');
    }
  }, [customClaims, isEdit]);

  useEffect(() => {
    if (id) {
      fetchAgentById(id);
    }
  }, [id]);

  useEffect(() => {
    if (selectedAgent && id) {
      setFormData({
        agentName: selectedAgent.agentName,
        email: selectedAgent.email,
        contactNumber: selectedAgent.contactNumber,
        address: selectedAgent.address,
        branchId: selectedAgent.branchId,
        commissionAmount: selectedAgent.commissionAmount || 0,
        licenseNumber: selectedAgent.licenseNumber || '',
        licenseExpiry: selectedAgent.licenseExpiry,
        status: selectedAgent.status,
      });
    }
  }, [selectedAgent, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'commissionAmount' 
        ? (value === '' ? undefined : parseFloat(value)) 
        : value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      licenseExpiry: value ? new Date(value) : undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setIsSaving(true);

    // Validate commission amount
    if (formData.commissionAmount === undefined || formData.commissionAmount < 0) {
      setSaveError('Please enter a valid commission amount');
      setIsSaving(false);
      return;
    }

    try {
      if (isEdit && id) {
        await updateAgent(id, formData);
        navigate(`/agents/${id}`);
      } else {
        const newId = await createAgent(formData);
        navigate(`/agents/${newId}`);
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save agent');
    } finally {
      setIsSaving(false);
    }
  };

  const canManage = customClaims?.role === 'admin' || customClaims?.role === 'branch_manager';

  if (!canManage) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
            <p className="text-red-800">You don't have permission to manage agents.</p>
            <Link to="/agents" className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium">
              Back to Agents
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading && isEdit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading agent...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Link
              to="/agents"
              className="inline-flex items-center text-white hover:text-teal-100"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Agents
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {isEdit ? 'Edit Agent' : 'Add New Agent'}
          </h1>
          <p className="mt-2 text-teal-100">
            {isEdit ? 'Update agent information and commission amount' : 'Create a new agent profile'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-6">
              {(saveError || error) && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{saveError || error}</p>
                </div>
              )}

              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="agentName" className="block text-sm font-medium text-gray-700">
                      Agent Name *
                    </label>
                    <input
                      type="text"
                      id="agentName"
                      name="agentName"
                      required
                      value={formData.agentName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      required
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      required
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Work Details */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Work Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="branchId" className="block text-sm font-medium text-gray-700">
                      Branch ID *
                    </label>
                    <input
                      type="text"
                      id="branchId"
                      name="branchId"
                      required
                      value={formData.branchId}
                      onChange={handleChange}
                      disabled={customClaims?.role === 'branch_manager'}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="commissionAmount" className="block text-sm font-medium text-gray-700">
                      Commission Amount *
                    </label>
                    <input
                      type="number"
                      id="commissionAmount"
                      name="commissionAmount"
                      required
                      min="0"
                      step="0.01"
                      value={formData.commissionAmount ?? ''}
                      onChange={handleChange}
                      placeholder="Enter commission amount"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                      License Number
                    </label>
                    <input
                      type="text"
                      id="licenseNumber"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="licenseExpiry" className="block text-sm font-medium text-gray-700">
                      License Expiry Date
                    </label>
                    <input
                      type="date"
                      id="licenseExpiry"
                      name="licenseExpiry"
                      value={formData.licenseExpiry ? formData.licenseExpiry.toISOString().split('T')[0] : ''}
                      onChange={handleDateChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status *
                    </label>
                    <select
                      id="status"
                      name="status"
                      required
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
              <Link
                to={isEdit ? `/agents/${id}` : '/agents'}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <XMarkIcon className="h-5 w-5 mr-2" />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    {isEdit ? 'Update Agent' : 'Create Agent'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

