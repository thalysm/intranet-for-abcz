import { Injectable, signal } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Router } from "@angular/router"
import { type Observable, tap } from "rxjs"
import type { User } from "../models/user.model"
import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly API_URL = environment.apiUrl
  currentUser = signal<User | null>(null)

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadUserFromStorage()
  }

  login(matriculaOrPhone: string, password: string): Observable<{ token: string; user: User }> {
    return this.http
      .post<{ token: string; user: User }>(`${this.API_URL}/auth/login`, {
        matriculaOrPhone,
        password,
      })
      .pipe(
        tap((response) => {
          this.setSession(response.token, response.user)
        }),
      )
  }

  loginWithWhatsApp(token: string): Observable<{ token: string; user: User }> {
    return this.http
      .post<{ token: string; user: User }>(`${this.API_URL}/auth/whatsapp`, {
        token,
      })
      .pipe(
        tap((response) => {
          this.setSession(response.token, response.user)
        }),
      )
  }

  logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    this.currentUser.set(null)
    this.router.navigate(["/"])
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  isAdmin(): boolean {
    const user = this.currentUser()
    return user?.role === 1
  }

  getToken(): string | null {
    return localStorage.getItem("token")
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    this.currentUser.set(user)
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        this.currentUser.set(JSON.parse(userStr))
      } catch (e) {
        localStorage.removeItem("user")
      }
    }
  }
}
