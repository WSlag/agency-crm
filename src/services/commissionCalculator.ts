import { COMMISSION_CONFIG, type CommissionType } from '../types/commission';

interface CalculationMetadata {
  applicantCount?: number;
  placementDays?: number;
  salary?: number;
  retentionMonths?: number;
  referralCount?: number;
  jobCategory?: string;
  employerName?: string;
  contractDuration?: number;
}

interface CalculationResult {
  baseAmount: number;
  bonusAmount: number;
  totalAmount: number;
  calculationDetails: {
    baseRate: number;
    bonusRate?: number;
    multipliers?: {
      name: string;
      value: number;
    }[];
    deductions?: {
      name: string;
      amount: number;
    }[];
  };
}

export class CommissionCalculator {
  private static instance: CommissionCalculator;

  private constructor() {}

  public static getInstance(): CommissionCalculator {
    if (!CommissionCalculator.instance) {
      CommissionCalculator.instance = new CommissionCalculator();
    }
    return CommissionCalculator.instance;
  }

  public calculateCommission(
    commissionType: CommissionType,
    baseAmount: number,
    metadata: CalculationMetadata
  ): CalculationResult {
    const config = COMMISSION_CONFIG[commissionType];
    let bonusAmount = 0;
    const calculationDetails: CalculationResult['calculationDetails'] = {
      baseRate: config.baseRate,
      multipliers: [],
      deductions: [],
    };

    // Calculate base commission
    let totalAmount = this.calculateBaseCommission(
      commissionType,
      baseAmount,
      config.baseRate
    );

    // Apply bonus thresholds if applicable
    if (config.bonusThresholds) {
      const bonusResult = this.applyBonusThresholds(
        commissionType,
        baseAmount,
        config.bonusThresholds,
        metadata
      );
      if (bonusResult.bonusRate) {
        calculationDetails.bonusRate = bonusResult.bonusRate;
        bonusAmount = bonusResult.bonusAmount;
        totalAmount += bonusAmount;
      }
    }

    // Apply multipliers if applicable
    if (config.multipliers) {
      const multiplierResult = this.applyMultipliers(
        commissionType,
        totalAmount,
        config.multipliers,
        metadata
      );
      calculationDetails.multipliers = multiplierResult.appliedMultipliers;
      totalAmount = multiplierResult.adjustedAmount;
      bonusAmount = multiplierResult.adjustedBonus;
    }

    // Apply deductions if needed
    const deductionResult = this.applyDeductions(commissionType, totalAmount, metadata);
    if (deductionResult.deductions.length > 0) {
      calculationDetails.deductions = deductionResult.deductions;
      totalAmount = deductionResult.adjustedAmount;
    }

    return {
      baseAmount: baseAmount * config.baseRate,
      bonusAmount,
      totalAmount,
      calculationDetails,
    };
  }

  private calculateBaseCommission(
    commissionType: CommissionType,
    baseAmount: number,
    baseRate: number
  ): number {
    // For referral type, baseAmount is a fixed amount
    if (commissionType === 'referral') {
      return baseRate;
    }
    return baseAmount * baseRate;
  }

  private applyBonusThresholds(
    commissionType: CommissionType,
    baseAmount: number,
    thresholds: { threshold: number; rate: number }[],
    metadata: CalculationMetadata
  ): { bonusRate?: number; bonusAmount: number } {
    let bonusRate: number | undefined;
    let bonusAmount = 0;

    // Sort thresholds in descending order to get the highest applicable bonus
    const sortedThresholds = [...thresholds].sort(
      (a, b) => b.threshold - a.threshold
    );

    for (const threshold of sortedThresholds) {
      if (this.isThresholdMet(commissionType, threshold.threshold, metadata)) {
        bonusRate = threshold.rate;
        bonusAmount = baseAmount * (threshold.rate - COMMISSION_CONFIG[commissionType].baseRate);
        break;
      }
    }

    return { bonusRate, bonusAmount };
  }

  private isThresholdMet(
    commissionType: CommissionType,
    threshold: number,
    metadata: CalculationMetadata
  ): boolean {
    switch (commissionType) {
      case 'recruitment':
        return (metadata.applicantCount || 0) >= threshold;
      case 'deployment':
        return (metadata.applicantCount || 0) >= threshold;
      case 'retention':
        return (metadata.retentionMonths || 0) >= threshold;
      case 'referral':
        return (metadata.referralCount || 0) >= threshold;
      default:
        return false;
    }
  }

