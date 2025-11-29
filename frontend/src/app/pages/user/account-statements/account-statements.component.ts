import { Component, inject, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ApiService } from "../../../core/services/api.service"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"

@Component({
  selector: "app-account-statements",
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: "./account-statements.component.html",
})
export class AccountStatementsComponent implements OnInit {
  private apiService = inject(ApiService)

  statements: any[] = []

  ngOnInit(): void {
    this.loadStatements()
  }

  loadStatements(): void {
    this.apiService.get<any[]>("/accountstatements").subscribe({
      next: (data) => (this.statements = data),
      error: (err) => console.error("Error loading statements:", err),
    })
  }

  viewDocument(url: string): void {
    if (url) {
      window.open(url, '_blank')
    }
  }
}
