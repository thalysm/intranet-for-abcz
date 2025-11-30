import { Component, inject, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { ApiService } from "../../../core/services/api.service"
import { AuthService } from "../../../core/services/auth.service"
import { ToastService } from "../../../core/services/toast.service"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"
import { ToastComponent } from "../../../shared/components/toast/toast.component"

@Component({
  selector: "app-marketplace",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, ToastComponent],
  templateUrl: "./marketplace.component.html",
})
export class MarketplaceComponent implements OnInit {
  private apiService = inject(ApiService)
  private authService = inject(AuthService)
  private toastService = inject(ToastService)
  private fb = inject(FormBuilder)

  items: any[] = []
  showMarketplaceModal = false
  isSubmitting = false

  priceDisplay: string = ''
  contactDisplay: string = ''

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

  formatCurrencyInput(value: string): string {
    const numbers = value.replace(/\D/g, '')
    
    if (!numbers) return ''
    
    const amount = parseFloat(numbers) / 100
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(amount)
  }

  parseCurrencyInput(value: string): number {
    const numbers = value.replace(/[R$\s.]/g, '').replace(',', '.')
    return parseFloat(numbers) || 0
  }

  onPriceInput(event: Event): void {
    const input = event.target as HTMLInputElement
    const formatted = this.formatCurrencyInput(input.value)
    
    this.priceDisplay = formatted
    input.value = formatted
    
    const numericValue = this.parseCurrencyInput(formatted)
    this.marketplaceForm.patchValue({ price: numericValue }, { emitEvent: false })
  }

  formatPhoneInput(value: string): string {
    const numbers = value.replace(/\D/g, '')
    
    if (!numbers) return ''
    
    if (numbers.length <= 2) {
      return `(${numbers}`
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }

  parsePhoneInput(value: string): string {
    return value.replace(/\D/g, '')
  }

  onContactInput(event: Event): void {
    const input = event.target as HTMLInputElement
    const formatted = this.formatPhoneInput(input.value)
    
    this.contactDisplay = formatted
    input.value = formatted
    
    const numericValue = this.parsePhoneInput(formatted)
    this.marketplaceForm.patchValue({ contactInfo: numericValue }, { emitEvent: false })
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
        this.toastService.success("Anúncio excluído com sucesso!")
      },
      error: (err) => {
        console.error("Error deleting item:", err)
        this.toastService.error("Erro ao excluir anúncio. Tente novamente.")
      },
    })
  }

  openMarketplaceModal(): void {
    this.marketplaceForm.reset({ type: 0, price: 0 })
    this.priceDisplay = ''
    this.contactDisplay = ''
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
        this.toastService.success("Anúncio criado com sucesso!")
      },
      error: (err) => {
        console.error("Error creating marketplace item:", err)
        this.isSubmitting = false
        this.toastService.error("Erro ao criar anúncio. Tente novamente.")
      },
    })
  }
}
