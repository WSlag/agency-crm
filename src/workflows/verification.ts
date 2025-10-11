import { z } from 'zod';
import { Document } from '../types/entities/document';
import { DocumentService } from '../services/documents/documentService';

// Validation schemas
const uploadSchema = z.object({
  file: z.any(),
  metadata: z.object({
    type: z.enum([
      'passport',
      'nbi_clearance',
      'barangay_cert',
      'medical_cert',
      'tesda_cert',
      'owwa',
      'employment_contract',
      'pdos',
      'plane_ticket'
    ]),
    applicantId: z.string(),
    expiryDate: z.date().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

const assignmentSchema = z.object({
  documentId: z.string(),
  verifierId: z.string(),
});

const reviewSchema = z.object({
  documentId: z.string(),
  status: z.enum(['verified', 'rejected']),
  comments: z.string(),
  verifierId: z.string(),
});

// Step handlers
const handleUpload = async (data: z.infer<typeof uploadSchema>) => {
  const documentService = new DocumentService();
  return await documentService.uploadDocument(data.file, data.metadata);
};

const handleAssignment = async (data: z.infer<typeof assignmentSchema>) => {
  const documentService = new DocumentService();
  await documentService.verifyDocument(data.documentId, {
    status: 'pending',
    verifiedBy: data.verifierId,
    verifiedAt: new Date(),
    comments: 'Assigned for verification',
  });
};

const handleReview = async (data: z.infer<typeof reviewSchema>) => {
  const documentService = new DocumentService();
  await documentService.verifyDocument(data.documentId, {
    status: data.status,
    verifiedBy: data.verifierId,
    verifiedAt: new Date(),
    comments: data.comments,
  });
};

// Workflow definition
export interface VerificationStep {
  type: 'upload' | 'assign' | 'review' | 'approve' | 'reject';
  handler: (data: any) => Promise<void>;
  validation: z.ZodSchema;
}

export interface VerificationWorkflow {
  steps: VerificationStep[];
  currentStep?: number;
  documentId?: string;
}

export const verificationWorkflow: VerificationWorkflow = {
  steps: [
    { type: 'upload', handler: handleUpload, validation: uploadSchema },
    { type: 'assign', handler: handleAssignment, validation: assignmentSchema },
    { type: 'review', handler: handleReview, validation: reviewSchema }
  ]
};

// Workflow executor
export class VerificationWorkflowExecutor {
  private workflow: VerificationWorkflow;
  private currentStep: number;

  constructor(workflow: VerificationWorkflow) {
    this.workflow = workflow;
    this.currentStep = 0;
  }

  async executeStep(data: any): Promise<void> {
    const step = this.workflow.steps[this.currentStep];
    
    // Validate input data
    const validationResult = step.validation.safeParse(data);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }

    // Execute step handler
    await step.handler(data);

    // Move to next step
    this.currentStep++;
  }

  async executeWorkflow(data: any[]): Promise<void> {
    for (const stepData of data) {
      await this.executeStep(stepData);
    }
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  isComplete(): boolean {
    return this.currentStep >= this.workflow.steps.length;
  }

  reset(): void {
    this.currentStep = 0;
  }
}
