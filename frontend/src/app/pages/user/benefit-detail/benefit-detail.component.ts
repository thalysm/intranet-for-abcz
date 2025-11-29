import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router } from "@angular/router"
import { BenefitService } from "../../../core/services/benefit.service"
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

  executeButtonAction(buttonAction: string): void {
    if (buttonAction) {
      if (buttonAction.startsWith('http')) {
        window.open(buttonAction, '_blank')
      } else {
        console.log('Executando ação:', buttonAction)
      }
    }
  }
}