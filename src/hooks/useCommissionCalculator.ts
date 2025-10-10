import { useState, useCallback } from 'react';
import { CommissionCalculator } from '../services/commissionCalculator';
import type { CommissionType } from '../types/commission';

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

interface UseCommissionCalculatorResult {
  calculate: (
    commissionType: CommissionType,
    baseAmount: number,
    metadata: CalculationMetadata
  ) => void;
  validateData: (
    commissionType: CommissionType,
    baseAmount: number,
    metadata: CalculationMetadata
  ) => string[];
  getCalculationSummary: () => string;
  result: CalculationResult | null;
  loading: boolean;
  error: string | null;
}

export const useCommissionCalculator = (): UseCommissionCalculatorResult => {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentType, setCurrentType] = useState<CommissionType | null>(null);

  const calculator = CommissionCalculator.getInstance();

  const calculate = useCallback(
    (
      commissionType: CommissionType,
      baseAmount: number,
      metadata: CalculationMetadata
    ) => {
      try {
        setLoading(true);
        setError(null);

        // Validate input data
        const validationErrors = calculator.validateCommissionData(
          commissionType,
          baseAmount,
          metadata
        );

        if (validationErrors.length > 0) {
          setError(validationErrors.join('\n'));
          setResult(null);
          return;
        }

        // Calculate commission
        const calculationResult = calculator.calculateCommission(
          commissionType,
          baseAmount,
          metadata
        );

        setResult(calculationResult);
        setCurrentType(commissionType);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate commission');
        setResult(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const validateData = useCallback(
    (
      commissionType: CommissionType,
      baseAmount: number,
      metadata: CalculationMetadata
    ): string[] => {
      return calculator.validateCommissionData(commissionType, baseAmount, metadata);
    },
    []
  );

  const getCalculationSummary = useCallback((): string => {
    if (!result || !currentType) {
      return '';
    }
    return calculator.getCommissionSummary(currentType, result);
  }, [result, currentType]);

  return {
    calculate,
    validateData,
    getCalculationSummary,
    result,
    loading,
    error,
  };
};
