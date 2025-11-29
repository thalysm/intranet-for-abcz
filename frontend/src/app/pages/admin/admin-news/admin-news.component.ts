import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { ApiService } from "../../../core/services/api.service"

import { AdminNavbarComponent } from "../components/admin-navbar/admin-navbar.component"

@Component({
  selector: "app-admin-news",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminNavbarComponent],
  templateUrl: "./admin-news.component.html",
})
export class AdminNewsComponent implements OnInit {
  newsList: any[] = []
  users: any[] = []
  newsForm: FormGroup
  showModal = false
  editingNews: any = null
  isSubmitting = false
  selectedUserIds: Set<string> = new Set()

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
  ) {
    this.newsForm = this.fb.group({
      title: ["", Validators.required],
      content: ["", Validators.required],
      imageUrl: [""],
      notifyAll: [false],
      notifyUserIds: [[]],
    })
  }

  ngOnInit(): void {
    this.loadNews()
    this.loadUsers()
  }

  loadNews(): void {
    this.apiService.get<any[]>("/news").subscribe({
      next: (data) => (this.newsList = data),
      error: (err) => console.error("Error loading news:", err),
    })
  }

  loadUsers(): void {
    this.apiService.get<any[]>("/events/users").subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error("Error loading users:", err),
    })
  }

  openCreateModal(): void {
    this.editingNews = null
    this.selectedUserIds.clear()
    this.newsForm.reset({ notifyAll: false })
    this.showModal = true
  }

  editNews(news: any): void {
    this.editingNews = news
    this.newsForm.patchValue({
      title: news.title,
      content: news.content,
      imageUrl: news.imageUrl,
    })
    this.showModal = true
  }

  closeModal(): void {
    this.showModal = false
    this.editingNews = null
    this.selectedUserIds.clear()
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
    if (this.newsForm.invalid) return

    this.isSubmitting = true
    const formValue = this.newsForm.value

    const payload = {
      ...formValue,
      notifyUserIds: Array.from(this.selectedUserIds),
    }

    if (this.editingNews) {
      this.apiService.put(`/news/${this.editingNews.id}`, payload).subscribe({
        next: () => {
          this.loadNews()
          this.closeModal()
          this.isSubmitting = false
        },
        error: (err) => {
          console.error("Error updating news:", err)
          this.isSubmitting = false
        },
      })
    } else {
      this.apiService.post("/news", payload).subscribe({
        next: () => {
          this.loadNews()
          this.closeModal()
          this.isSubmitting = false
        },
        error: (err) => {
          console.error("Error creating news:", err)
          this.isSubmitting = false
        },
      })
    }
  }

  deleteNews(id: string): void {
    if (!confirm("Tem certeza que deseja excluir esta notícia?")) return

    this.apiService.delete(`/news/${id}`).subscribe({
      next: () => this.loadNews(),
      error: (err) => console.error("Error deleting news:", err),
    })
  }
}
