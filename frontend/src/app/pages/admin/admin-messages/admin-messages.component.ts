import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { ApiService } from "../../../core/services/api.service"

import { AdminNavbarComponent } from "../components/admin-navbar/admin-navbar.component"

@Component({
  selector: "app-admin-messages",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminNavbarComponent],
  templateUrl: "./admin-messages.component.html",
})
export class AdminMessagesComponent implements OnInit {
  users: any[] = []
  messageForm: FormGroup
  isSubmitting = false
  messageSent = false
  messageResult: any = null
  selectedUserIds: Set<string> = new Set()

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
  ) {
    this.messageForm = this.fb.group({
      message: ["", Validators.required],
      sendToAll: [false],
      userIds: [[]],
    })
  }

  ngOnInit(): void {
    this.loadUsers()
  }

  loadUsers(): void {
    this.apiService.get<any[]>("/events/users").subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error("Error loading users:", err),
    })
  }

  toggleUserSelection(userId: string): void {
    if (this.selectedUserIds.has(userId)) {
      this.selectedUserIds.delete(userId)
    } else {
      this.selectedUserIds.add(userId)
    }
  }

  isUserSelected(userId: string): boolean {
    return this.selectedUserIds.has(userId)
  }

  onSubmit(): void {
    if (this.messageForm.invalid) return

    this.isSubmitting = true
    this.messageSent = false

    const payload = {
      message: this.messageForm.value.message,
      sendToAll: this.messageForm.value.sendToAll,
      userIds: Array.from(this.selectedUserIds),
    }

    this.apiService.post("/messaging/send", payload).subscribe({
      next: (result) => {
        this.messageResult = result
        this.messageSent = true
        this.isSubmitting = false
        this.messageForm.reset({ sendToAll: false })
        this.selectedUserIds.clear()
      },
      error: (err) => {
        console.error("Error sending messages:", err)
        this.isSubmitting = false
        alert("Erro ao enviar mensagens. Tente novamente.")
      },
    })
  }
}
