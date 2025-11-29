import { Component, inject, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ApiService } from "../../../core/services/api.service"
import { AuthService } from "../../../core/services/auth.service"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"

@Component({
  selector: "app-events",
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: "./events.component.html",
})
export class EventsComponent implements OnInit {
  private apiService = inject(ApiService)
  private authService = inject(AuthService)

  events: any[] = []

  get currentUser() {
    return this.authService.currentUser()
  }

  ngOnInit(): void {
    this.loadEvents()
  }

  loadEvents(): void {
    this.apiService.get<any[]>("/events").subscribe({
      next: (data) =>
        (this.events = data.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())),
      error: (err) => console.error("Error loading events:", err),
    })
  }

  getUserConfirmation(event: any): number {
    const confirmation = event.confirmations?.find((c: any) => c.userId === this.currentUser?.id)
    return confirmation?.status ?? 0
  }

  confirmEvent(eventId: string): void {
    this.apiService.post(`/events/${eventId}/confirm`, {}).subscribe({
      next: () => {
        this.loadEvents()
        alert("Presença confirmada com sucesso!")
      },
      error: (err) => console.error("Error confirming event:", err),
    })
  }

  declineEvent(eventId: string): void {
    this.apiService.post(`/events/${eventId}/decline`, {}).subscribe({
      next: () => {
        this.loadEvents()
        alert("Resposta registrada com sucesso!")
      },
      error: (err) => console.error("Error declining event:", err),
    })
  }
}
