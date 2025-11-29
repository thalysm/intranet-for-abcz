import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { type FormBuilder, type FormGroup, Validators, ReactiveFormsModule, FormsModule } from "@angular/forms"
import type { Router } from "@angular/router"
import type { AuthService } from "../../../core/services/auth.service"
import type { ApiService } from "../../../core/services/api.service"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
  activeTab: "news" | "events" | "marketplace" | "statements" = "news"
  currentUser = this.authService.currentUser()

  newsList: any[] = []
  upcomingEvents: any[] = []
  marketplaceItems: any[] = []
  statements: any[] = []

  commentInputs: { [key: string]: string } = {}
  showMarketplaceModal = false
  marketplaceForm: FormGroup
  isSubmitting = false

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.marketplaceForm = this.fb.group({
      title: ["", Validators.required],
      description: ["", Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      type: [0, Validators.required],
      contactInfo: ["", Validators.required],
      imageUrl: [""],
    })
  }

  ngOnInit(): void {
    this.loadNews()
    this.loadEvents()
    this.loadMarketplace()
    this.loadStatements()
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

  logout(): void {
    this.authService.logout()
  }
}
