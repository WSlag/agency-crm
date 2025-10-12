# Commission Management

## Overview
The commission management system handles agent commissions, calculations, and payouts. This guide covers the implementation and usage of commission-related features.

## Features

### Commission Calculation
Automated commission calculations based on:
- Transaction amount
- Agent level
- Commission rates
- Performance bonuses

### Commission Tracking
Monitor and manage commissions:
- Commission status
- Payment history
- Agent performance
- Commission reports

### Commission Approval
Multi-level approval workflow:
- Branch manager approval
- Accountant verification
- President authorization
- Payment processing

## Implementation

### Using Commission Service
```typescript
import { commissionService } from '@/services/CommissionService';

// Calculate commission
const commission = await commissionService.calculateCommission({
  agentId,
  transactionAmount,
  transactionType
});

// Process commission
await commissionService.processCommission({
  id: commissionId,
  status: 'approved',
  approvedBy: userId
});

// Get commission metrics
const metrics = await commissionService.getCommissionMetrics(branchId);
```

### Commission Calculator
```typescript
interface CommissionConfig {
  baseRate: number;
  bonusRate: number;
  minimumAmount: number;
  maximumAmount: number;
}

// Example calculation
const calculateCommission = (
  amount: number,
  config: CommissionConfig
): number => {
  if (amount < config.minimumAmount) return 0;
  
  const baseCommission = amount * config.baseRate;
  const bonus = amount >= config.maximumAmount
    ? amount * config.bonusRate
    : 0;
    
  return baseCommission + bonus;
};
```

### Commission Form
```tsx
import { CommissionForm } from '@/components/commissions/CommissionForm';

<CommissionForm
  agentId={agentId}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

## Components

### CommissionCalculator
Interactive commission calculator:
```tsx
import { CommissionCalculator } from '@/components/commissions/CommissionCalculator';

<CommissionCalculator
  onCalculate={handleCalculate}
/>
```

### CommissionTable
Display commission data:
```tsx
import { CommissionTable } from '@/components/commissions/CommissionTable';

<CommissionTable
  commissions={commissionData}
  onApprove={handleApprove}
  onReject={handleReject}
/>
```

## Best Practices

### Calculation Rules
1. Rate Configuration:
   - Define base rates
   - Set bonus thresholds
   - Configure caps

2. Validation:
   - Amount limits
   - Rate validation
   - Agent eligibility

### Approval Process
1. Workflow:
   - Define approval levels
   - Set authorization rules
   - Track approval history

2. Documentation:
   - Record decisions
   - Store attachments
   - Maintain audit trail

### Payment Processing
1. Verification:
   - Double-check calculations
   - Validate approvals
   - Check payment details

2. Processing:
   - Schedule payments
   - Track status
   - Handle failures

## Testing

### Unit Tests
```typescript
describe('CommissionCalculator', () => {
  it('calculates base commission correctly', () => {
    const amount = 1000;
    const config = {
      baseRate: 0.1,
      bonusRate: 0.02,
      minimumAmount: 500,
      maximumAmount: 5000
    };
    
    const commission = calculateCommission(amount, config);
    expect(commission).toBe(100); // 10% of 1000
  });
});
```

### Integration Tests
```typescript
describe('Commission Integration', () => {
  it('processes commission workflow', async () => {
    // Create commission
    const commission = await commissionService.createCommission(data);
    
    // Approve commission
    await commissionService.approveCommission(commission.id);
    
    // Verify status
    const updated = await commissionService.getCommission(commission.id);
    expect(updated.status).toBe('approved');
  });
});
```

## Security

### Access Control
1. Role-Based Access:
   - Branch managers
   - Accountants
   - Administrators

2. Authorization:
   - Approval limits
   - Branch restrictions
   - Action permissions

### Data Protection
1. Sensitive Data:
   - Payment information
   - Personal details
   - Commission rates

2. Audit Trail:
   - Track changes
   - Log approvals
   - Monitor access

## Troubleshooting

### Common Issues
1. Calculation Errors
   - Rate mismatches
   - Bonus calculation
   - Rounding issues

2. Approval Problems
   - Missing authorizations
   - Workflow blocks
   - System errors

3. Payment Issues
   - Processing failures
   - Bank details
   - Payment timing

### Debug Tools
1. Commission Logs:
   - Calculation details
   - Approval history
   - Payment records

2. Validation Checks:
   - Rate verification
   - Amount validation
   - Status checks

## Reports

### Commission Reports
1. Agent Reports:
   - Commission history
   - Performance metrics
   - Payment status

2. Branch Reports:
   - Total commissions
   - Approval rates
   - Payment summary

3. Financial Reports:
   - Commission expenses
   - Budget tracking
   - Forecast analysis
