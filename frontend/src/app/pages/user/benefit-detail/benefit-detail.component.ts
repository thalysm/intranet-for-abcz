import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router } from "@angular/router"
import { BenefitService } from "../../../core/services/benefit.service"
import { RequestService } from "../../../core/services/request.service"
import { ToastService } from "../../../core/services/toast.service"
import { Benefit } from "../../../core/models/benefit.model"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"

@Component({
  selector: "app-benefit-detail",
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: "./benefit-detail.component.html",
})
export class BenefitDetailComponent implements OnInit {
  benefit: Benefit | null = null
  isLoading = true

  constructor(
    private benefitService: BenefitService,
    private requestService: RequestService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const benefitId = this.route.snapshot.paramMap.get('id')
    if (benefitId) {
      this.loadBenefit(benefitId)
    } else {
      this.router.navigate(['/benefits'])
    }
  }

  loadBenefit(id: string): void {
    this.benefitService.getBenefitById(id).subscribe({
      next: (data) => {
        this.benefit = data
        this.isLoading = false
      },
      error: (err) => {
        console.error("Error loading benefit:", err)
        this.router.navigate(['/benefits'])
      },
    })
  }

  goBack(): void {
    this.router.navigate(['/benefits'])
  }

  isRequestAction(buttonAction: string): boolean {
    if (!buttonAction) return false;
    
    // Se for um link HTTP, não é uma solicitação
    if (buttonAction.startsWith('http')) return false;
    
    // Qualquer valor que não seja um link HTTP será tratado como solicitação
    return true;
  }

  executeButtonAction(buttonAction: string): void {
    if (!buttonAction || !this.benefit) {
      return;
    }

    // Se a ação é um link HTTP, abre em nova aba
    if (buttonAction.startsWith('http')) {
      window.open(buttonAction, '_blank');
      return;
    }

    // Para qualquer valor que não seja HTTP, cria uma solicitação
    this.createBenefitRequest();
  }

  private createBenefitRequest(): void {
    if (!this.benefit) return;

    // Primeiro, carrega os tipos de solicitação disponíveis
    this.requestService.getRequestTypes().subscribe({
      next: (requestTypes) => {
        // Procura por um tipo específico de benefício
        let benefitRequestType = requestTypes.find(type => 
          type.name.toLowerCase().includes('beneficio') || 
          type.name.toLowerCase().includes('benefit')
        );

        if (benefitRequestType) {
          // Se encontrou o tipo de benefício, usa ele
          this.submitBenefitRequest(benefitRequestType.id);
        } else if (requestTypes.length > 0) {
          // Se não encontrou mas tem outros tipos, cria um novo tipo "Benefício"
          this.createBenefitType().then(typeId => {
            if (typeId) {
              this.submitBenefitRequest(typeId);
            } else {
              // Se falhar ao criar, usa o primeiro tipo disponível
              this.submitBenefitRequest(requestTypes[0].id);
            }
          });
        } else {
          // Se não há nenhum tipo de solicitação
          this.toastService.error('Nenhum tipo de solicitação encontrado. Entre em contato com o administrador.');
        }
      },
      error: (err) => {
        console.error('Erro ao carregar tipos de solicitação:', err);
        this.toastService.error('Erro ao conectar com o servidor. Tente novamente.');
      }
    });
  }

  private async createBenefitType(): Promise<string | null> {
    return new Promise((resolve) => {
      const createTypeRequest = { name: 'Benefício' };
      
      this.requestService.createRequestType(createTypeRequest).subscribe({
        next: (newType) => {
          resolve(newType.id);
        },
        error: (err) => {
          console.error('Erro ao criar tipo de benefício:', err);
          resolve(null);
        }
      });
    });
  }

  private submitBenefitRequest(typeId: string): void {
    if (!this.benefit) return;

    const requestData = {
      typeId: typeId
    };

    this.requestService.createRequest(requestData).subscribe({
      next: (request) => {
        this.toastService.success('Solicitação de benefício criada com sucesso! Aguarde a aprovação do administrador.');
        
        // Redireciona para a página de solicitações após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/user-requests']);
        }, 2000);
      },
      error: (err) => {
        console.error('Erro ao criar solicitação:', err);
        
        // Mostra erro específico baseado no status HTTP
        if (err.status === 401) {
          this.toastService.error('Você precisa estar logado para fazer uma solicitação.');
        } else if (err.status === 400) {
          this.toastService.error('Dados inválidos para criar a solicitação.');
        } else {
          this.toastService.error('Erro ao criar solicitação. Tente novamente mais tarde.');
        }
      }
    });
  }
}