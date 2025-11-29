import { Component } from "@angular/core"
import { RouterLink } from "@angular/router"
import { ToastComponent } from "../../../shared/components/toast/toast.component"

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [RouterLink, ToastComponent],
  templateUrl: "./admin-dashboard.component.html",
})
export class AdminDashboardComponent {}
