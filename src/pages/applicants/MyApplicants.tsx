import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplicantTable } from '../../components/applicants/list/ApplicantTable';
import { useApplicantStore } from '../../stores/applicantStore';
import { useBranchStore } from '../../stores/branchStore';
import { useOfficerStore } from '../../stores/officerStore';
import { useAuth } from '../../contexts/AuthContext';
import { ApplicantFilter, ApplicantSort } from '../../types/applicant';
import { UserGroupIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * MyApplicants - HO Recruitment Officer dedicated page
 * Shows ONLY applicants assigned to the logged-in officer
 * Security: Enforces assignedRecruitmentOfficerId filter
 */
export const MyApplicants = () => {
  const navigate = useNavigate();
  const { user, customClaims } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    applicants,
    loading,
    error,
    filter,
    sort,
    pagination,
    setFilter,
    setSort,
    setPagination,
    fetchApplicants,
    deleteApplicant,
  } = useApplicantStore();

  const { branches, loading: branchesLoading, fetchBranches } = useBranchStore();
  const { officers, loading: officersLoading, fetchActiveOfficers } = useOfficerStore();

  // SECURITY: Redirect if not HO Recruitment Officer
  useEffect(() => {
    if (customClaims?.role && customClaims.role !== 'ho_recruitment_officer') {
      console.warn('Unauthorized access to My Applicants - redirecting');
      navigate('/dashboard');
    }
  }, [customClaims, navigate]);

  // Load initial data and enforce security filter
  useEffect(() => {
    const loadData = async () => {
      if (!user || !customClaims || customClaims.role !== 'ho_recruitment_officer') {
        return;
      }

      try {
        console.log('🔒 [MyApplicants] Loading assigned applicants for officer:', user.uid);
        
        // Load reference data
        await Promise.all([
          fetchBranches(),
          fetchActiveOfficers()
        ]);

        // SECURITY: Always filter by assigned officer ID
        const secureFilter: ApplicantFilter = {
          assignedOfficerId: user.uid, // Only show MY assigned applicants
        };
        
        console.log('🔒 [MyApplicants] Applying security filter:', secureFilter);
        setFilter(secureFilter);
        setIsInitialized(true);
        
        // Fetch applicants with security filter
        await fetchApplicants();
        console.log('✅ [MyApplicants] Assigned applicants loaded successfully');
      } catch (error) {
        console.error('❌ [MyApplicants] Error loading data:', error);
      }
    };

    if (!isInitialized) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, customClaims, isInitialized]);

  // Fetch applicants when filters or sort change
  useEffect(() => {
    if (isInitialized && filter.assignedOfficerId) {
      fetchApplicants();
    }
  }, [filter, sort, fetchApplicants, isInitialized]);

  const handleFilterChange = (key: keyof ApplicantFilter, value: any) => {
    console.log('🔒 [MyApplicants] Filter change:', { key, value });
    
    // SECURITY: Prevent removing assignedOfficerId filter
    if (key === 'assignedOfficerId') {
      console.warn('🔒 Cannot remove assigned officer filter');
      return;
    }
    
    const newFilters = { ...filter };
    
    if (value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    // SECURITY: Always keep assignedOfficerId filter
    if (user?.uid) {
      newFilters.assignedOfficerId = user.uid;
    }
    
    console.log('🔒 [MyApplicants] New filters (with security):', newFilters);
    setFilter(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  const handleSortChange = (newSort: ApplicantSort) => {
    console.log('Applying sort:', newSort);
    setSort(newSort);
  };

  const handleView = (id: string) => {
    navigate(`/my-applicants/${id}`);
  };

  const handleEdit = (id: string) => {
    // HO Officers should not edit applicants
    console.warn('🔒 HO Officers cannot edit applicants');
    alert('You do not have permission to edit applicants.');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this applicant?')) {
      try {
        await deleteApplicant(id);
        await fetchApplicants();
      } catch (error) {
        console.error('Failed to delete applicant:', error);
        alert('Failed to delete applicant. Please try again.');
      }
    }
  };

  // Show loading state
  if (loading && !isInitialized) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Assigned Applicants</h1>
              <p className="text-sm text-gray-500 mt-1">
                Applicants assigned to you for recruitment processing
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-indigo-600">{applicants.length}</p>
            <p className="text-sm text-gray-500">Total Assigned</p>
          </div>
        </div>
      </div>

      {/* Applicant Table */}
      <ApplicantTable
        applicants={applicants}
        sort={sort}
        onSortChange={handleSortChange}
        isAdmin={false}
        onDelete={handleDelete}
        basePath="/my-applicants" // Use dedicated HO Officer route
      />
    </div>
  );
};

