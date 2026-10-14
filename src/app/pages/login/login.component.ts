import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ThemeService } from '../../core/services/theme.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  template: `
    <div class="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-8 relative bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
      <!-- Header Strip -->
      <header class="w-full max-w-5xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-gradient-to-br from-[#1B2CC1] to-[#091540] text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-md border border-[#7692FF]/30">
            KPM
          </div>
          <div>
            <div class="text-xs font-bold tracking-tight text-foreground">KPM ACADEMY</div>
            <div class="text-[10px] text-muted-foreground font-medium">Portal Administrasi</div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="theme.toggleTheme()"
            class="h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
            title="Ganti Mode Tampilan"
          >
            <app-icon [name]="theme.isDarkMode() ? 'sun' : 'moon'" [size]="14"></app-icon>
          </button>
        </div>
      </header>

      <!-- Center Auth Box -->
      <main class="w-full max-w-[400px] mx-auto my-8">
        <div class="rounded-2xl border border-border bg-card p-7 sm:p-8 shadow-sm text-card-foreground backdrop-blur-sm">
          <div class="mb-6 text-center">
            <div class="inline-flex h-12 w-12 rounded-2xl bg-[#ABD2FA]/30 dark:bg-[#1B2CC1]/20 items-center justify-center text-[#1B2CC1] dark:text-[#7692FF] mb-3">
              <app-icon name="shield" [size]="24"></app-icon>
            </div>
            <h1 class="text-xl font-bold tracking-tight text-foreground">Masuk ke Portal</h1>
            <p class="text-xs text-muted-foreground mt-1">
              Silakan masukkan email dan kata sandi akun administrator Anda.
            </p>
          </div>

          <!-- Error Alert -->
          @if (errorMessage()) {
            <div class="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-start gap-2">
              <app-icon name="x" [size]="14" className="shrink-0 mt-0.5"></app-icon>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-foreground mb-1.5">Alamat Email</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                autocomplete="email"
                placeholder="nama@kpmacademy.com"
                class="w-full h-10 px-3.5 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all placeholder:text-muted-foreground/50 shadow-sm"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-foreground">Kata Sandi</label>
              </div>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                autocomplete="current-password"
                placeholder="••••••••••••"
                class="w-full h-10 px-3.5 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all placeholder:text-muted-foreground/50 shadow-sm"
              />
            </div>

            <button
              type="submit"
              [disabled]="isLoading()"
              class="w-full h-10 rounded-lg bg-[#1B2CC1] hover:bg-[#1B2CC1]/90 text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#7692FF] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-5 shadow-sm cursor-pointer"
            >
              @if (isLoading()) {
                <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Memverifikasi...</span>
              } @else {
                <span>Masuk Sekarang</span>
              }
            </button>
          </form>
        </div>

        <!-- Security Notice -->
        <p class="text-center text-[11px] text-muted-foreground mt-4">
          Akses terbatas untuk personel terotorisasi KPM Academy.
        </p>
      </main>

      <!-- Footer Info -->
      <footer class="w-full max-w-5xl mx-auto flex items-center justify-center text-xs text-muted-foreground">
        <span>&copy; {{ currentYear }} KPM Academy. Seluruh hak cipta dilindungi.</span>
      </footer>
    </div>
  `,
})
export class LoginComponent {
  auth = inject(AuthService);
  api = inject(ApiService);
  theme = inject(ThemeService);
  router = inject(Router);

  currentYear = new Date().getFullYear();
  email = '';
  password = '';
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage.set('Silakan isi email dan kata sandi.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Email atau kata sandi tidak valid.');
      },
    });
  }
}
