import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { AdminNavbarComponent } from "../components/admin-navbar/admin-navbar.component"
import { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, AdminNavbarComponent],
  templateUrl: "./admin-dashboard.component.html",
})
export class AdminDashboardComponent {
  private authService = inject(AuthService)

  get currentUser() {
    return this.authService.currentUser()
  }
}
