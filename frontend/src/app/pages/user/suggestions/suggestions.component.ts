import { Component, inject, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { ApiService } from "../../../core/services/api.service"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"

@Component({
  selector: "app-suggestions",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: "./suggestions.component.html",
})
export class SuggestionsComponent implements OnInit {
  private formBuilder = inject(FormBuilder)
  private apiService = inject(ApiService)
  private router = inject(Router)

  suggestionForm!: FormGroup
  isSubmitting = false
  successMessage = ""
  errorMessage = ""
  suggestionTypeId = "550e8400-e29b-41d4-a716-446655440000" 

  ngOnInit(): void {
    this.initializeForm()
  }

  initializeForm(): void {
    this.suggestionForm = this.formBuilder.group({
      title: ["", [Validators.required, Validators.maxLength(200)]],
      description: ["", [Validators.required, Validators.maxLength(1000)]]
    })
  }

  onSubmit(): void {
    if (this.suggestionForm.valid && !this.isSubmitting) {
      this.isSubmitting = true
      this.errorMessage = ""
      this.successMessage = ""

      const suggestionData = {
        typeId: this.suggestionTypeId,
        title: this.suggestionForm.value.title,
        description: this.suggestionForm.value.description
      }

      this.apiService.post("/requests", suggestionData).subscribe({
        next: (response) => {
          this.successMessage = "Sugestão enviada com sucesso! Obrigado pelo seu feedback."
          this.suggestionForm.reset()
          this.isSubmitting = false
          
          // Redirecionar para requests após 2 segundos
          setTimeout(() => {
            this.router.navigate(["/requests"])
          }, 2000)
        },
        error: (error) => {
          this.errorMessage = "Erro ao enviar sugestão. Tente novamente."
          this.isSubmitting = false
          console.error("Error submitting suggestion:", error)
        }
      })
    }
  }

  goBack(): void {
    this.router.navigate(["/dashboard"])
  }
}