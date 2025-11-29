import { Component, inject, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from "@angular/forms"
import { Router, RouterModule } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"
import { ApiService } from "../../../core/services/api.service"
import { BenefitService } from "../../../core/services/benefit.service"
import { LoanSimulationService } from "../../../core/services/loan-simulation.service"
import { BenefitCard } from "../../../core/models/benefit.model"
import { LoanSimulation } from "../../../core/models/loan-simulation.model"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService)
  private apiService = inject(ApiService)
  private benefitService = inject(BenefitService)
  private loanSimulationService = inject(LoanSimulationService)
  private router = inject(Router)
  private fb = inject(FormBuilder)

  activeTab: "news" | "events" | "marketplace" | "statements" | "benefits" | "loans" = "news"

  get currentUser() {
    return this.authService.currentUser()
  }

  newsList: any[] = []
  upcomingEvents: any[] = []
  marketplaceItems: any[] = []
  statements: any[] = []
  benefits: BenefitCard[] = []
  loanSimulations: LoanSimulation[] = []

  commentInputs: { [key: string]: string } = {}
  showMarketplaceModal = false
  marketplaceForm: FormGroup = this.fb.group({
    title: ["", Validators.required],
    description: ["", Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    type: [0, Validators.required],
    contactInfo: ["", Validators.required],
    imageUrl: [""],
  })
  isSubmitting = false

  ngOnInit(): void {
    this.loadNews()
    this.loadEvents()
    this.loadMarketplace()
    this.loadStatements()
    this.loadBenefits()
    this.loadLoanSimulations()
  }

  loadNews(): void {
    this.apiService.get<any[]>("/news").subscribe({
      next: (data) => (this.newsList = data),
      error: (err) => console.error("Error loading news:", err),
    })
  }

  loadEvents(): void {
    this.apiService.get<any[]>("/events").subscribe({
      next: (data) => {
        const now = new Date()
        this.upcomingEvents = data.filter((e) => new Date(e.eventDate) >= now)
      },
      error: (err) => console.error("Error loading events:", err),
    })
  }

  loadMarketplace(): void {
    this.apiService.get<any[]>("/marketplace").subscribe({
      next: (data) => (this.marketplaceItems = data),
      error: (err) => console.error("Error loading marketplace:", err),
    })
  }

  loadStatements(): void {
    this.apiService.get<any[]>("/accountstatements").subscribe({
      next: (data) => (this.statements = data),
      error: (err) => console.error("Error loading statements:", err),
    })
  }

  loadBenefits(): void {
    this.benefitService.getBenefitCards().subscribe({
      next: (data) => (this.benefits = data),
      error: (err) => console.error("Error loading benefits:", err),
    })
  }

  loadLoanSimulations(): void {
    this.loanSimulationService.getLoanSimulations().subscribe({
      next: (data) => (this.loanSimulations = data),
      error: (err) => console.error("Error loading loan simulations:", err),
    })
  }

  addComment(newsId: string, content: string): void {
    if (!content || content.trim() === "") return

    this.apiService.post(`/news/${newsId}/comments`, { content }).subscribe({
      next: () => {
        this.commentInputs[newsId] = ""
        this.loadNews()
      },
      error: (err) => console.error("Error adding comment:", err),
    })
  }

  getUserConfirmation(event: any): number {
    const confirmation = event.confirmations?.find((c: any) => c.userId === this.currentUser?.id)
    return confirmation?.status ?? 0
  }

  confirmEvent(eventId: string): void {
    this.apiService.post(`/events/${eventId}/confirm`, {}).subscribe({
      next: () => {
        this.loadEvents()
        alert("Presença confirmada com sucesso!")
      },
      error: (err) => console.error("Error confirming event:", err),
    })
  }

  declineEvent(eventId: string): void {
    this.apiService.post(`/events/${eventId}/decline`, {}).subscribe({
      next: () => {
        this.loadEvents()
        alert("Resposta registrada com sucesso!")
      },
      error: (err) => console.error("Error declining event:", err),
    })
  }

  openMarketplaceModal(): void {
    this.marketplaceForm.reset({ type: 0, price: 0 })
    this.showMarketplaceModal = true
  }

  closeMarketplaceModal(): void {
    this.showMarketplaceModal = false
  }

  onMarketplaceSubmit(): void {
    if (this.marketplaceForm.invalid) return

    this.isSubmitting = true
    const formValue = this.marketplaceForm.value

    this.apiService.post("/marketplace", formValue).subscribe({
      next: () => {
        this.loadMarketplace()
        this.closeMarketplaceModal()
        this.isSubmitting = false
        alert("Anúncio criado com sucesso!")
      },
      error: (err) => {
        console.error("Error creating marketplace item:", err)
        this.isSubmitting = false
        alert("Erro ao criar anúncio. Tente novamente.")
      },
    })
  }

  deleteMarketplaceItem(itemId: string): void {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return

    this.apiService.delete(`/marketplace/${itemId}`).subscribe({
      next: () => {
        this.loadMarketplace()
        alert("Anúncio excluído com sucesso!")
      },
      error: (err) => console.error("Error deleting item:", err),
    })
  }

  isMyItem(item: any): boolean {
    return item.userId === this.currentUser?.id
  }

  getWhatsAppLink(contactInfo: string): string {
    return "https://wa.me/" + contactInfo.replace(/\D/g, "")
  }

  viewBenefit(benefitId: string): void {
    this.router.navigate(['/benefits', benefitId])
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

  logout(): void {
    this.authService.logout()
  }
}
