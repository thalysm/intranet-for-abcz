import { Component, OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { RequestService } from "../../../core/services/request.service"
import { Request, RequestType } from "../../../core/models/request.model"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"

@Component({
  selector: "app-user-requests",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: "./user-requests.component.html",
})
export class UserRequestsComponent implements OnInit {
  private requestService = inject(RequestService)
  private fb = inject(FormBuilder)

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
        this.isLoading = false
      },
      error: (err) => {
        console.error("Error loading requests:", err)
        this.isLoading = false
      }
    })
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

  openCreateModal(): void {
    this.createForm.reset()
    this.showCreateModal = true
  }

  closeCreateModal(): void {
    this.showCreateModal = false
    this.createForm.reset()
  }

  onCreateSubmit(): void {
    if (this.createForm.invalid) return

    const formValue = this.createForm.value
    this.requestService.createRequest(formValue).subscribe({
      next: () => {
        this.loadRequests()
        this.closeCreateModal()
        alert("Solicitação criada com sucesso!")
      },
      error: (err) => {
        console.error("Error creating request:", err)
        alert("Erro ao criar solicitação. Tente novamente.")
      }
    })
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('pt-BR')
  }

  getStatusIcon(status: number): string {
    switch (status) {
      case 0: return "⏳" // Criado
      case 1: return "🔄" // Em Andamento
      case 2: return "✅" // Aprovado
      case 3: return "❌" // Reprovado
      default: return "❓"
    }
  }
}