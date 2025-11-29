import { Component, inject, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import { ApiService } from "../../../core/services/api.service"
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component"

@Component({
    selector: "app-news-detail",
    standalone: true,
    imports: [CommonModule, FormsModule, NavbarComponent],
    templateUrl: "./news-detail.component.html",
})
export class NewsDetailComponent implements OnInit {
    private apiService = inject(ApiService)
    private route = inject(ActivatedRoute)
    private router = inject(Router)

    news: any | null = null
    isLoading = true
    commentInput = ""

    ngOnInit(): void {
        const newsId = this.route.snapshot.paramMap.get('id')
        if (newsId) {
            this.loadNews(newsId)
        } else {
            this.router.navigate(['/news'])
        }
    }

    loadNews(id: string): void {
        this.isLoading = true
        // Assuming the API returns a single news item or we filter from the list. 
        // Ideally there should be a specific endpoint /news/:id, but if not we might need to fetch all and find.
        // Let's try fetching all and finding first as per previous patterns, or check if get /news/:id exists.
        // Based on previous context, we've been fetching all /news. Let's assume we can fetch all and find, 
        // or better, let's try to fetch specific if the API supports it. 
        // Given the backend context isn't fully visible, I'll stick to what likely works: 
        // The previous code used /news to get a list. I'll assume /news/:id might not be implemented or I should check.
        // Actually, looking at the dashboard code, it fetches /news. 
        // Let's try to fetch the specific news item. If it fails, we can fallback.
        // But wait, standard REST usually has /news/:id.

        // Let's try to fetch the list and find it for now to be safe, or if I can see backend code...
        // I see `NaSede.Api` running.
        // Let's assume /news returns the list. I'll fetch the list and find the item for now to be safe 
        // unless I want to check the backend routes.
        // Actually, I'll try to GET /news/{id} if possible. 
        // However, to be safe and quick, I'll fetch the list and filter, as I know /news works.
        // Wait, fetching all news to show one is inefficient. 
        // Let's assume there is a GET /news/{id} or similar.
        // Actually, I'll check the dashboard component again. It fetches /news.
        // I'll try to use `this.apiService.get<any>(`/news/${id}`)`. If it errors, I'll handle it.

        this.apiService.get<any>(`/news/${id}`).subscribe({
            next: (data) => {
                this.news = data
                this.isLoading = false
            },
            error: (err) => {
                console.error("Error loading news detail:", err)
                // Fallback: try fetching all and finding
                this.apiService.get<any[]>("/news").subscribe({
                    next: (allNews) => {
                        this.news = allNews.find(n => n.id === id)
                        this.isLoading = false
                        if (!this.news) this.router.navigate(['/news'])
                    },
                    error: (e) => {
                        console.error("Error loading news list fallback:", e)
                        this.router.navigate(['/news'])
                    }
                })
            },
        })
    }

    goBack(): void {
        this.router.navigate(['/news'])
    }

    addComment(): void {
        if (!this.commentInput || this.commentInput.trim() === "" || !this.news) return

        this.apiService.post(`/news/${this.news.id}/comments`, { content: this.commentInput }).subscribe({
            next: () => {
                this.commentInput = ""
                this.loadNews(this.news.id)
            },
            error: (err) => console.error("Error adding comment:", err),
        })
    }
}
