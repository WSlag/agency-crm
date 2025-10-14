/**
 * Stage Management Service
 * 
 * This service handles all business logic for applicant stage management,
 * including stage transitions, approvals, document verification, and
 * commission triggering.
 */

import { 
  ApplicantStage, 
  ApplicantStatus, 
  StageTransition, 
  StageApproval,
  StageHistory,
  DocumentType
} from '../types/applicant';
import { User, UserRole } from '../types';
import { 
  STAGE_CONFIGURATION, 
  VALID_STAGE_TRANSITIONS,
  BRANCH_STAGES,
  HEAD_OFFICE_STAGES,
  getNextStage,
  isTerminalStage
} from '../config/stageConfig';
import { firestore } from '../config/firebase';
import { 
  doc, 
  updateDoc, 
  addDoc, 
  collection, 
  getDoc,
  query,
  where,
  getDocs,
  Timestamp,
  writeBatch 
} from 'firebase/firestore';

class StageService {
  
  /**
   * Check if user can approve stage transition
   */
  canApproveStage(user: User, stage: ApplicantStage, applicant: any): boolean {
    const stageConfig = STAGE_CONFIGURATION[stage];
    
    // Admin can approve any stage
    if (user.role === 'admin') {
      return true;
    }
    
    // Check if user's role is in allowed approvers
    if (!stageConfig.approvers.includes(user.role)) {
      return false;
    }
    
    // Branch Manager can only approve branch stages for their branch
    if (user.role === 'branch_manager') {
      return (
        BRANCH_STAGES.includes(stage) &&
        user.branchId === applicant.branchId
      );
    }
    
    // President can approve transfers
    if (user.role === 'president') {
      return stage === ApplicantStage.TRANSFER;
    }
    
    // HO Recruitment Officer can approve HO stages for assigned applicants
    if (user.role === 'ho_recruitment_officer') {
      return (
        HEAD_OFFICE_STAGES.includes(stage) &&
        applicant.assignedRecruitmentOfficerId === user.uid
      );
    }
    
    return false;
  }
  
  /**
   * Check if user can initiate stage transition
   */
  canInitiateTransition(user: User, fromStage: ApplicantStage, applicant: any): boolean {
    // Use same logic as approval for now
    return this.canApproveStage(user, fromStage, applicant);
  }
  
  /**
   * Validate if stage transition is allowed
   */
  isValidTransition(fromStage: ApplicantStage, toStage: ApplicantStage): boolean {
    const allowedTransitions = VALID_STAGE_TRANSITIONS[fromStage];
    return allowedTransitions.includes(toStage);
  }
  
  /**
   * Check if all required documents are uploaded and verified
   */
  async areDocumentsComplete(
    applicantId: string, 
    stage: ApplicantStage
  ): Promise<{ complete: boolean; missing: string[] }> {
    const stageConfig = STAGE_CONFIGURATION[stage];
    const missing: string[] = [];
    
    if (stageConfig.documents.length === 0) {
      return { complete: true, missing: [] };
    }
    
    // Get all verified documents for this applicant
    const docsRef = collection(firestore, 'documents');
    const q = query(
      docsRef,
      where('applicantId', '==', applicantId),
      where('status', '==', 'verified')
    );
    const snapshot = await getDocs(q);
    const verifiedDocs = snapshot.docs.map(doc => {
      const data = doc.data();
      return data.type || data.documentType; // Handle both new and legacy field names
    });
    
    // Check each requirement
    for (const req of stageConfig.documents) {
      if (req.required || !req.alternatives || req.alternatives.length === 0) {
        // Required document - must have main document
        const hasRequired = verifiedDocs.includes(req.type);
        
        if (!hasRequired) {
          // Check alternatives if available
          if (req.alternatives && req.alternatives.length > 0) {
            const hasAlternative = req.alternatives.some(alt => 
              verifiedDocs.includes(alt)
            );
            if (!hasAlternative) {
              missing.push(req.description);
            }
          } else {
            missing.push(req.description);
          }
        }
      }
    }
    
    return {
      complete: missing.length === 0,
      missing
    };
  }
  
