import { Component, inject, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { ApiService } from "../../../core/services/api.service"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"

@Component({
    selector: "app-news",
    standalone: true,
    imports: [CommonModule, FormsModule, NavbarComponent, RouterModule],
    templateUrl: "./news.component.html",
})
export class NewsComponent implements OnInit {
    private apiService = inject(ApiService)

    newsList: any[] = []
    isLoading = true

    ngOnInit(): void {
        this.loadNews()
    }

    loadNews(): void {
        this.isLoading = true
        this.apiService.get<any[]>("/news").subscribe({
            next: (data) => {
                this.newsList = data
                this.isLoading = false
            },
            error: (err) => {
                console.error("Error loading news:", err)
                this.isLoading = false
            },
        })
    }
}
