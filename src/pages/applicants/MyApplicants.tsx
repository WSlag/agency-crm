import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApplicantTable } from '../../components/applicants/list/ApplicantTable';
import { useApplicantStore } from '../../stores/applicantStore';
import { useBranchStore } from '../../stores/branchStore';
import { useOfficerStore } from '../../stores/officerStore';
import { useAuth } from '../../contexts/AuthContext';
import { ApplicantFilter, ApplicantSort } from '../../types/applicant';
import { UserGroupIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../config/firebase';

/**
 * MyApplicants - HO Recruitment Officer dedicated page
 * Shows ONLY applicants assigned to the logged-in officer
 * Security: Enforces assignedRecruitmentOfficerId filter
 * Admin/Manager View: Can view any officer's applicants via ?officer=uid query param
 */
export const MyApplicants = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, customClaims } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [officerName, setOfficerName] = useState<string>('');
  const [currentOfficerId, setCurrentOfficerId] = useState<string | null>(null);
  
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
  } = useApplicantStore();

  const { branches, loading: branchesLoading, fetchBranches } = useBranchStore();
  const { officers, loading: officersLoading, fetchActiveOfficers } = useOfficerStore();

  // Get officer ID from query parameter (for admin view)
  const officerIdParam = searchParams.get('officer');
  const isAdminView = (customClaims?.role === 'admin' || customClaims?.role === 'president') && officerIdParam;

  // SECURITY: Redirect if not authorized
  useEffect(() => {
    if (customClaims?.role) {
      const isAuthorized = 
        customClaims.role === 'ho_recruitment_officer' || 
        customClaims.role === 'admin' || 
        customClaims.role === 'president';
      
      if (!isAuthorized) {
        console.warn('Unauthorized access to My Applicants - redirecting');
        navigate('/dashboard');
      }
    }
  }, [customClaims, navigate]);

  // Load initial data and enforce security filter
  useEffect(() => {
    const loadData = async () => {
      if (!user || !customClaims) {
        return;
      }

      try {
        // Determine which officer's applicants to show
        const targetOfficerId = isAdminView ? officerIdParam : user.uid;
        
        console.log('🔒 [MyApplicants] Loading assigned applicants for officer:', targetOfficerId);
        console.log('📋 [MyApplicants] Is admin view:', isAdminView);
        
        // Load reference data
        await Promise.all([
          fetchBranches(),
          fetchActiveOfficers()
        ]);

        // Fetch officer name if viewing another officer's applicants
        if (isAdminView && officerIdParam) {
          try {
            const officersQuery = query(
              collection(firestore, 'users'),
              where('role', '==', 'ho_recruitment_officer')
            );
            const snapshot = await getDocs(officersQuery);
            const officer = snapshot.docs.find(doc => doc.id === officerIdParam);
            if (officer) {
              setOfficerName(officer.data().displayName || officer.data().email || 'Unknown Officer');
            }
          } catch (err) {
            console.error('Error fetching officer name:', err);
          }
        }

        // SECURITY: Filter by assigned officer ID
        const secureFilter: ApplicantFilter = {
          assignedOfficerId: targetOfficerId, // Show assigned applicants for target officer
        };
        
        console.log('🔒 [MyApplicants] Applying security filter:', secureFilter);
        setFilter(secureFilter);
        setCurrentOfficerId(targetOfficerId);
        setIsInitialized(true);
        
        // Fetch applicants with security filter
        await fetchApplicants();
        console.log('✅ [MyApplicants] Assigned applicants loaded successfully');
      } catch (error) {
        console.error('❌ [MyApplicants] Error loading data:', error);
      }
    };

    // Determine which officer we should be viewing
    const targetOfficerId = isAdminView ? officerIdParam : user?.uid;
    
    // Load data if not initialized OR if the officer ID has changed
    if (!isInitialized || currentOfficerId !== targetOfficerId) {
      console.log('🔄 [MyApplicants] Loading data for officer:', targetOfficerId);
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, customClaims, officerIdParam]);

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
    const targetOfficerId = isAdminView ? officerIdParam : user?.uid;
    if (targetOfficerId) {
      newFilters.assignedOfficerId = targetOfficerId;
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
              <h1 className="text-2xl font-bold text-gray-900">
                {isAdminView ? `${officerName}'s Assigned Applicants` : 'My Assigned Applicants'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isAdminView 
                  ? `Viewing applicants assigned to ${officerName}` 
                  : 'Applicants assigned to you for recruitment processing'}
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
        isAdmin={false} // Disable delete button to prevent accidental deletions
        basePath="/my-applicants" // Use dedicated HO Officer route
      />
    </div>
  );
};

