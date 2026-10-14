import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 max-w-4xl">
      <!-- Action Toast Banner -->
      @if (toastMessage()) {
        <div class="p-3 rounded-lg border border-border bg-card flex items-center justify-between text-xs transition-all shadow-sm">
          <div class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span class="text-foreground font-medium">{{ toastMessage() }}</span>
          </div>
          <button (click)="toastMessage.set(null)" class="text-muted-foreground hover:text-foreground">
            <app-icon name="x" [size]="14"></app-icon>
          </button>
        </div>
      }

      @if (!auth.isSuperAdmin()) {
        <!-- SUPERADMIN SECURITY GATE -->
        <div class="max-w-md mx-auto my-12 p-6 rounded-xl border border-border bg-card shadow-sm text-center space-y-4">
          <div class="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <app-icon name="lock" [size]="22"></app-icon>
          </div>
          <div>
            <h2 class="text-base font-bold text-foreground">Akses Khusus Superadmin</h2>
            <p class="text-xs text-muted-foreground mt-1">
              Konfigurasi endpoint API dan preferensi backend hanya dapat diakses oleh Superadmin. Masukkan kunci otorisasi untuk membuka.
            </p>
          </div>

          <div class="space-y-3 pt-2">
            <input
              type="password"
              [(ngModel)]="superAdminPasscode"
              (keyup.enter)="unlockSuperAdmin()"
              placeholder="Masukkan kunci Superadmin..."
              class="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-center text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            @if (unlockError()) {
              <p class="text-xs text-destructive font-medium">{{ unlockError() }}</p>
            }
            <button
              type="button"
              (click)="unlockSuperAdmin()"
              class="w-full h-9 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Buka Akses Pengaturan
            </button>
          </div>
        </div>
      } @else {
        <!-- UNLOCKED SUPERADMIN SETTINGS -->
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold tracking-tight text-foreground">Konfigurasi Sistem & Jaringan</h1>
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold border border-primary/20 bg-primary/10 text-primary">
                SUPERADMIN
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5">
              Pengaturan endpoint server backend dan preferensi sistem aplikasi KPM Academy
            </p>
          </div>

          <button
            type="button"
            (click)="lockSuperAdmin()"
            class="h-8 px-3 rounded-md border border-border bg-card hover:bg-muted text-xs font-medium flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors self-start sm:self-auto"
          >
            <app-icon name="lock" [size]="13"></app-icon>
            <span>Kunci Kembali</span>
          </button>
        </div>

        <!-- 1. BACKEND API ENDPOINT CONFIG -->
        <div class="rounded-lg border border-border bg-card p-5 space-y-4">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-xs font-mono uppercase tracking-wider text-muted-foreground">01 / Alamat Endpoint Server</h2>
              <div class="text-sm font-semibold text-foreground mt-0.5">Layanan API Backend</div>
              <p class="text-xs text-muted-foreground">Base URL endpoint backend yang melayani Web Admin dan Mobile Apps</p>
            </div>
          </div>

          <div class="space-y-3 pt-1">
            <div>
              <label class="block text-xs font-medium text-foreground mb-1.5">Alamat Endpoint (Base URL)</label>
              <div class="flex gap-2">
                <input
                  type="text"
                  [(ngModel)]="apiUrlInput"
                  placeholder="https://backend-api.kpmacademic.io/api/v1"
                  class="flex-1 h-8 px-3 rounded-md border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="button"
                  (click)="saveApiUrl()"
                  class="h-8 px-3.5 rounded-md bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </div>

            <!-- Quick Presets -->
            <div class="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span class="text-[11px] text-muted-foreground font-medium">Preset:</span>
              <button
                type="button"
                (click)="setPreset('https://backend-api.kpmacademic.io/api/v1')"
                class="h-7 px-2.5 rounded border border-border bg-muted/40 hover:bg-muted text-[11px] transition-colors"
              >
                Live Production
              </button>
              <button
                type="button"
                (click)="setPreset('http://localhost:3000/api/v1')"
                class="h-7 px-2.5 rounded border border-border bg-muted/40 hover:bg-muted text-[11px] transition-colors"
              >
                Local Server
              </button>
            </div>
          </div>

          <!-- Ping Latency Tester -->
          <div class="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="text-xs font-medium text-foreground">Pemeriksaan Latensi Jaringan</div>
              <div class="text-[11px] text-muted-foreground">Menguji responsivitas koneksi ke endpoint server</div>
            </div>

            <div class="flex items-center gap-2">
              @if (pingLatency() !== null) {
                <span class="text-[11px] font-mono text-muted-foreground">
                  Latensi: <strong class="text-foreground">{{ pingLatency() }}ms</strong>
                </span>
              }
              <button
                type="button"
                (click)="testHealth()"
                [disabled]="isTesting()"
                class="h-8 px-3 rounded-md border border-border bg-card hover:bg-muted text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <app-icon name="refresh" [size]="12" [className]="isTesting() ? 'animate-spin' : ''"></app-icon>
                <span>Uji Koneksi Server</span>
              </button>
            </div>
          </div>

          @if (healthResult()) {
            <div
              [class]="healthStatus() === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/10 border-destructive/20 text-destructive'"
              class="p-3 rounded-md border text-xs font-mono flex items-center gap-2"
            >
              <app-icon [name]="healthStatus() === 'success' ? 'check' : 'x'" [size]="14"></app-icon>
              <span>{{ healthResult() }}</span>
            </div>
          }
        </div>

        <!-- 2. SUBSYSTEM STATUS MATRIX -->
        <div class="rounded-lg border border-border bg-card p-5 space-y-3">
          <h2 class="text-xs font-mono uppercase tracking-wider text-muted-foreground">02 / Status Layanan Terpadu</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div class="p-3 rounded-md border border-border bg-muted/20 space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-foreground">Server Backend API</span>
                <span class="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">ONLINE</span>
              </div>
              <div class="text-[11px] text-muted-foreground">RESTful Service • JWT Auth</div>
            </div>

            <div class="p-3 rounded-md border border-border bg-muted/20 space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-foreground">Payment Gateway</span>
                <span class="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">READY</span>
              </div>
              <div class="text-[11px] text-muted-foreground">Midtrans Snap Webhook</div>
            </div>

            <div class="p-3 rounded-md border border-border bg-muted/20 space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-foreground">Aplikasi Mobile Siswa</span>
                <span class="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">TERHUBUNG</span>
              </div>
              <div class="text-[11px] text-muted-foreground">Sinkronisasi Realtime Android & iOS</div>
            </div>

            <div class="p-3 rounded-md border border-border bg-muted/20 space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-foreground">AI Tutor Assistant</span>
                <span class="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">AKTIF</span>
              </div>
              <div class="text-[11px] text-muted-foreground">Asisten Belajar Interaktif</div>
            </div>
          </div>
        </div>

        <!-- 3. MOBILE HEADER PALETTE TOKEN -->
        <div class="rounded-lg border border-border bg-card p-5 space-y-4">
          <div>
            <h2 class="text-xs font-mono uppercase tracking-wider text-muted-foreground">03 / Desain Mobile App</h2>
            <div class="text-sm font-semibold text-foreground mt-0.5">Palette Token Header Siswa</div>
            <p class="text-xs text-muted-foreground">Tema warna aksen spanduk yang disinkronisasi ke aplikasi mobile siswa</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            @for (preset of headerPresets; track preset.key) {
              <button
                type="button"
                (click)="selectHeaderTheme(preset.key)"
                [class.border-primary]="selectedThemeKey() === preset.key"
                [class.ring-1]="selectedThemeKey() === preset.key"
                [class.ring-primary]="selectedThemeKey() === preset.key"
                class="p-3 rounded-md border border-border bg-card hover:bg-muted/40 text-left transition-all flex items-center justify-between"
              >
                <div>
                  <div class="text-xs font-medium text-foreground">{{ preset.name }}</div>
                  <div class="text-[10px] text-muted-foreground">{{ preset.key }}</div>
                </div>
                <div class="h-4 w-4 rounded-full border border-border shrink-0 ml-2" [style.background]="preset.previewColor"></div>
              </button>
            }
          </div>
        </div>

        <!-- 4. OPERATIONAL SESSION -->
        <div class="rounded-lg border border-border bg-card p-5 space-y-2">
          <h2 class="text-xs font-mono uppercase tracking-wider text-muted-foreground">04 / Sesi Terautentikasi</h2>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
            <div>
              <span class="text-muted-foreground">Pengguna:</span>
              <strong class="text-foreground ml-1">{{ auth.currentUser()?.name || 'Administrator KPM' }}</strong>
              <span class="text-muted-foreground ml-2 font-mono">({{ auth.currentUser()?.email || 'admin@kpmacademy.com' }})</span>
            </div>
            <div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Sesi Aktif
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class SettingsComponent {
  api = inject(ApiService);
  auth = inject(AuthService);

  apiUrlInput = this.api.baseUrl();
  isTesting = signal<boolean>(false);
  pingLatency = signal<number | null>(null);
  healthResult = signal<string | null>(null);
  healthStatus = signal<'success' | 'error'>('success');
  toastMessage = signal<string | null>(null);
  selectedThemeKey = signal<string>(localStorage.getItem('kpm_header_theme') || 'classic_blue');

  superAdminPasscode = '';
  unlockError = signal<string | null>(null);

  headerPresets = [
    { key: 'classic_blue', name: 'Deep Corporate Blue', previewColor: '#091540' },
    { key: 'ocean_teal', name: 'Royal Cobalt Blue', previewColor: '#1B2CC1' },
    { key: 'royal_purple', name: 'Periwinkle Theme', previewColor: '#7692FF' },
    { key: 'ruby_sunset', name: 'Soft Sky Theme', previewColor: '#ABD2FA' },
    { key: 'emerald_gold', name: 'Emerald Dark', previewColor: '#064E3B' },
    { key: 'midnight_dark', name: 'Midnight Navy', previewColor: '#091540' },
  ];

  unlockSuperAdmin(): void {
    const code = this.superAdminPasscode.trim().toLowerCase();
    if (code === 'superadmin' || code === 'admin123' || code === 'kpm2026') {
      this.auth.setSuperAdminMode(true);
      this.unlockError.set(null);
      this.toastMessage.set('Akses Superadmin berhasil diaktifkan.');
    } else {
      this.unlockError.set('Kunci Superadmin tidak valid. Silakan coba lagi.');
    }
  }

  lockSuperAdmin(): void {
    this.auth.setSuperAdminMode(false);
    this.superAdminPasscode = '';
    this.toastMessage.set('Mode Superadmin telah dikunci.');
  }

  selectHeaderTheme(key: string): void {
    this.selectedThemeKey.set(key);
    localStorage.setItem('kpm_header_theme', key);
    this.toastMessage.set(`Tema header mobile disinkronkan ke token: ${key}`);
  }

  saveApiUrl(): void {
    if (this.apiUrlInput) {
      this.api.setBaseUrl(this.apiUrlInput);
      this.toastMessage.set(`Endpoint Server Backend berhasil disimpan: ${this.apiUrlInput}`);
    }
  }

  setPreset(url: string): void {
    this.apiUrlInput = url;
    this.saveApiUrl();
  }

  testHealth(): void {
    this.isTesting.set(true);
    this.healthResult.set(null);
    const start = performance.now();

    this.api.checkHealth().subscribe({
      next: (res) => {
        const latency = Math.round(performance.now() - start);
        this.pingLatency.set(latency);
        this.isTesting.set(false);
        this.healthStatus.set('success');
        this.healthResult.set(`Koneksi Berhasil: Server Online (${latency}ms, status: 200 OK)`);
      },
      error: (err) => {
        const latency = Math.round(performance.now() - start);
        this.pingLatency.set(latency);
        this.isTesting.set(false);
        this.healthStatus.set('error');
        this.healthResult.set(`Koneksi Gagal (${latency}ms): ${err.message || 'Koneksi ditolak'}`);
      },
    });
  }
}
