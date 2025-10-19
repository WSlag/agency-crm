import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplicantTable } from '../../components/applicants/list/ApplicantTable';
import { useApplicantStore } from '../../stores/applicantStore';
import { useBranchStore } from '../../stores/branchStore';
import { useOfficerStore } from '../../stores/officerStore';
import { useAuth } from '../../contexts/AuthContext';
import { ApplicantFilter, ApplicantSort } from '../../types/applicant';
import { UserGroupIcon, ExclamationTriangleIcon, SparklesIcon } from '@heroicons/react/24/outline';

/**
 * AllHOApplicants - Shared applicant pool for all HO Recruitment Officers
 * Shows ONLY unassigned applicants (those without assignedRecruitmentOfficerId)
 * Purpose: Collaborative work on Interview/Medical stages before individual assignment
 */
export const AllHOApplicants = () => {
  const navigate = useNavigate();
  const { user, customClaims } = useAuth();
  const {
    applicants,
    loading,
    error,
    filter,
    sort,
    setFilter,
    setSort,
    fetchApplicants,
    deleteApplicant,
  } = useApplicantStore();

  const { branches, loading: branchesLoading, fetchBranches } = useBranchStore();
  const { officers, loading: officersLoading, fetchActiveOfficers } = useOfficerStore();

  // Security check
  useEffect(() => {
    if (customClaims?.role && customClaims.role !== 'ho_recruitment_officer') {
      console.warn('🔒 Non-HO Officer redirected from All HO Applicants');
      navigate('/dashboard', { replace: true });
    }
  }, [customClaims, navigate]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Loading All HO Applicants data...');
        
        // Load branches and officers
        if (branches.length === 0) {
          await fetchBranches();
        }
        if (officers.length === 0) {
          await fetchActiveOfficers();
        }
        
        console.log('✅ Reference data loaded');
      } catch (error) {
        console.error('❌ Error loading reference data:', error);
      }
    };
    
    loadData();
  }, [branches.length, officers.length, fetchBranches, fetchActiveOfficers]);

  // Set filter for unassigned applicants and fetch data
  useEffect(() => {
    const loadUnassignedApplicants = async () => {
      if (user?.uid) {
        // Filter for applicants WITHOUT assigned officer (shared pool)
        // These are applicants that haven't been transferred to HO yet
        setFilter({ 
          assignedOfficerId: null, // This will query for unassigned applicants
          status: 'active', // Only show active applicants
          transferredToHO: false // Only show applicants not yet transferred to HO
        });
        console.log('🔍 Filter set for unassigned applicants (shared pool)');
        
        // Fetch applicants with the new filter
        await fetchApplicants();
        console.log('✅ Unassigned applicants loaded');
      }
    };
    
    loadUnassignedApplicants();
  }, [user?.uid, setFilter, fetchApplicants]);

  const handleSortChange = (newSort: ApplicantSort) => {
    console.log('Applying sort:', newSort);
    setSort(newSort);
  };

  const handleView = (id: string) => {
    navigate(`/ho-applicants/all/${id}`);
  };

  const handleEdit = (id: string) => {
    // HO Officers should not edit applicants
    console.warn('🔒 HO Officers cannot edit applicants');
    alert('You do not have permission to edit applicants.');
  };

  const handleDelete = async (id: string) => {
    // HO Officers should not delete applicants
    console.warn('🔒 HO Officers cannot delete applicants');
    alert('You do not have permission to delete applicants.');
  };

  if (loading || branchesLoading || officersLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading shared applicants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading applicants</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="h-10 w-10 text-white" />
                <h1 className="text-3xl font-bold text-white">All Applicants</h1>
              </div>
              <p className="mt-2 text-indigo-100">
                Shared pool of unassigned applicants for all HO Recruitment Officers
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 border-2 border-white/30">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{applicants.length}</p>
                <p className="text-sm text-indigo-100 mt-1">Total Unassigned</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Applicant Table */}
        <ApplicantTable
          applicants={applicants}
          sort={sort}
          onSortChange={handleSortChange}
          isAdmin={false}
          onDelete={handleDelete}
          basePath="/ho-applicants/all" // Use dedicated route for shared pool
        />
      </div>
    </div>
  );
};

