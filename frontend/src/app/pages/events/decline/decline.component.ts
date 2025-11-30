import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-events-decline',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './decline.component.html',
})
export class EventsDeclineComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private authService = inject(AuthService);
    private eventService = inject(EventService);
    private toastService = inject(ToastService);

    loading = signal(true);
    success = signal(false);
    error = signal<string | null>(null);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        const token = this.route.snapshot.queryParamMap.get('token');

        if (!id || !token) {
            this.error.set('Link inválido. Verifique se o link está correto.');
            this.loading.set(false);
            return;
        }

        this.processDecline(id, token);
    }

    private processDecline(id: string, token: string) {
        this.authService.loginWithWhatsApp(token).subscribe({
            next: () => {
                this.declineEvent(id);
            },
            error: (err) => {
                console.error('Login error', err);
                this.error.set('Não foi possível autenticar. O link pode ter expirado.');
                this.loading.set(false);
            }
        });
    }

    private declineEvent(id: string) {
        this.eventService.declinePresence(id).subscribe({
            next: () => {
                this.success.set(true);
                this.loading.set(false);
                this.toastService.info('Presença recusada.');
                setTimeout(() => {
                    this.router.navigate(['/']);
                }, 3000);
            },
            error: (err) => {
                console.error('Decline error', err);
                this.error.set('Erro ao recusar presença. Tente novamente.');
                this.loading.set(false);
            }
        });
    }
}
