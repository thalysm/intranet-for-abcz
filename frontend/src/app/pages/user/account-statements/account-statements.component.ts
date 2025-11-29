import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import type { ApiService } from "../../../core/services/api.service"

@Component({
  selector: "app-account-statements",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./account-statements.component.html",
})
export class AccountStatementsComponent implements OnInit {
  statements: any[] = []

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadStatements()
  }

  loadStatements(): void {
    this.apiService.get<any[]>("/accountstatements").subscribe({
      next: (data) => (this.statements = data),
      error: (err) => console.error("Error loading statements:", err),
    })
  }
}
