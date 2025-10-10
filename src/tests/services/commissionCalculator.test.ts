import { CommissionCalculator } from '../../services/commissionCalculator';

describe('CommissionCalculator', () => {
  let calculator: CommissionCalculator;

  beforeEach(() => {
    calculator = CommissionCalculator.getInstance();
  });

  describe('calculateCommission', () => {
    it('should calculate recruitment commission correctly', () => {
      const result = calculator.calculateCommission('recruitment', 100000, {
        applicantCount: 6,
        placementDays: 25,
        salary: 120000,
      });

      expect(result.baseAmount).toBe(10000); // 10% base rate
      expect(result.bonusAmount).toBeGreaterThan(0); // Should have bonus for 6+ placements
      expect(result.calculationDetails.baseRate).toBe(0.1);
      expect(result.calculationDetails.bonusRate).toBe(0.12);
      expect(result.calculationDetails.multipliers?.length).toBe(2); // Urgent placement and high value
    });

    it('should calculate deployment commission correctly', () => {
      const result = calculator.calculateCommission('deployment', 50000, {
        applicantCount: 4,
      });

      expect(result.baseAmount).toBe(2500); // 5% base rate
      expect(result.bonusAmount).toBeGreaterThan(0); // Should have bonus for 3+ deployments
      expect(result.calculationDetails.baseRate).toBe(0.05);
      expect(result.calculationDetails.bonusRate).toBe(0.06);
    });

    it('should calculate retention commission correctly', () => {
      const result = calculator.calculateCommission('retention', 30000, {
        retentionMonths: 7,
        salary: 50000,
      });

      expect(result.baseAmount).toBe(900); // 3% base rate
      expect(result.bonusAmount).toBeGreaterThan(0); // Should have bonus for 6+ months
      expect(result.calculationDetails.baseRate).toBe(0.03);
      expect(result.calculationDetails.bonusRate).toBe(0.04);
    });

    it('should calculate referral commission correctly', () => {
      const result = calculator.calculateCommission('referral', 1000, {
        referralCount: 4,
      });

      expect(result.baseAmount).toBe(1000); // Fixed amount
      expect(result.calculationDetails.multipliers?.length).toBe(1); // Multiple referrals multiplier
    });
  });

  describe('validateCommissionData', () => {
    it('should validate recruitment commission data correctly', () => {
      const errors = calculator.validateCommissionData('recruitment', 100000, {
        applicantCount: 5,
        placementDays: 30,
      });
      expect(errors).toHaveLength(0);

      const errorsWithMissingData = calculator.validateCommissionData(
        'recruitment',
        100000,
        {}
      );
      expect(errorsWithMissingData).toContain(
        'Applicant count is required for recruitment commission'
      );
      expect(errorsWithMissingData).toContain(
        'Placement days is required for recruitment commission'
      );
    });

    it('should validate deployment commission data correctly', () => {
      const errors = calculator.validateCommissionData('deployment', 50000, {
        applicantCount: 3,
      });
      expect(errors).toHaveLength(0);

      const errorsWithMissingData = calculator.validateCommissionData(
        'deployment',
        50000,
        {}
      );
      expect(errorsWithMissingData).toContain(
        'Applicant count is required for deployment commission'
      );
    });

    it('should validate retention commission data correctly', () => {
      const errors = calculator.validateCommissionData('retention', 30000, {
        retentionMonths: 6,
        salary: 50000,
      });
      expect(errors).toHaveLength(0);

      const errorsWithMissingData = calculator.validateCommissionData(
        'retention',
        30000,
        {}
      );
      expect(errorsWithMissingData).toContain(
        'Retention months is required for retention commission'
      );
      expect(errorsWithMissingData).toContain(
        'Salary is required for retention commission'
      );
    });

    it('should validate referral commission data correctly', () => {
      const errors = calculator.validateCommissionData('referral', 1000, {
        referralCount: 3,
      });
      expect(errors).toHaveLength(0);

      const errorsWithMissingData = calculator.validateCommissionData(
        'referral',
        1000,
        {}
      );
      expect(errorsWithMissingData).toContain(
        'Referral count is required for referral commission'
      );
    });

    it('should validate base amount correctly', () => {
      const errors = calculator.validateCommissionData('recruitment', 0, {
        applicantCount: 5,
        placementDays: 30,
      });
      expect(errors).toContain('Base amount must be greater than 0');
    });
  });

  describe('getCommissionSummary', () => {
    it('should generate a correct summary for recruitment commission', () => {
      const result = calculator.calculateCommission('recruitment', 100000, {
        applicantCount: 6,
        placementDays: 25,
        salary: 120000,
      });

      const summary = calculator.getCommissionSummary('recruitment', result);

      expect(summary).toContain('Commission Type: Recruitment Commission');
      expect(summary).toContain('Base Rate: 10.0%');
      expect(summary).toContain('Bonus Rate: 12.0%');
      expect(summary).toContain('Urgent Placement: 1.2x');
      expect(summary).toContain('High Value: 1.5x');
    });

    it('should generate a correct summary for referral commission', () => {
      const result = calculator.calculateCommission('referral', 1000, {
        referralCount: 4,
      });

      const summary = calculator.getCommissionSummary('referral', result);

      expect(summary).toContain('Commission Type: Referral Commission');
      expect(summary).toContain('Multiple Referrals: 1.5x');
    });
  });
});
