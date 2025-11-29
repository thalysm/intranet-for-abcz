import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Benefit, BenefitCard, CreateBenefitRequest, UpdateBenefitRequest } from '../models/benefit.model';

@Injectable({
  providedIn: 'root'
})
export class BenefitService {
  private readonly baseUrl = '/benefits';

  constructor(private apiService: ApiService) {}

  getBenefits(): Observable<Benefit[]> {
    return this.apiService.get<Benefit[]>(this.baseUrl);
  }

  getBenefitCards(): Observable<BenefitCard[]> {
    return this.apiService.get<BenefitCard[]>(`${this.baseUrl}/cards`);
  }

  getBenefitById(id: string): Observable<Benefit> {
    return this.apiService.get<Benefit>(`${this.baseUrl}/${id}`);
  }

  createBenefit(benefit: CreateBenefitRequest): Observable<Benefit> {
    return this.apiService.post<Benefit>(this.baseUrl, benefit);
  }

  updateBenefit(id: string, benefit: UpdateBenefitRequest): Observable<Benefit> {
    return this.apiService.put<Benefit>(`${this.baseUrl}/${id}`, benefit);
  }

  deleteBenefit(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
  }
}