  /**
   * Request stage advancement (creates pending approval)
   */
  async requestStageAdvancement(
    transition: StageTransition,
    user: User
  ): Promise<string> {
    // Validate transition
    if (!this.isValidTransition(transition.fromStage, transition.toStage)) {
      throw new Error(
        `Invalid transition from ${transition.fromStage} to ${transition.toStage}`
      );
    }
    
    // Check document requirements for current stage
    const docCheck = await this.areDocumentsComplete(
      transition.applicantId,
      transition.fromStage
    );
    
    if (!docCheck.complete) {
      throw new Error(
        `Missing required documents: ${docCheck.missing.join(', ')}`
      );
    }
    
    // Get applicant
    const applicantRef = doc(firestore, 'applicants', transition.applicantId);
    const applicantSnap = await getDoc(applicantRef);
    
    if (!applicantSnap.exists()) {
      throw new Error('Applicant not found');
    }
    
    const applicant = { id: applicantSnap.id, ...applicantSnap.data() };
    
    // Check if user can initiate this transition
    const canInitiate = this.canInitiateTransition(user, transition.fromStage, applicant);
    
    if (!canInitiate) {
      throw new Error('You do not have permission to initiate this transition');
    }
    
    // Create stage history entry
    const stageHistoryRef = collection(firestore, 'stage_history');
    const historyDoc = await addDoc(stageHistoryRef, {
      applicantId: transition.applicantId,
      fromStage: transition.fromStage,
      toStage: transition.toStage,
      changedBy: user.uid,
      changedAt: Timestamp.now(),
      approvalRequired: transition.requiresApproval,
      status: transition.requiresApproval ? 'pending' : 'approved',
      notes: transition.notes || '',
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null
    });
    
    // Update applicant status
    const updateData: any = {
      requiresApproval: transition.requiresApproval,
      updatedAt: Timestamp.now()
    };
    
    if (transition.requiresApproval) {
      updateData.currentStatus = ApplicantStatus.PENDING_APPROVAL;
    } else {
      updateData.currentStatus = ApplicantStatus.ACTIVE;
    }
    
    await updateDoc(applicantRef, updateData);
    
    // If no approval required, advance immediately
    if (!transition.requiresApproval) {
      await this.advanceStage(transition.applicantId, transition.toStage, user);
    }
    
    // Create notification
    await this.createStageNotification(
      transition.applicantId,
      transition.toStage,
      applicant,
      user,
      'stage_transition_requested'
    );
    
    return historyDoc.id;
  }
  
  /**
   * Approve or reject stage advancement
   */
  async approveStageAdvancement(
    approval: StageApproval,
    user: User
  ): Promise<void> {
    // Get applicant
    const applicantRef = doc(firestore, 'applicants', approval.applicantId);
    const applicantSnap = await getDoc(applicantRef);
    
    if (!applicantSnap.exists()) {
      throw new Error('Applicant not found');
    }
    
    const applicant = { id: applicantSnap.id, ...applicantSnap.data() };
    
    // Check if user can approve
    if (!this.canApproveStage(user, approval.stage, applicant)) {
      throw new Error('You do not have permission to approve this stage');
    }
    
    // Get pending stage history
    const historyRef = collection(firestore, 'stage_history');
    const q = query(
      historyRef,
      where('applicantId', '==', approval.applicantId),
      where('toStage', '==', approval.stage),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('No pending approval found for this stage');
    }
    
    const historyDoc = snapshot.docs[0];
    
    // Update stage history
    await updateDoc(doc(firestore, 'stage_history', historyDoc.id), {
      status: approval.approved ? 'approved' : 'rejected',
      approvedBy: user.uid,
      approvedAt: Timestamp.now(),
      rejectionReason: approval.rejectionReason || null
    });
    
    if (approval.approved) {
      // Advance to next stage
      await this.advanceStage(
        approval.applicantId,
        approval.stage,
        user
      );
      
      // Create notification
      await this.createStageNotification(
        approval.applicantId,
        approval.stage,
        applicant,
        user,
        'stage_advancement_approved'
      );
    } else {
      // Update applicant status to rejected
      await updateDoc(applicantRef, {
        currentStatus: ApplicantStatus.REJECTED,
        requiresApproval: false,
        rejectionReason: approval.rejectionReason,
        updatedAt: Timestamp.now()
      });
      
      // Create notification
      await this.createStageNotification(
        approval.applicantId,
        approval.stage,
        applicant,
        user,
        'stage_advancement_rejected'
      );
    }
  }
  
