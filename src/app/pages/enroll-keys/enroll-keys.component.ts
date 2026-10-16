import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { EnrollKey } from '../../core/models/models';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-enroll-keys',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Top Title & Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-lg bg-blue-500/10 text-[#1B2CC1] dark:text-[#7692FF] flex items-center justify-center">
              <app-icon name="key" [size]="18"></app-icon>
            </div>
            Kunci Akses & Aktivasi Siswa
          </h1>
          <p class="text-xs text-muted-foreground mt-1">
            Data lisensi akses materi, kode aktivasi paket belajar, dan status hak belajar siswa terverifikasi.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="exportCSV()"
            class="h-9 px-3.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <app-icon name="file-text" [size]="14"></app-icon>
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            (click)="loadKeys()"
            [disabled]="isLoading()"
            class="h-9 px-3.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <app-icon name="refresh" [size]="14" [className]="isLoading() ? 'animate-spin' : ''"></app-icon>
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      <!-- Quick Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Lisensi Terbit</div>
          <div class="text-2xl font-bold text-foreground mt-1">{{ keys().length }}</div>
        </div>
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Akses Berjalan Aktif</div>
          <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ countActive() }}</div>
        </div>
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-[#1B2CC1] dark:text-[#7692FF] uppercase tracking-wider">Masa Berlaku Standar</div>
          <div class="text-2xl font-bold text-foreground mt-1">180 Hari</div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="relative w-full md:w-80">
          <app-icon name="search" [size]="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Cari kode order, nama siswa, email, atau paket..."
            class="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all placeholder:text-muted-foreground/50 shadow-sm"
          />
        </div>

        <div class="text-xs text-muted-foreground">
          Daftar lisensi yang sudah lunas terverifikasi pembayaran
        </div>
      </div>

      <!-- Table -->
      <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th class="py-3 px-4">Kode Lisensi / Order</th>
                <th class="py-3 px-4">Siswa Pemegang Lisensi</th>
                <th class="py-3 px-4">Paket Belajar yang Dibuka</th>
                <th class="py-3 px-4">Masa Akses</th>
                <th class="py-3 px-4">Metode Bayar</th>
                <th class="py-3 px-4">Tanggal Terbit</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-right">Salin</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @if (isLoading()) {
                <tr>
                  <td colspan="8" class="py-12 text-center text-muted-foreground">
                    <div class="inline-flex items-center gap-2">
                      <div class="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat data kunci akses...</span>
                    </div>
                  </td>
                </tr>
              } @else if (filteredKeys().length === 0) {
                <tr>
                  <td colspan="8" class="py-12 text-center text-muted-foreground">
                    <app-icon name="key" [size]="28" className="mx-auto mb-2 opacity-30"></app-icon>
                    <p class="font-medium">Tidak ada kunci akses yang cocok.</p>
                  </td>
                </tr>
              } @else {
                <tr *ngFor="let k of filteredKeys()" class="hover:bg-muted/30 transition-colors">
                  <td class="py-3.5 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                    {{ k.orderNumber }}
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-foreground">{{ k.studentName }}</div>
                    <div class="text-[11px] text-muted-foreground font-mono">{{ k.studentEmail }}</div>
                  </td>
                  <td class="py-3.5 px-4 font-medium text-foreground">
                    {{ k.packageTitle }}
                  </td>
                  <td class="py-3.5 px-4 font-mono font-medium text-[#1B2CC1] dark:text-[#7692FF] whitespace-nowrap">
                    {{ k.accessDuration }}
                  </td>
                  <td class="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                    {{ k.paymentMethod }}
                  </td>
                  <td class="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                    {{ k.createdAt }}
                  </td>
                  <td class="py-3.5 px-4 text-center whitespace-nowrap">
                    <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      AKTIF
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      (click)="copyCode(k.orderNumber)"
                      class="h-7 px-2.5 rounded-md border border-border hover:bg-muted text-foreground text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                      title="Salin Kode Akses"
                    >
                      <app-icon name="copy" [size]="12"></app-icon>
                      <span>Salin</span>
                    </button>
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
export class EnrollKeysComponent implements OnInit {
  private adminService = inject(AdminService);

  keys = signal<EnrollKey[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = '';

  ngOnInit(): void {
    this.loadKeys();
  }

  loadKeys(): void {
    this.isLoading.set(true);
    this.adminService.getEnrollKeys().subscribe({
      next: (data) => {
        this.keys.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  countActive = computed(() => this.keys().filter((k) => k.status === 'ACTIVE' || k.status === 'PAID').length);

  filteredKeys = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.keys();
    return this.keys().filter(
      (k) =>
        k.orderNumber.toLowerCase().includes(q) ||
        k.studentName.toLowerCase().includes(q) ||
        k.studentEmail.toLowerCase().includes(q) ||
        k.packageTitle.toLowerCase().includes(q)
    );
  });

  copyCode(code: string): void {
    navigator.clipboard.writeText(code);
    alert(`Kode lisensi "${code}" berhasil disalin ke clipboard!`);
  }

  exportCSV(): void {
    const headers = ['Order Number', 'Student Name', 'Student Email', 'Package', 'Access Duration', 'Status', 'Date'];
    const rows = this.filteredKeys().map((k) => [
      k.orderNumber,
      `"${k.studentName}"`,
      k.studentEmail,
      `"${k.packageTitle}"`,
      k.accessDuration || '180 Hari',
      k.status,
      k.createdAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpm-enroll-keys-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
