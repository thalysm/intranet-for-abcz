import { Component, OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { RequestService } from "../../../core/services/request.service"
import { Request, RequestType } from "../../../core/models/request.model"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"
import { ModalComponent } from "../../../shared/components/modal/modal.component"
import { ToastService } from "../../../core/services/toast.service"

@Component({
  selector: "app-admin-requests",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, ModalComponent],
  templateUrl: "./admin-requests.component.html"
})
export class AdminRequestsComponent implements OnInit {
  private requestService = inject(RequestService)
  private fb = inject(FormBuilder)
  private toastService = inject(ToastService)

  requests: Request[] = []
  requestTypes: RequestType[] = []
  isLoading = true
  
  // Pipeline de status organizados
  requestsPipeline = {
    pending: [] as Request[],      // Status 0 - Em Aberto
    inProgress: [] as Request[],   // Status 1 - Em Andamento  
    approved: [] as Request[],     // Status 2 - Aprovadas
    rejected: [] as Request[]      // Status 3 - Reprovadas
  }
  
  // Modal states
  showStatusModal = false
  showTypeModal = false
  selectedRequest: Request | null = null
  
  // Forms
  statusForm: FormGroup = this.fb.group({
    status: ['', Validators.required],
    response: ['']
  })
  
  typeForm: FormGroup = this.fb.group({
    name: ['', Validators.required]
  })

  ngOnInit(): void {
    this.loadRequests()
    this.loadRequestTypes()
  }

  loadRequests(): void {
    this.isLoading = true
    this.requestService.getRequests().subscribe({
      next: (data) => {
        this.requests = data
        this.organizePipeline()
        this.isLoading = false
      },
      error: (err) => {
        console.error("Erro ao carregar solicitações:", err)
        this.isLoading = false
      }
    })
  }

  organizePipeline(): void {
    this.requestsPipeline = {
      pending: this.requests.filter(req => req.status === 0),
      inProgress: this.requests.filter(req => req.status === 1),
      approved: this.requests.filter(req => req.status === 2),
      rejected: this.requests.filter(req => req.status === 3)
    }
  }

  loadRequestTypes(): void {
    this.requestService.getRequestTypes().subscribe({
      next: (data) => {
        this.requestTypes = data
      },
      error: (err) => {
        console.error("Erro ao carregar tipos de solicitação:", err)
      }
    })
  }

  openStatusModal(request: Request): void {
    this.selectedRequest = request
    this.statusForm.patchValue({
      status: request.status,
      response: request.response || ''
    })
    this.showStatusModal = true
  }

  closeStatusModal(): void {
    this.showStatusModal = false
    this.selectedRequest = null
    this.statusForm.reset()
  }

  onStatusSubmit(): void {
    if (!this.statusForm.valid || !this.selectedRequest) return;

    const formData = this.statusForm.value;
    
    // Validar se reprovação tem justificativa
    if (formData.status === 3 && !formData.response?.trim()) {
      this.toastService.error('Justificativa é obrigatória para reprovações');
      return;
    }

    const updateData = {
      status: formData.status,
      response: formData.response || ''
    };

    this.requestService.updateRequestStatus(this.selectedRequest.id, updateData).subscribe({
      next: (updatedRequest) => {
        // Atualizar a solicitação na lista local
        const index = this.requests.findIndex(r => r.id === updatedRequest.id);
        if (index !== -1) {
          this.requests[index] = updatedRequest;
        }
        
        // Reorganizar pipeline
        this.organizePipeline();
        
        this.closeStatusModal();
        this.toastService.success('Status atualizado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao atualizar status:', error);
        this.toastService.error('Erro ao atualizar status. Tente novamente.');
      }
    });
  }

  openTypeModal(): void {
    this.showTypeModal = true
  }

  closeTypeModal(): void {
    this.showTypeModal = false
    this.typeForm.reset()
  }

  onTypeSubmit(): void {
    if (this.typeForm.valid) {
      const formData = this.typeForm.value
      
      this.requestService.createRequestType(formData.name).subscribe({
        next: () => {
          this.loadRequestTypes()
          this.closeTypeModal()
          this.toastService.success('Tipo de solicitação criado com sucesso!');
        },
        error: (err) => {
          console.error("Erro ao criar tipo de solicitação:", err)
          this.toastService.error('Erro ao criar tipo de solicitação. Tente novamente.');
        }
      })
    }
  }

  getStatusOptions() {
    if (!this.selectedRequest) return []
    
    const currentStatus = this.selectedRequest.status
    const options = [
      { value: 0, label: 'Em Aberto' },
      { value: 1, label: 'Em Andamento' },
      { value: 2, label: 'Aprovada' },
      { value: 3, label: 'Reprovada' }
    ]
    
    // Remove a opção atual para evitar mudanças desnecessárias
    return options.filter(opt => opt.value !== currentStatus)
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Em Aberto'
      case 1: return 'Em Andamento'
      case 2: return 'Aprovada'
      case 3: return 'Reprovada'
      default: return 'Desconhecido'
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0: return 'bg-orange-100 text-orange-800'
      case 1: return 'bg-blue-100 text-blue-800'
      case 2: return 'bg-green-100 text-green-800'
      case 3: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  get isStatusFormValid(): boolean {
    if (!this.statusForm.valid) return false;
    
    const formData = this.statusForm.value;
    if (formData.status === 3 && !formData.response?.trim()) {
      return false;
    }
    
    return true;
  }
}