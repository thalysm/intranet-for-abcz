import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink, RouterLinkActive, type Router } from "@angular/router"
import type { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: "./navbar.component.html",
})
export class NavbarComponent {
  currentUser = this.authService.currentUser()
  isAdmin = this.authService.isAdmin()
  mobileMenuOpen = false

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  logout(): void {
    this.authService.logout()
    this.mobileMenuOpen = false
  }
}
