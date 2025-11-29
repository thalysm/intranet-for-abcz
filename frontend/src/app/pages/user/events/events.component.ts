import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ApiService } from "../../../core/services/api.service"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"

@Component({
  selector: "app-events",
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: "./events.component.html",
})
export class EventsComponent implements OnInit {
  events: any[] = []

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadEvents()
  }

  loadEvents(): void {
    this.apiService.get<any[]>("/events").subscribe({
      next: (data) =>
        (this.events = data.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())),
      error: (err) => console.error("Error loading events:", err),
    })
  }
}
