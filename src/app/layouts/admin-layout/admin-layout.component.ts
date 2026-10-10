import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ApiService } from '../../core/services/api.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <!-- MOBILE DRAWER BACKDROP -->
      @if (isMobileDrawerOpen()) {
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          (click)="closeMobileDrawer()"
        ></div>
      }

      <!-- MOBILE SLIDE-OVER SIDEBAR DRAWER -->
      <aside
        [class.translate-x-0]="isMobileDrawerOpen()"
        [class.-translate-x-full]="!isMobileDrawerOpen()"
        class="fixed top-0 bottom-0 left-0 w-72 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 ease-in-out md:hidden shadow-2xl"
      >
        <!-- Mobile Drawer Header -->
        <div class="h-16 px-5 border-b border-border flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-extrabold shadow-sm">
              <app-icon name="shield" [size]="20"></app-icon>
            </div>
            <div>
              <h1 class="text-sm font-extrabold tracking-tight">KPM ACADEMY</h1>
              <p class="text-[10px] text-muted-foreground font-semibold">Web Admin CMS</p>
            </div>
          </div>
          <button
            type="button"
            (click)="closeMobileDrawer()"
            class="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <app-icon name="x" [size]="18"></app-icon>
          </button>
        </div>

        <!-- Mobile Drawer Nav Links -->
        <nav class="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div class="px-3 pb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Menu Utama
          </div>

          <a
            routerLink="/admin/dashboard"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary text-primary-foreground font-semibold shadow-sm"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <app-icon name="dashboard" [size]="18"></app-icon>
            <span>Dashboard & Metrik</span>
          </a>

          <a
            routerLink="/admin/cms"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary text-primary-foreground font-semibold shadow-sm"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <app-icon name="layers" [size]="18"></app-icon>
            <span>CMS Konten Belajar</span>
          </a>

          <a
            routerLink="/admin/orders"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary text-primary-foreground font-semibold shadow-sm"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <app-icon name="shopping-cart" [size]="18"></app-icon>
            <span>Pesanan & Midtrans</span>
          </a>

          <div class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Manajemen & Sistem
          </div>

          <a
            routerLink="/admin/users"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary text-primary-foreground font-semibold shadow-sm"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <app-icon name="users" [size]="18"></app-icon>
            <span>Pengguna & Siswa</span>
          </a>

          <a
            routerLink="/admin/settings"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-primary text-primary-foreground font-semibold shadow-sm"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <app-icon name="settings" [size]="18"></app-icon>
            <span>Pengaturan API & DB</span>
          </a>
        </nav>

        <!-- Mobile Drawer Footer -->
        <div class="p-4 border-t border-border bg-muted/20">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span class="text-[11px] font-bold text-foreground">Go Fiber API (Live)</span>
            </div>
            <span class="text-[10px] text-muted-foreground font-mono">v1.0.0</span>
          </div>
          <div class="text-[10px] text-muted-foreground truncate" [title]="api.baseUrl()">
            {{ api.baseUrl() }}
          </div>
        </div>
      </aside>

      <!-- DESKTOP FIXED SIDEBAR -->
      <aside
        class="hidden md:flex md:w-64 flex-col border-r border-border bg-card/60 backdrop-blur-md sticky top-0 h-screen z-30"
      >
        <!-- Logo Header -->
        <div class="h-16 px-6 border-b border-border flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-extrabold shadow-sm">
              <app-icon name="shield" [size]="20"></app-icon>
            </div>
            <div>
              <h1 class="text-sm font-extrabold tracking-tight">KPM ACADEMY</h1>
              <p class="text-[10px] text-muted-foreground font-semibold">Web Admin CMS</p>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div class="px-3 pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Menu Utama
          </div>

          <a
            routerLink="/admin/dashboard"
            routerLinkActive="bg-primary text-primary-foreground font-semibold shadow-sm"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <app-icon name="dashboard" [size]="16"></app-icon>
            <span>Dashboard & Metrik</span>
          </a>

          <a
            routerLink="/admin/cms"
            routerLinkActive="bg-primary text-primary-foreground font-semibold shadow-sm"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <app-icon name="layers" [size]="16"></app-icon>
            <span>CMS Konten Belajar</span>
          </a>

          <a
            routerLink="/admin/orders"
            routerLinkActive="bg-primary text-primary-foreground font-semibold shadow-sm"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <app-icon name="shopping-cart" [size]="16"></app-icon>
            <span>Pesanan & Midtrans</span>
          </a>

          <div class="px-3 pt-4 pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Manajemen & Sistem
          </div>

          <a
            routerLink="/admin/users"
            routerLinkActive="bg-primary text-primary-foreground font-semibold shadow-sm"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <app-icon name="users" [size]="16"></app-icon>
            <span>Pengguna & Siswa</span>
          </a>

          <a
            routerLink="/admin/settings"
            routerLinkActive="bg-primary text-primary-foreground font-semibold shadow-sm"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <app-icon name="settings" [size]="16"></app-icon>
            <span>Pengaturan API & DB</span>
          </a>
        </nav>

        <!-- Sidebar Footer / Go Backend Status -->
        <div class="p-4 border-t border-border bg-muted/20">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span class="text-[11px] font-bold text-foreground">Go Fiber API</span>
            </div>
            <span class="text-[10px] text-muted-foreground font-mono">v1.0.0</span>
          </div>
          <div class="text-[10px] text-muted-foreground truncate" [title]="api.baseUrl()">
            {{ api.baseUrl() }}
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT AREA -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- TOPBAR HEADER -->
        <header class="h-16 px-4 md:px-8 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
          <!-- Left: Mobile Hamburger Menu & Title -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="toggleMobileDrawer()"
              class="h-9 w-9 rounded-lg border border-border bg-background hover:bg-muted flex md:hidden items-center justify-center text-foreground transition-colors"
              title="Buka Menu Navigasi"
            >
              <app-icon name="layers" [size]="18"></app-icon>
            </button>

            <div class="flex items-center gap-2 md:hidden">
              <div class="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                <app-icon name="shield" [size]="14"></app-icon>
              </div>
              <span class="text-xs font-bold tracking-tight">KPM Admin</span>
            </div>

            <!-- Desktop Subtitle -->
            <div class="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span class="font-bold text-foreground">KPM Academy Control Panel</span>
              <span>•</span>
              <span>Single Backend Go Fiber & Flutter Sync</span>
            </div>
          </div>

          <!-- Right Action Tools -->
          <div class="flex items-center gap-2 sm:gap-3">
            <!-- Dark Mode Toggle -->
            <button
              type="button"
              (click)="theme.toggleTheme()"
              class="h-9 w-9 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              [title]="theme.isDarkMode() ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'"
            >
              <app-icon [name]="theme.isDarkMode() ? 'sun' : 'moon'" [size]="16"></app-icon>
            </button>

            <!-- Admin Profile & Logout -->
            <div class="flex items-center gap-2 pl-2 border-l border-border">
              <div class="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div class="hidden lg:block text-left">
                <div class="text-xs font-bold leading-tight">{{ auth.currentUser()?.name || 'Administrator' }}</div>
                <div class="text-[10px] text-muted-foreground">{{ auth.currentUser()?.email || 'admin@kpmacademy.com' }}</div>
              </div>

              <button
                type="button"
                (click)="auth.logout()"
                class="h-9 px-2.5 sm:px-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center gap-1.5 text-xs font-semibold transition-all"
                title="Keluar dari akun admin"
              >
                <app-icon name="log-out" [size]="14"></app-icon>
                <span class="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <!-- PAGE CONTENT ROUTER OUTLET -->
        <main class="flex-1 p-3 sm:p-5 md:p-8 max-w-7xl w-full mx-auto">
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

  isMobileDrawerOpen = signal<boolean>(false);

  toggleMobileDrawer(): void {
    this.isMobileDrawerOpen.update((val) => !val);
  }

  closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
  }
}