  /**
   * Advance applicant to next stage
   */
  private async advanceStage(
    applicantId: string,
    toStage: ApplicantStage,
    user: User
  ): Promise<void> {
    const applicantRef = doc(firestore, 'applicants', applicantId);
    const applicantSnap = await getDoc(applicantRef);
    
    if (!applicantSnap.exists()) {
      throw new Error('Applicant not found');
    }
    
    const applicant = { id: applicantSnap.id, ...applicantSnap.data() };
    
    const updateData: any = {
      currentStageEnum: toStage,
      currentStage: toStage, // Also update legacy field for backward compatibility
      currentStatus: ApplicantStatus.ACTIVE,
      stageEnteredAt: Timestamp.now(),
      stageCompletedAt: null,
      requiresApproval: false,
      updatedAt: Timestamp.now()
    };
    
    // Check if this stage triggers commission
    const stageConfig = STAGE_CONFIGURATION[toStage];
    
    if (stageConfig.commissionTrigger === 'medical') {
      updateData.commissionMedicalTriggered = true;
      updateData.commissionMedicalTriggeredAt = Timestamp.now();
      
      // Create commission record
      await this.triggerCommission(applicantId, 'medical', applicant);
    }
    
    if (stageConfig.commissionTrigger === 'deployed') {
      updateData.commissionDeploymentTriggered = true;
      updateData.commissionDeploymentTriggeredAt = Timestamp.now();
      updateData.currentStatus = ApplicantStatus.DEPLOYED; // Terminal status
      
      // Create commission record
      await this.triggerCommission(applicantId, 'deployed', applicant);
    }
    
    // Update applicant
    await updateDoc(applicantRef, updateData);
    
    // Create notification for relevant users
    await this.createStageNotification(applicantId, toStage, applicant, user, 'stage_advanced');
  }
  
  /**
   * Trigger commission calculation and creation
   */
  private async triggerCommission(
    applicantId: string,
    triggerStage: 'medical' | 'deployed',
    applicant: any
  ): Promise<void> {
    // Only trigger if applicant has an agent
    if (!applicant.agentId) {
      console.log('No agent assigned - skipping commission trigger');
      return;
    }
    
    // Get agent commission rate
    const agentRef = doc(firestore, 'agents', applicant.agentId);
    const agentSnap = await getDoc(agentRef);
    
    if (!agentSnap.exists()) {
      console.error('Agent not found for commission trigger');
      return;
    }
    
    const agent = agentSnap.data();
    const commissionRate = agent.commissionRate || 0;
    
    // Calculate commission amount based on stage
    // Medical: 50% of total commission
    // Deployed: 50% of total commission
    const baseCommission = 10000; // Default base in PHP (can be configured per agent/job)
    const percentage = triggerStage === 'medical' ? 0.5 : 0.5;
    const amount = baseCommission * percentage * (commissionRate / 100);
    
    // Create commission record
    const commissionsRef = collection(firestore, 'commissions');
    await addDoc(commissionsRef, {
      agentId: applicant.agentId,
      applicantId: applicantId,
      branchId: applicant.branchId, // Original branch gets commission
      amount: amount,
      currency: 'PHP',
      triggerStage: triggerStage,
      triggeredAt: Timestamp.now(),
      autoCalculated: true,
      calculationDetails: {
        baseCommission,
        commissionRate,
        percentage,
        stage: triggerStage
      },
      status: 'pending',
      requestedBy: null,
      verifiedBy: null,
      approvedBy: null,
      createdAt: Timestamp.now()
    });
    
    console.log(`✅ Commission triggered for ${triggerStage} stage: ${amount} PHP`);
  }
  
