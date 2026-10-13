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
      <!-- Page Title & Operational Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 class="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Ringkasan Operasional</h1>
          <p class="text-xs text-zinc-500 mt-0.5">Monitoring aktivitas belajar, pembayaran siswa, dan integritas katalog KPM</p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="loadData()"
            [disabled]="isLoading()"
            class="h-8 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors shadow-none"
          >
            <app-icon name="refresh" [size]="13" [className]="isLoading() ? 'animate-spin' : ''"></app-icon>
            <span>Perbarui Data</span>
          </button>

          <a
            routerLink="/admin/orders"
            class="h-8 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <app-icon name="shopping-cart" [size]="13"></app-icon>
            <span>Daftar Transaksi</span>
          </a>
        </div>
      </div>

      <!-- SYSTEM INTEGRITY STATUS STRIP -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
        <div class="flex items-center gap-2.5">
          <span class="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
          <div>
            <span class="font-medium text-zinc-800 dark:text-zinc-200 block text-xs">Backend Go Fiber Engine</span>
            <span class="text-[11px] text-zinc-400 font-mono">Port 3000 / REST API v1.0.0</span>
          </div>
        </div>

        <div class="flex items-center gap-2.5 md:border-l md:border-zinc-200 md:dark:border-zinc-800 md:pl-4">
          <span class="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
          <div>
            <span class="font-medium text-zinc-800 dark:text-zinc-200 block text-xs">Midtrans Payment Gateway</span>
            <span class="text-[11px] text-zinc-400 font-mono">Snap QRIS, VA BCA/Mandiri/BNI</span>
          </div>
        </div>

        <div class="flex items-center gap-2.5 md:border-l md:border-zinc-200 md:dark:border-zinc-800 md:pl-4">
          <span class="h-2 w-2 rounded-full bg-purple-500 flex-shrink-0"></span>
          <div>
            <span class="font-medium text-zinc-800 dark:text-zinc-200 block text-xs">Gemini 3.5 Flash AI Tutor</span>
            <span class="text-[11px] text-zinc-400 font-mono">Pembahasan Soal 24/7 Aktif</span>
          </div>
        </div>
      </div>

      <!-- KEY METRIC CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Total Siswa -->
        <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-none">
          <div class="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
            <span>Siswa Terdaftar</span>
            <app-icon name="users" [size]="15"></app-icon>
          </div>
          <div class="mt-2.5 flex items-baseline justify-between">
            <span class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
              {{ (stats()?.totalUsers || 5) | number }}
            </span>
            <span class="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Akun Aktif</span>
          </div>
        </div>

        <!-- 2. Total Pendapatan -->
        <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-none">
          <div class="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
            <span>Volume Penjualan</span>
            <app-icon name="dollar" [size]="15"></app-icon>
          </div>
          <div class="mt-2.5 flex items-baseline justify-between">
            <span class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
              Rp {{ (stats()?.totalRevenue || 688000) | number }}
            </span>
            <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">IDR Net</span>
          </div>
        </div>

        <!-- 3. Total Transaksi -->
        <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-none">
          <div class="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
            <span>Transaksi Berhasil</span>
            <app-icon name="shopping-cart" [size]="15"></app-icon>
          </div>
          <div class="mt-2.5 flex items-baseline justify-between">
            <span class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
              {{ (stats()?.totalOrders || 5) | number }}
            </span>
            <span class="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">Settlement</span>
          </div>
        </div>

        <!-- 4. Paket Belajar -->
        <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-none">
          <div class="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
            <span>Katalog Kurikulum</span>
            <app-icon name="package" [size]="15"></app-icon>
          </div>
          <div class="mt-2.5 flex items-baseline justify-between">
            <span class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
              {{ (stats()?.activePackages || 5) }}
            </span>
            <span class="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Paket Terbit</span>
          </div>
        </div>
      </div>

      <!-- OPERATIONAL CMS SHORTCUTS STRIP (No childish rainbow boxes) -->
      <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <div class="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center justify-between">
          <span>Manajemen Katalog & Modul Belajar</span>
          <a routerLink="/admin/cms" class="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium">Buka CMS Terpadu &rarr;</a>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <a
            routerLink="/admin/cms"
            [queryParams]="{ tab: 'package' }"
            class="p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors flex items-center gap-2"
          >
            <app-icon name="package" [size]="14" className="text-zinc-500"></app-icon>
            <div>
              <span class="font-medium text-zinc-800 dark:text-zinc-200 block text-xs">Paket Ujian</span>
              <span class="text-[10px] text-zinc-400">5 Paket aktif</span>
            </div>
          </a>

          <a
            routerLink="/admin/cms"
            [queryParams]="{ tab: 'banner' }"
            class="p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors flex items-center gap-2"
          >
            <app-icon name="layers" [size]="14" className="text-zinc-500"></app-icon>
            <div>
              <span class="font-medium text-zinc-800 dark:text-zinc-200 block text-xs">Banner Slider</span>
              <span class="text-[10px] text-zinc-400">3 Banner aktif</span>
            </div>
          </a>

          <a
            routerLink="/admin/cms"
            [queryParams]="{ tab: 'live' }"
            class="p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors flex items-center gap-2"
          >
            <app-icon name="video" [size]="14" className="text-zinc-500"></app-icon>
            <div>
              <span class="font-medium text-zinc-800 dark:text-zinc-200 block text-xs">Live Class</span>
              <span class="text-[10px] text-zinc-400">2 Sesi Zoom</span>
            </div>
          </a>

          <a
            routerLink="/admin/cms"
            [queryParams]="{ tab: 'video' }"
            class="p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors flex items-center gap-2"
          >
            <app-icon name="video" [size]="14" className="text-zinc-500"></app-icon>
            <div>
              <span class="font-medium text-zinc-800 dark:text-zinc-200 block text-xs">Video Materi</span>
              <span class="text-[10px] text-zinc-400">4 Video MIPA</span>
            </div>
          </a>

          <a
            routerLink="/admin/cms"
            [queryParams]="{ tab: 'module' }"
            class="p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors flex items-center gap-2"
          >
            <app-icon name="file-text" [size]="14" className="text-zinc-500"></app-icon>
            <div>
              <span class="font-medium text-zinc-800 dark:text-zinc-200 block text-xs">Modul PDF</span>
              <span class="text-[10px] text-zinc-400">4 E-Book</span>
            </div>
          </a>

          <a
            routerLink="/admin/cms"
            [queryParams]="{ tab: 'voucher' }"
            class="p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors flex items-center gap-2"
          >
            <app-icon name="ticket" [size]="14" className="text-zinc-500"></app-icon>
            <div>
              <span class="font-medium text-zinc-800 dark:text-zinc-200 block text-xs">Voucher Diskon</span>
              <span class="text-[10px] text-zinc-400">3 Kode promo</span>
            </div>
          </a>
        </div>
      </div>

      <!-- RECENT ORDERS SECTION -->
      <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div class="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Log Transaksi Terkini</h2>
            <p class="text-[11px] text-zinc-400 mt-0.5">Sinkronisasi status pembayaran gateway Midtrans real-time</p>
          </div>
          <a
            routerLink="/admin/orders"
            class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Semua Transaksi</span>
            <app-icon name="external-link" [size]="11"></app-icon>
          </a>
        </div>

        <!-- Table View -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold">
              <tr>
                <th class="px-4 py-2.5">No. Invoice</th>
                <th class="px-4 py-2.5">Siswa</th>
                <th class="px-4 py-2.5">Paket Belajar</th>
                <th class="px-4 py-2.5">Metode Bayar</th>
                <th class="px-4 py-2.5 text-right">Nominal</th>
                <th class="px-4 py-2.5 text-center">Status</th>
                <th class="px-4 py-2.5 text-right">Waktu Transaksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              @for (order of recentOrders(); track order.id) {
                <tr class="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                  <td class="px-4 py-3 font-mono font-medium text-blue-600 dark:text-blue-400">{{ order.id }}</td>
                  <td class="px-4 py-3">
                    <span class="font-medium text-zinc-900 dark:text-zinc-100 block">{{ order.studentName }}</span>
                    <span class="text-[11px] text-zinc-400 block truncate max-w-[200px]">{{ order.school }}</span>
                  </td>
                  <td class="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">{{ order.packageTitle }}</td>
                  <td class="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-[11px] font-mono">{{ order.paymentMethod }}</td>
                  <td class="px-4 py-3 text-right font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    Rp {{ order.amount | number }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-mono">
                      <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>{{ order.status }}</span>
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right text-[11px] text-zinc-400 font-mono">{{ order.createdAt }}</td>
                </tr>
              }
            </tbody>
          </table>
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
