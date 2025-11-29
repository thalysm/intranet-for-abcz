import { Component, inject, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"
import { ApiService } from "../../../core/services/api.service"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, RouterModule],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService)
  private apiService = inject(ApiService)

  get currentUser() {
    return this.authService.currentUser()
  }

  newsList: any[] = []

  ngOnInit(): void {
    this.loadNews()
  }

  loadNews(): void {
    this.apiService.get<any[]>("/news").subscribe({
      next: (data) => (this.newsList = data),
      error: (err) => console.error("Error loading news:", err),
    })
  }
}
