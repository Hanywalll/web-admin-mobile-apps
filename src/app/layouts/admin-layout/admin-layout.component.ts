import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ApiService } from '../../core/services/api.service';
import { AdminService } from '../../core/services/admin.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row antialiased">
      <!-- MOBILE DRAWER BACKDROP -->
      @if (isMobileDrawerOpen()) {
        <div
          class="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          (click)="closeMobileDrawer()"
        ></div>
      }

      <!-- MOBILE SLIDE-OVER DRAWER -->
      <aside
        [class.translate-x-0]="isMobileDrawerOpen()"
        [class.-translate-x-full]="!isMobileDrawerOpen()"
        class="fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-50 flex flex-col transition-transform duration-200 ease-out md:hidden shadow-xl"
      >
        <!-- Mobile Header -->
        <div class="h-14 px-4 border-b border-border flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md shadow-primary/20">
              <app-icon name="shield" [size]="16"></app-icon>
            </div>
            <div>
              <span class="text-xs font-bold tracking-wider text-foreground uppercase">KPM ACADEMY</span>
              <span class="block text-[10px] text-muted-foreground font-medium leading-none">Portal Admin</span>
            </div>
          </div>
          <button
            type="button"
            (click)="closeMobileDrawer()"
            class="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <app-icon name="x" [size]="14"></app-icon>
          </button>
        </div>

        <!-- Mobile Navigation -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div class="px-2.5 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Menu Utama
          </div>
          <a
            routerLink="/admin/dashboard"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="dashboard" [size]="15"></app-icon>
            <span>Ringkasan Dashboard</span>
          </a>
          <a
            routerLink="/admin/notifications"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center justify-between px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <div class="flex items-center gap-3">
              <app-icon name="bell" [size]="15"></app-icon>
              <span>Notifikasi Aktivitas</span>
            </div>
            @if (adminService.unreadNotificationCount() > 0) {
              <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {{ adminService.unreadNotificationCount() }}
              </span>
            }
          </a>
          <a
            routerLink="/admin/orders"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="shopping-cart" [size]="15"></app-icon>
            <span>Pesanan & Pembayaran</span>
          </a>
          <a
            routerLink="/admin/enroll-keys"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="key" [size]="15"></app-icon>
            <span>Kunci Akses Siswa</span>
          </a>
          <a
            routerLink="/admin/users"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="users" [size]="15"></app-icon>
            <span>Pengguna & Siswa</span>
          </a>

          <div class="px-2.5 pt-4 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Akademik & CBT
          </div>
          <a
            routerLink="/admin/tryouts"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="award" [size]="15"></app-icon>
            <span>Hasil Tryout CBT</span>
          </a>

          <div class="px-2.5 pt-4 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Manajemen Konten
          </div>
          <a
            routerLink="/admin/banners"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="image" [size]="15"></app-icon>
            <span>Spanduk Banner</span>
          </a>
          <a
            routerLink="/admin/packages"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="package" [size]="15"></app-icon>
            <span>Paket Belajar</span>
          </a>
          <a
            routerLink="/admin/live-classes"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="calendar" [size]="15"></app-icon>
            <span>Jadwal Live Class</span>
          </a>
          <a
            routerLink="/admin/videos"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="video" [size]="15"></app-icon>
            <span>Video Materi</span>
          </a>
          <a
            routerLink="/admin/modules"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="file-text" [size]="15"></app-icon>
            <span>Modul PDF</span>
          </a>
          <a
            routerLink="/admin/vouchers"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="ticket" [size]="15"></app-icon>
            <span>Kupon Diskon</span>
          </a>

          <div class="px-2.5 pt-4 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Layanan & Bantuan
          </div>
          <a
            routerLink="/admin/support"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="help-circle" [size]="15"></app-icon>
            <span>Pusat Bantuan Siswa</span>
          </a>
          <a
            routerLink="/admin/testimonials"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="star" [size]="15"></app-icon>
            <span>Moderasi Testimoni</span>
          </a>

          @if (auth.isSuperAdmin()) {
            <div class="px-2.5 pt-4 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Superadmin
            </div>
            <a
              routerLink="/admin/settings"
              (click)="closeMobileDrawer()"
              routerLinkActive="bg-primary/10 text-primary font-semibold"
              class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <app-icon name="settings" [size]="15"></app-icon>
              <span>Konfigurasi API</span>
            </a>
          }
        </nav>

        <!-- Mobile Drawer Footer -->
        <div class="p-3 border-t border-border bg-card/60">
          <div class="flex items-center justify-between text-[11px]">
            <div class="flex items-center gap-2 text-foreground font-medium">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span class="text-xs">Sistem Terhubung</span>
            </div>
            <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Online</span>
          </div>
        </div>
      </aside>

      <!-- DESKTOP CRISP SIDEBAR -->
      <aside
        class="hidden md:flex md:w-60 flex-col border-r border-border bg-card sticky top-0 h-screen z-30 select-none"
      >
        <!-- Logo / Brand Header -->
        <div class="h-14 px-5 border-b border-border flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md shadow-primary/20">
              <app-icon name="shield" [size]="16"></app-icon>
            </div>
            <div>
              <span class="text-xs font-bold tracking-wider text-foreground uppercase">KPM ACADEMY</span>
              <span class="block text-[10px] text-muted-foreground font-medium leading-none">Portal Admin</span>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div class="px-2.5 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Menu Utama
          </div>

          <a
            routerLink="/admin/dashboard"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="dashboard" [size]="15"></app-icon>
            <span>Ringkasan</span>
          </a>

          <a
            routerLink="/admin/notifications"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center justify-between px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <div class="flex items-center gap-2.5">
              <app-icon name="bell" [size]="15"></app-icon>
              <span>Notifikasi</span>
            </div>
            @if (adminService.unreadNotificationCount() > 0) {
              <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {{ adminService.unreadNotificationCount() }}
              </span>
            }
          </a>

          <a
            routerLink="/admin/orders"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="shopping-cart" [size]="15"></app-icon>
            <span>Pesanan & Bayar</span>
          </a>

          <a
            routerLink="/admin/enroll-keys"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="key" [size]="15"></app-icon>
            <span>Kunci Akses Siswa</span>
          </a>

          <a
            routerLink="/admin/users"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="users" [size]="15"></app-icon>
            <span>Pengguna & Siswa</span>
          </a>

          <div class="px-2.5 pt-4 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Akademik & CBT
          </div>

          <a
            routerLink="/admin/tryouts"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="award" [size]="15"></app-icon>
            <span>Hasil Tryout CBT</span>
          </a>

          <div class="px-2.5 pt-4 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Manajemen Konten
          </div>

          <a
            routerLink="/admin/banners"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="image" [size]="15"></app-icon>
            <span>Spanduk Banner</span>
          </a>

          <a
            routerLink="/admin/packages"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="package" [size]="15"></app-icon>
            <span>Paket Belajar</span>
          </a>

          <a
            routerLink="/admin/live-classes"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="calendar" [size]="15"></app-icon>
            <span>Jadwal Live Class</span>
          </a>

          <a
            routerLink="/admin/videos"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="video" [size]="15"></app-icon>
            <span>Video Materi</span>
          </a>

          <a
            routerLink="/admin/modules"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="file-text" [size]="15"></app-icon>
            <span>Modul PDF</span>
          </a>

          <a
            routerLink="/admin/vouchers"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="ticket" [size]="15"></app-icon>
            <span>Kupon Diskon</span>
          </a>

          <div class="px-2.5 pt-4 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Layanan & Bantuan
          </div>

          <a
            routerLink="/admin/support"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="help-circle" [size]="15"></app-icon>
            <span>Pusat Bantuan</span>
          </a>

          <a
            routerLink="/admin/testimonials"
            routerLinkActive="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <app-icon name="star" [size]="15"></app-icon>
            <span>Moderasi Testimoni</span>
          </a>

          @if (auth.isSuperAdmin()) {
            <div class="px-2.5 pt-4 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Superadmin
            </div>

            <a
              routerLink="/admin/settings"
              routerLinkActive="bg-primary/10 text-primary font-semibold"
              class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <app-icon name="settings" [size]="15"></app-icon>
              <span>Konfigurasi API</span>
            </a>
          }
        </nav>

        <!-- Sidebar Footer / Status -->
        <div class="p-3 border-t border-border bg-card/60">
          <div class="flex items-center justify-between text-[11px]">
            <div class="flex items-center gap-2 text-foreground font-medium">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span class="text-xs">Sistem Terhubung</span>
            </div>
            <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Online</span>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT WRAPPER -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- TOPBAR HEADER -->
        <header
          class="h-14 px-4 md:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between gap-4"
        >
          <!-- Left: Mobile Toggle -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="toggleMobileDrawer()"
              class="h-8 w-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex md:hidden items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 transition-colors"
              title="Menu Navigasi"
            >
              <app-icon name="layers" [size]="15"></app-icon>
            </button>
          </div>

          <!-- Right: System Tools & Admin Session -->
          <div class="flex items-center gap-2">
            <!-- Notifications Bell with Dropdown -->
            <div class="relative">
              <button
                type="button"
                (click)="toggleNotifDropdown()"
                class="relative h-8 w-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Notifikasi Aktivitas Masuk"
              >
                <app-icon name="bell" [size]="15"></app-icon>
                @if (adminService.unreadNotificationCount() > 0) {
                  <span class="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900 animate-pulse">
                    {{ adminService.unreadNotificationCount() }}
                  </span>
                }
              </button>

              <!-- Backdrop when dropdown is open -->
              @if (isNotifDropdownOpen()) {
                <div
                  class="fixed inset-0 z-40 bg-transparent"
                  (click)="closeNotifDropdown()"
                ></div>
              }

              <!-- Notification Dropdown Popover Panel -->
              @if (isNotifDropdownOpen()) {
                <div
                  class="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl z-50 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100"
                >
                  <!-- Dropdown Header -->
                  <div class="p-3 bg-zinc-50/70 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-foreground">Notifikasi Masuk</span>
                      @if (adminService.unreadNotificationCount() > 0) {
                        <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          {{ adminService.unreadNotificationCount() }} baru
                        </span>
                      }
                    </div>

                    @if (adminService.unreadNotificationCount() > 0) {
                      <button
                        type="button"
                        (click)="markAllNotifsAsRead($event)"
                        class="text-[11px] font-medium text-[#1B2CC1] dark:text-[#7692FF] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Tandai semua dibaca"
                      >
                        <app-icon name="check" [size]="12"></app-icon>
                        <span>Semua dibaca</span>
                      </button>
                    }
                  </div>

                  <!-- Dropdown Body (Feed list) -->
                  <div class="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    @if (adminService.latestNotifications().length === 0) {
                      <div class="py-8 text-center text-muted-foreground text-xs">
                        <app-icon name="bell" [size]="20" className="mx-auto mb-1 opacity-30"></app-icon>
                        Tidak ada notifikasi saat ini
                      </div>
                    } @else {
                      @for (n of adminService.latestNotifications().slice(0, 6); track n.id) {
                        <div
                          (click)="navigateToNotif(n)"
                          class="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-start justify-between gap-2.5 transition-colors cursor-pointer group"
                          [class.bg-blue-500/5]="!n.isRead"
                        >
                          <div class="flex items-start gap-2.5 min-w-0">
                            <div
                              class="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
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
                                <app-icon *ngSwitchCase="'payment'" name="dollar" [size]="13"></app-icon>
                                <app-icon *ngSwitchCase="'order'" name="shopping-cart" [size]="13"></app-icon>
                                <app-icon *ngSwitchCase="'support'" name="help-circle" [size]="13"></app-icon>
                                <app-icon *ngSwitchCase="'testimonial'" name="star" [size]="13"></app-icon>
                                <app-icon *ngSwitchCase="'tryout'" name="award" [size]="13"></app-icon>
                                <app-icon *ngSwitchCase="'user'" name="users" [size]="13"></app-icon>
                                <app-icon *ngSwitchDefault name="bell" [size]="13"></app-icon>
                              </ng-container>
                            </div>

                            <div class="min-w-0 flex-1">
                              <div class="flex items-center gap-1.5">
                                <span class="text-xs font-semibold text-foreground truncate block">{{ n.title }}</span>
                                @if (!n.isRead) {
                                  <span class="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0"></span>
                                }
                              </div>
                              <p class="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">{{ n.message }}</p>
                              <div class="flex items-center gap-2 text-[10px] text-muted-foreground/70 mt-1">
                                <span>{{ n.studentName }}</span>
                                <span>•</span>
                                <span>{{ n.createdAt }}</span>
                              </div>
                            </div>
                          </div>

                          <!-- Mini quick actions: Icon only -->
                          <div class="flex items-center gap-1 shrink-0 pt-0.5">
                            @if (!n.isRead) {
                              <button
                                type="button"
                                (click)="markNotifAsRead(n, $event)"
                                class="h-6 w-6 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-colors"
                                title="Tandai dibaca"
                              >
                                <app-icon name="check" [size]="12"></app-icon>
                              </button>
                            }
                            @if (n.targetRoute) {
                              <button
                                type="button"
                                (click)="navigateToNotif(n)"
                                class="h-6 w-6 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                                title="Buka menu terkait"
                              >
                                <app-icon name="external-link" [size]="11"></app-icon>
                              </button>
                            }
                          </div>
                        </div>
                      }
                    }
                  </div>

                  <!-- Dropdown Footer -->
                  <div class="p-2.5 bg-zinc-50/70 dark:bg-zinc-800/40 text-center">
                    <a
                      routerLink="/admin/notifications"
                      (click)="closeNotifDropdown()"
                      class="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1B2CC1] dark:text-[#7692FF] hover:underline cursor-pointer"
                    >
                      <span>Lihat Semua Notifikasi</span>
                      <app-icon name="external-link" [size]="11"></app-icon>
                    </a>
                  </div>
                </div>
              }
            </div>

            <!-- Theme Toggle -->
            <button
              type="button"
              (click)="theme.toggleTheme()"
              class="h-8 w-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              [title]="theme.isDarkMode() ? 'Mode Terang' : 'Mode Gelap'"
            >
              <app-icon [name]="theme.isDarkMode() ? 'sun' : 'moon'" [size]="14"></app-icon>
            </button>

            <!-- Divider -->
            <div class="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

            <!-- Profile Summary & Logout -->
            <div class="flex items-center gap-2">
              <div class="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 flex items-center justify-center font-bold text-xs select-none">
                {{ (auth.currentUser()?.name || 'A')[0].toUpperCase() }}
              </div>
              <div class="hidden sm:block text-left text-xs leading-tight">
                <span class="font-medium text-zinc-800 dark:text-zinc-200 block truncate max-w-[140px]">{{ auth.currentUser()?.name || 'Administrator' }}</span>
                <span class="text-[10px] text-zinc-400 block font-mono">admin</span>
              </div>

              <button
                type="button"
                (click)="auth.logout()"
                class="h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 text-xs font-medium transition-colors ml-1"
                title="Keluar"
              >
                <span class="hidden sm:inline">Keluar</span>
                <app-icon name="log-out" [size]="13" className="sm:hidden"></app-icon>
              </button>
            </div>
          </div>
        </header>

        <!-- PAGE CONTENT -->
        <main class="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  api = inject(ApiService);
  adminService = inject(AdminService);
  router = inject(Router);

  isMobileDrawerOpen = signal<boolean>(false);
  isNotifDropdownOpen = signal<boolean>(false);
  currentSection = signal<string>('Ringkasan');

  constructor() {
    this.updateCurrentSection(this.router.url);
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.updateCurrentSection(e.urlAfterRedirects || e.url);
    });
    // Load notifications count
    this.adminService.getNotifications().subscribe();
  }

  private updateCurrentSection(url: string): void {
    if (url.includes('/notifications')) {
      this.currentSection.set('Notifikasi Aktivitas');
    } else if (url.includes('/banners')) {
      this.currentSection.set('Spanduk Banner');
    } else if (url.includes('/packages')) {
      this.currentSection.set('Paket Belajar');
    } else if (url.includes('/live-classes')) {
      this.currentSection.set('Jadwal Live Class');
    } else if (url.includes('/videos')) {
      this.currentSection.set('Video Materi');
    } else if (url.includes('/modules')) {
      this.currentSection.set('Modul PDF');
    } else if (url.includes('/vouchers')) {
      this.currentSection.set('Kupon Diskon');
    } else if (url.includes('/cms')) {
      this.currentSection.set('Manajemen Konten');
    } else if (url.includes('/orders')) {
      this.currentSection.set('Pesanan & Pembayaran');
    } else if (url.includes('/enroll-keys')) {
      this.currentSection.set('Kunci Akses Siswa');
    } else if (url.includes('/tryouts')) {
      this.currentSection.set('Hasil Tryout CBT');
    } else if (url.includes('/support')) {
      this.currentSection.set('Pusat Bantuan Siswa');
    } else if (url.includes('/testimonials')) {
      this.currentSection.set('Moderasi Testimoni');
    } else if (url.includes('/users')) {
      this.currentSection.set('Pengguna & Siswa');
    } else if (url.includes('/settings')) {
      this.currentSection.set('Konfigurasi API');
    } else {
      this.currentSection.set('Ringkasan Dashboard');
    }
  }

  toggleMobileDrawer(): void {
    this.isMobileDrawerOpen.update((val) => !val);
  }

  closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
  }

  toggleNotifDropdown(): void {
    this.isNotifDropdownOpen.update((v) => !v);
    if (this.isNotifDropdownOpen()) {
      this.adminService.getNotifications().subscribe();
    }
  }

  closeNotifDropdown(): void {
    this.isNotifDropdownOpen.set(false);
  }

  markNotifAsRead(n: any, event?: Event): void {
    if (event) event.stopPropagation();
    this.adminService.markNotificationRead(n.id).subscribe();
  }

  markAllNotifsAsRead(event?: Event): void {
    if (event) event.stopPropagation();
    this.adminService.markAllNotificationsRead().subscribe();
  }

  navigateToNotif(n: any): void {
    if (!n.isRead) {
      this.adminService.markNotificationRead(n.id).subscribe();
    }
    this.closeNotifDropdown();
    if (n.targetRoute) {
      this.router.navigate([n.targetRoute]);
    }
  }
}
