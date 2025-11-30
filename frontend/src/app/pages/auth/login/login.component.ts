import { Component, inject, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./login.component.html",
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder)
  private authService = inject(AuthService)
  private router = inject(Router)

  loginForm: FormGroup = this.fb.group({
    matriculaOrPhone: ["", Validators.required],
    password: ["", Validators.required],
  })
  isLoading = false
  errorMessage = ""

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const user = this.authService.currentUser()
      if (user?.role === 1) {
        this.router.navigate(["/admin"])
      } else {
        this.router.navigate(["/dashboard"])
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return

    this.isLoading = true
    this.errorMessage = ""

    const { matriculaOrPhone, password } = this.loginForm.value

    this.authService.login(matriculaOrPhone, password).subscribe({
      next: () => {
        const user = this.authService.currentUser()
        if (user?.role === 1) {
          this.router.navigate(["/admin"])
        } else {
          this.router.navigate(["/dashboard"])
        }
      },
      error: (err) => {
        this.isLoading = false
        this.errorMessage = "Credenciais inválidas. Verifique sua matrícula/WhatsApp e senha."
        console.error("Login error:", err)
      },
    })
  }
}
