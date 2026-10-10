import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          (click)="onClose.emit()"
        ></div>

        <!-- Dialog Card -->
        <div
          class="relative z-50 w-full max-w-lg rounded-xl border border-border bg-card p-6 text-card-foreground shadow-2xl transition-all duration-200 sm:max-w-xl max-h-[90vh] flex flex-col"
        >
          <!-- Header -->
          <div class="flex items-start justify-between pb-4 border-b border-border">
            <div>
              <h3 class="text-lg font-bold tracking-tight text-foreground">{{ title }}</h3>
              @if (description) {
                <p class="text-xs text-muted-foreground mt-1">{{ description }}</p>
              }
            </div>
            <button
              type="button"
              (click)="onClose.emit()"
              class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <!-- Body Content -->
          <div class="py-4 overflow-y-auto flex-1">
            <ng-content></ng-content>
          </div>

          <!-- Footer slot (optional) -->
          <div class="pt-3 border-t border-border flex justify-end gap-2">
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() description: string = '';
  @Output() onClose = new EventEmitter<void>();
}
