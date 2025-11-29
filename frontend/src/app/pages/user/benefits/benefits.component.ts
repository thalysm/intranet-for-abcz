import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { BenefitService } from "../../../core/services/benefit.service"
import { BenefitCard } from "../../../core/models/benefit.model"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"

@Component({
  selector: "app-benefits",
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: "./benefits.component.html",
})
export class BenefitsComponent implements OnInit {
  benefits: BenefitCard[] = []
  isLoading = true

  constructor(
    private benefitService: BenefitService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBenefits()
  }

  loadBenefits(): void {
    this.benefitService.getBenefitCards().subscribe({
      next: (data) => {
        this.benefits = data
        this.isLoading = false
      },
      error: (err) => {
        console.error("Error loading benefits:", err)
        this.isLoading = false
      },
    })
  }

  viewBenefit(benefitId: string): void {
    this.router.navigate(['/benefits', benefitId])
  }

  executeButtonAction(buttonAction: string): void {
    if (buttonAction) {
      if (buttonAction.startsWith('http')) {
        window.open(buttonAction, '_blank')
      } else {
        // Outras ações customizadas podem ser implementadas aqui
        console.log('Executando ação:', buttonAction)
      }
    }
  }
}