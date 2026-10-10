import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { ApiService } from '../../core/services/api.service';
import { AdminStats, Order } from '../../core/models/models';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Dashboard Administrator</h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Ringkasan metrik belajar, performa penjualan paket & sinkronisasi data KPM Academy
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="loadData()"
            [disabled]="isLoading()"
            class="h-9 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-2 transition-all shadow-sm"
          >
            <app-icon name="refresh" [size]="14" [className]="isLoading() ? 'animate-spin' : ''"></app-icon>
            <span>Sinkron Data</span>
          </button>

          <a
            routerLink="/admin/cms"
            class="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm"
          >
            <app-icon name="plus" [size]="14"></app-icon>
            <span>Kelola CMS</span>
          </a>
        </div>
      </div>

      <!-- METRICS GRID (Responsive 1-col on mobile, 2-col on tablet, 4-col on desktop) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Total Siswa -->
        <div class="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm hover:border-primary/40 transition-colors">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-muted-foreground">Total Siswa Terdaftar</span>
            <div class="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <app-icon name="users" [size]="16"></app-icon>
            </div>
          </div>
          <div class="mt-3">
            <div class="text-2xl font-black text-foreground">{{ (stats()?.totalUsers || 5) | number }}</div>
            <div class="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-bold">
              <span>+100% Realtime</span>
              <span class="text-muted-foreground font-normal">Sinkron akun mobile</span>
            </div>
          </div>
        </div>

        <!-- 2. Total Omset Realtime -->
        <div class="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm hover:border-primary/40 transition-colors">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-muted-foreground">Total Pendapatan Midtrans</span>
            <div class="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <app-icon name="dollar" [size]="16"></app-icon>
            </div>
          </div>
          <div class="mt-3">
            <div class="text-2xl font-black text-foreground">Rp {{ (stats()?.totalRevenue || 688000) | number }}</div>
            <div class="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-bold">
              <span>Otomatis Verifikasi</span>
              <span class="text-muted-foreground font-normal">Kwitansi aktif</span>
            </div>
          </div>
        </div>

        <!-- 3. Total Pesanan -->
        <div class="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm hover:border-primary/40 transition-colors">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-muted-foreground">Transaksi Pesanan</span>
            <div class="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <app-icon name="shopping-cart" [size]="16"></app-icon>
            </div>
          </div>
          <div class="mt-3">
            <div class="text-2xl font-black text-foreground">{{ (stats()?.totalOrders || 5) | number }}</div>
            <div class="flex items-center gap-1.5 mt-1 text-[11px] text-blue-600 font-bold">
              <span>100% Selesai (PAID)</span>
            </div>
          </div>
        </div>

        <!-- 4. Paket Belajar Aktif -->
        <div class="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm hover:border-primary/40 transition-colors">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-muted-foreground">Paket Belajar & Tryout</span>
            <div class="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <app-icon name="package" [size]="16"></app-icon>
            </div>
          </div>
          <div class="mt-3">
            <div class="text-2xl font-black text-foreground">{{ (stats()?.activePackages || 5) }} Paket</div>
            <div class="flex items-center gap-1.5 mt-1 text-[11px] text-purple-600 font-bold">
              <span>SD, SMP, SMA & MNR</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SHORTCUT GRID FOR CMS (Responsive 2-col on mobile, 3-col on tablet, 6-col on desktop) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <a
          routerLink="/admin/cms"
          [queryParams]="{ tab: 'banner' }"
          class="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:bg-muted/60 transition-all flex flex-col items-center text-center group shadow-sm"
        >
          <div class="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <app-icon name="layers" [size]="20"></app-icon>
          </div>
          <span class="text-xs font-bold text-foreground">Banner Promo</span>
          <span class="text-[10px] text-muted-foreground">{{ stats()?.totalVideos ? '3 Banner' : 'Slider Beranda' }}</span>
        </a>

        <a
          routerLink="/admin/cms"
          [queryParams]="{ tab: 'live' }"
          class="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:bg-muted/60 transition-all flex flex-col items-center text-center group shadow-sm"
        >
          <div class="h-10 w-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <app-icon name="video" [size]="20"></app-icon>
          </div>
          <span class="text-xs font-bold text-foreground">Live Class</span>
          <span class="text-[10px] text-muted-foreground">Jadwal Zoom & Tutor</span>
        </a>

        <a
          routerLink="/admin/cms"
          [queryParams]="{ tab: 'package' }"
          class="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:bg-muted/60 transition-all flex flex-col items-center text-center group shadow-sm"
        >
          <div class="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <app-icon name="package" [size]="20"></app-icon>
          </div>
          <span class="text-xs font-bold text-foreground">Paket Belajar</span>
          <span class="text-[10px] text-muted-foreground">Tryout & Modul</span>
        </a>

        <a
          routerLink="/admin/cms"
          [queryParams]="{ tab: 'video' }"
          class="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:bg-muted/60 transition-all flex flex-col items-center text-center group shadow-sm"
        >
          <div class="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <app-icon name="video" [size]="20"></app-icon>
          </div>
          <span class="text-xs font-bold text-foreground">Video Materi</span>
          <span class="text-[10px] text-muted-foreground">4 Video Pembahasan</span>
        </a>

        <a
          routerLink="/admin/cms"
          [queryParams]="{ tab: 'module' }"
          class="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:bg-muted/60 transition-all flex flex-col items-center text-center group shadow-sm"
        >
          <div class="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <app-icon name="file-text" [size]="20"></app-icon>
          </div>
          <span class="text-xs font-bold text-foreground">Modul PDF</span>
          <span class="text-[10px] text-muted-foreground">4 Bank Soal PDF</span>
        </a>

        <a
          routerLink="/admin/cms"
          [queryParams]="{ tab: 'voucher' }"
          class="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:bg-muted/60 transition-all flex flex-col items-center text-center group shadow-sm"
        >
          <div class="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <app-icon name="ticket" [size]="20"></app-icon>
          </div>
          <span class="text-xs font-bold text-foreground">Kupon Voucher</span>
          <span class="text-[10px] text-muted-foreground">3 Kupon Diskon</span>
        </a>
      </div>

      <!-- RECENT TRANSACTIONS (Responsive table + mobile card list) -->
      <div class="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div class="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 class="text-sm sm:text-base font-bold text-foreground">Transaksi Pesanan Terbaru</h2>
            <p class="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Daftar pembayaran siswa terverifikasi Midtrans Sandbox & Production</p>
          </div>
          <a
            routerLink="/admin/orders"
            class="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>Semua Pesanan</span>
            <app-icon name="external-link" [size]="12"></app-icon>
          </a>
        </div>

        <!-- Desktop/Tablet Table -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th class="px-5 py-3.5">Invoice</th>
                <th class="px-5 py-3.5">Siswa & Sekolah</th>
                <th class="px-5 py-3.5">Paket Belajar</th>
                <th class="px-5 py-3.5">Total Bayar</th>
                <th class="px-5 py-3.5">Metode</th>
                <th class="px-5 py-3.5">Status</th>
                <th class="px-5 py-3.5">Waktu</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (order of recentOrders(); track order.id) {
                <tr class="hover:bg-muted/30 transition-colors">
                  <td class="px-5 py-3.5 font-mono font-bold text-primary">{{ order.id }}</td>
                  <td class="px-5 py-3.5">
                    <div class="font-bold text-foreground">{{ order.studentName }}</div>
                    <div class="text-[10px] text-muted-foreground">{{ order.school }}</div>
                  </td>
                  <td class="px-5 py-3.5 font-medium text-foreground">{{ order.packageTitle }}</td>
                  <td class="px-5 py-3.5 font-bold text-emerald-600">Rp {{ order.amount | number }}</td>
                  <td class="px-5 py-3.5 text-muted-foreground">{{ order.paymentMethod }}</td>
                  <td class="px-5 py-3.5">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <app-icon name="check" [size]="10"></app-icon>
                      <span>{{ order.status }}</span>
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-muted-foreground">{{ order.createdAt }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Mobile Card List (< 640px) -->
        <div class="sm:hidden divide-y divide-border">
          @for (order of recentOrders(); track order.id) {
            <div class="p-4 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs font-bold text-primary">{{ order.id }}</span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                  <app-icon name="check" [size]="10"></app-icon>
                  <span>{{ order.status }}</span>
                </span>
              </div>
              <div class="text-xs">
                <div class="font-bold text-foreground">{{ order.studentName }}</div>
                <div class="text-[10px] text-muted-foreground">{{ order.school }}</div>
              </div>
              <div class="text-xs text-muted-foreground">
                {{ order.packageTitle }}
              </div>
              <div class="flex items-center justify-between text-xs pt-1">
                <span class="text-muted-foreground">{{ order.createdAt }}</span>
                <span class="font-black text-emerald-600">Rp {{ order.amount | number }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  adminService = inject(AdminService);
  api = inject(ApiService);

  stats = signal<AdminStats | null>(null);
  recentOrders = signal<Order[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.adminService.getDashboardStats().subscribe((res) => {
      this.stats.set(res);
      this.isLoading.set(false);
    });

    this.adminService.getOrders().subscribe((orders) => {
      this.recentOrders.set(orders.slice(0, 5));
    });
  }
}
