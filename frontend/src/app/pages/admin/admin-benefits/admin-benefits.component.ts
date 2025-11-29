import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { BenefitService } from "../../../core/services/benefit.service"
import { Benefit } from "../../../core/models/benefit.model"

@Component({
  selector: "app-admin-benefits",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./admin-benefits.component.html",
})
export class AdminBenefitsComponent implements OnInit {
  benefits: Benefit[] = []
  benefitForm: FormGroup
  showModal = false
  editingBenefit: Benefit | null = null
  isSubmitting = false
  isLoading = true

  constructor(
    private fb: FormBuilder,
    private benefitService: BenefitService
  ) {
    this.benefitForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      isActive: [true],
      imageUrl: [''],
      buttonAction: ['']
    })
  }

  ngOnInit(): void {
    this.loadBenefits()
  }

  loadBenefits(): void {
    this.isLoading = true
    this.benefitService.getBenefits().subscribe({
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

  openCreateModal(): void {
    this.editingBenefit = null
    this.benefitForm.reset({ isActive: true })
    this.showModal = true
  }

  editBenefit(benefit: Benefit): void {
    this.editingBenefit = benefit
    this.benefitForm.patchValue({
      name: benefit.name,
      description: benefit.description,
      isActive: benefit.isActive,
      imageUrl: benefit.imageUrl || '',
      buttonAction: benefit.buttonAction || ''
    })
    this.showModal = true
  }

  closeModal(): void {
    this.showModal = false
    this.editingBenefit = null
  }

  onSubmit(): void {
    if (this.benefitForm.invalid) return

    this.isSubmitting = true
    const formValue = this.benefitForm.value

    if (this.editingBenefit) {
      this.benefitService.updateBenefit(this.editingBenefit.id, formValue).subscribe({
        next: () => {
          this.loadBenefits()
          this.closeModal()
          this.isSubmitting = false
        },
        error: (err) => {
          console.error("Error updating benefit:", err)
          alert("Erro ao atualizar benefício. Tente novamente.")
          this.isSubmitting = false
        },
      })
    } else {
      this.benefitService.createBenefit(formValue).subscribe({
        next: () => {
          this.loadBenefits()
          this.closeModal()
          this.isSubmitting = false
        },
        error: (err) => {
          console.error("Error creating benefit:", err)
          alert("Erro ao criar benefício. Tente novamente.")
          this.isSubmitting = false
        },
      })
    }
  }

  deleteBenefit(benefit: Benefit): void {
    if (!confirm(`Tem certeza que deseja excluir o benefício "${benefit.name}"?`)) return

    this.benefitService.deleteBenefit(benefit.id).subscribe({
      next: () => this.loadBenefits(),
      error: (err) => {
        console.error("Error deleting benefit:", err)
        alert("Erro ao excluir benefício. Tente novamente.")
      },
    })
  }

  toggleStatus(benefit: Benefit): void {
    const updateData = {
      name: benefit.name,
      description: benefit.description,
      isActive: !benefit.isActive,
      imageUrl: benefit.imageUrl || '',
      buttonAction: benefit.buttonAction || ''
    }

    this.benefitService.updateBenefit(benefit.id, updateData).subscribe({
      next: () => this.loadBenefits(),
      error: (err) => {
        console.error("Error updating benefit status:", err)
        alert("Erro ao alterar status do benefício. Tente novamente.")
      },
    })
  }
}