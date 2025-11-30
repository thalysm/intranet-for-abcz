import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import { BenefitService } from "../../core/services/benefit.service"
import { BenefitCard } from "../../core/models/benefit.model"

@Component({
  selector: "app-home",
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
  benefits: BenefitCard[] = []
  isLoadingBenefits = true

  constructor(private benefitService: BenefitService) {}

  ngOnInit(): void {
    this.loadRecentBenefits()
  }

  loadRecentBenefits(): void {
    this.benefitService.getBenefitCards().subscribe({
      next: (data) => {
        // Mostra apenas os 3 benefícios mais recentes na home
        this.benefits = data.slice(0, 3)
        this.isLoadingBenefits = false
      },
      error: (err) => {
        console.error("Error loading benefits:", err)
        this.isLoadingBenefits = false
      },
    })
  }

  executeButtonAction(buttonAction: string): void {
    if (buttonAction) {
      if (buttonAction.startsWith('http')) {
        window.open(buttonAction, '_blank')
      }
    }
  }
}
