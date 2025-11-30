import { Injectable, inject } from "@angular/core"
import { Observable } from "rxjs"
import { ApiService } from "./api.service"
import { Request, RequestType, CreateRequestRequest, UpdateRequestStatusRequest, CreateRequestTypeRequest } from "../models/request.model"

@Injectable({
  providedIn: "root"
})
export class RequestService {
  private apiService = inject(ApiService)

  getRequests(): Observable<Request[]> {
    return this.apiService.get<Request[]>("/requests")
  }

  getRequestById(id: string): Observable<Request> {
    return this.apiService.get<Request>(`/requests/${id}`)
  }

  createRequest(request: CreateRequestRequest): Observable<Request> {
    return this.apiService.post<Request>("/requests", request)
  }

  updateRequestStatus(id: string, status: UpdateRequestStatusRequest): Observable<Request> {
    return this.apiService.put<Request>(`/requests/${id}/status`, status)
  }

  getRequestTypes(): Observable<RequestType[]> {
    return this.apiService.get<RequestType[]>("/requests/types")
  }

  createRequestType(type: CreateRequestTypeRequest): Observable<RequestType> {
    return this.apiService.post<RequestType>("/requests/types", type)
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0: return "bg-gray-100 text-gray-700" // Criado
      case 1: return "bg-blue-100 text-blue-700" // Em Andamento
      case 2: return "bg-green-100 text-green-700" // Aprovado
      case 3: return "bg-red-100 text-red-700" // Reprovado
      default: return "bg-gray-100 text-gray-700"
    }
  }

  getStatusOptions() {
    return [
      { value: 0, label: "Criado", color: "bg-gray-100 text-gray-700" },
      { value: 1, label: "Em Andamento", color: "bg-blue-100 text-blue-700" },
      { value: 2, label: "Aprovado", color: "bg-green-100 text-green-700" },
      { value: 3, label: "Reprovado", color: "bg-red-100 text-red-700" }
    ]
  }
}