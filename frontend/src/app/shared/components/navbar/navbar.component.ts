import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink, RouterLinkActive, Router } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: "./navbar.component.html",
})
export class NavbarComponent {
  private authService = inject(AuthService)
  private router = inject(Router)

  mobileMenuOpen = false

  get currentUser() {
    return this.authService.currentUser()
  }

  get isAdmin() {
    return this.authService.isAdmin()
  }

  logout(): void {
    this.authService.logout()
    this.mobileMenuOpen = false
  }
}
