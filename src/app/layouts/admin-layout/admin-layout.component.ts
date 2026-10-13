import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ApiService } from '../../core/services/api.service';
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
        <div class="h-14 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-7 w-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <app-icon name="shield" [size]="15"></app-icon>
            </div>
            <div>
              <span class="text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-100">KPM ACADEMY</span>
              <span class="block text-[10px] text-zinc-500 font-mono leading-none">Console v2.2</span>
            </div>
          </div>
          <button
            type="button"
            (click)="closeMobileDrawer()"
            class="h-7 w-7 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <app-icon name="x" [size]="14"></app-icon>
          </button>
        </div>

        <!-- Mobile Navigation -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div class="px-2.5 pb-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Menu Utama
          </div>
          <a
            routerLink="/admin/dashboard"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <app-icon name="dashboard" [size]="15"></app-icon>
            <span>Ringkasan & Metrik</span>
          </a>
          <a
            routerLink="/admin/cms"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <app-icon name="layers" [size]="15"></app-icon>
            <span>Manajemen Konten (CMS)</span>
          </a>
          <a
            routerLink="/admin/orders"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <app-icon name="shopping-cart" [size]="15"></app-icon>
            <span>Pesanan & Pembayaran</span>
          </a>

          <div class="px-2.5 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Administrasi
          </div>
          <a
            routerLink="/admin/users"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <app-icon name="users" [size]="15"></app-icon>
            <span>Pengguna & Siswa</span>
          </a>
          <a
            routerLink="/admin/settings"
            (click)="closeMobileDrawer()"
            routerLinkActive="bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <app-icon name="settings" [size]="15"></app-icon>
            <span>Pengaturan Sistem</span>
          </a>
        </nav>

        <!-- Mobile Drawer Footer -->
        <div class="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div class="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span class="font-mono text-[10px]">API Online: 3000 / VPS</span>
          </div>
        </div>
      </aside>

      <!-- DESKTOP CRISP SIDEBAR -->
      <aside
        class="hidden md:flex md:w-60 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 h-screen z-30 select-none"
      >
        <!-- Logo / Brand Header -->
        <div class="h-14 px-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-7 w-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <app-icon name="shield" [size]="15"></app-icon>
            </div>
            <div>
              <span class="text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-100">KPM ACADEMY</span>
              <span class="block text-[10px] text-zinc-400 dark:text-zinc-500 font-mono leading-none">Console v2.2</span>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div class="px-2.5 pb-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Menu Utama
          </div>

          <a
            routerLink="/admin/dashboard"
            routerLinkActive="bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <app-icon name="dashboard" [size]="15"></app-icon>
            <span>Ringkasan</span>
          </a>

          <a
            routerLink="/admin/cms"
            routerLinkActive="bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <app-icon name="layers" [size]="15"></app-icon>
            <span>Konten (CMS)</span>
          </a>

          <a
            routerLink="/admin/orders"
            routerLinkActive="bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <app-icon name="shopping-cart" [size]="15"></app-icon>
            <span>Transaksi & Bayar</span>
          </a>

          <div class="px-2.5 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Administrasi
          </div>

          <a
            routerLink="/admin/users"
            routerLinkActive="bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <app-icon name="users" [size]="15"></app-icon>
            <span>Pengguna & Siswa</span>
          </a>

          <a
            routerLink="/admin/settings"
            routerLinkActive="bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <app-icon name="settings" [size]="15"></app-icon>
            <span>Konfigurasi API</span>
          </a>
        </nav>

        <!-- Sidebar Footer / Infrastructure Status -->
        <div class="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div class="flex items-center justify-between text-[11px]">
            <div class="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <span class="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
              <span class="font-medium text-[11px]">Go API v1</span>
            </div>
            <span class="text-[10px] font-mono text-zinc-400">Port 3000</span>
          </div>
          <div class="mt-1 text-[10px] font-mono text-zinc-400 truncate" [title]="api.baseUrl()">
            {{ api.baseUrl().replace('https://', '').replace('/api/v1', '') }}
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT WRAPPER -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- TOPBAR HEADER -->
        <header
          class="h-14 px-4 md:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between gap-4"
        >
          <!-- Left: Mobile Toggle & Breadcrumb -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="toggleMobileDrawer()"
              class="h-8 w-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex md:hidden items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 transition-colors"
              title="Menu Navigasi"
            >
              <app-icon name="layers" [size]="15"></app-icon>
            </button>

            <!-- Breadcrumbs -->
            <div class="flex items-center gap-1.5 text-xs text-zinc-500">
              <span class="text-zinc-400 dark:text-zinc-600">Konsol</span>
              <span class="text-zinc-300 dark:text-zinc-700">/</span>
              <span class="font-medium text-zinc-800 dark:text-zinc-200">{{ currentSection() }}</span>
            </div>
          </div>

          <!-- Right: System Tools & Admin Session -->
          <div class="flex items-center gap-2">
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
  router = inject(Router);

  isMobileDrawerOpen = signal<boolean>(false);
  currentSection = signal<string>('Ringkasan');

  constructor() {
    this.updateCurrentSection(this.router.url);
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.updateCurrentSection(e.urlAfterRedirects || e.url);
    });
  }

  private updateCurrentSection(url: string): void {
    if (url.includes('/cms')) {
      this.currentSection.set('Manajemen Konten (CMS)');
    } else if (url.includes('/orders')) {
      this.currentSection.set('Pesanan & Transaksi');
    } else if (url.includes('/users')) {
      this.currentSection.set('Pengguna & Siswa');
    } else if (url.includes('/settings')) {
      this.currentSection.set('Pengaturan Sistem');
    } else {
      this.currentSection.set('Ringkasan Metrik');
    }
  }

  toggleMobileDrawer(): void {
    this.isMobileDrawerOpen.update((val) => !val);
  }

  closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
  }
}
