/**
 * Stage Configuration
 * 
 * This file defines the recruitment pipeline stages, their requirements,
 * approvers, document requirements, and commission triggers.
 */

import { 
  ApplicantStage, 
  DocumentType, 
  StageRequirement,
  DocumentRequirement 
} from '../types/applicant';

// ==================== Document Requirements by Stage ====================

const INTERVIEW_DOCUMENTS: DocumentRequirement[] = [
  {
    type: DocumentType.PASSPORT,
    required: true, // At least one of these is required
    alternatives: [DocumentType.NBI_CLEARANCE, DocumentType.BARANGAY_CERT],
    description: 'Passport OR NBI Clearance OR Barangay Certificate'
  }
];

const MEDICAL_DOCUMENTS: DocumentRequirement[] = [
  {
    type: DocumentType.MEDICAL_CERT,
    required: true,
    description: 'Medical Certificate (Required)'
  }
];

const PROCESSING_DOCUMENTS: DocumentRequirement[] = [
  {
    type: DocumentType.TESDA_CERT,
    required: true, // At least one of these is required
    alternatives: [DocumentType.OWWA],
    description: 'TESDA Certificate OR OWWA'
  }
];

const SELECTED_DOCUMENTS: DocumentRequirement[] = [
  {
    type: DocumentType.EMPLOYMENT_CONTRACT,
    required: true,
    description: 'Employment Contract (Required)'
  }
];

const DEPLOYED_DOCUMENTS: DocumentRequirement[] = [
  {
    type: DocumentType.PDOS,
    required: true,
    alternatives: [DocumentType.PLANE_TICKET],
    description: 'PDOS OR Plane Ticket'
  }
];

// ==================== Stage Configuration ====================

/**
 * Complete stage configuration mapping
 */
export const STAGE_CONFIGURATION: Record<ApplicantStage, StageRequirement> = {
  [ApplicantStage.REGISTRATION]: {
    stage: ApplicantStage.REGISTRATION,
    documents: [],
    approvers: ['admin', 'branch_manager'], // Branch Manager can approve
    autoAdvance: false // Requires approval (Branch Manager can self-approve)
  },
  
  [ApplicantStage.INTERVIEW]: {
    stage: ApplicantStage.INTERVIEW,
    documents: INTERVIEW_DOCUMENTS,
    approvers: ['admin', 'ho_recruitment_officer'], // HO Officer can approve
    autoAdvance: false // Requires manual approval
  },
  
  [ApplicantStage.MEDICAL]: {
    stage: ApplicantStage.MEDICAL,
    documents: MEDICAL_DOCUMENTS,
    approvers: ['admin', 'ho_recruitment_officer'], // HO Officer can approve
    autoAdvance: false
  },
  
  [ApplicantStage.TRANSFER]: {
    stage: ApplicantStage.TRANSFER,
    documents: [],
    approvers: ['admin', 'president'], // Only Admin/President can approve and assign HO Officer
    commissionTrigger: 'medical', // 1st commission trigger - when transferred to HO
    autoAdvance: false // Requires Admin/President approval and officer assignment
  },
  
  [ApplicantStage.PROCESSING]: {
    stage: ApplicantStage.PROCESSING,
    documents: PROCESSING_DOCUMENTS,
    approvers: ['admin', 'president'], // Admin/President approve (HO Officer removed)
    autoAdvance: false
  },
  
  [ApplicantStage.SELECTED]: {
    stage: ApplicantStage.SELECTED,
    documents: SELECTED_DOCUMENTS,
    approvers: ['admin', 'president'], // Admin/President approve (HO Officer removed)
    autoAdvance: false
  },
  
  [ApplicantStage.DEPLOYED]: {
    stage: ApplicantStage.DEPLOYED,
    documents: DEPLOYED_DOCUMENTS,
    approvers: ['admin', 'president'], // Admin/President approve (HO Officer removed)
    commissionTrigger: 'deployed',
    autoAdvance: false // Requires document verification
  }
};

// ==================== Stage Transition Rules ====================

/**
 * Valid stage transitions - defines the allowed flow
 */
export const VALID_STAGE_TRANSITIONS: Record<ApplicantStage, ApplicantStage[]> = {
  [ApplicantStage.REGISTRATION]: [ApplicantStage.INTERVIEW],
  [ApplicantStage.INTERVIEW]: [ApplicantStage.MEDICAL],
  [ApplicantStage.MEDICAL]: [ApplicantStage.TRANSFER],
  [ApplicantStage.TRANSFER]: [ApplicantStage.PROCESSING],
  [ApplicantStage.PROCESSING]: [ApplicantStage.SELECTED],
  [ApplicantStage.SELECTED]: [ApplicantStage.DEPLOYED],
  [ApplicantStage.DEPLOYED]: [] // Terminal stage - no further transitions
};

// ==================== Stage Grouping ====================

/**
 * Stages managed by Branch
 */
export const BRANCH_STAGES: ApplicantStage[] = [
  ApplicantStage.REGISTRATION,
  ApplicantStage.INTERVIEW,
  ApplicantStage.MEDICAL
];