  private applyMultipliers(
    commissionType: CommissionType,
    amount: number,
    multipliers: { name: string; condition: string; value: number }[],
    metadata: CalculationMetadata
  ): {
    adjustedAmount: number;
    adjustedBonus: number;
    appliedMultipliers: { name: string; value: number }[];
  } {
    let adjustedAmount = amount;
    let adjustedBonus = amount - (amount * COMMISSION_CONFIG[commissionType].baseRate);
    const appliedMultipliers: { name: string; value: number }[] = [];

    for (const multiplier of multipliers) {
      if (this.isMultiplierApplicable(multiplier, metadata)) {
        adjustedAmount *= multiplier.value;
        adjustedBonus *= multiplier.value;
        appliedMultipliers.push({
          name: multiplier.name,
          value: multiplier.value,
        });
      }
    }

    return { adjustedAmount, adjustedBonus, appliedMultipliers };
  }

  private isMultiplierApplicable(
    multiplier: { name: string; condition: string; value: number },
    metadata: CalculationMetadata
  ): boolean {
    switch (multiplier.name) {
      case 'Urgent Placement':
        return (metadata.placementDays || Infinity) <= 30;
      case 'High Value':
        return (metadata.salary || 0) >= 100000;
      case 'Multiple Referrals':
        return (metadata.referralCount || 0) >= 3;
      default:
        return false;
    }
  }

  private applyDeductions(
    commissionType: CommissionType,
    amount: number,
    metadata: CalculationMetadata
  ): {
    adjustedAmount: number;
    deductions: { name: string; amount: number }[];
  } {
    const deductions: { name: string; amount: number }[] = [];
    let adjustedAmount = amount;

    // Example deduction rules (can be expanded based on business rules)
    if (commissionType === 'recruitment' && metadata.placementDays && metadata.placementDays > 60) {
      const deductionAmount = amount * 0.1; // 10% deduction for slow placement
      deductions.push({
        name: 'Delayed Placement Penalty',
        amount: deductionAmount,
      });
      adjustedAmount -= deductionAmount;
    }

    if (commissionType === 'retention' && metadata.retentionMonths && metadata.retentionMonths < 3) {
      const deductionAmount = amount * 0.2; // 20% deduction for early termination
      deductions.push({
        name: 'Early Termination Penalty',
        amount: deductionAmount,
      });
      adjustedAmount -= deductionAmount;
    }

    return { adjustedAmount, deductions };
  }

  public validateCommissionData(
    commissionType: CommissionType,
    baseAmount: number,
    metadata: CalculationMetadata
  ): string[] {
    const errors: string[] = [];

    if (baseAmount <= 0) {
      errors.push('Base amount must be greater than 0');
    }

    switch (commissionType) {
      case 'recruitment':
        if (metadata.applicantCount === undefined) {
          errors.push('Applicant count is required for recruitment commission');
        }
        if (metadata.placementDays === undefined) {
          errors.push('Placement days is required for recruitment commission');
        }
        break;

      case 'deployment':
        if (metadata.applicantCount === undefined) {
          errors.push('Applicant count is required for deployment commission');
        }
        break;

      case 'retention':
        if (metadata.retentionMonths === undefined) {
          errors.push('Retention months is required for retention commission');
        }
        if (metadata.salary === undefined) {
          errors.push('Salary is required for retention commission');
        }
        break;

      case 'referral':
        if (metadata.referralCount === undefined) {
          errors.push('Referral count is required for referral commission');
        }
        break;
    }

    return errors;
  }

  public getCommissionSummary(
    commissionType: CommissionType,
    calculationResult: CalculationResult
  ): string {
    const {
      baseAmount,
      bonusAmount,
      totalAmount,
      calculationDetails,
    } = calculationResult;

    let summary = `Commission Type: ${COMMISSION_CONFIG[commissionType].name}\n`;
    summary += `Base Amount: ${this.formatCurrency(baseAmount)}\n`;
    summary += `Base Rate: ${(calculationDetails.baseRate * 100).toFixed(1)}%\n`;

    if (calculationDetails.bonusRate) {
      summary += `Bonus Rate: ${(calculationDetails.bonusRate * 100).toFixed(1)}%\n`;
      summary += `Bonus Amount: ${this.formatCurrency(bonusAmount)}\n`;
    }

    if (calculationDetails.multipliers?.length) {
      summary += '\nApplied Multipliers:\n';
      calculationDetails.multipliers.forEach((multiplier) => {
        summary += `- ${multiplier.name}: ${multiplier.value}x\n`;
      });
    }

    if (calculationDetails.deductions?.length) {
      summary += '\nDeductions:\n';
      calculationDetails.deductions.forEach((deduction) => {
        summary += `- ${deduction.name}: ${this.formatCurrency(deduction.amount)}\n`;
      });
    }

    summary += `\nTotal Commission: ${this.formatCurrency(totalAmount)}`;

    return summary;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}
