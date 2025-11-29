import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { ApiService } from "../../../core/services/api.service"

@Component({
  selector: "app-admin-account-statements",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./admin-account-statements.component.html",
})
export class AdminAccountStatementsComponent implements OnInit {
  statements: any[] = []
  users: any[] = []
  statementForm: FormGroup
  showModal = false
  isSubmitting = false

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
  ) {
    this.statementForm = this.fb.group({
      title: ["", Validators.required],
      description: ["", Validators.required],
      filePath: ["", Validators.required],
      type: ["1", Validators.required],
      userId: [null],
    })
  }

  ngOnInit(): void {
    this.loadStatements()
    this.loadUsers()
  }

  loadStatements(): void {
    this.apiService.get<any[]>("/accountstatements").subscribe({
      next: (data) => (this.statements = data),
      error: (err) => console.error("Error loading statements:", err),
    })
  }

  loadUsers(): void {
    this.apiService.get<any[]>("/events/users").subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error("Error loading users:", err),
    })
  }

  openCreateModal(): void {
    this.statementForm.reset({ type: "1" })
    this.showModal = true
  }

  closeModal(): void {
    this.showModal = false
  }

  onSubmit(): void {
    if (this.statementForm.invalid) return

    this.isSubmitting = true
    const formValue = this.statementForm.value

    const payload = {
      title: formValue.title,
      description: formValue.description,
      filePath: formValue.filePath,
      type: Number.parseInt(formValue.type),
      userId: formValue.type === "0" ? formValue.userId : null,
    }

    this.apiService.post("/accountstatements", payload).subscribe({
      next: () => {
        this.loadStatements()
        this.closeModal()
        this.isSubmitting = false
      },
      error: (err) => {
        console.error("Error creating statement:", err)
        this.isSubmitting = false
      },
    })
  }

  deleteStatement(id: string): void {
    if (!confirm("Tem certeza que deseja excluir este documento?")) return

    this.apiService.delete(`/accountstatements/${id}`).subscribe({
      next: () => this.loadStatements(),
      error: (err) => console.error("Error deleting statement:", err),
    })
  }
}
