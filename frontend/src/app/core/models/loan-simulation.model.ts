export interface LoanSimulation {
  id: string;
  wage: number;
  loanAmount: number;
  numberInstallments: number;
  interestRate: number;
  installmentValue: number;
  totalAmount: number;
  maxAllowedLoan: number;
  isValidLoan: boolean;
  createdAt: string;
  userId: string;
  userName?: string;
}

export interface CreateLoanSimulationRequest {
  wage: number;
  loanAmount: number;
  numberInstallments: number;
}

export interface LoanSimulationResult {
  requestedAmount: number;
  installmentValue: number;
  totalAmount: number;
  interestRate: number;
  numberInstallments: number;
  maxAllowedLoan: number;
  isValidLoan: boolean;
  validationMessage: string;
}