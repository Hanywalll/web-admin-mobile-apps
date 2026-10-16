import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { Testimonial } from '../../core/models/models';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Top Title & Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <app-icon name="star" [size]="18"></app-icon>
            </div>
            Moderasi Testimoni & Review Siswa
          </h1>
          <p class="text-xs text-muted-foreground mt-1">
            Pantau dan setujui ulasan atau testimoni positif dari siswa sebelum ditayangkan di aplikasi mobile.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="loadTestimonials()"
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
          <div class="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Testimoni</div>
          <div class="text-2xl font-bold text-foreground mt-1">{{ testimonials().length }}</div>
        </div>
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Menunggu Review</div>
          <div class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{{ countPending() }}</div>
        </div>
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Disetujui (Tayang)</div>
          <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ countApproved() }}</div>
        </div>
        <div class="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div class="text-[11px] font-medium text-[#1B2CC1] dark:text-[#7692FF] uppercase tracking-wider">Rata-rata Rating</div>
          <div class="text-2xl font-bold text-foreground mt-1 flex items-center gap-1.5">
            <span>{{ avgRating() }}</span>
            <span class="text-amber-500 text-lg">★</span>
          </div>
        </div>
      </div>

      <!-- Filter Strip -->
      <div class="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="relative w-full md:w-80">
          <app-icon name="search" [size]="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Cari nama siswa, sekolah, atau kata kunci ulasan..."
            class="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all placeholder:text-muted-foreground/50 shadow-sm"
          />
        </div>

        <div class="flex items-center gap-1.5 w-full md:w-auto">
          <button
            type="button"
            (click)="selectedTab.set('all')"
            [class.bg-[#1B2CC1]]="selectedTab() === 'all'"
            [class.text-white]="selectedTab() === 'all'"
            [class.bg-muted]="selectedTab() !== 'all'"
            [class.text-muted-foreground]="selectedTab() !== 'all'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
          >
            Semua
          </button>
          <button
            type="button"
            (click)="selectedTab.set('pending')"
            [class.bg-[#1B2CC1]]="selectedTab() === 'pending'"
            [class.text-white]="selectedTab() === 'pending'"
            [class.bg-muted]="selectedTab() !== 'pending'"
            [class.text-muted-foreground]="selectedTab() !== 'pending'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
          >
            Menunggu Review ({{ countPending() }})
          </button>
          <button
            type="button"
            (click)="selectedTab.set('approved')"
            [class.bg-[#1B2CC1]]="selectedTab() === 'approved'"
            [class.text-white]="selectedTab() === 'approved'"
            [class.bg-muted]="selectedTab() !== 'approved'"
            [class.text-muted-foreground]="selectedTab() !== 'approved'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
          >
            Disetujui
          </button>
        </div>
      </div>

      <!-- Testimonial Cards Grid -->
      @if (isLoading()) {
        <div class="p-12 text-center text-muted-foreground bg-card rounded-xl border border-border shadow-sm">
          <div class="inline-flex items-center gap-2 text-xs">
            <div class="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Memuat data testimoni siswa...</span>
          </div>
        </div>
      } @else if (filteredList().length === 0) {
        <div class="p-12 text-center text-muted-foreground bg-card rounded-xl border border-border shadow-sm">
          <app-icon name="star" [size]="28" className="mx-auto mb-2 opacity-30"></app-icon>
          <p class="font-medium text-xs">Tidak ada testimoni yang cocok dengan pencarian.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let t of filteredList()"
            class="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden"
          >
            <!-- Top Card Header -->
            <div>
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-gradient-to-tr from-[#1B2CC1] to-[#7692FF] text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden shrink-0">
                    @if (t.userAvatar) {
                      <img [src]="t.userAvatar" [alt]="t.userName" class="h-full w-full object-cover" />
                    } @else {
                      {{ t.userName?.charAt(0) || 'S' }}
                    }
                  </div>
                  <div>
                    <h3 class="font-bold text-xs text-foreground">{{ t.userName }}</h3>
                    <div class="text-[11px] text-muted-foreground">{{ t.userSchool }}</div>
                  </div>
                </div>

                <div class="flex items-center text-amber-500 text-xs tracking-tight">
                  <span *ngFor="let star of [1,2,3,4,5]" [class.opacity-30]="star > t.rating">★</span>
                </div>
              </div>

              <!-- Content Body -->
              <div class="mt-4 text-xs text-foreground/90 leading-relaxed italic bg-muted/30 p-3 rounded-lg border border-border/60">
                "{{ t.content }}"
              </div>
            </div>

            <!-- Bottom Badges & Action Buttons -->
            <div class="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
              <div class="flex items-center gap-1.5">
                <span
                  class="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                  [ngClass]="t.isApproved ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'"
                >
                  {{ t.isApproved ? 'DISETUJUI' : 'PERLU REVIEW' }}
                </span>
                <span class="text-[10px] text-muted-foreground">{{ t.createdAt }}</span>
              </div>

              <div class="flex items-center gap-1.5">
                @if (!t.isApproved) {
                  <button
                    type="button"
                    (click)="approve(t)"
                    class="h-7 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                    title="Setujui Testimoni"
                  >
                    <app-icon name="check" [size]="12"></app-icon>
                    <span>Approve</span>
                  </button>
                } @else {
                  <button
                    type="button"
                    (click)="toggleActive(t)"
                    class="h-7 px-2 rounded-md border border-border hover:bg-muted font-medium text-[11px] transition-colors cursor-pointer text-muted-foreground"
                    title="Toggle Tayang"
                  >
                    {{ t.isActive ? 'Sembunyikan' : 'Tampilkan' }}
                  </button>
                }
                <button
                  type="button"
                  (click)="delete(t)"
                  class="h-7 w-7 rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="Hapus"
                >
                  <app-icon name="trash" [size]="12"></app-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TestimonialsComponent implements OnInit {
  private adminService = inject(AdminService);

  testimonials = signal<Testimonial[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = '';
  selectedTab = signal<'all' | 'pending' | 'approved'>('all');

  ngOnInit(): void {
    this.loadTestimonials();
  }

  loadTestimonials(): void {
    this.isLoading.set(true);
    this.adminService.getTestimonials().subscribe({
      next: (data) => {
        this.testimonials.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  countPending = computed(() => this.testimonials().filter((t) => !t.isApproved).length);
  countApproved = computed(() => this.testimonials().filter((t) => t.isApproved).length);
  avgRating = computed(() => {
    const list = this.testimonials();
    if (list.length === 0) return '5.0';
    const sum = list.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / list.length).toFixed(1);
  });

  filteredList = computed(() => {
    let list = this.testimonials();
    if (this.selectedTab() === 'pending') {
      list = list.filter((t) => !t.isApproved);
    } else if (this.selectedTab() === 'approved') {
      list = list.filter((t) => t.isApproved);
    }

    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (t) =>
          (t.userName && t.userName.toLowerCase().includes(q)) ||
          (t.userSchool && t.userSchool.toLowerCase().includes(q)) ||
          (t.content && t.content.toLowerCase().includes(q))
      );
    }
    return list;
  });

  approve(t: Testimonial): void {
    this.adminService.approveTestimonial(t.id).subscribe({
      next: () => {
        this.testimonials.update((arr) =>
          arr.map((item) => (item.id === t.id ? { ...item, isApproved: true, isActive: true } : item))
        );
      },
      error: () => {
        this.testimonials.update((arr) =>
          arr.map((item) => (item.id === t.id ? { ...item, isApproved: true, isActive: true } : item))
        );
      },
    });
  }

  toggleActive(t: Testimonial): void {
    this.adminService.toggleTestimonialActive(t.id).subscribe({
      next: () => {
        this.testimonials.update((arr) =>
          arr.map((item) => (item.id === t.id ? { ...item, isActive: !item.isActive } : item))
        );
      },
      error: () => {
        this.testimonials.update((arr) =>
          arr.map((item) => (item.id === t.id ? { ...item, isActive: !item.isActive } : item))
        );
      },
    });
  }

  delete(t: Testimonial): void {
    if (!confirm(`Hapus ulasan dari ${t.userName}?`)) return;
    this.adminService.deleteTestimonial(t.id).subscribe({
      next: () => {
        this.testimonials.update((arr) => arr.filter((item) => item.id !== t.id));
      },
      error: () => {
        this.testimonials.update((arr) => arr.filter((item) => item.id !== t.id));
      },
    });
  }
}
