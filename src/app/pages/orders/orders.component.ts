import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { Order } from '../../core/models/models';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold tracking-tight text-foreground">Log Transaksi & Penjualan</h1>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono border border-border bg-muted/60 text-muted-foreground">
              MIDTRANS V2
            </span>
          </div>
          <p class="text-xs text-muted-foreground mt-0.5">
            Audit histori settlement, kupon diskon, dan aktivasi akses otomatis siswa
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="exportCSV()"
            class="h-8 px-3 rounded-md border border-border bg-card hover:bg-muted text-xs font-medium text-foreground flex items-center gap-2 transition-colors"
          >
            <app-icon name="file-text" [size]="13"></app-icon>
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      <!-- KPI Metrics Strip -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="p-4 rounded-lg border border-border bg-card">
          <div class="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">Gross Settlement</div>
          <div class="text-lg font-bold font-mono text-foreground mt-1">
            Rp {{ totalGrossVolume() | number }}
          </div>
          <div class="text-[10px] text-muted-foreground mt-0.5">Total penerimaan terverifikasi</div>
        </div>

        <div class="p-4 rounded-lg border border-border bg-card">
          <div class="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">Transaksi Sukses</div>
          <div class="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {{ paidCount() }} Transaksi
          </div>
          <div class="text-[10px] text-muted-foreground mt-0.5">100% hak akses teraktivasi</div>
        </div>

        <div class="p-4 rounded-lg border border-border bg-card">
          <div class="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">Menunggu Pembayaran</div>
          <div class="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {{ pendingCount() }} Transaksi
          </div>
          <div class="text-[10px] text-muted-foreground mt-0.5">Menunggu respon gateway</div>
        </div>

        <div class="p-4 rounded-lg border border-border bg-card">
          <div class="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">Rata-rata Order (AOV)</div>
          <div class="text-lg font-bold font-mono text-foreground mt-1">
            Rp {{ averageOrderValue() | number }}
          </div>
          <div class="text-[10px] text-muted-foreground mt-0.5">Per siswa terdaftar</div>
        </div>
      </div>

      <!-- Search & Filter Controls -->
      <div class="p-3 rounded-lg border border-border bg-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1">
          <app-icon name="search" [size]="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></app-icon>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchInput($event)"
            placeholder="Cari ID transaksi, nama siswa, sekolah, atau nama paket..."
            class="w-full h-8 pl-8 pr-7 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
          @if (searchQuery()) {
            <button
              (click)="searchQuery.set('')"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
            >
              <app-icon name="x" [size]="12"></app-icon>
            </button>
          }
        </div>

        <!-- Status Filter Tabs -->
        <div class="flex items-center gap-1 text-xs">
          <button
            type="button"
            (click)="statusFilter.set('ALL')"
            [class]="statusFilter() === 'ALL' ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
            class="h-8 px-3 rounded-md transition-colors"
          >
            Semua ({{ orders().length }})
          </button>
          <button
            type="button"
            (click)="statusFilter.set('PAID')"
            [class]="statusFilter() === 'PAID' ? 'bg-emerald-600/10 text-emerald-600 border border-emerald-500/20 font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
            class="h-8 px-3 rounded-md transition-colors"
          >
            Selesai ({{ paidCount() }})
          </button>
          <button
            type="button"
            (click)="statusFilter.set('PENDING')"
            [class]="statusFilter() === 'PENDING' ? 'bg-amber-600/10 text-amber-600 border border-amber-500/20 font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
            class="h-8 px-3 rounded-md transition-colors"
          >
            Pending ({{ pendingCount() }})
          </button>
        </div>
      </div>

      <!-- DESKTOP / TABLET DATA TABLE -->
      <div class="hidden sm:block rounded-lg border border-border bg-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-muted/40 border-b border-border text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th class="px-4 py-3 font-medium">Invoice ID</th>
                <th class="px-4 py-3 font-medium">Siswa & Kontak</th>
                <th class="px-4 py-3 font-medium">Paket Belajar</th>
                <th class="px-4 py-3 font-medium">Metode</th>
                <th class="px-4 py-3 font-medium">Nominal</th>
                <th class="px-4 py-3 font-medium">Status</th>
                <th class="px-4 py-3 font-medium">Waktu Transaksi</th>
                <th class="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (order of filteredOrders(); track order.id) {
                <tr class="hover:bg-muted/30 transition-colors">
                  <!-- Invoice -->
                  <td class="px-4 py-3 font-mono">
                    <div class="flex items-center gap-1.5 font-semibold text-foreground">
                      <span>{{ order.id }}</span>
                      <button
                        (click)="copyToClipboard(order.id)"
                        class="p-0.5 text-muted-foreground hover:text-foreground rounded"
                        title="Salin Invoice"
                      >
                        <app-icon name="copy" [size]="11"></app-icon>
                      </button>
                    </div>
                    @if (order.voucherCode) {
                      <div class="text-[10px] text-muted-foreground mt-0.5 font-sans">
                        Kupon: <span class="font-mono font-semibold text-foreground">{{ order.voucherCode }}</span>
                      </div>
                    }
                  </td>

                  <!-- Siswa -->
                  <td class="px-4 py-3">
                    <div class="font-medium text-foreground">{{ order.studentName }}</div>
                    <div class="text-[11px] text-muted-foreground">{{ order.school }}</div>
                    <div class="text-[10px] text-muted-foreground font-mono">{{ order.studentPhone }}</div>
                  </td>

                  <!-- Paket -->
                  <td class="px-4 py-3">
                    <div class="font-medium text-foreground">{{ order.packageTitle }}</div>
                    <div class="text-[10px] text-muted-foreground font-mono">Durasi: {{ order.accessDuration || '180 Hari' }}</div>
                  </td>

                  <!-- Metode -->
                  <td class="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                    {{ order.paymentMethod }}
                  </td>

                  <!-- Nominal -->
                  <td class="px-4 py-3 font-mono font-bold text-foreground">
                    Rp {{ order.amount | number }}
                  </td>

                  <!-- Status -->
                  <td class="px-4 py-3">
                    @if (order.status === 'PAID') {
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        <span>SETTLED</span>
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
                        <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                        <span>PENDING</span>
                      </span>
                    }
                  </td>

                  <!-- Timestamp -->
                  <td class="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                    {{ order.createdAt }}
                  </td>

                  <!-- Action -->
                  <td class="px-4 py-3 text-right">
                    <button
                      type="button"
                      (click)="viewReceipt(order)"
                      class="h-7 px-2.5 rounded border border-border bg-card hover:bg-muted text-[11px] font-medium text-foreground transition-colors"
                    >
                      Detail Faktur
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="text-center py-12 text-muted-foreground">
                    <p class="text-xs font-medium text-foreground">Tidak ada transaksi ditemukan</p>
                    <p class="text-[11px] text-muted-foreground mt-0.5">Coba sesuaikan kata kunci atau filter status</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MOBILE VIEW: CARD LIST (< 640px) -->
      <div class="sm:hidden space-y-2.5">
        @for (order of filteredOrders(); track order.id) {
          <div class="rounded-lg border border-border bg-card p-3.5 space-y-2.5">
            <div class="flex items-start justify-between">
              <div>
                <div class="font-mono text-xs font-bold text-foreground">{{ order.id }}</div>
                <div class="text-xs font-medium text-foreground mt-0.5">{{ order.studentName }}</div>
                <div class="text-[10px] text-muted-foreground">{{ order.school }}</div>
              </div>
              @if (order.status === 'PAID') {
                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-600 bg-emerald-500/10 border border-emerald-500/20">
                  <span>PAID</span>
                </span>
              } @else {
                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-600 bg-amber-500/10 border border-amber-500/20">
                  <span>PENDING</span>
                </span>
              }
            </div>

            <div class="text-xs border-y border-border py-2 space-y-1">
              <div class="text-muted-foreground">Paket: <span class="font-medium text-foreground">{{ order.packageTitle }}</span></div>
              <div class="flex items-center justify-between text-muted-foreground">
                <span>Metode: {{ order.paymentMethod }}</span>
                <span class="font-mono font-bold text-foreground">Rp {{ order.amount | number }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-0.5">
              <span class="text-[10px] text-muted-foreground font-mono">{{ order.createdAt }}</span>
              <button
                type="button"
                (click)="viewReceipt(order)"
                class="h-7 px-2.5 rounded border border-border bg-muted/50 hover:bg-muted text-[11px] font-medium transition-colors"
              >
                Detail Faktur
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- DIGITAL RECEIPT / INVOICE MODAL -->
    <app-modal
      [isOpen]="isReceiptOpen()"
      title="Faktur Transaksi Elektronik"
      description="Verifikasi KPM Academy & Midtrans Payment Gateway"
      (onClose)="isReceiptOpen.set(false)"
    >
      @if (selectedOrder(); as ord) {
        <div class="space-y-4">
          <!-- Official Slip Header -->
          <div class="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Invoice Reference</span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20">
                SETTLEMENT BERHASIL
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-base font-mono font-bold text-foreground">{{ ord.id }}</span>
              <button
                (click)="copyToClipboard(ord.id)"
                class="h-7 px-2.5 rounded border border-border bg-card hover:bg-muted text-xs font-mono transition-colors"
              >
                Salin ID
              </button>
            </div>
          </div>

          <!-- Customer & Order Information -->
          <div class="rounded-lg border border-border bg-card p-4 space-y-2.5 text-xs">
            <div class="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Identitas Pembeli</div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-muted-foreground block text-[11px]">Nama Lengkap</span>
                <span class="font-medium text-foreground">{{ ord.studentName }}</span>
              </div>
              <div>
                <span class="text-muted-foreground block text-[11px]">Sekolah</span>
                <span class="font-medium text-foreground">{{ ord.school }}</span>
              </div>
              <div>
                <span class="text-muted-foreground block text-[11px]">No. WhatsApp</span>
                <span class="font-mono text-foreground">{{ ord.studentPhone }}</span>
              </div>
              <div>
                <span class="text-muted-foreground block text-[11px]">Status Akses</span>
                <span class="font-medium text-emerald-600">Aktif ({{ ord.accessDuration || '180 Hari' }})</span>
              </div>
            </div>
          </div>

          <!-- Payment Breakdown -->
          <div class="rounded-lg border border-border bg-card p-4 space-y-2 text-xs">
            <div class="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Rincian Pembayaran</div>
            <div class="flex justify-between text-muted-foreground">
              <span>Paket Pembelajaran</span>
              <span class="font-medium text-foreground">{{ ord.packageTitle }}</span>
            </div>
            <div class="flex justify-between text-muted-foreground">
              <span>Metode Pembayaran</span>
              <span class="font-mono text-foreground">{{ ord.paymentMethod }}</span>
            </div>
            <div class="flex justify-between text-muted-foreground">
              <span>Waktu Settlement</span>
              <span class="font-mono text-foreground">{{ ord.createdAt }}</span>
            </div>
            <div class="flex justify-between text-muted-foreground">
              <span>Harga Normal</span>
              <span class="font-mono text-foreground">Rp {{ (ord.originalAmount || ord.amount) | number }}</span>
            </div>
            @if (ord.discountAmount) {
              <div class="flex justify-between text-muted-foreground">
                <span>Potongan Kupon ({{ ord.voucherCode }})</span>
                <span class="font-mono text-emerald-600">- Rp {{ ord.discountAmount | number }}</span>
              </div>
            }

            <div class="pt-2 border-t border-border flex justify-between items-center text-sm font-bold text-foreground">
              <span>Total Bersih</span>
              <span class="font-mono">Rp {{ ord.amount | number }}</span>
            </div>
          </div>
        </div>
      }

      <div modal-footer class="flex items-center justify-end gap-2">
        <button
          type="button"
          (click)="isReceiptOpen.set(false)"
          class="h-8 px-4 rounded-md border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors"
        >
          Tutup
        </button>
      </div>
    </app-modal>
  `,
})
export class OrdersComponent implements OnInit {
  adminService = inject(AdminService);

  orders = signal<Order[]>([]);
  searchQuery = signal<string>('');
  statusFilter = signal<'ALL' | 'PAID' | 'PENDING'>('ALL');

  isReceiptOpen = signal<boolean>(false);
  selectedOrder = signal<Order | null>(null);

  totalGrossVolume = computed(() => {
    return this.orders()
      .filter((o) => o.status === 'PAID')
      .reduce((sum, o) => sum + (o.amount || 0), 0);
  });

  paidCount = computed(() => {
    return this.orders().filter((o) => o.status === 'PAID').length;
  });

  pendingCount = computed(() => {
    return this.orders().filter((o) => o.status === 'PENDING').length;
  });

  averageOrderValue = computed(() => {
    const paid = this.paidCount();
    if (paid === 0) return 0;
    return Math.round(this.totalGrossVolume() / paid);
  });

  filteredOrders = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const sf = this.statusFilter();

    return this.orders().filter((ord) => {
      if (sf !== 'ALL' && ord.status !== sf) return false;
      if (!q) return true;

      const invoice = (ord.id || '').toLowerCase();
      const student = (ord.studentName || '').toLowerCase();
      const school = (ord.school || '').toLowerCase();
      const pkg = (ord.packageTitle || '').toLowerCase();
      const payment = (ord.paymentMethod || '').toLowerCase();

      return invoice.includes(q) || student.includes(q) || school.includes(q) || pkg.includes(q) || payment.includes(q);
    });
  });

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.adminService.getOrders().subscribe((res) => {
      this.orders.set(res);
    });
  }

  onSearchInput(val: string): void {
    this.searchQuery.set(val);
  }

  viewReceipt(order: Order): void {
    this.selectedOrder.set(order);
    this.isReceiptOpen.set(true);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }

  exportCSV(): void {
    const data = this.filteredOrders();
    let csv = 'Invoice,Siswa,Sekolah,WhatsApp,Paket,Total Bayar,Metode,Status,Waktu\n';
    data.forEach((d) => {
      csv += `"${d.id}","${d.studentName}","${d.school}","${d.studentPhone}","${d.packageTitle}",${d.amount},"${d.paymentMethod}","${d.status}","${d.createdAt}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kpm-orders-${Date.now()}.csv`);
    link.click();
  }
}
