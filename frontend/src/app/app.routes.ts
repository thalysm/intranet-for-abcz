import type { Routes } from "@angular/router"
import { authGuard } from "./core/guards/auth.guard"
import { adminGuard } from "./core/guards/admin.guard"

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./pages/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "login",
    loadComponent: () => import("./pages/auth/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "auth/whatsapp/:token",
    loadComponent: () =>
      import("./pages/auth/whatsapp-auth/whatsapp-auth.component").then((m) => m.WhatsappAuthComponent),
  },
  {
    path: "dashboard",
    canActivate: [authGuard],
    loadComponent: () => import("./pages/user/dashboard/dashboard.component").then((m) => m.DashboardComponent),
  },
  {
    path: "events",
    canActivate: [authGuard],
    loadComponent: () => import("./pages/user/events/events.component").then((m) => m.EventsComponent),
  },
  {
    path: "marketplace",
    canActivate: [authGuard],
    loadComponent: () => import("./pages/user/marketplace/marketplace.component").then((m) => m.MarketplaceComponent),
  },
  {
    path: "account-statements",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./pages/user/account-statements/account-statements.component").then((m) => m.AccountStatementsComponent),
  },
  {
    path: "benefits",
    canActivate: [authGuard],
    loadComponent: () => import("./pages/user/benefits/benefits.component").then((m) => m.BenefitsComponent),
  },
  {
    path: "benefits/:id",
    canActivate: [authGuard],
    loadComponent: () => import("./pages/user/benefit-detail/benefit-detail.component").then((m) => m.BenefitDetailComponent),
  },
  {
    path: "loan-simulation",
    canActivate: [authGuard],
    loadComponent: () => import("./pages/user/loan-simulation/loan-simulation.component").then((m) => m.LoanSimulationComponent),
  },
  {
    path: "requests",
    canActivate: [authGuard],
    loadComponent: () => import("./pages/user/user-requests/user-requests.component").then((m) => m.UserRequestsComponent),
  },
  {
    path: "admin",
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./pages/admin/admin-dashboard/admin-dashboard.component").then((m) => m.AdminDashboardComponent),
      },
      {
        path: "events",
        loadComponent: () =>
          import("./pages/admin/admin-events/admin-events.component").then((m) => m.AdminEventsComponent),
      },
      {
        path: "news",
        loadComponent: () => import("./pages/admin/admin-news/admin-news.component").then((m) => m.AdminNewsComponent),
      },
      {
        path: "messages",
        loadComponent: () =>
          import("./pages/admin/admin-messages/admin-messages.component").then((m) => m.AdminMessagesComponent),
      },
      {
        path: "account-statements",
        loadComponent: () =>
          import("./pages/admin/admin-account-statements/admin-account-statements.component").then(
            (m) => m.AdminAccountStatementsComponent,
          ),
      },
      {
        path: "benefits",
        loadComponent: () =>
          import("./pages/admin/admin-benefits/admin-benefits.component").then((m) => m.AdminBenefitsComponent),
      },
      {
        path: "requests",
        loadComponent: () =>
          import("./pages/admin/admin-requests/admin-requests.component").then((m) => m.AdminRequestsComponent),
      },
    ],
  },
  {
    path: "**",
    redirectTo: "",
  },
]
