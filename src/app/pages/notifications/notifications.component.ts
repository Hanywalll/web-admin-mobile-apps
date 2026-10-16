import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AdminNotification } from '../../core/models/models';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header Strip -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-lg bg-[#1B2CC1]/10 text-[#1B2CC1] dark:text-[#7692FF] flex items-center justify-center">
              <app-icon name="bell" [size]="18"></app-icon>
            </div>
            Pusat Notifikasi & Aktivitas Siswa
          </h1>
          <p class="text-xs text-muted-foreground mt-1">
            Pantau arus aktivitas real-time dari aplikasi mobile: transaksi baru, keluhan siswa, ulasan, dan tryout.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="markAllAsRead()"
            [disabled]="unreadCount() === 0"
            class="h-9 px-3.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-40"
          >
            <app-icon name="check" [size]="14"></app-icon>
            <span>Tandai Semua Dibaca</span>
          </button>
          <button
            type="button"
            (click)="loadNotifications()"
            [disabled]="isLoading()"
            class="h-9 px-3.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <app-icon name="refresh" [size]="14" [className]="isLoading() ? 'animate-spin' : ''"></app-icon>
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Notifikasi</div>
          <div class="text-2xl font-bold text-foreground mt-1">{{ notifications().length }}</div>
        </div>
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">Belum Dibaca</div>
          <div class="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{{ unreadCount() }}</div>
        </div>
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Transaksi & Bayar</div>
          <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ countPayment() }}</div>
        </div>
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Tiket & Pengaduan</div>
          <div class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{{ countSupport() }}</div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            *ngFor="let tab of tabs"
            type="button"
            (click)="selectedCategory.set(tab.key)"
            [class.bg-[#1B2CC1]]="selectedCategory() === tab.key"
            [class.text-white]="selectedCategory() === tab.key"
            [class.bg-muted]="selectedCategory() !== tab.key"
            [class.text-muted-foreground]="selectedCategory() !== tab.key"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="relative w-full md:w-72">
          <app-icon name="search" [size]="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Cari pesan atau siswa..."
            class="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all placeholder:text-muted-foreground/50 shadow-sm"
          />
        </div>
      </div>

      <!-- Notification Feed List -->
      <div class="rounded-xl border border-border bg-card shadow-sm divide-y divide-border overflow-hidden">
        @if (isLoading()) {
          <div class="p-12 text-center text-muted-foreground">
            <div class="inline-flex items-center gap-2 text-xs">
              <div class="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Memeriksa aktivitas terbaru dari mobile...</span>
            </div>
          </div>
        } @else if (filteredNotifications().length === 0) {
          <div class="p-12 text-center text-muted-foreground">
            <app-icon name="bell" [size]="32" className="mx-auto mb-2 opacity-30"></app-icon>
            <p class="font-medium text-xs">Tidak ada notifikasi yang ditemukan pada kategori ini.</p>
          </div>
        } @else {
          <div
            *ngFor="let n of filteredNotifications()"
            class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
            [ngClass]="n.isRead ? 'hover:bg-muted/30 bg-card' : 'bg-primary/5 hover:bg-primary/10 border-l-4 border-l-[#1B2CC1]'"
          >
            <!-- Left Info Area -->
            <div class="flex items-start gap-3.5">
              <!-- Type Icon Avatar -->
              <div
                class="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                [ngClass]="{
                  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': n.type === 'payment',
                  'bg-blue-500/10 text-[#1B2CC1] dark:text-[#7692FF]': n.type === 'order',
                  'bg-amber-500/10 text-amber-600 dark:text-amber-400': n.type === 'support',
                  'bg-purple-500/10 text-purple-600 dark:text-purple-400': n.type === 'testimonial',
                  'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400': n.type === 'tryout',
                  'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400': n.type === 'user'
                }"
              >
                <ng-container [ngSwitch]="n.type">
                  <app-icon *ngSwitchCase="'payment'" name="dollar" [size]="18"></app-icon>
                  <app-icon *ngSwitchCase="'order'" name="shopping-cart" [size]="18"></app-icon>
                  <app-icon *ngSwitchCase="'support'" name="help-circle" [size]="18"></app-icon>
                  <app-icon *ngSwitchCase="'testimonial'" name="star" [size]="18"></app-icon>
                  <app-icon *ngSwitchCase="'tryout'" name="award" [size]="18"></app-icon>
                  <app-icon *ngSwitchCase="'user'" name="users" [size]="18"></app-icon>
                  <app-icon *ngSwitchDefault name="bell" [size]="18"></app-icon>
                </ng-container>
              </div>

              <!-- Message Body -->
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-bold text-xs text-foreground">{{ n.title }}</h3>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase"
                    [ngClass]="{
                      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20': n.type === 'payment',
                      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20': n.type === 'order',
                      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20': n.type === 'support',
                      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20': n.type === 'testimonial',
                      'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20': n.type === 'tryout',
                      'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20': n.type === 'user'
                    }"
                  >
                    {{ n.type }}
                  </span>
                  @if (!n.isRead) {
                    <span class="h-2 w-2 rounded-full bg-rose-500" title="Belum dibaca"></span>
                  }
                </div>

                <p class="text-xs text-foreground/80 leading-relaxed max-w-2xl">
                  {{ n.message }}
                </p>

                <div class="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                  <span class="font-medium text-foreground">{{ n.studentName }}</span>
                  <span>•</span>
                  <span>{{ n.createdAt }}</span>
                </div>
              </div>
            </div>

            <!-- Right Actions -->
            <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
              @if (!n.isRead) {
                <button
                  type="button"
                  (click)="markAsRead(n)"
                  class="h-8 px-3 rounded-md border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors cursor-pointer"
                  title="Tandai Sudah Dibaca"
                >
                  Tandai Dibaca
                </button>
              }

              @if (n.targetRoute) {
                <button
                  type="button"
                  (click)="openDetail(n)"
                  class="h-8 px-3.5 rounded-md bg-[#1B2CC1] hover:bg-[#1B2CC1]/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Buka Menu Terkait</span>
                  <app-icon name="external-link" [size]="12"></app-icon>
                </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class NotificationsComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  notifications = signal<AdminNotification[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = '';
  selectedCategory = signal<string>('all');

  tabs = [
    { key: 'all', label: 'Semua' },
    { key: 'unread', label: 'Belum Dibaca' },
    { key: 'payment', label: 'Pembayaran' },
    { key: 'order', label: 'Pesanan' },
    { key: 'support', label: 'Tiket Bantuan' },
    { key: 'testimonial', label: 'Testimoni' },
    { key: 'tryout', label: 'Tryout CBT' },
    { key: 'user', label: 'Siswa Baru' },
  ];

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.adminService.getNotifications().subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  unreadCount = computed(() => this.notifications().filter((n) => !n.isRead).length);
  countPayment = computed(() => this.notifications().filter((n) => n.type === 'payment' || n.type === 'order').length);
  countSupport = computed(() => this.notifications().filter((n) => n.type === 'support').length);

  filteredNotifications = computed(() => {
    let list = this.notifications();
    const cat = this.selectedCategory();
    if (cat === 'unread') {
      list = list.filter((n) => !n.isRead);
    } else if (cat !== 'all') {
      list = list.filter((n) => n.type === cat);
    }

    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          (n.studentName && n.studentName.toLowerCase().includes(q))
      );
    }
    return list;
  });

  markAsRead(n: AdminNotification): void {
    this.adminService.markNotificationRead(n.id).subscribe({
      next: () => {
        this.notifications.update((arr) =>
          arr.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        );
      },
      error: () => {
        this.notifications.update((arr) =>
          arr.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        );
      },
    });
  }

  markAllAsRead(): void {
    this.adminService.markAllNotificationsRead().subscribe({
      next: () => {
        this.notifications.update((arr) => arr.map((item) => ({ ...item, isRead: true })));
      },
      error: () => {
        this.notifications.update((arr) => arr.map((item) => ({ ...item, isRead: true })));
      },
    });
  }

  openDetail(n: AdminNotification): void {
    if (!n.isRead) {
      this.markAsRead(n);
    }
    if (n.targetRoute) {
      this.router.navigate([n.targetRoute]);
    }
  }
}
