import { Component, OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { RequestService } from "../../../core/services/request.service"
import { Request, RequestType } from "../../../core/models/request.model"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"
import { ApiService } from "../../../core/services/api.service"

@Component({
  selector: "app-user-requests",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: "./user-requests.component.html",
})
export class UserRequestsComponent implements OnInit {
  private requestService = inject(RequestService)
  private fb = inject(FormBuilder)
  private apiService = inject(ApiService)

  requests: Request[] = []
  requestTypes: RequestType[] = []
  isLoading = true
  showCreateModal = false
  
  createForm: FormGroup = this.fb.group({
    typeId: ['', Validators.required]
  })

  ngOnInit(): void {
    this.loadRequests()
    this.loadRequestTypes()
  }

  loadRequests(): void {
    this.requestService.getRequests().subscribe({
      next: (data) => {
        this.requests = data
        this.loadRequestsDetails()
      },
      error: (err) => {
        console.error("Error loading requests:", err)
        this.isLoading = false
      }
    })
  }

  async loadRequestsDetails(): Promise<void> {
    const emprestimosRequests = this.requests.filter(req => 
      req.typeName.toLowerCase().includes('empréstimo') || 
      req.typeName.toLowerCase().includes('emprestimo')
    )

    for (const request of emprestimosRequests) {
      try {
        const loanSimulations = await this.apiService.get<any[]>(`/loan-simulations?userId=${request.userId}`).toPromise()
        if (loanSimulations && loanSimulations.length > 0) {
          const requestDate = new Date(request.createdAt)
          const closestSimulation = loanSimulations
            .filter(sim => new Date(sim.createdAt) <= requestDate)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
          
          if (closestSimulation) {
            request.loanDetails = {
              wage: closestSimulation.wage,
              loanAmount: closestSimulation.loanAmount,
              numberInstallments: closestSimulation.numberInstallments
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do empréstimo:', error)
      }
    }

    this.isLoading = false
  }

  loadRequestTypes(): void {
    this.requestService.getRequestTypes().subscribe({
      next: (data) => {
        this.requestTypes = data
      },
      error: (err) => {
        console.error("Error loading request types:", err)
      }
    })
  }

  getStatusColor(status: number): string {
    return this.requestService.getStatusColor(status)
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('pt-BR')
  }

  getStatusEmoji(status: number): string {
    switch (status) {
      case 0: return "⏳"
      case 1: return "🔄"
      case 2: return "✅"
      case 3: return "❌"
      default: return "❓"
    }
  }

  formatCurrency(value: number): string {
    return (value / 100).toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }
}