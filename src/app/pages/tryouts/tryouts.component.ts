import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { PracticeStatistic } from '../../core/models/models';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-tryouts',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Top Title & Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <app-icon name="award" [size]="18"></app-icon>
            </div>
            Hasil Tryout CBT & Statistik Siswa
          </h1>
          <p class="text-xs text-muted-foreground mt-1">
            Pantau performa ujian tryout simulasi CBT, akurasi jawaban, dan papan peringkat siswa nasional.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="loadStatistics()"
            [disabled]="isLoading()"
            class="h-9 px-3.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <app-icon name="refresh" [size]="14" [className]="isLoading() ? 'animate-spin' : ''"></app-icon>
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      <!-- Quick Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Sesi Ujian</div>
          <div class="text-2xl font-bold text-foreground mt-1">{{ sessions().length }}</div>
        </div>
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-[#1B2CC1] dark:text-[#7692FF] uppercase tracking-wider">Rata-Rata Skor</div>
          <div class="text-2xl font-bold text-foreground mt-1">{{ avgScore() }}</div>
        </div>
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Skor Tertinggi</div>
          <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ highestScore() }}</div>
        </div>
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Tingkat Ketuntasan</div>
          <div class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{{ passRate() }}%</div>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="relative w-full md:w-80">
          <app-icon name="search" [size]="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Cari nama siswa, sekolah, atau paket ujian..."
            class="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all placeholder:text-muted-foreground/50 shadow-sm"
          />
        </div>

        <div class="text-xs text-muted-foreground font-medium">
          Menampilkan <span class="text-foreground font-bold">{{ filteredSessions().length }}</span> riwayat pengerjaan
        </div>
      </div>

      <!-- Leaderboard & Practice Table -->
      <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th class="py-3 px-4 text-center w-14">Rank</th>
                <th class="py-3 px-4">Nama Siswa</th>
                <th class="py-3 px-4">Paket Ujian / Simulasi</th>
                <th class="py-3 px-4 text-center">Skor Akhir</th>
                <th class="py-3 px-4 text-center">Akurasi Jawaban</th>
                <th class="py-3 px-4">Waktu Ujian</th>
                <th class="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @if (isLoading()) {
                <tr>
                  <td colspan="7" class="py-12 text-center text-muted-foreground">
                    <div class="inline-flex items-center gap-2">
                      <div class="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat data hasil tryout...</span>
                    </div>
                  </td>
                </tr>
              } @else if (filteredSessions().length === 0) {
                <tr>
                  <td colspan="7" class="py-12 text-center text-muted-foreground">
                    <app-icon name="award" [size]="28" className="mx-auto mb-2 opacity-30"></app-icon>
                    <p class="font-medium">Tidak ada data tryout yang ditemukan.</p>
                  </td>
                </tr>
              } @else {
                <tr *ngFor="let s of filteredSessions(); let idx = index" class="hover:bg-muted/30 transition-colors">
                  <!-- Rank Badge -->
                  <td class="py-3.5 px-4 text-center">
                    @if (idx === 0) {
                      <span class="inline-flex h-6 w-6 rounded-full bg-amber-500/20 text-amber-600 font-bold items-center justify-center text-xs">🥇</span>
                    } @else if (idx === 1) {
                      <span class="inline-flex h-6 w-6 rounded-full bg-zinc-400/20 text-zinc-600 dark:text-zinc-300 font-bold items-center justify-center text-xs">🥈</span>
                    } @else if (idx === 2) {
                      <span class="inline-flex h-6 w-6 rounded-full bg-amber-700/20 text-amber-700 font-bold items-center justify-center text-xs">🥉</span>
                    } @else {
                      <span class="text-muted-foreground font-mono font-medium text-xs">#{{ idx + 1 }}</span>
                    }
                  </td>

                  <!-- Student Info -->
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-foreground">{{ s.studentName }}</div>
                    <div class="text-[11px] text-muted-foreground">{{ s.school }}</div>
                  </td>

                  <!-- Package Title -->
                  <td class="py-3.5 px-4 font-medium text-foreground">
                    {{ s.packageTitle }}
                  </td>

                  <!-- Total Score -->
                  <td class="py-3.5 px-4 text-center">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#1B2CC1]/10 text-[#1B2CC1] dark:text-[#7692FF] font-mono font-bold text-sm">
                      {{ s.totalScore }}
                    </span>
                  </td>

                  <!-- Accuracy -->
                  <td class="py-3.5 px-4 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-2">
                      <span class="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">✔ {{ s.correctAnswer }}</span>
                      <span class="text-muted-foreground">/</span>
                      <span class="text-rose-500 font-semibold text-[11px]">✖ {{ s.wrongAnswer }}</span>
                    </div>
                  </td>

                  <!-- Date -->
                  <td class="py-3.5 px-4 text-muted-foreground text-[11px] whitespace-nowrap">
                    {{ s.startedAt || s.createdAt }}
                  </td>

                  <!-- Status -->
                  <td class="py-3.5 px-4 text-center">
                    <span
                      class="px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase"
                      [ngClass]="s.status === 'finished' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'"
                    >
                      {{ s.status === 'finished' ? 'Selesai' : 'Mengerjakan' }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class TryoutsComponent implements OnInit {
  private adminService = inject(AdminService);

  sessions = signal<PracticeStatistic[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = '';

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.isLoading.set(true);
    this.adminService.getPracticeStatistics().subscribe({
      next: (data) => {
        // Sort highest score first for leaderboard
        const sorted = [...data].sort((a, b) => b.totalScore - a.totalScore);
        this.sessions.set(sorted);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  avgScore = computed(() => {
    const list = this.sessions();
    if (list.length === 0) return '0';
    const sum = list.reduce((acc, curr) => acc + curr.totalScore, 0);
    return Math.round(sum / list.length);
  });

  highestScore = computed(() => {
    const list = this.sessions();
    if (list.length === 0) return '0';
    return Math.max(...list.map((s) => s.totalScore));
  });

  passRate = computed(() => {
    const list = this.sessions();
    if (list.length === 0) return '100';
    const passed = list.filter((s) => s.totalScore >= 700).length;
    return Math.round((passed / list.length) * 100);
  });

  filteredSessions = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.sessions();
    return this.sessions().filter(
      (s) =>
        (s.studentName && s.studentName.toLowerCase().includes(q)) ||
        (s.school && s.school.toLowerCase().includes(q)) ||
        (s.packageTitle && s.packageTitle.toLowerCase().includes(q))
    );
  });
}
