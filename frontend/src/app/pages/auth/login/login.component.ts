import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { type FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { type Router, RouterLink } from "@angular/router"
import type { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  loginForm: FormGroup
  isLoading = false
  errorMessage = ""

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      matriculaOrPhone: ["", Validators.required],
      password: ["", Validators.required],
    })
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
