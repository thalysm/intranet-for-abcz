import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, Router } from "@angular/router"
import { AuthService } from "../../../../core/services/auth.service"

@Component({
    selector: "app-admin-navbar",
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: "./admin-navbar.component.html",
})
export class AdminNavbarComponent {
    private authService = inject(AuthService)
    private router = inject(Router)

    mobileMenuOpen = false

    currentUser = this.authService.currentUser

    logout(): void {
        this.authService.logout()
        this.router.navigate(["/login"])
    }
}