/**
 * Stages managed by Head Office
 */
export const HEAD_OFFICE_STAGES: ApplicantStage[] = [
  ApplicantStage.PROCESSING,
  ApplicantStage.SELECTED,
  ApplicantStage.DEPLOYED
];

/**
 * The transition stage between Branch and Head Office
 */
export const TRANSITION_STAGE = ApplicantStage.TRANSFER;

/**
 * Terminal stages where applicant journey ends
 */
export const TERMINAL_STAGES: ApplicantStage[] = [
  ApplicantStage.DEPLOYED
];

// ==================== Stage Display Configuration ====================

/**
 * Human-readable labels for each stage
 */
export const STAGE_LABELS: Record<ApplicantStage, string> = {
  [ApplicantStage.REGISTRATION]: 'Registration',
  [ApplicantStage.INTERVIEW]: 'Interview',
  [ApplicantStage.MEDICAL]: 'Medical',
  [ApplicantStage.TRANSFER]: 'Transfer to HO',
  [ApplicantStage.PROCESSING]: 'Processing',
  [ApplicantStage.SELECTED]: 'Selected',
  [ApplicantStage.DEPLOYED]: 'Deployed'
};

/**
 * Stage descriptions
 */
export const STAGE_DESCRIPTIONS: Record<ApplicantStage, string> = {
  [ApplicantStage.REGISTRATION]: 'Initial applicant registration with agent or direct hire',
  [ApplicantStage.INTERVIEW]: 'Interview stage with identification document verification',
  [ApplicantStage.MEDICAL]: 'Medical examination and certificate verification',
  [ApplicantStage.TRANSFER]: 'Transfer from Branch to Head Office (1st commission trigger)',
  [ApplicantStage.PROCESSING]: 'Processing stage with certificates verification',
  [ApplicantStage.SELECTED]: 'Applicant selected by employer - employment contract and employer details required',
  [ApplicantStage.DEPLOYED]: 'Successfully deployed (2nd commission trigger)'
};

/**
 * Stage colors for UI (Tailwind classes)
 */
export const STAGE_COLORS: Record<ApplicantStage, string> = {
  [ApplicantStage.REGISTRATION]: 'bg-gray-100 text-gray-800',
  [ApplicantStage.INTERVIEW]: 'bg-blue-100 text-blue-800',
  [ApplicantStage.MEDICAL]: 'bg-purple-100 text-purple-800',
  [ApplicantStage.TRANSFER]: 'bg-yellow-100 text-yellow-800',
  [ApplicantStage.PROCESSING]: 'bg-orange-100 text-orange-800',
  [ApplicantStage.SELECTED]: 'bg-indigo-100 text-indigo-800',
  [ApplicantStage.DEPLOYED]: 'bg-green-100 text-green-800'
};

// ==================== Helper Functions ====================

/**
 * Check if a stage requires approval
 */
export function stageRequiresApproval(stage: ApplicantStage): boolean {
  return !STAGE_CONFIGURATION[stage].autoAdvance;
}

/**
 * Check if a stage triggers commission
 */
export function stageTriggersCommission(stage: ApplicantStage): boolean {
  return STAGE_CONFIGURATION[stage].commissionTrigger !== undefined;
}

/**
 * Get commission trigger type for a stage
 */
export function getCommissionTrigger(stage: ApplicantStage): 'medical' | 'deployed' | null {
  return STAGE_CONFIGURATION[stage].commissionTrigger || null;
}

/**
 * Check if stage is managed by branch
 */
export function isBranchStage(stage: ApplicantStage): boolean {
  return BRANCH_STAGES.includes(stage);
}

/**
 * Check if stage is managed by head office
 */
export function isHeadOfficeStage(stage: ApplicantStage): boolean {
  return HEAD_OFFICE_STAGES.includes(stage);
}

/**
 * Check if stage is terminal
 */
export function isTerminalStage(stage: ApplicantStage): boolean {
  return TERMINAL_STAGES.includes(stage);
}

/**
 * Get next stage in the pipeline
 */
export function getNextStage(currentStage: ApplicantStage): ApplicantStage | null {
  const nextStages = VALID_STAGE_TRANSITIONS[currentStage];
  return nextStages.length > 0 ? nextStages[0] : null;
}

/**
 * Get all stages in order
 */
export function getAllStagesInOrder(): ApplicantStage[] {
  return [
    ApplicantStage.REGISTRATION,
    ApplicantStage.INTERVIEW,
    ApplicantStage.MEDICAL,
    ApplicantStage.TRANSFER,
    ApplicantStage.PROCESSING,
    ApplicantStage.SELECTED,
    ApplicantStage.DEPLOYED
  ];
}

/**
 * Get stage index (for progress calculation)
 */
export function getStageIndex(stage: ApplicantStage): number {
  return getAllStagesInOrder().indexOf(stage);
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(currentStage: ApplicantStage): number {
  const stages = getAllStagesInOrder();
  const currentIndex = getStageIndex(currentStage);
  return Math.round(((currentIndex + 1) / stages.length) * 100);
}

