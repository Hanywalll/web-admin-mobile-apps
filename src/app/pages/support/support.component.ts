import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { SupportTicket } from '../../core/models/models';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Top Title & Stats Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-lg bg-[#1B2CC1]/10 text-[#1B2CC1] dark:text-[#7692FF] flex items-center justify-center">
              <app-icon name="help-circle" [size]="18"></app-icon>
            </div>
            Pusat Bantuan & Tiket Siswa
          </h1>
          <p class="text-xs text-muted-foreground mt-1">
            Kelola pengaduan, kendala teknis, pertanyaan materi, dan tiket bantuan dari siswa.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="loadTickets()"
            [disabled]="isLoading()"
            class="h-9 px-3.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <app-icon name="refresh" [size]="14" [className]="isLoading() ? 'animate-spin' : ''"></app-icon>
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Tiket</div>
          <div class="text-2xl font-bold text-foreground mt-1">{{ tickets().length }}</div>
        </div>
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Menunggu Balasan</div>
          <div class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{{ countPending() }}</div>
        </div>
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Telah Dibalas</div>
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{{ countAnswered() }}</div>
        </div>
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Selesai (Resolved)</div>
          <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ countResolved() }}</div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="relative w-full md:w-80">
          <app-icon name="search" [size]="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Cari ID tiket, nama siswa, email, atau topik..."
            class="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all placeholder:text-muted-foreground/50 shadow-sm"
          />
        </div>

        <div class="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            *ngFor="let s of statusTabs"
            type="button"
            (click)="selectedStatus.set(s.key)"
            [class.bg-[#1B2CC1]]="selectedStatus() === s.key"
            [class.text-white]="selectedStatus() === s.key"
            [class.bg-muted]="selectedStatus() !== s.key"
            [class.text-muted-foreground]="selectedStatus() !== s.key"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Tickets Table -->
      <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th class="py-3 px-4">No. Tiket</th>
                <th class="py-3 px-4">Siswa</th>
                <th class="py-3 px-4">Pertanyaan / Kendala</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Waktu</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @if (isLoading()) {
                <tr>
                  <td colspan="6" class="py-12 text-center text-muted-foreground">
                    <div class="inline-flex items-center gap-2">
                      <div class="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat tiket bantuan...</span>
                    </div>
                  </td>
                </tr>
              } @else if (filteredTickets().length === 0) {
                <tr>
                  <td colspan="6" class="py-12 text-center text-muted-foreground">
                    <app-icon name="help-circle" [size]="28" className="mx-auto mb-2 opacity-30"></app-icon>
                    <p class="font-medium">Tidak ada tiket bantuan yang ditemukan.</p>
                  </td>
                </tr>
              } @else {
                <tr *ngFor="let t of filteredTickets()" class="hover:bg-muted/30 transition-colors">
                  <td class="py-3.5 px-4 font-mono font-medium text-foreground whitespace-nowrap">
                    {{ t.sessionId }}
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="font-semibold text-foreground">{{ t.name }}</div>
                    <div class="text-[11px] text-muted-foreground font-mono">{{ t.email }}</div>
                  </td>
                  <td class="py-3.5 px-4 max-w-xs">
                    <div class="font-medium text-foreground line-clamp-2">{{ t.question }}</div>
                    @if (t.answer) {
                      <div class="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-1.5 rounded-md line-clamp-1 border border-emerald-500/20">
                        <span class="font-semibold">Balasan:</span> {{ t.answer }}
                      </div>
                    }
                  </td>
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide border uppercase"
                      [ngClass]="{
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20': t.status === 'pending',
                        'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20': t.status === 'answered',
                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20': t.status === 'resolved',
                        'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20': t.status === 'closed'
                      }"
                    >
                      {{ t.status }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-muted-foreground text-[11px] whitespace-nowrap">
                    {{ t.createdAt }}
                  </td>
                  <td class="py-3.5 px-4 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        (click)="openAnswerModal(t)"
                        class="h-7 px-2.5 rounded-md bg-[#1B2CC1] hover:bg-[#1B2CC1]/90 text-white font-medium text-[11px] flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        title="Balas Tiket"
                      >
                        <app-icon name="edit" [size]="12"></app-icon>
                        <span>Balas</span>
                      </button>
                      @if (t.status !== 'resolved') {
                        <button
                          type="button"
                          (click)="markResolved(t)"
                          class="h-7 px-2 rounded-md border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 font-medium text-[11px] transition-colors cursor-pointer"
                          title="Tandai Selesai"
                        >
                          <app-icon name="check" [size]="12"></app-icon>
                        </button>
                      }
                      <button
                        type="button"
                        (click)="deleteTicket(t)"
                        class="h-7 w-7 rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors cursor-pointer"
                        title="Hapus Tiket"
                      >
                        <app-icon name="trash" [size]="12"></app-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL BALAS TIKET -->
      @if (activeTicket()) {
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl text-card-foreground">
            <div class="flex items-center justify-between pb-3 border-b border-border">
              <div class="flex items-center gap-2">
                <div class="h-7 w-7 rounded-lg bg-[#1B2CC1]/10 text-[#1B2CC1] flex items-center justify-center">
                  <app-icon name="help-circle" [size]="14"></app-icon>
                </div>
                <h3 class="font-bold text-sm text-foreground">Balas Tiket Bantuan</h3>
              </div>
              <button
                type="button"
                (click)="activeTicket.set(null)"
                class="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <app-icon name="x" [size]="14"></app-icon>
              </button>
            </div>

            <div class="mt-4 space-y-4 text-xs">
              <div class="p-3 rounded-lg bg-muted/40 border border-border">
                <div class="flex items-center justify-between text-muted-foreground font-mono text-[10px] mb-1">
                  <span>{{ activeTicket()?.sessionId }}</span>
                  <span>{{ activeTicket()?.createdAt }}</span>
                </div>
                <div class="font-semibold text-foreground">{{ activeTicket()?.name }} ({{ activeTicket()?.email }})</div>
                <div class="mt-2 text-foreground font-medium bg-background p-2.5 rounded-md border border-border">
                  "{{ activeTicket()?.question }}"
                </div>
              </div>

              <div>
                <label class="block font-semibold text-foreground mb-1.5">Tulis Jawaban Resmi Administrator</label>
                <textarea
                  [(ngModel)]="answerText"
                  rows="4"
                  placeholder="Ketik jawaban panduan atau solusi untuk siswa..."
                  class="w-full p-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all shadow-sm"
                ></textarea>
              </div>

              <div class="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  (click)="activeTicket.set(null)"
                  class="h-9 px-4 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  (click)="submitAnswer()"
                  [disabled]="isSubmitting() || !answerText.trim()"
                  class="h-9 px-4 rounded-lg bg-[#1B2CC1] hover:bg-[#1B2CC1]/90 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  @if (isSubmitting()) {
                    <div class="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  }
                  <span>Kirim Jawaban ke Siswa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class SupportComponent implements OnInit {
  private adminService = inject(AdminService);

  tickets = signal<SupportTicket[]>([]);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  searchQuery = '';
  selectedStatus = signal<string>('all');

  activeTicket = signal<SupportTicket | null>(null);
  answerText = '';

  statusTabs = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Menunggu' },
    { key: 'answered', label: 'Dibalas' },
    { key: 'resolved', label: 'Selesai' },
  ];

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading.set(true);
    this.adminService.getSupportTickets().subscribe({
      next: (data) => {
        this.tickets.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  countPending = computed(() => this.tickets().filter((t) => t.status === 'pending').length);
  countAnswered = computed(() => this.tickets().filter((t) => t.status === 'answered').length);
  countResolved = computed(() => this.tickets().filter((t) => t.status === 'resolved').length);

  filteredTickets = computed(() => {
    let list = this.tickets();
    const status = this.selectedStatus();
    if (status !== 'all') {
      list = list.filter((t) => t.status === status);
    }
    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (t) =>
          t.sessionId.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.question.toLowerCase().includes(q)
      );
    }
    return list;
  });

  openAnswerModal(ticket: SupportTicket): void {
    this.activeTicket.set(ticket);
    this.answerText = ticket.answer || '';
  }

  submitAnswer(): void {
    const t = this.activeTicket();
    if (!t || !this.answerText.trim()) return;

    this.isSubmitting.set(true);
    this.adminService.answerSupportTicket(t.id, this.answerText.trim()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.tickets.update((arr) =>
          arr.map((item) =>
            item.id === t.id
              ? { ...item, answer: this.answerText.trim(), status: 'answered', answeredAt: new Date().toLocaleString('id-ID') }
              : item
          )
        );
        this.activeTicket.set(null);
      },
      error: () => {
        // Fallback update
        this.isSubmitting.set(false);
        this.tickets.update((arr) =>
          arr.map((item) =>
            item.id === t.id
              ? { ...item, answer: this.answerText.trim(), status: 'answered', answeredAt: new Date().toLocaleString('id-ID') }
              : item
          )
        );
        this.activeTicket.set(null);
      },
    });
  }

  markResolved(ticket: SupportTicket): void {
    this.adminService.updateSupportStatus(ticket.id, 'resolved').subscribe({
      next: () => {
        this.tickets.update((arr) =>
          arr.map((item) => (item.id === ticket.id ? { ...item, status: 'resolved' } : item))
        );
      },
      error: () => {
        this.tickets.update((arr) =>
          arr.map((item) => (item.id === ticket.id ? { ...item, status: 'resolved' } : item))
        );
      },
    });
  }

  deleteTicket(ticket: SupportTicket): void {
    if (!confirm(`Hapus tiket ${ticket.sessionId}?`)) return;
    this.adminService.deleteSupportTicket(ticket.id).subscribe({
      next: () => {
        this.tickets.update((arr) => arr.filter((item) => item.id !== ticket.id));
      },
      error: () => {
        this.tickets.update((arr) => arr.filter((item) => item.id !== ticket.id));
      },
    });
  }
}
