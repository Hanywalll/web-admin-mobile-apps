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
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Pesanan & Pembayaran Siswa</h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Daftar transaksi, verifikasi Midtrans Gateway, dan bukti kwitansi pembelian
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="exportCSV()"
            class="h-9 px-3.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <app-icon name="file-text" [size]="14"></app-icon>
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      <!-- SEARCH & FILTER TOOLBAR -->
      <div class="p-3 sm:p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <!-- Search Input with Live Signal Keystroke Filter -->
        <div class="relative flex-1">
          <app-icon name="search" [size]="16" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></app-icon>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchInput($event)"
            placeholder="Cari nomor invoice (misal: ORD-2026-9812) atau nama siswa..."
            class="w-full h-10 pl-9 pr-8 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
          @if (searchQuery()) {
            <button
              (click)="searchQuery.set('')"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <app-icon name="x" [size]="14"></app-icon>
            </button>
          }
        </div>

        <!-- Status Filter Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            type="button"
            (click)="statusFilter.set('ALL')"
            [class]="statusFilter() === 'ALL' ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted text-muted-foreground hover:text-foreground'"
            class="px-3 py-2 rounded-lg transition-all whitespace-nowrap"
          >
            Semua ({{ orders().length }})
          </button>
          <button
            type="button"
            (click)="statusFilter.set('PAID')"
            [class]="statusFilter() === 'PAID' ? 'bg-emerald-600 text-white font-bold' : 'bg-muted text-muted-foreground hover:text-foreground'"
            class="px-3 py-2 rounded-lg transition-all whitespace-nowrap"
          >
            Berhasil (PAID)
          </button>
          <button
            type="button"
            (click)="statusFilter.set('PENDING')"
            [class]="statusFilter() === 'PENDING' ? 'bg-amber-600 text-white font-bold' : 'bg-muted text-muted-foreground hover:text-foreground'"
            class="px-3 py-2 rounded-lg transition-all whitespace-nowrap"
          >
            Pending
          </button>
        </div>
      </div>

      <!-- DESKTOP / TABLET VIEW: ORDERS TABLE -->
      <div class="hidden sm:block rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th class="px-5 py-3.5">Invoice</th>
                <th class="px-5 py-3.5">Siswa & Kontak</th>
                <th class="px-5 py-3.5">Paket Belajar</th>
                <th class="px-5 py-3.5">Total Bersih</th>
                <th class="px-5 py-3.5">Metode Bayar</th>
                <th class="px-5 py-3.5">Status</th>
                <th class="px-5 py-3.5">Waktu</th>
                <th class="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (order of filteredOrders(); track order.id) {
                <tr class="hover:bg-muted/30 transition-colors">
                  <td class="px-5 py-3.5 font-mono font-bold text-primary">
                    <div class="flex items-center gap-1.5">
                      <span>{{ order.id }}</span>
                      <button
                        (click)="copyToClipboard(order.id, 'Invoice')"
                        class="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                        title="Salin Invoice"
                      >
                        <app-icon name="copy" [size]="12"></app-icon>
                      </button>
                    </div>
                    @if (order.voucherCode) {
                      <span class="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-pink-500/10 text-pink-600 border border-pink-500/20">
                        Kupon: {{ order.voucherCode }}
                      </span>
                    }
                  </td>
                  <td class="px-5 py-3.5">
                    <div class="font-bold text-foreground">{{ order.studentName }}</div>
                    <div class="text-[10px] text-muted-foreground">{{ order.school }}</div>
                    <div class="text-[10px] text-muted-foreground font-mono">{{ order.studentPhone }}</div>
                  </td>
                  <td class="px-5 py-3.5">
                    <div class="font-semibold text-foreground">{{ order.packageTitle }}</div>
                    <div class="text-[10px] text-emerald-600 font-bold">Akses Otomatis Aktif</div>
                  </td>
                  <td class="px-5 py-3.5 font-black text-emerald-600">Rp {{ order.amount | number }}</td>
                  <td class="px-5 py-3.5 text-muted-foreground">{{ order.paymentMethod }}</td>
                  <td class="px-5 py-3.5">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <app-icon name="check" [size]="10"></app-icon>
                      <span>{{ order.status }}</span>
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-muted-foreground">{{ order.createdAt }}</td>
                  <td class="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      (click)="viewReceipt(order)"
                      class="h-7 px-2.5 rounded-md border border-primary/30 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary text-[11px] font-bold transition-all"
                    >
                      Lihat Kwitansi
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="text-center py-12 text-muted-foreground">
                    <app-icon name="search" [size]="32" className="mx-auto mb-2 text-muted-foreground/60"></app-icon>
                    <p class="text-xs font-bold text-foreground">Tidak Ada Pesanan Ditemukan</p>
                    <p class="text-[11px] text-muted-foreground mt-0.5">Coba cari dengan kata kunci invoice atau nama siswa lain</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MOBILE VIEW: CARD LIST (< 640px) -->
      <div class="sm:hidden space-y-3">
        @for (order of filteredOrders(); track order.id) {
          <div class="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
            <div class="flex items-start justify-between">
              <div>
                <div class="font-mono text-xs font-bold text-primary">{{ order.id }}</div>
                <div class="text-xs font-bold text-foreground mt-0.5">{{ order.studentName }}</div>
                <div class="text-[10px] text-muted-foreground">{{ order.school }}</div>
              </div>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <app-icon name="check" [size]="10"></app-icon>
                <span>{{ order.status }}</span>
              </span>
            </div>

            <div class="text-xs border-y border-border py-2 space-y-1">
              <div class="text-muted-foreground">Paket: <span class="font-semibold text-foreground">{{ order.packageTitle }}</span></div>
              <div class="text-muted-foreground">Metode: <span class="font-medium text-foreground">{{ order.paymentMethod }}</span></div>
              <div class="flex items-center justify-between pt-1">
                <span class="text-muted-foreground">Total:</span>
                <span class="text-sm font-black text-emerald-600">Rp {{ order.amount | number }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <span class="text-[10px] text-muted-foreground">{{ order.createdAt }}</span>
              <button
                type="button"
                (click)="viewReceipt(order)"
                class="h-8 px-3 rounded-lg border border-primary/30 bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all"
              >
                Lihat Kwitansi
              </button>
            </div>
          </div>
        } @empty {
          <div class="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            <app-icon name="search" [size]="32" className="mx-auto mb-2 text-muted-foreground/60"></app-icon>
            <p class="text-xs font-bold text-foreground">Tidak Ada Pesanan Ditemukan</p>
            <p class="text-[11px] text-muted-foreground mt-0.5">Coba cari dengan kata kunci lain</p>
          </div>
        }
      </div>
    </div>

    <!-- DIGITAL RECEIPT MODAL -->
    <app-modal
      [isOpen]="isReceiptOpen()"
      title="Bukti Kwitansi Resmi Pembelian"
      description="KPM Academy & Midtrans Payment Gateway Verification"
      (onClose)="isReceiptOpen.set(false)"
    >
      @if (selectedOrder(); as ord) {
        <div class="space-y-4">
          <!-- Invoice Box Card -->
          <div class="rounded-xl bg-gradient-to-br from-blue-700 to-blue-600 p-4 text-white shadow-md">
            <div class="text-[10px] font-bold tracking-wider text-blue-100 uppercase">Nomor Invoice Pesanan</div>
            <div class="flex items-center justify-between mt-1">
              <span class="text-base sm:text-lg font-mono font-black tracking-wide">{{ ord.id }}</span>
              <button
                (click)="copyToClipboard(ord.id, 'Nomor Invoice')"
                class="px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-xs font-bold backdrop-blur-sm transition-colors"
              >
                Salin
              </button>
            </div>
            <div class="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px]">
              <span>Masa Akses: {{ ord.accessDuration || '180 Hari Aktif' }}</span>
              <span class="font-bold text-emerald-300 flex items-center gap-1">
                <app-icon name="check" [size]="12"></app-icon>
                <span>Akses Otomatis Aktif</span>
              </span>
            </div>
          </div>

          <!-- Student Details -->
          <div class="rounded-xl border border-border bg-background p-3.5 space-y-2 text-xs">
            <div class="font-bold text-foreground mb-1">Data Siswa & Pembeli</div>
            <div class="flex justify-between text-muted-foreground">
              <span>Nama Siswa</span>
              <span class="font-bold text-foreground">{{ ord.studentName }}</span>
            </div>
            <div class="flex justify-between text-muted-foreground">
              <span>Sekolah</span>
              <span class="font-medium text-foreground">{{ ord.school }}</span>
            </div>
            <div class="flex justify-between text-muted-foreground">
              <span>No. WhatsApp</span>
              <span class="font-medium text-foreground">{{ ord.studentPhone }}</span>
            </div>
            <div class="flex justify-between text-muted-foreground">
              <span>Paket Belajar</span>
              <span class="font-bold text-primary">{{ ord.packageTitle }}</span>
            </div>
          </div>

          <!-- Transaction Summary -->
          <div class="rounded-xl border border-border bg-background p-3.5 space-y-2 text-xs">
            <div class="font-bold text-foreground mb-1">Rincian Pembayaran</div>
            <div class="flex justify-between text-muted-foreground">
              <span>Waktu Transaksi</span>
              <span class="font-medium text-foreground">{{ ord.createdAt }}</span>
            </div>
            <div class="flex justify-between text-muted-foreground">
              <span>Metode Pembayaran</span>
              <span class="font-medium text-foreground">{{ ord.paymentMethod }}</span>
            </div>
            <div class="flex justify-between text-muted-foreground">
              <span>Harga Normal</span>
              <span class="font-medium text-foreground">Rp {{ (ord.originalAmount || ord.amount) | number }}</span>
            </div>
            @if (ord.discountAmount) {
              <div class="flex justify-between text-pink-600 font-bold">
                <span>Potongan Kupon ({{ ord.voucherCode }})</span>
                <span>- Rp {{ ord.discountAmount | number }}</span>
              </div>
            }

            <div class="pt-2 border-t border-border flex justify-between items-center text-sm font-black text-emerald-600">
              <span>Total Pembayaran Bersih</span>
              <span>Rp {{ ord.amount | number }}</span>
            </div>
          </div>
        </div>
      }

      <div modal-footer class="flex items-center gap-2">
        <button
          type="button"
          (click)="isReceiptOpen.set(false)"
          class="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 shadow-sm"
        >
          Tutup Kwitansi
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

  filteredOrders = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const sf = this.statusFilter();

    return this.orders().filter((ord) => {
      // Filter status
      if (sf !== 'ALL' && ord.status !== sf) return false;

      // Filter query
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

  copyToClipboard(text: string, label: string): void {
    navigator.clipboard.writeText(text);
    alert(`${label} (${text}) berhasil disalin ke clipboard!`);
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
