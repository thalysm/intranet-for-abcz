import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import type { ApiService } from "../../../core/services/api.service"

@Component({
  selector: "app-marketplace",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./marketplace.component.html",
})
export class MarketplaceComponent implements OnInit {
  items: any[] = []

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadItems()
  }

  loadItems(): void {
    this.apiService.get<any[]>("/marketplace").subscribe({
      next: (data) => (this.items = data),
      error: (err) => console.error("Error loading marketplace:", err),
    })
  }
}
