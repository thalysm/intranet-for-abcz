import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { LoanSimulationService } from "../../../core/services/loan-simulation.service"
import { RequestService } from "../../../core/services/request.service"
import { ToastService } from "../../../core/services/toast.service"
import { LoanSimulation, CreateLoanSimulationRequest, LoanSimulationResult } from "../../../core/models/loan-simulation.model"
import { CreateRequestRequest } from "../../../core/models/request.model"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"
import { ToastComponent } from "../../../shared/components/toast/toast.component"

@Component({
  selector: "app-loan-simulation",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, ToastComponent],
  templateUrl: "./loan-simulation.component.html",
})
export class LoanSimulationComponent implements OnInit {
  simulationForm: FormGroup
  simulations: LoanSimulation[] = []
  isLoading = true
  isSubmitting = false
  showResultModal = false
  simulationResult: LoanSimulationResult | null = null
  isRequestingCredit = false

  // Valores formatados para exibição
  wageDisplay: string = ''
  loanAmountDisplay: string = ''

  constructor(
    private fb: FormBuilder,
    private loanSimulationService: LoanSimulationService,
    private requestService: RequestService,
    private toastService: ToastService
  ) {
    this.simulationForm = this.fb.group({
      wage: ['', [Validators.required, Validators.min(0.01)]],
      loanAmount: ['', [Validators.required, Validators.min(0.01)]],
      numberInstallments: ['', [Validators.required, Validators.min(1), Validators.max(12)]]
    })
  }

  ngOnInit(): void {
    this.loadSimulations()
  }

  // Função para formatar valor como moeda brasileira
  formatCurrencyInput(value: string): string {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    if (!numbers) return ''
    
    // Converte para número e divide por 100 para ter centavos
    const amount = parseFloat(numbers) / 100
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Função para converter valor formatado de volta para número
  parseCurrencyInput(value: string): number {
    // Remove símbolos de moeda e espaços, substitui vírgula por ponto
    const numbers = value.replace(/[R$\s.]/g, '').replace(',', '.')
    return parseFloat(numbers) || 0
  }

  // Manipulador para o campo de salário
  onWageInput(event: Event): void {
    const input = event.target as HTMLInputElement
    const formatted = this.formatCurrencyInput(input.value)
    
    this.wageDisplay = formatted
    input.value = formatted
    
    // Atualiza o valor numérico no formulário
    const numericValue = this.parseCurrencyInput(formatted)
    this.simulationForm.patchValue({ wage: numericValue }, { emitEvent: false })
  }

  // Manipulador para o campo de valor do empréstimo
  onLoanAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement
    const formatted = this.formatCurrencyInput(input.value)
    
    this.loanAmountDisplay = formatted
    input.value = formatted
    
    // Atualiza o valor numérico no formulário
    const numericValue = this.parseCurrencyInput(formatted)
    this.simulationForm.patchValue({ loanAmount: numericValue }, { emitEvent: false })
  }

  loadSimulations(): void {
    this.loanSimulationService.getLoanSimulations().subscribe({
      next: (data) => {
        this.simulations = data
        this.isLoading = false
      },
      error: (err) => {
        console.error("Error loading simulations:", err)
        this.isLoading = false
      },
    })
  }

  onSubmit(): void {
    if (this.simulationForm.invalid) return

    this.isSubmitting = true
    const formValue = this.simulationForm.value as CreateLoanSimulationRequest

    this.loanSimulationService.simulateLoan(formValue).subscribe({
      next: (result) => {
        this.simulationResult = result
        this.showResultModal = true
        this.loadSimulations() // Recarrega as simulações para mostrar a nova
        this.isSubmitting = false
      },
      error: (err) => {
        console.error("Error simulating loan:", err)
        this.toastService.error("Erro ao simular empréstimo. Tente novamente.")
        this.isSubmitting = false
      },
    })
  }

  closeResultModal(): void {
    this.showResultModal = false
    this.simulationResult = null
  }

  simulateAgain(): void {
    this.closeResultModal()
    // O formulário permanece preenchido para facilitar nova simulação
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value)
  }

  requestCredit(): void {
    if (!this.simulationResult) return

    this.isRequestingCredit = true

    // Busca o tipo de solicitação "Empréstimo"
    this.requestService.getRequestTypes().subscribe({
      next: (types) => {
        const loanType = types.find(type => 
          type.name.toLowerCase().includes('empréstimo') || 
          type.name.toLowerCase().includes('crédito')
        )
        
        if (!loanType) {
          this.toastService.error("Tipo de solicitação de empréstimo não encontrado. Contate o administrador.")
          this.isRequestingCredit = false
          return
        }

        // Cria a solicitação com os dados da simulação
        const createRequest: CreateRequestRequest = {
          typeId: loanType.id
        }

        this.requestService.createRequest(createRequest).subscribe({
          next: (newRequest) => {
            this.toastService.success("Solicitação de crédito enviada com sucesso! Você pode acompanhar o status na página de Solicitações.")
            this.closeResultModal()
            this.isRequestingCredit = false
            
            // Limpa o formulário após sucesso
            this.simulationForm.reset()
            this.wageDisplay = ''
            this.loanAmountDisplay = ''
          },
          error: (err) => {
            console.error("Error creating credit request:", err)
            this.toastService.error("Erro ao enviar solicitação de crédito. Tente novamente.")
            this.isRequestingCredit = false
          }
        })
      },
      error: (err) => {
        console.error("Error loading request types:", err)
        this.toastService.error("Erro ao carregar tipos de solicitação. Tente novamente.")
        this.isRequestingCredit = false
      }
    })
  }
}