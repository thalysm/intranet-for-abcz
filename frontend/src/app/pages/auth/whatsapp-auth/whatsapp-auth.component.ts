import { Component, inject, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router, RouterLink } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-whatsapp-auth",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./whatsapp-auth.component.html",
})
export class WhatsappAuthComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private authService = inject(AuthService)

  isLoading = true
  errorMessage = ""

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get("token")

    if (!token) {
      this.errorMessage = "Token não fornecido"
      this.isLoading = false
      return
    }

    this.authService.loginWithWhatsApp(token).subscribe({
      next: () => {
        const user = this.authService.currentUser()
        if (user?.role === 1) {
          this.router.navigate(["/admin"])
        } else {
          this.router.navigate(["/dashboard"])
        }
      },
      error: () => {
        this.isLoading = false
        this.errorMessage = "Token inválido ou expirado. Solicite um novo link."
      },
    })
  }
}
