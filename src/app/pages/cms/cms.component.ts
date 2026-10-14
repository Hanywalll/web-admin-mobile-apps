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
      <!-- DYNAMIC SECTION HEADER ACCORDING TO SELECTED SIDEBAR MENU -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground">
            @switch (currentTab()) {
              @case ('banner') { Spanduk Banner }
              @case ('package') { Paket Belajar & Tryout }
              @case ('live') { Jadwal Live Class }
              @case ('video') { Video Materi Pembelajaran }
              @case ('module') { Modul & E-Book PDF }
              @case ('voucher') { Kupon Diskon & Voucher }
              @default { Manajemen Konten }
            }
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            @switch (currentTab()) {
              @case ('banner') { Kelola spanduk promosi dan pengumuman yang tampil pada beranda aplikasi mobile }
              @case ('package') { Kelola paket pembelajaran, tryout ujian berkala, dan masa aktif siswa }
              @case ('live') { Kelola jadwal sesi kelas online interaktif via Zoom / Google Meet dan tutor pengajar }
              @case ('video') { Kelola video rekaman pembahasan materi dan pembelajaran interaktif }
              @case ('module') { Kelola e-book materi pelajaran, modul rumus, dan bank latihan soal format PDF }
              @case ('voucher') { Kelola kupon diskon harga pembelian paket belajar dan kuota klaim }
              @default { Kelola konten dan katalog aplikasi mobile }
            }
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="openCreateModal()"
            class="h-8 px-3.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
          >
            <app-icon name="plus" [size]="13"></app-icon>
            <span>
              @switch (currentTab()) {
                @case ('banner') { Tambah Banner Baru }
                @case ('package') { Tambah Paket Baru }
                @case ('live') { Tambah Jadwal Baru }
                @case ('video') { Tambah Video Baru }
                @case ('module') { Tambah Modul PDF }
                @case ('voucher') { Buat Kupon Baru }
                @default { Tambah Data Baru }
              }
            </span>
          </button>
        </div>
      </div>

      <!-- 1. BANNERS SECTION -->
      @if (currentTab() === 'banner') {
        <section class="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">01 / Spanduk Mobile</div>
              <h2 class="text-sm font-semibold text-foreground mt-0.5">Banner Promosi & Beranda</h2>
            </div>
            <button
              (click)="openBannerModal()"
              class="h-7 px-2.5 rounded border border-border bg-muted/30 hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <app-icon name="plus" [size]="12"></app-icon>
              <span>Tambah Banner</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            @for (b of banners(); track b.id) {
              <div class="rounded-md border border-border bg-background overflow-hidden flex flex-col group hover:border-foreground/30 transition-colors">
                <div class="h-32 bg-muted relative overflow-hidden">
                  <img [src]="b.imageUrl" [alt]="b.title" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102" />
                  <span class="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-black/70 text-white backdrop-blur-sm">
                    URUTAN #{{ b.order || 1 }}
                  </span>
                </div>
                <div class="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 class="font-medium text-xs text-foreground line-clamp-1">{{ b.title }}</h3>
                    <p class="text-[11px] font-mono text-muted-foreground mt-1 truncate">Route: {{ b.targetUrl || '/package_list' }}</p>
                  </div>
                  <div class="flex items-center justify-between pt-2.5 border-t border-border mt-3 text-xs">
                    <span class="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>ACTIVE</span>
                    </span>
                    <div class="flex items-center gap-1">
                      <button (click)="openBannerModal(b)" class="p-1 text-muted-foreground hover:text-foreground rounded" title="Edit">
                        <app-icon name="edit" [size]="13"></app-icon>
                      </button>
                      <button (click)="deleteBanner(b.id)" class="p-1 text-muted-foreground hover:text-destructive rounded" title="Hapus">
                        <app-icon name="trash" [size]="13"></app-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- 2. PAKET BELAJAR SECTION -->
      @if (currentTab() === 'package') {
        <section class="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">02 / Katalog Langganan</div>
              <h2 class="text-sm font-semibold text-foreground mt-0.5">Paket Belajar & Tryout Ujian</h2>
            </div>
            <button
              (click)="openPackageModal()"
              class="h-7 px-2.5 rounded border border-border bg-muted/30 hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <app-icon name="plus" [size]="12"></app-icon>
              <span>Tambah Paket</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            @for (p of packages(); track p.id) {
              <div class="rounded-md border border-border bg-background p-4 flex flex-col justify-between hover:border-foreground/30 transition-colors">
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-border bg-muted text-foreground">
                      {{ p.jenjang || 'SMA' }} • {{ p.kelas || 'Semua Kelas' }}
                    </span>
                    <span class="text-[10px] font-mono text-muted-foreground">{{ p.activeDays || 180 }} Hari Akses</span>
                  </div>
                  <h3 class="font-semibold text-xs mt-2 text-foreground">{{ p.title }}</h3>
                  <p class="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{{ p.description }}</p>

                  <div class="mt-3 flex items-baseline gap-2 font-mono">
                    <span class="text-sm font-bold text-foreground">Rp {{ (p.discountPrice || p.price) | number }}</span>
                    @if (p.isDiscountActive && p.discountPrice) {
                      <span class="text-[11px] line-through text-muted-foreground">Rp {{ p.price | number }}</span>
                    }
                  </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-border mt-4 text-xs">
                  <span class="text-[11px] text-muted-foreground font-mono">{{ p.totalModules || 20 }} Modul/Soal</span>
                  <div class="flex items-center gap-1">
                    <button (click)="openPackageModal(p)" class="p-1 text-muted-foreground hover:text-foreground rounded" title="Edit">
                      <app-icon name="edit" [size]="13"></app-icon>
                    </button>
                    <button (click)="deletePackage(p.id)" class="p-1 text-muted-foreground hover:text-destructive rounded" title="Hapus">
                      <app-icon name="trash" [size]="13"></app-icon>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- 3. LIVE CLASS SECTION -->
      @if (currentTab() === 'live') {
        <section class="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">03 / Sesi Daring</div>
              <h2 class="text-sm font-semibold text-foreground mt-0.5">Jadwal Live Class & Tutor</h2>
            </div>
            <button
              (click)="openLiveModal()"
              class="h-7 px-2.5 rounded border border-border bg-muted/30 hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <app-icon name="plus" [size]="12"></app-icon>
              <span>Tambah Jadwal</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            @for (lc of liveClasses(); track lc.id) {
              <div class="rounded-md border border-border bg-background p-4 flex items-start justify-between gap-3 hover:border-foreground/30 transition-colors">
                <div class="space-y-1.5 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      LIVE INTERAKTIF
                    </span>
                    <span class="text-[10px] font-mono text-muted-foreground">{{ lc.scheduledAt }}</span>
                  </div>
                  <h3 class="font-semibold text-xs text-foreground">{{ lc.title }}</h3>
                  <div class="text-[11px] text-muted-foreground">Tutor: <span class="font-medium text-foreground">{{ lc.tutorName }}</span></div>
                  <div class="text-[11px] text-muted-foreground font-mono truncate">{{ lc.meetingUrl }}</div>
                </div>

                <div class="flex flex-col gap-1">
                  <button (click)="openLiveModal(lc)" class="p-1 text-muted-foreground hover:text-foreground rounded" title="Edit">
                    <app-icon name="edit" [size]="13"></app-icon>
                  </button>
                  <button (click)="deleteLiveClass(lc.id)" class="p-1 text-muted-foreground hover:text-destructive rounded" title="Hapus">
                    <app-icon name="trash" [size]="13"></app-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- 4. VIDEO MATERI SECTION -->
      @if (currentTab() === 'video') {
        <section class="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">04 / Perpustakaan Video</div>
              <h2 class="text-sm font-semibold text-foreground mt-0.5">Video Pembelajaran Interaktif</h2>
            </div>
            <button
              (click)="openVideoModal()"
              class="h-7 px-2.5 rounded border border-border bg-muted/30 hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <app-icon name="plus" [size]="12"></app-icon>
              <span>Tambah Video</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            @for (v of videos(); track v.id) {
              <div class="rounded-md border border-border bg-background p-3.5 flex flex-col justify-between hover:border-foreground/30 transition-colors">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono border border-border bg-muted text-foreground">
                      {{ v.category }}
                    </span>
                    <span class="text-[10px] font-mono text-muted-foreground">
                      {{ (v.durationSeconds || 1800) / 60 | number:'1.0-0' }} Menit
                    </span>
                  </div>
                  <h3 class="font-medium text-xs mt-2 text-foreground line-clamp-2">{{ v.title }}</h3>
                  <p class="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{{ v.description || 'Pembahasan materi pembelajaran interaktif KPM' }}</p>
                </div>
                <div class="flex items-center justify-between pt-2.5 border-t border-border mt-3 text-xs">
                  <span class="text-[10px] font-mono" [class]="v.isLocked ? 'text-amber-600' : 'text-emerald-600'">
                    {{ v.isLocked ? 'PREMIUM' : 'FREE' }}
                  </span>
                  <div class="flex items-center gap-1">
                    <button (click)="openVideoModal(v)" class="p-1 text-muted-foreground hover:text-foreground rounded" title="Edit">
                      <app-icon name="edit" [size]="13"></app-icon>
                    </button>
                    <button (click)="deleteVideo(v.id)" class="p-1 text-muted-foreground hover:text-destructive rounded" title="Hapus">
                      <app-icon name="trash" [size]="13"></app-icon>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- 5. MODUL PDF SECTION -->
      @if (currentTab() === 'module') {
        <section class="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">05 / Dokumen & E-Book</div>
              <h2 class="text-sm font-semibold text-foreground mt-0.5">Modul & Bank Soal PDF</h2>
            </div>
            <button
              (click)="openModuleModal()"
              class="h-7 px-2.5 rounded border border-border bg-muted/30 hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <app-icon name="plus" [size]="12"></app-icon>
              <span>Tambah Modul</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            @for (m of modules(); track m.id) {
              <div class="rounded-md border border-border bg-background p-3.5 flex flex-col justify-between hover:border-foreground/30 transition-colors">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono border border-border bg-muted text-foreground">
                      {{ m.subject }}
                    </span>
                    <span class="text-[10px] font-mono text-muted-foreground">{{ m.grade || 'Semua' }}</span>
                  </div>
                  <h3 class="font-medium text-xs mt-2 text-foreground line-clamp-2">{{ m.title }}</h3>
                  <div class="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-2 font-mono">
                    <span>{{ m.totalPages || 30 }} Hal</span>
                    <span>•</span>
                    <span>{{ m.fileSizeMb || 5.0 }} MB</span>
                  </div>
                </div>
                <div class="flex items-center justify-between pt-2.5 border-t border-border mt-3 text-xs">
                  <a [href]="m.fileUrl" target="_blank" class="text-[11px] text-foreground hover:underline font-mono flex items-center gap-1">
                    <span>File PDF</span>
                    <app-icon name="external-link" [size]="10"></app-icon>
                  </a>
                  <div class="flex items-center gap-1">
                    <button (click)="openModuleModal(m)" class="p-1 text-muted-foreground hover:text-foreground rounded" title="Edit">
                      <app-icon name="edit" [size]="13"></app-icon>
                    </button>
                    <button (click)="deleteModule(m.id)" class="p-1 text-muted-foreground hover:text-destructive rounded" title="Hapus">
                      <app-icon name="trash" [size]="13"></app-icon>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- 6. VOUCHERS SECTION -->
      @if (currentTab() === 'voucher') {
        <section class="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">06 / Promosi & Kupon</div>
              <h2 class="text-sm font-semibold text-foreground mt-0.5">Kupon Voucher Diskon</h2>
            </div>
            <button
              (click)="openVoucherModal()"
              class="h-7 px-2.5 rounded border border-border bg-muted/30 hover:bg-muted text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <app-icon name="plus" [size]="12"></app-icon>
              <span>Buat Kupon</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            @for (v of vouchers(); track v.id) {
              <div class="rounded-md border border-border bg-background p-4 flex flex-col justify-between hover:border-foreground/30 transition-colors">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-muted border border-border text-foreground tracking-wider">
                      {{ v.code }}
                    </span>
                    <span class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {{ v.discountPercent ? v.discountPercent + '% OFF' : 'Rp ' + (v.discountNominal | number) }}
                    </span>
                  </div>
                  <h3 class="font-medium text-xs mt-2.5 text-foreground">{{ v.title }}</h3>
                  <div class="text-[11px] text-muted-foreground mt-1 font-mono">
                    Kuota: {{ v.usedCount }}/{{ v.quota }} Terpakai
                  </div>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-border mt-3 text-[11px] text-muted-foreground font-mono">
                  <span>EXP: {{ v.expiresAt }}</span>
                  <button (click)="deleteVoucher(v.id)" class="text-destructive hover:underline font-sans text-xs">Hapus</button>
                </div>
              </div>
            }
          </div>
        </section>
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
            <label class="block text-xs font-medium text-foreground mb-1">Judul Banner</label>
            <input type="text" [(ngModel)]="bannerForm.title" name="b_title" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label class="block text-xs font-medium text-foreground mb-1">URL Gambar</label>
            <input type="text" [(ngModel)]="bannerForm.imageUrl" name="b_img" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="https://..." />
          </div>
          <div>
            <label class="block text-xs font-medium text-foreground mb-1">Target Route Mobile</label>
            <input type="text" [(ngModel)]="bannerForm.targetUrl" name="b_target" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="/package_list" />
          </div>
        }

        @if (modalType() === 'package') {
          <div>
            <label class="block text-xs font-medium text-foreground mb-1">Nama Paket Belajar</label>
            <input type="text" [(ngModel)]="packageForm.title" name="p_title" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label class="block text-xs font-medium text-foreground mb-1">Deskripsi Ringkas</label>
            <textarea [(ngModel)]="packageForm.description" name="p_desc" rows="2" class="w-full p-2.5 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-foreground mb-1">Harga Normal (Rp)</label>
              <input type="number" [(ngModel)]="packageForm.price" name="p_price" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label class="block text-xs font-medium text-foreground mb-1">Harga Diskon (Rp)</label>
              <input type="number" [(ngModel)]="packageForm.discountPrice" name="p_disc" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-foreground mb-1">Masa Aktif (Hari)</label>
              <input type="number" [(ngModel)]="packageForm.activeDays" name="p_days" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label class="block text-xs font-medium text-foreground mb-1">Jenjang / Kelas</label>
              <input type="text" [(ngModel)]="packageForm.kelas" name="p_kelas" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="12 SMA / Olimpiade" />
            </div>
          </div>
        }

        @if (modalType() === 'live') {
          <div>
            <label class="block text-xs font-medium text-foreground mb-1">Topik Live Class</label>
            <input type="text" [(ngModel)]="liveForm.title" name="l_title" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-foreground mb-1">Nama Tutor</label>
              <input type="text" [(ngModel)]="liveForm.tutorName" name="l_tutor" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label class="block text-xs font-medium text-foreground mb-1">Waktu & Tanggal</label>
              <input type="text" [(ngModel)]="liveForm.scheduledAt" name="l_time" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="2026-10-15 19:30 WIB" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-foreground mb-1">URL Zoom / Google Meet</label>
            <input type="text" [(ngModel)]="liveForm.meetingUrl" name="l_url" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="https://zoom.us/..." />
          </div>
        }

        @if (modalType() === 'video') {
          <div>
            <label class="block text-xs font-medium text-foreground mb-1">Judul Video Materi</label>
            <input type="text" [(ngModel)]="videoForm.title" name="v_title" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label class="block text-xs font-medium text-foreground mb-1">Kategori Pelajaran</label>
            <input type="text" [(ngModel)]="videoForm.category" name="v_cat" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Matematika SMA / TPS" />
          </div>
          <div>
            <label class="block text-xs font-medium text-foreground mb-1">URL Video (YouTube / MP4)</label>
            <input type="text" [(ngModel)]="videoForm.videoUrl" name="v_url" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="https://www.youtube.com/..." />
          </div>
        }

        @if (modalType() === 'module') {
          <div>
            <label class="block text-xs font-medium text-foreground mb-1">Judul Modul PDF</label>
            <input type="text" [(ngModel)]="moduleForm.title" name="m_title" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-foreground mb-1">Mata Pelajaran</label>
              <input type="text" [(ngModel)]="moduleForm.subject" name="m_subj" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Matematika Nalaria" />
            </div>
            <div>
              <label class="block text-xs font-medium text-foreground mb-1">Jenjang</label>
              <input type="text" [(ngModel)]="moduleForm.grade" name="m_grade" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="SD & SMP" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-foreground mb-1">URL File PDF</label>
            <input type="text" [(ngModel)]="moduleForm.fileUrl" name="m_url" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="https://..." />
          </div>
        }

        @if (modalType() === 'voucher') {
          <div>
            <label class="block text-xs font-medium text-foreground mb-1">Kode Voucher Promo</label>
            <input type="text" [(ngModel)]="voucherForm.code" name="v_code" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs uppercase font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="KPMJUARA2026" />
          </div>
          <div>
            <label class="block text-xs font-medium text-foreground mb-1">Judul / Promo Deskripsi</label>
            <input type="text" [(ngModel)]="voucherForm.title" name="v_title" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-foreground mb-1">Diskon Persen (%)</label>
              <input type="number" [(ngModel)]="voucherForm.discountPercent" name="v_disc" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="25" />
            </div>
            <div>
              <label class="block text-xs font-medium text-foreground mb-1">Kuota Pemakaian</label>
              <input type="number" [(ngModel)]="voucherForm.quota" name="v_quota" class="w-full h-8 px-3 rounded-md border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="500" />
            </div>
          </div>
        }
      </form>

      <div modal-footer class="flex items-center justify-end gap-2">
        <button
          type="button"
          (click)="isModalOpen.set(false)"
          class="h-8 px-3 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors"
        >
          Batal
        </button>
        <button
          type="button"
          (click)="saveModalData()"
          class="h-8 px-3.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          Simpan Data
        </button>
      </div>
    </app-modal>
  `,
})
export class CMSComponent implements OnInit {
  adminService = inject(AdminService);
  route = inject(ActivatedRoute);

  currentTab = signal<CMSTab>('banner');
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
    this.route.data.subscribe((data) => {
      if (data && data['tab']) {
        this.currentTab.set(data['tab'] as CMSTab);
      }
    });
    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        this.currentTab.set(params['tab'] as CMSTab);
      }
    });
    const snapshotUrl = this.route.snapshot.url.map((s) => s.path).join('/');
    if (snapshotUrl.includes('packages')) this.currentTab.set('package');
    else if (snapshotUrl.includes('live-classes')) this.currentTab.set('live');
    else if (snapshotUrl.includes('videos')) this.currentTab.set('video');
    else if (snapshotUrl.includes('modules')) this.currentTab.set('module');
    else if (snapshotUrl.includes('vouchers')) this.currentTab.set('voucher');
    else if (snapshotUrl.includes('banners')) this.currentTab.set('banner');

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
    this.modalTitle.set(b ? 'Edit Spanduk Banner' : 'Tambah Spanduk Banner Baru');
    this.modalDescription.set('Konfigurasi gambar slider beranda aplikasi mobile');
    this.bannerForm = b ? { ...b } : { title: '', imageUrl: '', targetUrl: '/package_list', order: 1 };
    this.isModalOpen.set(true);
  }

  openPackageModal(p?: Package): void {
    this.modalType.set('package');
    this.modalTitle.set(p ? 'Edit Paket Belajar' : 'Tambah Paket Belajar Baru');
    this.modalDescription.set('Konfigurasi harga, diskon, dan hak akses tryout');
    this.packageForm = p ? { ...p } : { title: '', description: '', price: 154000, discountPrice: 129000, activeDays: 180, kelas: '12 SMA' };
    this.isModalOpen.set(true);
  }

  openLiveModal(lc?: LiveClass): void {
    this.modalType.set('live');
    this.modalTitle.set(lc ? 'Edit Jadwal Live Class' : 'Tambah Jadwal Live Class');
    this.modalDescription.set('Konfigurasi pertemuan daring dan tutor');
    this.liveForm = lc ? { ...lc } : { title: '', tutorName: '', scheduledAt: '2026-10-20 19:30 WIB', meetingUrl: 'https://zoom.us/...' };
    this.isModalOpen.set(true);
  }

  openVideoModal(v?: Video): void {
    this.modalType.set('video');
    this.modalTitle.set(v ? 'Edit Video Pembelajaran' : 'Tambah Video Materi Baru');
    this.modalDescription.set('Tautan streaming video dan silabus');
    this.videoForm = v ? { ...v } : { title: '', category: 'Matematika SMA', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' };
    this.isModalOpen.set(true);
  }

  openModuleModal(m?: Module): void {
    this.modalType.set('module');
    this.modalTitle.set(m ? 'Edit Modul Pembelajaran' : 'Tambah Modul PDF Baru');
    this.modalDescription.set('Tautan arsip dokumen PDF dan jenjang kurikulum');
    this.moduleForm = m ? { ...m } : { title: '', subject: 'Matematika Nalaria', grade: 'SD & SMP', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' };
    this.isModalOpen.set(true);
  }

  openVoucherModal(): void {
    this.modalType.set('voucher');
    this.modalTitle.set('Buat Kupon Promo Diskon');
    this.modalDescription.set('Kode voucher potongan harga checkout siswa');
    this.voucherForm = { code: '', title: '', discountPercent: 20, quota: 250 };
    this.isModalOpen.set(true);
  }

  saveModalData(): void {
    const type = this.modalType();
    const onSaved = () => {
      this.isModalOpen.set(false);
      this.loadAllCMS();
    };
    const onFailed = (err: any) => alert('Gagal menyimpan ke server: ' + (err?.message || 'unknown error'));

    if (type === 'banner') {
      const req = this.bannerForm.id
        ? this.adminService.updateBanner(this.bannerForm.id, this.bannerForm)
        : this.adminService.createBanner(this.bannerForm);
      req.subscribe({ next: onSaved, error: onFailed });
      return;
    } else if (type === 'package') {
      const req = this.packageForm.id
        ? this.adminService.updatePackage(this.packageForm.id, this.packageForm)
        : this.adminService.createPackage(this.packageForm);
      req.subscribe({ next: onSaved, error: onFailed });
      return;
    } else if (type === 'live') {
      const req = this.liveForm.id
        ? this.adminService.updateLiveClass(this.liveForm.id, this.liveForm)
        : this.adminService.createLiveClass(this.liveForm);
      req.subscribe({ next: onSaved, error: onFailed });
      return;
    } else if (type === 'video') {
      const payload: any = {
        title: this.videoForm.title,
        description: this.videoForm.description || '',
        video_url: this.videoForm.videoUrl,
        category: this.videoForm.category || 'Matematika SMA',
      };
      const req = this.videoForm.id
        ? this.adminService.updateVideo(this.videoForm.id, payload)
        : this.adminService.createVideo(payload);
      req.subscribe({ next: onSaved, error: onFailed });
      return;
    } else if (type === 'module') {
      const req = this.moduleForm.id
        ? this.adminService.updateModule(this.moduleForm.id, this.moduleForm)
        : this.adminService.createModule(this.moduleForm);
      req.subscribe({ next: onSaved, error: onFailed });
      return;
    } else if (type === 'voucher') {
      const req = this.adminService.createVoucher(this.voucherForm);
      req.subscribe({ next: onSaved, error: onFailed });
      return;
    }

    this.isModalOpen.set(false);
  }

  deleteBanner(id: string): void {
    if (confirm('Yakin ingin menghapus banner ini?')) {
      this.adminService.deleteBanner(id).subscribe({
        next: () => this.loadAllCMS(),
        error: (err) => alert('Gagal menghapus banner: ' + (err?.message || 'error')),
      });
    }
  }

  deletePackage(id: string): void {
    if (confirm('Yakin ingin menghapus paket belajar ini?')) {
      this.adminService.deletePackage(id).subscribe({
        next: () => this.loadAllCMS(),
        error: (err) => alert('Gagal menghapus paket: ' + (err?.message || 'error')),
      });
    }
  }

  deleteLiveClass(id: string): void {
    if (confirm('Yakin ingin menghapus jadwal live class ini?')) {
      this.adminService.deleteLiveClass(id).subscribe({
        next: () => this.loadAllCMS(),
        error: (err) => alert('Gagal menghapus live class: ' + (err?.message || 'error')),
      });
    }
  }

  deleteVideo(id: string): void {
    if (confirm('Yakin ingin menghapus video materi ini?')) {
      this.adminService.deleteVideo(id).subscribe({
        next: () => this.loadAllCMS(),
        error: (err) => alert('Gagal menghapus video: ' + (err?.message || 'error')),
      });
    }
  }

  deleteModule(id: string): void {
    if (confirm('Yakin ingin menghapus modul PDF ini?')) {
      this.adminService.deleteModule(id).subscribe({
        next: () => this.loadAllCMS(),
        error: (err) => alert('Gagal menghapus modul: ' + (err?.message || 'error')),
      });
    }
  }

  deleteVoucher(id: string): void {
    if (confirm('Yakin ingin menghapus kupon voucher ini?')) {
      this.adminService.deleteVoucher(id).subscribe({
        next: () => this.loadAllCMS(),
        error: (err) => alert('Gagal menghapus voucher: ' + (err?.message || 'error')),
      });
    }
  }
}
