import { Component, inject, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { ApiService } from "../../../core/services/api.service"
import { AuthService } from "../../../core/services/auth.service"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"

@Component({
  selector: "app-marketplace",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: "./marketplace.component.html",
})
export class MarketplaceComponent implements OnInit {
  private apiService = inject(ApiService)
  private authService = inject(AuthService)
  private fb = inject(FormBuilder)

  items: any[] = []
  showMarketplaceModal = false
  isSubmitting = false

  marketplaceForm: FormGroup = this.fb.group({
    title: ["", Validators.required],
    description: ["", Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    type: [0, Validators.required],
    contactInfo: ["", Validators.required],
    imageUrl: [""],
  })

  get currentUser() {
    return this.authService.currentUser()
  }

  ngOnInit(): void {
    this.loadItems()
  }

  loadItems(): void {
    this.apiService.get<any[]>("/marketplace").subscribe({
      next: (data) => (this.items = data),
      error: (err) => console.error("Error loading marketplace:", err),
    })
  }

  getWhatsAppLink(contactInfo: string): string {
    return "https://wa.me/" + contactInfo.replace(/\D/g, "")
  }

  isMyItem(item: any): boolean {
    return item.userId === this.currentUser?.id
  }

  deleteMarketplaceItem(itemId: string): void {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return

    this.apiService.delete(`/marketplace/${itemId}`).subscribe({
      next: () => {
        this.loadItems()
        alert("Anúncio excluído com sucesso!")
      },
      error: (err) => console.error("Error deleting item:", err),
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
        this.loadItems()
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
}
