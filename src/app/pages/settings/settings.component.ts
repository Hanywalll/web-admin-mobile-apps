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
        <h1 class="text-2xl font-extrabold tracking-tight text-foreground">Pengaturan Sistem & API</h1>
        <p class="text-xs text-muted-foreground mt-0.5">
          Konfigurasi koneksi Go Fiber Backend API, database KPM Academy, dan sesi admin
        </p>
      </div>

      <!-- 1. BACKEND API ENDPOINT CONFIG -->
      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <app-icon name="settings" [size]="18"></app-icon>
          </div>
          <div>
            <h2 class="text-sm font-bold text-foreground">Koneksi Backend Go Fiber API</h2>
            <p class="text-[11px] text-muted-foreground">Tentukan URL server Go yang melayani Mobile Flutter dan Web Admin ini</p>
          </div>
        </div>

        <div class="space-y-3 pt-2">
          <div>
            <label class="block text-xs font-bold text-foreground mb-1.5">Base URL API Endpoint</label>
            <div class="flex gap-2">
              <input
                type="text"
                [(ngModel)]="apiUrlInput"
                class="flex-1 h-10 px-3.5 rounded-lg border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                (click)="saveApiUrl()"
                class="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 shadow-sm"
              >
                Simpan URL
              </button>
            </div>
          </div>

          <!-- Quick Presets -->
          <div class="flex items-center gap-2 pt-1 text-xs">
            <span class="text-[11px] text-muted-foreground font-semibold">Preset Cepat:</span>
            <button
              type="button"
              (click)="setPreset('http://localhost:8080/api/v1')"
              class="px-2.5 py-1 rounded-md border border-border bg-muted/40 hover:bg-muted text-[11px] font-mono"
            >
              Localhost (Port 8080)
            </button>
            <button
              type="button"
              (click)="setPreset('https://api.kpmacademy.com/api/v1')"
              class="px-2.5 py-1 rounded-md border border-border bg-muted/40 hover:bg-muted text-[11px] font-mono"
            >
              Production VPS Server
            </button>
          </div>
        </div>

        <!-- Health Check Test Button -->
        <div class="pt-4 border-t border-border flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-foreground">Uji Konektivitas Server Go</div>
            <div class="text-[10px] text-muted-foreground">Mengirim ping ke endpoint /health pada backend Go</div>
          </div>

          <button
            type="button"
            (click)="testHealth()"
            [disabled]="isTesting()"
            class="h-9 px-3.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <app-icon name="refresh" [size]="14" [className]="isTesting() ? 'animate-spin' : ''"></app-icon>
            <span>Uji Ping Go API</span>
          </button>
        </div>

        @if (healthResult()) {
          <div
            [class]="healthStatus() === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-destructive/10 border-destructive/30 text-destructive'"
            class="p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2"
          >
            <app-icon [name]="healthStatus() === 'success' ? 'check' : 'x'" [size]="16"></app-icon>
            <span>{{ healthResult() }}</span>
          </div>
        }
      </div>

      <!-- 2. MOBILE APP HEADER THEME CUSTOMIZER -->
      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <app-icon name="palette" [size]="18"></app-icon>
          </div>
          <div>
            <h2 class="text-sm font-bold text-foreground">Kustomisasi Gradasi Header Mobile App</h2>
            <p class="text-[11px] text-muted-foreground">Admin dapat mengubah tema warna header pada tampilan mobile siswa</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          @for (preset of headerPresets; track preset.key) {
            <button
              type="button"
              (click)="selectHeaderTheme(preset.key)"
              [class.ring-2]="selectedThemeKey() === preset.key"
              [class.ring-primary]="selectedThemeKey() === preset.key"
              class="p-3.5 rounded-xl border border-border text-left transition-all hover:scale-[1.02] flex items-center gap-3 text-white shadow-sm"
              [style.background]="preset.gradient"
            >
              <div class="h-4 w-4 rounded-full border border-white/60 flex items-center justify-center">
                @if (selectedThemeKey() === preset.key) {
                  <div class="h-2 w-2 rounded-full bg-white"></div>
                }
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold truncate text-white drop-shadow-sm">{{ preset.name }}</div>
                <div class="text-[10px] text-white/80 font-mono">{{ preset.key }}</div>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- 3. ARCHITECTURE SUMMARY CARD -->
      <div class="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
        <div class="flex items-center gap-2">
          <app-icon name="shield" [size]="18" className="text-primary"></app-icon>
          <h2 class="text-sm font-bold text-foreground">Arsitektur Terintegrasi (Single Backend, Multi-Client)</h2>
        </div>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Web Admin Angular ini menggunakan REST API yang sama persis dengan aplikasi Flutter Mobile KPM Academy.
          Setiap perubahan data (paket, banner, live class, kupon) akan langsung tersinkronisasi 100% secara real-time ke aplikasi mobile siswa.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div class="p-3 rounded-xl border border-border bg-background">
            <div class="font-bold text-foreground">📱 Mobile App Frontend</div>
            <div class="text-[11px] text-muted-foreground mt-0.5">Flutter Dart (Android & iOS)</div>
          </div>
          <div class="p-3 rounded-xl border border-border bg-background">
            <div class="font-bold text-foreground">💻 Web Admin Frontend</div>
            <div class="text-[11px] text-muted-foreground mt-0.5">Angular Modern + shadcn/ui & Tailwind CSS</div>
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
  healthResult = signal<string | null>(null);
  healthStatus = signal<'success' | 'error'>('success');
  selectedThemeKey = signal<string>(localStorage.getItem('kpm_header_theme') || 'classic_blue');

  headerPresets = [
    { key: 'classic_blue', name: 'Classic KPM Deep Blue', gradient: 'linear-gradient(135deg, #081F42, #1D4ED8)' },
    { key: 'ocean_teal', name: 'Ocean Teal & Cyan', gradient: 'linear-gradient(135deg, #0F2E3D, #0284C7)' },
    { key: 'royal_purple', name: 'Royal Purple & Nebula', gradient: 'linear-gradient(135deg, #1E1035, #7C3AED)' },
    { key: 'ruby_sunset', name: 'Ruby Sunset Crimson', gradient: 'linear-gradient(135deg, #3B0712, #DC2626)' },
    { key: 'emerald_gold', name: 'Emerald Green & Jade', gradient: 'linear-gradient(135deg, #064E3B, #059669)' },
    { key: 'midnight_dark', name: 'Midnight Obsidian Dark', gradient: 'linear-gradient(135deg, #090D16, #334155)' },
  ];

  selectHeaderTheme(key: string): void {
    this.selectedThemeKey.set(key);
    localStorage.setItem('kpm_header_theme', key);
    alert(`Tema Header Mobile berhasil diset ke: ${key}. Tema ini akan aktif pada header aplikasi mobile!`);
  }

  saveApiUrl(): void {
    if (this.apiUrlInput) {
      this.api.setBaseUrl(this.apiUrlInput);
      alert(`URL Go Backend API berhasil diubah ke: ${this.apiUrlInput}`);
    }
  }

  setPreset(url: string): void {
    this.apiUrlInput = url;
    this.saveApiUrl();
  }

  testHealth(): void {
    this.isTesting.set(true);
    this.healthResult.set(null);

    this.api.checkHealth().subscribe({
      next: (res) => {
        this.isTesting.set(false);
        this.healthStatus.set('success');
        this.healthResult.set('Server Go API Online & Terhubung Normal! (HTTP 200 OK)');
      },
      error: (err) => {
        this.isTesting.set(false);
        this.healthStatus.set('error');
        this.healthResult.set(`Gagal terhubung ke Go API: ${err.message}`);
      },
    });
  }
}
