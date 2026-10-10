import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { Banner, Package, LiveClass, Video, Module, Voucher } from '../../core/models/models';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

type CMSTab = 'all' | 'banner' | 'package' | 'live' | 'video' | 'module' | 'voucher';

@Component({
  selector: 'app-cms',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">CMS Konten Pembelajaran</h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Kelola banner slider, live class, paket tryout, video materi, modul PDF, dan kupon voucher
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="openCreateModal()"
            class="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm"
          >
            <app-icon name="plus" [size]="14"></app-icon>
            <span>Tambah Data Baru</span>
          </button>
        </div>
      </div>

      <!-- HORIZONTAL FILTER TABS -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-xs">
        <button
          type="button"
          (click)="setTab('all')"
          [class]="currentTab() === 'all' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'"
          class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <app-icon name="layers" [size]="14"></app-icon>
          <span>Semua CMS</span>
        </button>

        <button
          type="button"
          (click)="setTab('banner')"
          [class]="currentTab() === 'banner' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'"
          class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <app-icon name="layers" [size]="14"></app-icon>
          <span>Banner Slider ({{ banners().length }})</span>
        </button>

        <button
          type="button"
          (click)="setTab('package')"
          [class]="currentTab() === 'package' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'"
          class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <app-icon name="package" [size]="14"></app-icon>
          <span>Paket Belajar ({{ packages().length }})</span>
        </button>

        <button
          type="button"
          (click)="setTab('live')"
          [class]="currentTab() === 'live' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'"
          class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <app-icon name="video" [size]="14"></app-icon>
          <span>Live Class ({{ liveClasses().length }})</span>
        </button>

        <button
          type="button"
          (click)="setTab('video')"
          [class]="currentTab() === 'video' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'"
          class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <app-icon name="video" [size]="14"></app-icon>
          <span>Video Materi ({{ videos().length }})</span>
        </button>

        <button
          type="button"
          (click)="setTab('module')"
          [class]="currentTab() === 'module' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'"
          class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <app-icon name="file-text" [size]="14"></app-icon>
          <span>Modul PDF ({{ modules().length }})</span>
        </button>

        <button
          type="button"
          (click)="setTab('voucher')"
          [class]="currentTab() === 'voucher' ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'"
          class="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <app-icon name="ticket" [size]="14"></app-icon>
          <span>Kupon Diskon ({{ vouchers().length }})</span>
        </button>
      </div>

      <!-- 1. BANNERS SECTION -->
      @if (currentTab() === 'all' || currentTab() === 'banner') {
        <div class="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <app-icon name="layers" [size]="16"></app-icon>
              </div>
              <div>
                <h2 class="text-xs sm:text-sm font-bold text-foreground">Banner Promosi & Beranda</h2>
                <p class="text-[10px] sm:text-[11px] text-muted-foreground">Banner slider beranda aplikasi mobile</p>
              </div>
            </div>
            <button
              (click)="openBannerModal()"
              class="h-8 px-3 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-bold flex items-center gap-1.5"
            >
              <app-icon name="plus" [size]="12"></app-icon>
              <span class="hidden sm:inline">Tambah Banner</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (b of banners(); track b.id) {
              <div class="rounded-xl border border-border bg-background overflow-hidden flex flex-col group">
                <div class="h-36 bg-muted relative overflow-hidden">
                  <img [src]="b.imageUrl" [alt]="b.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span class="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm">
                    Urutan: {{ b.order || 1 }}
                  </span>
                </div>
                <div class="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 class="font-bold text-xs line-clamp-2 text-foreground">{{ b.title }}</h3>
                    <p class="text-[10px] text-muted-foreground mt-1 truncate">Route: {{ b.targetUrl || '/package_list' }}</p>
                  </div>
                  <div class="flex items-center justify-between pt-3 border-t border-border mt-3">
                    <span class="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">Aktif</span>
                    <div class="flex items-center gap-1">
                      <button (click)="openBannerModal(b)" class="p-1 text-muted-foreground hover:text-primary rounded">
                        <app-icon name="edit" [size]="14"></app-icon>
                      </button>
                      <button (click)="deleteBanner(b.id)" class="p-1 text-muted-foreground hover:text-destructive rounded">
                        <app-icon name="trash" [size]="14"></app-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- 2. PAKET BELAJAR SECTION -->
      @if (currentTab() === 'all' || currentTab() === 'package') {
        <div class="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <app-icon name="package" [size]="16"></app-icon>
              </div>
              <div>
                <h2 class="text-xs sm:text-sm font-bold text-foreground">Paket Belajar & Tryout Ujian</h2>
                <p class="text-[10px] sm:text-[11px] text-muted-foreground">Paket langganan berbayar dengan akses simulasi otomatis</p>
              </div>
            </div>
            <button
              (click)="openPackageModal()"
              class="h-8 px-3 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-bold flex items-center gap-1.5"
            >
              <app-icon name="plus" [size]="12"></app-icon>
              <span class="hidden sm:inline">Tambah Paket</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (p of packages(); track p.id) {
              <div class="rounded-xl border border-border bg-background p-4 flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      {{ p.jenjang || 'SMA' }} • {{ p.kelas || 'Semua Kelas' }}
                    </span>
                    <span class="text-[11px] font-extrabold text-muted-foreground">{{ p.activeDays || 180 }} Hari</span>
                  </div>
                  <h3 class="font-bold text-xs mt-2 text-foreground">{{ p.title }}</h3>
                  <p class="text-[11px] text-muted-foreground mt-1 line-clamp-2">{{ p.description }}</p>

                  <div class="mt-3 flex items-baseline gap-2">
                    <span class="text-sm font-black text-emerald-600">Rp {{ (p.discountPrice || p.price) | number }}</span>
                    @if (p.isDiscountActive && p.discountPrice) {
                      <span class="text-[10px] line-through text-muted-foreground">Rp {{ p.price | number }}</span>
                    }
                  </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-border mt-4">
                  <span class="text-[10px] text-muted-foreground font-semibold">{{ p.totalModules || 20 }} Modul/Soal</span>
                  <div class="flex items-center gap-1">
                    <button (click)="openPackageModal(p)" class="p-1 text-muted-foreground hover:text-primary rounded">
                      <app-icon name="edit" [size]="14"></app-icon>
                    </button>
                    <button (click)="deletePackage(p.id)" class="p-1 text-muted-foreground hover:text-destructive rounded">
                      <app-icon name="trash" [size]="14"></app-icon>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- 3. LIVE CLASS SECTION -->
      @if (currentTab() === 'all' || currentTab() === 'live') {
        <div class="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="h-8 w-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
                <app-icon name="video" [size]="16"></app-icon>
              </div>
              <div>
                <h2 class="text-xs sm:text-sm font-bold text-foreground">Jadwal Live Class & Tutor</h2>
                <p class="text-[10px] sm:text-[11px] text-muted-foreground">Sesi bimbingan langsung via Zoom/Google Meet</p>
              </div>
            </div>
            <button
              (click)="openLiveModal()"
              class="h-8 px-3 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-bold flex items-center gap-1.5"
            >
              <app-icon name="plus" [size]="12"></app-icon>
              <span class="hidden sm:inline">Tambah Jadwal</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            @for (lc of liveClasses(); track lc.id) {
              <div class="rounded-xl border border-border bg-background p-4 flex items-start justify-between gap-3">
                <div class="space-y-1.5 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                      LIVE INTERAKTIF
                    </span>
                    <span class="text-[10px] text-muted-foreground font-semibold">{{ lc.scheduledAt }}</span>
                  </div>
                  <h3 class="font-bold text-xs text-foreground">{{ lc.title }}</h3>
                  <div class="text-[11px] text-muted-foreground">Tutor: <span class="font-bold text-foreground">{{ lc.tutorName }}</span></div>
                  <div class="text-[10px] text-blue-600 font-mono truncate">{{ lc.meetingUrl }}</div>
                </div>

                <div class="flex flex-col gap-1">
                  <button (click)="openLiveModal(lc)" class="p-1 text-muted-foreground hover:text-primary rounded">
                    <app-icon name="edit" [size]="14"></app-icon>
                  </button>
                  <button (click)="deleteLiveClass(lc.id)" class="p-1 text-muted-foreground hover:text-destructive rounded">
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- 4. VIDEO MATERI SECTION -->
      @if (currentTab() === 'all' || currentTab() === 'video') {
        <div class="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <app-icon name="video" [size]="16"></app-icon>
              </div>
              <div>
                <h2 class="text-xs sm:text-sm font-bold text-foreground">Video Pembelajaran Interaktif</h2>
                <p class="text-[10px] sm:text-[11px] text-muted-foreground">Video materi konsep dasar dan pembahasan soal</p>
              </div>
            </div>
            <button
              (click)="openVideoModal()"
              class="h-8 px-3 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-bold flex items-center gap-1.5"
            >
              <app-icon name="plus" [size]="12"></app-icon>
              <span class="hidden sm:inline">Tambah Video</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (v of videos(); track v.id) {
              <div class="rounded-xl border border-border bg-background p-4 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      {{ v.category }}
                    </span>
                    <span class="text-[10px] text-muted-foreground font-mono">
                      {{ (v.durationSeconds || 1800) / 60 | number:'1.0-0' }} Menit
                    </span>
                  </div>
                  <h3 class="font-bold text-xs mt-2 text-foreground line-clamp-2">{{ v.title }}</h3>
                  <p class="text-[11px] text-muted-foreground mt-1 line-clamp-2">{{ v.description || 'Pembahasan materi pembelajaran interaktif KPM' }}</p>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-border mt-3">
                  <span class="text-[10px] font-bold" [class]="v.isLocked ? 'text-amber-600' : 'text-emerald-600'">
                    {{ v.isLocked ? 'Premium / Terkunci' : 'Gratis / Terbuka' }}
                  </span>
                  <div class="flex items-center gap-1">
                    <button (click)="openVideoModal(v)" class="p-1 text-muted-foreground hover:text-primary rounded">
                      <app-icon name="edit" [size]="14"></app-icon>
                    </button>
                    <button (click)="deleteVideo(v.id)" class="p-1 text-muted-foreground hover:text-destructive rounded">
                      <app-icon name="trash" [size]="14"></app-icon>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- 5. MODUL PDF SECTION -->
      @if (currentTab() === 'all' || currentTab() === 'module') {
        <div class="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <app-icon name="file-text" [size]="16"></app-icon>
              </div>
              <div>
                <h2 class="text-xs sm:text-sm font-bold text-foreground">Modul & Bank Soal PDF</h2>
                <p class="text-[10px] sm:text-[11px] text-muted-foreground">E-Book ringkasan materi dan rumus sakti pembelajaran</p>
              </div>
            </div>
            <button
              (click)="openModuleModal()"
              class="h-8 px-3 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-bold flex items-center gap-1.5"
            >
              <app-icon name="plus" [size]="12"></app-icon>
              <span class="hidden sm:inline">Tambah Modul</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (m of modules(); track m.id) {
              <div class="rounded-xl border border-border bg-background p-4 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                      {{ m.subject }}
                    </span>
                    <span class="text-[10px] text-muted-foreground font-semibold">{{ m.grade || 'Semua' }}</span>
                  </div>
                  <h3 class="font-bold text-xs mt-2 text-foreground line-clamp-2">{{ m.title }}</h3>
                  <div class="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-2">
                    <span>{{ m.totalPages || 30 }} Halaman</span>
                    <span>•</span>
                    <span>{{ m.fileSizeMb || 5.0 }} MB</span>
                  </div>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-border mt-3">
                  <a [href]="m.fileUrl" target="_blank" class="text-[10px] text-primary hover:underline font-bold flex items-center gap-1">
                    <span>Lihat PDF</span>
                    <app-icon name="external-link" [size]="10"></app-icon>
                  </a>
                  <div class="flex items-center gap-1">
                    <button (click)="openModuleModal(m)" class="p-1 text-muted-foreground hover:text-primary rounded">
                      <app-icon name="edit" [size]="14"></app-icon>
                    </button>
                    <button (click)="deleteModule(m.id)" class="p-1 text-muted-foreground hover:text-destructive rounded">
                      <app-icon name="trash" [size]="14"></app-icon>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- 6. VOUCHERS SECTION -->
      @if (currentTab() === 'all' || currentTab() === 'voucher') {
        <div class="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="h-8 w-8 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center">
                <app-icon name="ticket" [size]="16"></app-icon>
              </div>
              <div>
                <h2 class="text-xs sm:text-sm font-bold text-foreground">Kupon Voucher Diskon</h2>
                <p class="text-[10px] sm:text-[11px] text-muted-foreground">Kode promo diskon belanja checkout paket siswa</p>
              </div>
            </div>
            <button
              (click)="openVoucherModal()"
              class="h-8 px-3 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-bold flex items-center gap-1.5"
            >
              <app-icon name="plus" [size]="12"></app-icon>
              <span class="hidden sm:inline">Buat Kupon</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (v of vouchers(); track v.id) {
              <div class="rounded-xl border border-dashed border-pink-500/40 bg-pink-500/5 p-4 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="px-2.5 py-1 rounded-md text-xs font-mono font-black bg-pink-600 text-white tracking-wider">
                      {{ v.code }}
                    </span>
                    <span class="text-xs font-extrabold text-pink-600">
                      {{ v.discountPercent ? v.discountPercent + '%' : 'Rp ' + (v.discountNominal | number) }}
                    </span>
                  </div>
                  <h3 class="font-bold text-xs mt-2.5 text-foreground">{{ v.title }}</h3>
                  <p class="text-[10px] text-muted-foreground mt-1">Kuota: {{ v.usedCount }}/{{ v.quota }} Terpakai</p>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-border mt-3 text-[10px] text-muted-foreground">
                  <span>Kadaluarsa: {{ v.expiresAt }}</span>
                  <button (click)="deleteVoucher(v.id)" class="text-destructive hover:underline font-bold">Hapus</button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- GENERIC MODAL FOR CMS CRUD -->
    <app-modal
      [isOpen]="isModalOpen()"
      [title]="modalTitle()"
      [description]="modalDescription()"
      (onClose)="isModalOpen.set(false)"
    >
      <form class="space-y-3.5">
        @if (modalType() === 'banner') {
          <div>
            <label class="block text-xs font-bold mb-1">Judul Banner</label>
            <input type="text" [(ngModel)]="bannerForm.title" name="b_title" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" />
          </div>
          <div>
            <label class="block text-xs font-bold mb-1">URL Gambar</label>
            <input type="text" [(ngModel)]="bannerForm.imageUrl" name="b_img" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" placeholder="https://..." />
          </div>
          <div>
            <label class="block text-xs font-bold mb-1">Target Route</label>
            <input type="text" [(ngModel)]="bannerForm.targetUrl" name="b_target" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" placeholder="/package_list" />
          </div>
        }

        @if (modalType() === 'package') {
          <div>
            <label class="block text-xs font-bold mb-1">Nama Paket Belajar</label>
            <input type="text" [(ngModel)]="packageForm.title" name="p_title" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" />
          </div>
          <div>
            <label class="block text-xs font-bold mb-1">Deskripsi Ringkas</label>
            <textarea [(ngModel)]="packageForm.description" name="p_desc" rows="2" class="w-full p-3 rounded-lg border border-input bg-background text-xs"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold mb-1">Harga Normal (Rp)</label>
              <input type="number" [(ngModel)]="packageForm.price" name="p_price" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1">Harga Diskon (Rp)</label>
              <input type="number" [(ngModel)]="packageForm.discountPrice" name="p_disc" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold mb-1">Masa Aktif (Hari)</label>
              <input type="number" [(ngModel)]="packageForm.activeDays" name="p_days" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1">Jenjang / Kelas</label>
              <input type="text" [(ngModel)]="packageForm.kelas" name="p_kelas" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" placeholder="12 SMA / Olimpiade" />
            </div>
          </div>
        }

        @if (modalType() === 'live') {
          <div>
            <label class="block text-xs font-bold mb-1">Topik Live Class</label>
            <input type="text" [(ngModel)]="liveForm.title" name="l_title" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold mb-1">Nama Tutor</label>
              <input type="text" [(ngModel)]="liveForm.tutorName" name="l_tutor" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1">Waktu & Tanggal</label>
              <input type="text" [(ngModel)]="liveForm.scheduledAt" name="l_time" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" placeholder="2026-10-15 19:30 WIB" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold mb-1">URL Zoom / Google Meet</label>
            <input type="text" [(ngModel)]="liveForm.meetingUrl" name="l_url" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" placeholder="https://zoom.us/..." />
          </div>
        }

        @if (modalType() === 'video') {
          <div>
            <label class="block text-xs font-bold mb-1">Judul Video Materi</label>
            <input type="text" [(ngModel)]="videoForm.title" name="v_title" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" />
          </div>
          <div>
            <label class="block text-xs font-bold mb-1">Kategori Pelajaran</label>
            <input type="text" [(ngModel)]="videoForm.category" name="v_cat" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" placeholder="Matematika SMA / TPS" />
          </div>
          <div>
            <label class="block text-xs font-bold mb-1">URL Video (YouTube / MP4)</label>
            <input type="text" [(ngModel)]="videoForm.videoUrl" name="v_url" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" placeholder="https://www.youtube.com/..." />
          </div>
        }

        @if (modalType() === 'module') {
          <div>
            <label class="block text-xs font-bold mb-1">Judul Modul PDF</label>
            <input type="text" [(ngModel)]="moduleForm.title" name="m_title" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold mb-1">Mata Pelajaran</label>
              <input type="text" [(ngModel)]="moduleForm.subject" name="m_subj" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" placeholder="Matematika Nalaria" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1">Jenjang</label>
              <input type="text" [(ngModel)]="moduleForm.grade" name="m_grade" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" placeholder="SD & SMP" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold mb-1">URL File PDF</label>
            <input type="text" [(ngModel)]="moduleForm.fileUrl" name="m_url" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" placeholder="https://..." />
          </div>
        }

        @if (modalType() === 'voucher') {
          <div>
            <label class="block text-xs font-bold mb-1">Kode Voucher Promo</label>
            <input type="text" [(ngModel)]="voucherForm.code" name="v_code" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs uppercase font-mono font-bold" placeholder="KPMJUARA2026" />
          </div>
          <div>
            <label class="block text-xs font-bold mb-1">Judul / Promo Deskripsi</label>
            <input type="text" [(ngModel)]="voucherForm.title" name="v_title" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold mb-1">Diskon Persen (%)</label>
              <input type="number" [(ngModel)]="voucherForm.discountPercent" name="v_disc" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" placeholder="25" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1">Kuota Pemakaian</label>
              <input type="number" [(ngModel)]="voucherForm.quota" name="v_quota" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs" placeholder="500" />
            </div>
          </div>
        }
      </form>

      <div modal-footer class="flex items-center gap-2">
        <button
          type="button"
          (click)="isModalOpen.set(false)"
          class="h-9 px-3 rounded-lg border border-border text-xs font-bold hover:bg-muted"
        >
          Batal
        </button>
        <button
          type="button"
          (click)="saveModalData()"
          class="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 shadow-sm"
        >
          Simpan Data ke Database Go
        </button>
      </div>
    </app-modal>
  `,
})
export class CMSComponent implements OnInit {
  adminService = inject(AdminService);
  route = inject(ActivatedRoute);

  currentTab = signal<CMSTab>('all');
  banners = signal<Banner[]>([]);
  packages = signal<Package[]>([]);
  liveClasses = signal<LiveClass[]>([]);
  videos = signal<Video[]>([]);
  modules = signal<Module[]>([]);
  vouchers = signal<Voucher[]>([]);

  // Modal State
  isModalOpen = signal<boolean>(false);
  modalTitle = signal<string>('');
  modalDescription = signal<string>('');
  modalType = signal<string>('banner');

  bannerForm: Partial<Banner> = {};
  packageForm: Partial<Package> = {};
  liveForm: Partial<LiveClass> = {};
  videoForm: Partial<Video> = {};
  moduleForm: Partial<Module> = {};
  voucherForm: Partial<Voucher> = {};

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        this.currentTab.set(params['tab'] as CMSTab);
      }
    });
    this.loadAllCMS();
  }

  setTab(tab: CMSTab): void {
    this.currentTab.set(tab);
  }

  loadAllCMS(): void {
    this.adminService.getBanners().subscribe((res) => this.banners.set(res));
    this.adminService.getPackages().subscribe((res) => this.packages.set(res));
    this.adminService.getLiveClasses().subscribe((res) => this.liveClasses.set(res));
    this.adminService.getVideos().subscribe((res) => this.videos.set(res));
    this.adminService.getModules().subscribe((res) => this.modules.set(res));
    this.adminService.getVouchers().subscribe((res) => this.vouchers.set(res));
  }

  openCreateModal(): void {
    if (this.currentTab() === 'package') this.openPackageModal();
    else if (this.currentTab() === 'live') this.openLiveModal();
    else if (this.currentTab() === 'video') this.openVideoModal();
    else if (this.currentTab() === 'module') this.openModuleModal();
    else if (this.currentTab() === 'voucher') this.openVoucherModal();
    else this.openBannerModal();
  }

  openBannerModal(b?: Banner): void {
    this.modalType.set('banner');
    this.modalTitle.set(b ? 'Edit Banner Promo' : 'Tambah Banner Promo Baru');
    this.modalDescription.set('Kelola gambar slider beranda aplikasi');
    this.bannerForm = b ? { ...b } : { title: '', imageUrl: '', targetUrl: '/package_list', order: 1 };
    this.isModalOpen.set(true);
  }

  openPackageModal(p?: Package): void {
    this.modalType.set('package');
    this.modalTitle.set(p ? 'Edit Paket Belajar' : 'Tambah Paket Belajar Baru');
    this.modalDescription.set('Konfigurasi harga, diskon, dan masa aktif paket');
    this.packageForm = p ? { ...p } : { title: '', description: '', price: 154000, discountPrice: 129000, activeDays: 180, kelas: '12 SMA' };
    this.isModalOpen.set(true);
  }

  openLiveModal(lc?: LiveClass): void {
    this.modalType.set('live');
    this.modalTitle.set(lc ? 'Edit Live Class' : 'Tambah Jadwal Live Class');
    this.modalDescription.set('Jadwalkan pertemuan virtual dengan tutor');
    this.liveForm = lc ? { ...lc } : { title: '', tutorName: '', scheduledAt: '2026-10-20 19:30 WIB', meetingUrl: 'https://zoom.us/...' };
    this.isModalOpen.set(true);
  }

  openVideoModal(v?: Video): void {
    this.modalType.set('video');
    this.modalTitle.set(v ? 'Edit Video Materi' : 'Tambah Video Materi Baru');
    this.modalDescription.set('Kelola tautan video dan kategori pembelajaran');
    this.videoForm = v ? { ...v } : { title: '', category: 'Matematika SMA', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' };
    this.isModalOpen.set(true);
  }

  openModuleModal(m?: Module): void {
    this.modalType.set('module');
    this.modalTitle.set(m ? 'Edit Modul PDF' : 'Tambah Modul PDF Baru');
    this.modalDescription.set('Kelola modul materi dan bank soal PDF');
    this.moduleForm = m ? { ...m } : { title: '', subject: 'Matematika Nalaria', grade: 'SD & SMP', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' };
    this.isModalOpen.set(true);
  }

  openVoucherModal(): void {
    this.modalType.set('voucher');
    this.modalTitle.set('Buat Kupon Diskon Baru');
    this.modalDescription.set('Kode voucher promo belanja checkout siswa');
    this.voucherForm = { code: '', title: '', discountPercent: 20, quota: 250 };
    this.isModalOpen.set(true);
  }

  saveModalData(): void {
    const type = this.modalType();
    if (type === 'banner') {
      if (this.bannerForm.id) {
        this.adminService.updateBanner(this.bannerForm.id, this.bannerForm).subscribe(() => this.loadAllCMS());
      } else {
        this.adminService.createBanner(this.bannerForm).subscribe(() => this.loadAllCMS());
      }
      this.banners.update((arr) => [{ id: 'b_' + Date.now(), title: this.bannerForm.title || 'Banner Baru', imageUrl: this.bannerForm.imageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', targetUrl: this.bannerForm.targetUrl || '/package_list', order: 1 }, ...arr]);
    } else if (type === 'package') {
      if (this.packageForm.id) {
        this.adminService.updatePackage(this.packageForm.id, this.packageForm).subscribe(() => this.loadAllCMS());
      } else {
        this.adminService.createPackage(this.packageForm).subscribe(() => this.loadAllCMS());
      }
      this.packages.update((arr) => [{ id: 'p_' + Date.now(), title: this.packageForm.title || 'Paket Baru', description: this.packageForm.description || '', price: this.packageForm.price || 150000, discountPrice: this.packageForm.discountPrice || 120000, activeDays: this.packageForm.activeDays || 180, kelas: this.packageForm.kelas || 'SMA' }, ...arr]);
    } else if (type === 'live') {
      this.liveClasses.update((arr) => [{ id: 'lc_' + Date.now(), title: this.liveForm.title || 'Live Class Baru', subject: 'Umum', tutorName: this.liveForm.tutorName || 'Tutor KPM', scheduledAt: this.liveForm.scheduledAt || '2026-10-25 19:30 WIB', meetingUrl: this.liveForm.meetingUrl || 'https://zoom.us' }, ...arr]);
    } else if (type === 'video') {
      this.videos.update((arr) => [{ id: 'vid_' + Date.now(), title: this.videoForm.title || 'Video Baru', category: this.videoForm.category || 'Matematika SMA', videoUrl: this.videoForm.videoUrl || '', durationSeconds: 1800, isLocked: false }, ...arr]);
    } else if (type === 'module') {
      this.modules.update((arr) => [{ id: 'mod_' + Date.now(), title: this.moduleForm.title || 'Modul Baru', subject: this.moduleForm.subject || 'Matematika', grade: this.moduleForm.grade || 'Semua', totalPages: 25, fileSizeMb: 5.0, fileUrl: this.moduleForm.fileUrl || '' }, ...arr]);
    } else if (type === 'voucher') {
      this.vouchers.update((arr) => [{ id: 'v_' + Date.now(), code: this.voucherForm.code || 'PROMO2026', title: this.voucherForm.title || 'Diskon Baru', discountPercent: this.voucherForm.discountPercent || 20, quota: this.voucherForm.quota || 100, usedCount: 0, expiresAt: '2026-12-31' }, ...arr]);
    }

    this.isModalOpen.set(false);
  }

  deleteBanner(id: string): void {
    if (confirm('Yakin ingin menghapus banner ini?')) {
      this.adminService.deleteBanner(id).subscribe(() => {});
      this.banners.update((arr) => arr.filter((x) => x.id !== id));
    }
  }

  deletePackage(id: string): void {
    if (confirm('Yakin ingin menghapus paket belajar ini?')) {
      this.adminService.deletePackage(id).subscribe(() => {});
      this.packages.update((arr) => arr.filter((x) => x.id !== id));
    }
  }

  deleteLiveClass(id: string): void {
    if (confirm('Yakin ingin menghapus jadwal live class ini?')) {
      this.adminService.deleteLiveClass(id).subscribe(() => {});
      this.liveClasses.update((arr) => arr.filter((x) => x.id !== id));
    }
  }

  deleteVideo(id: string): void {
    if (confirm('Yakin ingin menghapus video materi ini?')) {
      this.adminService.deleteVideo(id).subscribe(() => {});
      this.videos.update((arr) => arr.filter((x) => x.id !== id));
    }
  }

  deleteModule(id: string): void {
    if (confirm('Yakin ingin menghapus modul PDF ini?')) {
      this.adminService.deleteModule(id).subscribe(() => {});
      this.modules.update((arr) => arr.filter((x) => x.id !== id));
    }
  }

  deleteVoucher(id: string): void {
    if (confirm('Yakin ingin menghapus kupon voucher ini?')) {
      this.vouchers.update((arr) => arr.filter((x) => x.id !== id));
    }
  }
}
