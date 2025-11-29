import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LoanSimulation, CreateLoanSimulationRequest, LoanSimulationResult } from '../models/loan-simulation.model';

@Injectable({
  providedIn: 'root'
})
export class LoanSimulationService {
  private readonly baseUrl = '/loansimulations';

  constructor(private apiService: ApiService) {}

  getLoanSimulations(): Observable<LoanSimulation[]> {
    return this.apiService.get<LoanSimulation[]>(this.baseUrl);
  }

  simulateLoan(request: CreateLoanSimulationRequest): Observable<LoanSimulationResult> {
    return this.apiService.post<LoanSimulationResult>(`${this.baseUrl}/simulate`, request);
  }

  getLoanSimulationById(id: string): Observable<LoanSimulation> {
    return this.apiService.get<LoanSimulation>(`${this.baseUrl}/${id}`);
  }

  deleteLoanSimulation(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }
}