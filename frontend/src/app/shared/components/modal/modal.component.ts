import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
           (click)="onOverlayClick()"></div>
      
      <!-- Modal -->
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all"
             [class]="modalSize">
          
          <!-- Header -->
          <div class="border-b border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ title }}
              </h3>
              <button type="button" 
                      (click)="close()"
                      class="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors">
                <span class="sr-only">Fechar</span>
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p *ngIf="description" class="mt-1 text-sm text-gray-600">
              {{ description }}
            </p>
          </div>

          <!-- Content -->
          <div class="px-6 py-4">
            <ng-content></ng-content>
          </div>

          <!-- Footer (optional) -->
          <div *ngIf="showFooter" class="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div class="flex gap-3 justify-end">
              <button type="button" 
                      (click)="onSecondaryAction()"
                      class="btn-secondary">
                {{ secondaryButtonText }}
              </button>
              <button type="button" 
                      (click)="onPrimaryAction()"
                      [disabled]="primaryButtonDisabled"
                      [class]="primaryButtonClass">
                {{ primaryButtonText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-secondary {
      @apply inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors;
    }
  `]
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closeOnOverlay: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() primaryButtonText: string = 'Confirmar';
  @Input() secondaryButtonText: string = 'Cancelar';
  @Input() primaryButtonDisabled: boolean = false;
  @Input() primaryButtonClass: string = 'btn-primary';

  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }

  get modalSize(): string {
    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl'
    };
    return sizes[this.size];
  }

  onOverlayClick(): void {
    if (this.closeOnOverlay) {
      this.close();
    }
  }

  onPrimaryAction(): void {
    this.primaryAction.emit();
  }

  onSecondaryAction(): void {
    this.secondaryAction.emit();
  }

  close(): void {
    document.body.style.overflow = 'auto';
    this.closeModal.emit();
  }
}