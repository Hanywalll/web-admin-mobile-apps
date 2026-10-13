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
      <!-- Header -->
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-xl font-bold tracking-tight text-foreground">Konfigurasi Sistem & Infrastruktur</h1>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono border border-border bg-muted/60 text-muted-foreground">
            ENVIRONMENT
          </span>
        </div>
        <p class="text-xs text-muted-foreground mt-0.5">
          Pengaturan routing Go Fiber backend, gateway Midtrans, dan parameter sesi operasional
        </p>
      </div>

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

      <!-- 1. BACKEND API ENDPOINT CONFIG -->
      <div class="rounded-lg border border-border bg-card p-5 space-y-4">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xs font-mono uppercase tracking-wider text-muted-foreground">01 / Routing Gateway</h2>
            <div class="text-sm font-semibold text-foreground mt-0.5">Go Fiber REST API Service</div>
            <p class="text-xs text-muted-foreground">Base URL endpoint backend yang melayani Web Admin dan Mobile Flutter</p>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono border border-border bg-muted text-muted-foreground">
            PORT 3000 / 443
          </span>
        </div>

        <div class="space-y-3 pt-1">
          <div>
            <label class="block text-xs font-medium text-foreground mb-1.5">Alamat Endpoint (Base URL)</label>
            <div class="flex gap-2">
              <input
                type="text"
                [(ngModel)]="apiUrlInput"
                placeholder="https://backend-api.kpmacademic.io/api/v1"
                class="flex-1 h-8 px-3 rounded-md border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
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
            <span class="text-[11px] text-muted-foreground font-mono">Preset Cepat:</span>
            <button
              type="button"
              (click)="setPreset('https://backend-api.kpmacademic.io/api/v1')"
              class="h-7 px-2.5 rounded border border-border bg-muted/40 hover:bg-muted text-[11px] font-mono transition-colors"
            >
              Live Production (VPS)
            </button>
            <button
              type="button"
              (click)="setPreset('http://localhost:3000/api/v1')"
              class="h-7 px-2.5 rounded border border-border bg-muted/40 hover:bg-muted text-[11px] font-mono transition-colors"
            >
              Localhost (Port 3000)
            </button>
          </div>
        </div>

        <!-- Ping Latency Tester -->
        <div class="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="text-xs font-medium text-foreground">Pemeriksaan Latensi Jaringan</div>
            <div class="text-[11px] text-muted-foreground">Mengirim handshake HTTP GET ke endpoint <code>/health</code></div>
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
              <span>Uji Ping Go API</span>
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
        <h2 class="text-xs font-mono uppercase tracking-wider text-muted-foreground">02 / Matriks Integrasi Sub-sistem</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div class="p-3 rounded-md border border-border bg-muted/20 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-foreground">Backend API Engine</span>
              <span class="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">ONLINE</span>
            </div>
            <div class="text-[11px] text-muted-foreground font-mono">Go 1.23 • Fiber v2.52 • JWT Auth</div>
          </div>

          <div class="p-3 rounded-md border border-border bg-muted/20 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-foreground">Midtrans Snap Gateway</span>
              <span class="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">READY</span>
            </div>
            <div class="text-[11px] text-muted-foreground font-mono">Webhook Listener /payments/notification</div>
          </div>

          <div class="p-3 rounded-md border border-border bg-muted/20 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-foreground">Mobile Client App</span>
              <span class="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">SYNCED</span>
            </div>
            <div class="text-[11px] text-muted-foreground font-mono">Flutter 3.24 • Dio Client • Android/iOS</div>
          </div>

          <div class="p-3 rounded-md border border-border bg-muted/20 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-foreground">Gemini AI Tutor Integration</span>
              <span class="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">STANDBY</span>
            </div>
            <div class="text-[11px] text-muted-foreground font-mono">Chatbot Pembelajaran Siswa Interaktif</div>
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
              [class.border-foreground]="selectedThemeKey() === preset.key"
              [class.ring-1]="selectedThemeKey() === preset.key"
              [class.ring-foreground]="selectedThemeKey() === preset.key"
              class="p-3 rounded-md border border-border bg-card hover:bg-muted/40 text-left transition-all flex items-center justify-between"
            >
              <div>
                <div class="text-xs font-medium text-foreground">{{ preset.name }}</div>
                <div class="text-[10px] font-mono text-muted-foreground">{{ preset.key }}</div>
              </div>
              <div class="h-4 w-4 rounded-full border border-border shrink-0 ml-2" [style.background]="preset.previewColor"></div>
            </button>
          }
        </div>
      </div>

      <!-- 4. OPERATIONAL SESSION -->
      <div class="rounded-lg border border-border bg-card p-5 space-y-2">
        <h2 class="text-xs font-mono uppercase tracking-wider text-muted-foreground">04 / Sesi Administrator Terautentikasi</h2>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
          <div>
            <span class="text-muted-foreground">Operator:</span>
            <strong class="text-foreground ml-1">{{ auth.currentUser()?.name || 'Administrator KPM' }}</strong>
            <span class="text-muted-foreground ml-2 font-mono">({{ auth.currentUser()?.email || 'admin@kpmacademy.com' }})</span>
          </div>
          <div class="font-mono text-[11px] text-muted-foreground">
            TOKEN: {{ auth.token() ? auth.token()!.substring(0, 16) + '...' : 'AKTIF' }}
          </div>
        </div>
      </div>
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

  headerPresets = [
    { key: 'classic_blue', name: 'Deep Corporate Blue', previewColor: '#081F42' },
    { key: 'ocean_teal', name: 'Ocean Teal & Slate', previewColor: '#0F2E3D' },
    { key: 'royal_purple', name: 'Royal Indigo Theme', previewColor: '#1E1035' },
    { key: 'ruby_sunset', name: 'Crimson Burgundy', previewColor: '#3B0712' },
    { key: 'emerald_gold', name: 'Emerald Forest Dark', previewColor: '#064E3B' },
    { key: 'midnight_dark', name: 'Midnight Obsidian', previewColor: '#090D16' },
  ];

  selectHeaderTheme(key: string): void {
    this.selectedThemeKey.set(key);
    localStorage.setItem('kpm_header_theme', key);
    this.toastMessage.set(`Tema header mobile disinkronkan ke token: ${key}`);
  }

  saveApiUrl(): void {
    if (this.apiUrlInput) {
      this.api.setBaseUrl(this.apiUrlInput);
      this.toastMessage.set(`Endpoint Go Backend API berhasil disimpan: ${this.apiUrlInput}`);
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
        this.healthResult.set(`Handshake Berhasil: Go Engine Online (${latency}ms, status: 200 OK)`);
      },
      error: (err) => {
        const latency = Math.round(performance.now() - start);
        this.pingLatency.set(latency);
        this.isTesting.set(false);
        this.healthStatus.set('error');
        this.healthResult.set(`Handshake Gagal (${latency}ms): ${err.message || 'Koneksi ditolak'}`);
      },
    });
  }
}
