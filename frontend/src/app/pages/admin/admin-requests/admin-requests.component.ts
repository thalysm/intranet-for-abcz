import { Component, OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop"
import { RequestService } from "../../../core/services/request.service"
import { Request, RequestType } from "../../../core/models/request.model"
import { AdminNavbarComponent } from "../components/admin-navbar/admin-navbar.component"
import { ToastService } from "../../../core/services/toast.service"

@Component({
  selector: "app-admin-requests",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule, AdminNavbarComponent],
  templateUrl: "./admin-requests.component.html",
  styles: [`
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
    .cdk-drag-placeholder {
      opacity: 0;
    }
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .request-list.cdk-drop-list-dragging .request-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class AdminRequestsComponent implements OnInit {
  private requestService = inject(RequestService)
  private fb = inject(FormBuilder)
  private toastService = inject(ToastService)

  requests: Request[] = []
  requestTypes: RequestType[] = []
  isLoading = true

  requestsPipeline = {
    pending: [] as Request[],
    inProgress: [] as Request[],
    approved: [] as Request[],
    rejected: [] as Request[]
  }

  showStatusModal = false
  showTypeModal = false
  selectedRequest: Request | null = null

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

  drop(event: CdkDragDrop<Request[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const request = event.previousContainer.data[event.previousIndex];
      const newStatus = this.getContainerStatus(event.container.id);

      if (newStatus === 3) {
        this.openStatusModal(request, 3);
        return;
      }

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      this.updateRequestStatus(request.id, newStatus);
    }
  }

  getContainerStatus(containerId: string): number {
    switch (containerId) {
      case 'pendingList': return 0;
      case 'inProgressList': return 1;
      case 'approvedList': return 2;
      case 'rejectedList': return 3;
      default: return 0;
    }
  }

  updateRequestStatus(requestId: string, status: number, response: string = ''): void {
    const updateData = { status, response };

    this.requestService.updateRequestStatus(requestId, updateData).subscribe({
      next: (updatedRequest) => {
        const index = this.requests.findIndex(r => r.id === updatedRequest.id);
        if (index !== -1) {
          this.requests[index] = updatedRequest;
        }
        this.toastService.success('Status atualizado!');
      },
      error: (error) => {
        console.error('Erro ao atualizar status:', error);
        this.toastService.error('Erro ao atualizar status.');
        this.loadRequests();
      }
    });
  }

  openStatusModal(request: Request, preselectedStatus?: number): void {
    this.selectedRequest = request
    this.statusForm.patchValue({
      status: preselectedStatus !== undefined ? preselectedStatus : request.status,
      response: request.response || ''
    })
    this.showStatusModal = true
  }

  closeStatusModal(): void {
    this.showStatusModal = false
    this.selectedRequest = null
    this.statusForm.reset()
    this.organizePipeline();
  }

  onStatusSubmit(): void {
    if (!this.statusForm.valid || !this.selectedRequest) return;

    const formData = this.statusForm.value;

    if (formData.status == 3 && !formData.response?.trim()) {
      this.toastService.error('Justificativa obrigatória para reprovações');
      return;
    }

    this.updateRequestStatus(this.selectedRequest.id, Number(formData.status), formData.response);
    this.closeStatusModal();

    setTimeout(() => this.organizePipeline(), 100);
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
          this.toastService.success('Tipo criado com sucesso!');
        },
        error: (err) => {
          console.error("Erro ao criar tipo de solicitação:", err)
          this.toastService.error('Erro ao criar tipo.');
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

    return options
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
      default: return 'bg-stone-100 text-stone-800'
    }
  }

  get isStatusFormValid(): boolean {
    if (!this.statusForm.valid) return false;

    const formData = this.statusForm.value;
    if (formData.status == 3 && !formData.response?.trim()) {
      return false;
    }

    return true;
  }

  trackByRequest(index: number, request: Request): string {
    return request.id;
  }
}