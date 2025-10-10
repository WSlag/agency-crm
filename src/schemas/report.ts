import { z } from 'zod';

export const reportFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  branchId: z.string().optional(),
  agentId: z.string().optional(),
  applicantId: z.string().optional(),
  officerId: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']).optional(),
});

export const reportTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum([
    'applicant',
    'commission',
    'expense',
    'deployment',
    'transfer',
    'agent',
    'branch',
    'officer',
  ]),
  filters: reportFilterSchema,
  columns: z.array(z.string()),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const reportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum([
    'applicant',
    'commission',
    'expense',
    'deployment',
    'transfer',
    'agent',
    'branch',
    'officer',
  ]),
  filters: reportFilterSchema,
  format: z.enum(['pdf', 'excel', 'csv']),
});

export const reportScheduleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  reportType: z.enum([
    'applicant',
    'commission',
    'expense',
    'deployment',
    'transfer',
    'agent',
    'branch',
    'officer',
  ]),
  templateId: z.string(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  recipients: z.array(z.string().email('Invalid email address')),
  enabled: z.boolean(),
});

export const reportMetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  previousValue: z.number().optional(),
  change: z.number().optional(),
  changeType: z.enum(['increase', 'decrease', 'no_change']).optional(),
  trend: z.array(z.number()).optional(),
});

export const dashboardMetricsSchema = z.object({
  applicants: z.object({
    total: reportMetricSchema,
    pending: reportMetricSchema,
    deployed: reportMetricSchema,
    transferRequests: reportMetricSchema,
  }),
  expenses: z.object({
    total: reportMetricSchema,
    pending: reportMetricSchema,
    approved: reportMetricSchema,
    byType: z.record(reportMetricSchema),
  }),
  commissions: z.object({
    total: reportMetricSchema,
    pending: reportMetricSchema,
    paid: reportMetricSchema,
    byType: z.record(reportMetricSchema),
  }),
  transfers: z.object({
    total: reportMetricSchema,
    pending: reportMetricSchema,
    approved: reportMetricSchema,
    byBranch: z.record(reportMetricSchema),
  }),
  officers: z.object({
    total: reportMetricSchema,
    activeAssignments: reportMetricSchema,
    averageWorkload: reportMetricSchema,
    byPerformance: z.record(reportMetricSchema),
  }),
});

export const applicantReportSchema = z.object({
  applicant: z.any(), // Define specific applicant schema
  agent: z.any().optional(), // Define specific agent schema
  branch: z.any(), // Define specific branch schema
  assignedOfficer: z.string().optional(),
  expenses: z.array(z.any()), // Define specific expense schema
  commissions: z.array(z.any()), // Define specific commission schema
  documents: z.array(
    z.object({
      type: z.string(),
      status: z.string(),
      uploadedAt: z.date(),
      verifiedAt: z.date().optional(),
    })
  ),
  timeline: z.array(
    z.object({
      stage: z.string(),
      enteredAt: z.date(),
      completedAt: z.date().optional(),
      duration: z.number(),
    })
  ),
  transfer: z
    .object({
      requestedAt: z.date(),
      approvedAt: z.date().optional(),
      assignedAt: z.date().optional(),
      fromBranch: z.string(),
      toBranch: z.string(),
      assignedOfficer: z.string().optional(),
    })
    .optional(),
});

export const commissionReportSchema = z.object({
  agent: z.any(), // Define specific agent schema
  branch: z.any(), // Define specific branch schema
  commissions: z.array(z.any()), // Define specific commission schema
  summary: z.object({
    totalAmount: z.number(),
    paidAmount: z.number(),
    pendingAmount: z.number(),
    byType: z.record(z.number()),
    byMonth: z.record(z.number()),
  }),
  performance: z.object({
    applicantCount: z.number(),
    deploymentRate: z.number(),
    averageProcessingTime: z.number(),
  }),
});

export const expenseReportSchema = z.object({
  branch: z.any(), // Define specific branch schema
  expenses: z.array(z.any()), // Define specific expense schema
  summary: z.object({
    totalAmount: z.number(),
    approvedAmount: z.number(),
    pendingAmount: z.number(),
    byType: z.record(z.number()),
    byMonth: z.record(z.number()),
  }),
  applicantExpenses: z
    .array(
      z.object({
        applicantId: z.string(),
        amount: z.number(),
        expenses: z.array(z.any()), // Define specific expense schema
      })
    )
    .optional(),
});

export const transferReportSchema = z.object({
  branch: z.any(), // Define specific branch schema
  transfers: z.array(
    z.object({
      applicantId: z.string(),
      requestedAt: z.date(),
      approvedAt: z.date().optional(),
      assignedAt: z.date().optional(),
      assignedOfficer: z.string().optional(),
      status: z.string(),
      duration: z.number(),
    })
  ),
  summary: z.object({
    totalTransfers: z.number(),
    approvedTransfers: z.number(),
    pendingTransfers: z.number(),
    averageApprovalTime: z.number(),
    byOfficer: z.array(
      z.object({
        officerId: z.string(),
        assignedCount: z.number(),
        averageProcessingTime: z.number(),
      })
    ),
  }),
});

export const officerReportSchema = z.object({
  officerId: z.string(),
  name: z.string(),
  metrics: z.object({
    activeAssignments: z.number(),
    completedAssignments: z.number(),
    averageProcessingTime: z.number(),
    deploymentRate: z.number(),
  }),
  applicants: z.array(
    z.object({
      applicantId: z.string(),
      status: z.string(),
      assignedAt: z.date(),
      currentStage: z.string(),
      duration: z.number(),
    })
  ),
  performance: z.object({
    byStage: z.array(
      z.object({
        stage: z.string(),
        averageTime: z.number(),
        successRate: z.number(),
      })
    ),
    byMonth: z.array(
      z.object({
        month: z.string(),
        assignmentCount: z.number(),
        completionRate: z.number(),
      })
    ),
  }),
});

export const deploymentReportSchema = z.object({
  summary: z.object({
    totalDeployments: z.number(),
    byCountry: z.record(z.number()),
    byEmployer: z.record(z.number()),
    byMonth: z.record(z.number()),
  }),
  metrics: z.object({
    averageProcessingTime: z.number(),
    successRate: z.number(),
    returnRate: z.number(),
  }),
  deployments: z.array(
    z.object({
      applicantId: z.string(),
      country: z.string(),
      employer: z.string(),
      deployedAt: z.date(),
      processingTime: z.number(),
      status: z.string(),
    })
  ),
});

export const branchReportSchema = z.object({
  branch: z.any(), // Define specific branch schema
  metrics: z.object({
    applicants: z.object({
      total: z.number(),
      active: z.number(),
      deployed: z.number(),
      transferred: z.number(),
    }),
    agents: z.object({
      total: z.number(),
      active: z.number(),
      topPerformers: z.array(
        z.object({
          agentId: z.string(),
          applicantCount: z.number(),
          commissionAmount: z.number(),
        })
      ),
    }),
    expenses: z.object({
      total: z.number(),
      approved: z.number(),
      pending: z.number(),
      byType: z.record(z.number()),
    }),
    commissions: z.object({
      total: z.number(),
      paid: z.number(),
      pending: z.number(),
      byAgent: z.record(z.number()),
    }),
    transfers: z.object({
      total: z.number(),
      approved: z.number(),
      pending: z.number(),
      averageTime: z.number(),
    }),
  }),
  performance: z.object({
    deploymentRate: z.number(),
    processingTime: z.number(),
    documentAccuracy: z.number(),
    applicantSatisfaction: z.number(),
  }),
});
