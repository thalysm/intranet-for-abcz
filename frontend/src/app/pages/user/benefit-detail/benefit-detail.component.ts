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
    
    if (buttonAction.startsWith('http')) return false;
    
    return true;
  }

  executeButtonAction(buttonAction: string): void {
    if (!buttonAction || !this.benefit) {
      return;
    }

    if (buttonAction.startsWith('http')) {
      window.open(buttonAction, '_blank');
      return;
    }

    this.createBenefitRequest();
  }

  private createBenefitRequest(): void {
    if (!this.benefit) return;

    this.requestService.getRequestTypes().subscribe({
      next: (requestTypes) => {
        let benefitRequestType = requestTypes.find(type => 
          type.name.toLowerCase().includes('beneficio') || 
          type.name.toLowerCase().includes('benefit')
        );

        if (benefitRequestType) {
          this.submitBenefitRequest(benefitRequestType.id);
        } else if (requestTypes.length > 0) {
          this.createBenefitType().then(typeId => {
            if (typeId) {
              this.submitBenefitRequest(typeId);
            } else {
              this.submitBenefitRequest(requestTypes[0].id);
            }
          });
        } else {
          this.toastService.error('Tipos de solicitação não encontrados.');
        }
      },
      error: (err) => {
        console.error('Erro ao carregar tipos de solicitação:', err);
        this.toastService.error('Erro de conexão.');
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
        this.toastService.success('Solicitação criada com sucesso!');
        
        setTimeout(() => {
          this.router.navigate(['/benefits']);
        }, 2000);
      },
      error: (err) => {
        console.error('Erro ao criar solicitação:', err);
        
        if (err.status === 401) {
          this.toastService.error('Login necessário para solicitar.');
        } else if (err.status === 400) {
          this.toastService.error('Dados inválidos na solicitação.');
        } else {
          this.toastService.error('Erro ao criar solicitação.');
        }
      }
    });
  }
}