  /**
   * Create notification for stage change
   */
  private async createStageNotification(
    applicantId: string,
    stage: ApplicantStage,
    applicant: any,
    changedBy: User,
    type: string
  ): Promise<void> {
    const notificationsRef = collection(firestore, 'notifications');
    
    // Determine recipients based on stage and notification type
    const recipients: string[] = [];
    
    // Get admin users
    const adminQuery = query(
      collection(firestore, 'users'),
      where('role', '==', 'admin')
    );
    const adminSnapshot = await getDocs(adminQuery);
    adminSnapshot.docs.forEach(doc => recipients.push(doc.id));
    
    // If transfer stage, notify President
    if (stage === ApplicantStage.TRANSFER) {
      const presidentQuery = query(
        collection(firestore, 'users'),
        where('role', '==', 'president')
      );
      const presidentSnapshot = await getDocs(presidentQuery);
      presidentSnapshot.docs.forEach(doc => recipients.push(doc.id));
      
      // Notify assigned HO Recruitment Officer if assigned
      if (applicant.assignedRecruitmentOfficerId) {
        recipients.push(applicant.assignedRecruitmentOfficerId);
      }
    }
    
    // Notify Branch Manager for branch stages
    if (BRANCH_STAGES.includes(stage)) {
      const managerQuery = query(
        collection(firestore, 'users'),
        where('role', '==', 'branch_manager'),
        where('branchId', '==', applicant.branchId)
      );
      const managerSnapshot = await getDocs(managerQuery);
      managerSnapshot.docs.forEach(doc => recipients.push(doc.id));
    }
    
    // Notify HO Recruitment Officer for HO stages
    if (HEAD_OFFICE_STAGES.includes(stage) && applicant.assignedRecruitmentOfficerId) {
      if (!recipients.includes(applicant.assignedRecruitmentOfficerId)) {
        recipients.push(applicant.assignedRecruitmentOfficerId);
      }
    }
    
    // Create notification message based on type
    let title = '';
    let message = '';
    
    switch (type) {
      case 'stage_transition_requested':
        title = `Stage Advancement Requested`;
        message = `${applicant.fullName} - advancement to ${stage} stage has been requested`;
        break;
      case 'stage_advancement_approved':
        title = `Stage Advancement Approved`;
        message = `${applicant.fullName} - advancement to ${stage} stage has been approved by ${changedBy.email}`;
        break;
      case 'stage_advancement_rejected':
        title = `Stage Advancement Rejected`;
        message = `${applicant.fullName} - advancement to ${stage} stage has been rejected by ${changedBy.email}`;
        break;
      case 'stage_advanced':
        title = `Applicant Advanced to ${stage}`;
        message = `${applicant.fullName} has been advanced to ${stage} stage by ${changedBy.email}`;
        break;
      default:
        title = `Stage Update`;
        message = `${applicant.fullName} - stage ${stage}`;
    }
    
    // Create notification for each unique recipient
    const uniqueRecipients = [...new Set(recipients)].filter(r => r !== changedBy.uid);
    
    for (const recipientId of uniqueRecipients) {
      try {
        await addDoc(notificationsRef, {
          userId: recipientId,
          type: type,
          title: title,
          message: message,
          data: {
            applicantId,
            stage,
            applicantName: applicant.fullName,
            changedBy: changedBy.uid
          },
          read: false,
          createdAt: Timestamp.now()
        });
      } catch (error) {
        console.error(`Failed to create notification for ${recipientId}:`, error);
      }
    }
  }
  
  /**
   * Get pending approvals for user
   */
  async getPendingApprovals(user: User): Promise<any[]> {
    const historyRef = collection(firestore, 'stage_history');
    
    // Get all pending approvals
    const q = query(historyRef, where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    
    const approvals = [];
    
    for (const historyDoc of snapshot.docs) {
      const data = historyDoc.data();
      
      // Get applicant details
      const applicantRef = doc(firestore, 'applicants', data.applicantId);
      const applicantSnap = await getDoc(applicantRef);
      
      if (applicantSnap.exists()) {
        const applicant = { id: applicantSnap.id, ...applicantSnap.data() };
        
        // Check if user can approve
        if (this.canApproveStage(user, data.toStage as ApplicantStage, applicant)) {
          approvals.push({
            id: historyDoc.id,
            ...data,
            applicant
          });
        }
      }
    }
    
    return approvals;
  }
  
  /**
   * Get stage history for an applicant
   */
  async getStageHistory(applicantId: string): Promise<StageHistory[]> {
    const historyRef = collection(firestore, 'stage_history');
    const q = query(
      historyRef,
      where('applicantId', '==', applicantId)
    );
    
    const snapshot = await getDocs(q);
    const history: StageHistory[] = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      history.push({
        id: doc.id,
        applicantId: data.applicantId,
        fromStage: data.fromStage,
        toStage: data.toStage,
        changedBy: data.changedBy,
        changedAt: data.changedAt?.toDate(),
        approvalRequired: data.approvalRequired,
        approvedBy: data.approvedBy,
        approvedAt: data.approvedAt?.toDate(),
        status: data.status,
        rejectionReason: data.rejectionReason,
        notes: data.notes
      });
    });
    
    // Sort by date
    history.sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());
    
    return history;
  }
}

export const stageService = new StageService();

