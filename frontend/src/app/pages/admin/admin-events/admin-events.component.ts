import { Component, type OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  type FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { ApiService } from "../../../core/services/api.service";

import { AdminNavbarComponent } from "../components/admin-navbar/admin-navbar.component";

@Component({
  selector: "app-admin-events",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminNavbarComponent],
  templateUrl: "./admin-events.component.html",
})
export class AdminEventsComponent implements OnInit {
  events: any[] = [];
  users: any[] = [];
  eventForm: FormGroup;
  showModal = false;
  showReportModal = false;
  editingEvent: any = null;
  selectedReport: any = null;
  isSubmitting = false;
  selectedUserIds: Set<string> = new Set();

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.eventForm = this.fb.group({
      title: ["", Validators.required],
      description: ["", Validators.required],
      eventDate: ["", Validators.required],
      location: ["", Validators.required],
      notifyAll: [true],
      notifyUserIds: [[]],
    });
  }

  ngOnInit(): void {
    this.loadEvents();
    this.loadUsers();
  }

  loadEvents(): void {
    this.apiService.get<any[]>("/events").subscribe({
      next: (data) => (this.events = data),
      error: (err) => console.error("Error loading events:", err),
    });
  }

  loadUsers(): void {
    this.apiService.get<any[]>("/events/users").subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error("Error loading users:", err),
    });
  }

  openCreateModal(): void {
    this.editingEvent = null;
    this.selectedUserIds.clear();
    this.eventForm.reset({ notifyAll: true });
    this.showModal = true;
  }

  editEvent(event: any): void {
    this.editingEvent = event;
    const eventDate = new Date(event.eventDate);

    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      eventDate: new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate(),
        eventDate.getHours() - 3,
        eventDate.getMinutes()
      )
        .toISOString()
        .slice(0, 16),
      location: event.location,
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingEvent = null;
    this.selectedUserIds.clear();
  }

  toggleUserSelection(userId: string): void {
    if (this.selectedUserIds.has(userId)) {
      this.selectedUserIds.delete(userId);
    } else {
      this.selectedUserIds.add(userId);
    }
  }

  isUserSelected(userId: string): boolean {
    return this.selectedUserIds.has(userId);
  }

  onSubmit(): void {
    if (this.eventForm.invalid) return;

    this.isSubmitting = true;
    let formValue = this.eventForm.value;

    // add 3 hours to the event date
    formValue.eventDate = new Date(formValue.eventDate);

    const payload = {
      ...formValue,
      notifyUserIds: Array.from(this.selectedUserIds),
    };

    if (this.editingEvent) {
      this.apiService
        .put(`/events/${this.editingEvent.id}`, payload)
        .subscribe({
          next: () => {
            this.loadEvents();
            this.closeModal();
            this.isSubmitting = false;
          },
          error: (err) => {
            console.error("Error updating event:", err);
            this.isSubmitting = false;
          },
        });
    } else {
      this.apiService.post("/events", payload).subscribe({
        next: () => {
          this.loadEvents();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error("Error creating event:", err);
          this.isSubmitting = false;
        },
      });
    }
  }

  deleteEvent(id: string): void {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;

    this.apiService.delete(`/events/${id}`).subscribe({
      next: () => this.loadEvents(),
      error: (err) => console.error("Error deleting event:", err),
    });
  }

  viewReport(eventId: string): void {
    this.apiService.get<any>(`/events/${eventId}/report`).subscribe({
      next: (data) => {
        this.selectedReport = data;
        this.showReportModal = true;
      },
      error: (err) => console.error("Error loading report:", err),
    });
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.selectedReport = null;
  }

  getConfirmedCount(event: any): number {
    return event.confirmations?.filter((c: any) => c.status === 1).length || 0;
  }

  getDeclinedCount(event: any): number {
    return event.confirmations?.filter((c: any) => c.status === 2).length || 0;
  }

  getPendingCount(event: any): number {
    return event.confirmations?.filter((c: any) => c.status === 0).length || 0;
  }
}
