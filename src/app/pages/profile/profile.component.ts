import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  template: `
    <div class="space-y-6 max-w-5xl">
      <!-- Action Feedback Toast -->
      @if (toastMessage()) {
        <div
          class="p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all shadow-sm animate-in fade-in duration-200"
          [ngClass]="toastType() === 'success' ? 'border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'border-rose-500/20 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'"
        >
          <div class="flex items-center gap-2.5">
            <app-icon [name]="toastType() === 'success' ? 'check' : 'x'" [size]="15"></app-icon>
            <span class="font-medium">{{ toastMessage() }}</span>
          </div>
          <button (click)="toastMessage.set(null)" class="opacity-60 hover:opacity-100 cursor-pointer">
            <app-icon name="x" [size]="14"></app-icon>
          </button>
        </div>
      }

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-lg bg-[#1B2CC1]/10 text-[#1B2CC1] dark:text-[#7692FF] flex items-center justify-center">
              <app-icon name="user" [size]="18"></app-icon>
            </div>
            Profil Administrator & Data Akun
          </h1>
          <p class="text-xs text-muted-foreground mt-1">
            Kelola rincian informasi data diri, kontak, lembaga, dan keamanan akun login Anda.
          </p>
        </div>

        @if (auth.isSuperAdmin()) {
          <a
            routerLink="/admin/settings"
            class="h-9 px-3.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <app-icon name="settings" [size]="14"></app-icon>
            <span>Pengaturan API & Sistem</span>
          </a>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Sisi Kiri: Ringkasan Kartu Identitas Akun -->
        <div class="space-y-4">
          <div class="rounded-2xl border border-border bg-card p-5 text-center shadow-sm space-y-4">
            <!-- Avatar Display -->
            <div class="relative mx-auto w-24 h-24">
              @if (formData.profile_photo) {
                <img
                  [src]="formData.profile_photo"
                  [alt]="formData.name"
                  class="w-24 h-24 rounded-full object-cover border-4 border-background shadow-md mx-auto"
                  (error)="handleAvatarError()"
                />
              } @else {
                <div class="w-24 h-24 rounded-full bg-[#1B2CC1] text-white flex items-center justify-center font-bold text-3xl select-none shadow-md mx-auto">
                  {{ (formData.name || 'A')[0].toUpperCase() }}
                </div>
              }
            </div>

            <div>
              <h2 class="text-base font-bold text-foreground">{{ formData.name || 'Administrator KPM' }}</h2>
              <p class="text-xs text-muted-foreground">{{ auth.currentUser()?.email || 'admin@kpmacademy.com' }}</p>
              
              <div class="flex items-center justify-center gap-2 mt-2.5">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Aktif
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-[#1B2CC1] dark:text-[#7692FF] border border-blue-500/20 uppercase tracking-wider">
                  {{ auth.isSuperAdmin() ? 'Super Admin' : (auth.currentUser()?.role || 'Admin') }}
                </span>
              </div>
            </div>

            <!-- Quick Metadata Details -->
            <div class="border-t border-border pt-4 text-left space-y-2.5 text-xs">
              <div class="flex justify-between items-center text-muted-foreground">
                <span>ID Pengguna:</span>
                <span class="font-mono font-medium text-foreground truncate max-w-[130px]">{{ auth.currentUser()?.id || 'ADM-ROOT-001' }}</span>
              </div>
              <div class="flex justify-between items-center text-muted-foreground">
                <span>Institusi:</span>
                <span class="font-medium text-foreground truncate max-w-[150px]">{{ formData.school_name || 'KPM Academy Center' }}</span>
              </div>
              <div class="flex justify-between items-center text-muted-foreground">
                <span>Lokasi:</span>
                <span class="font-medium text-foreground truncate max-w-[150px]">{{ formData.city || 'Bogor / Indonesia' }}</span>
              </div>
            </div>

            <!-- Logout Button -->
            <div class="border-t border-border pt-4">
              <button
                type="button"
                (click)="auth.logout()"
                class="w-full h-9 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <app-icon name="log-out" [size]="14"></app-icon>
                <span>Keluar dari Akun Ini</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Sisi Kanan: Formulir Edit Profil & Keamanan -->
        <div class="lg:col-span-2 space-y-6">
          <!-- CARD 1: FORMULIR EDIT DATA PROFIL -->
          <div class="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-border">
              <div class="flex items-center gap-2.5">
                <div class="h-7 w-7 rounded-lg bg-[#1B2CC1]/10 text-[#1B2CC1] dark:text-[#7692FF] flex items-center justify-center">
                  <app-icon name="edit" [size]="14"></app-icon>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-foreground">Edit Informasi Data Profil</h3>
                  <p class="text-[11px] text-muted-foreground">Perbarui identitas, kontak, dan instansi Anda</p>
                </div>
              </div>
            </div>

            <form (ngSubmit)="saveProfile()" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Nama Lengkap -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-foreground">
                    Nama Lengkap <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="formData.name"
                    name="name"
                    required
                    placeholder="Contoh: Administrator KPM"
                    class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all shadow-xs"
                  />
                </div>

                <!-- Email (Read-only identitas) -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-foreground">
                    Alamat Email <span class="text-[10px] text-muted-foreground font-normal">(Akun Utama)</span>
                  </label>
                  <input
                    type="email"
                    [value]="auth.currentUser()?.email || 'admin@kpmacademy.com'"
                    disabled
                    class="w-full h-9 px-3 rounded-lg border border-input bg-muted/60 text-muted-foreground text-xs cursor-not-allowed shadow-xs"
                  />
                </div>

                <!-- Nomor Telepon / WhatsApp -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-foreground">Nomor HP / WhatsApp</label>
                  <input
                    type="tel"
                    [(ngModel)]="formData.phone"
                    name="phone"
                    placeholder="Contoh: 0812-3456-7890"
                    class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all shadow-xs"
                  />
                </div>

                <!-- Unit / Institusi / Sekolah -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-foreground">Lembaga / Sekolah / Unit</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.school_name"
                    name="school_name"
                    placeholder="Contoh: KPM Academy Center"
                    class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all shadow-xs"
                  />
                </div>

                <!-- Lokasi / Kota -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-foreground">Kota / Lokasi</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.city"
                    name="city"
                    placeholder="Contoh: Bogor / Jakarta"
                    class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all shadow-xs"
                  />
                </div>

                <!-- URL Foto Profil -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-foreground">URL Foto Profil (Avatar)</label>
                  <input
                    type="url"
                    [(ngModel)]="formData.profile_photo"
                    name="profile_photo"
                    placeholder="https://..."
                    class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all shadow-xs"
                  />
                </div>
              </div>

              <!-- Tombol Simpan Profil -->
              <div class="pt-2 flex justify-end">
                <button
                  type="submit"
                  [disabled]="isSavingProfile()"
                  class="h-9 px-5 rounded-lg bg-[#1B2CC1] hover:bg-[#1B2CC1]/90 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <app-icon
                    [name]="isSavingProfile() ? 'refresh' : 'check'"
                    [size]="14"
                    [className]="isSavingProfile() ? 'animate-spin' : ''"
                  ></app-icon>
                  <span>{{ isSavingProfile() ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Profil' }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- CARD 2: GANTI KATA SANDI / KEAMANAN AKUN -->
          <div class="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-border">
              <div class="flex items-center gap-2.5">
                <div class="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <app-icon name="lock" [size]="14"></app-icon>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-foreground">Keamanan & Ubah Kata Sandi</h3>
                  <p class="text-[11px] text-muted-foreground">Pastikan akun Anda menggunakan kata sandi yang kuat dan aman</p>
                </div>
              </div>
            </div>

            <form (ngSubmit)="changePassword()" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <!-- Sandi Lama -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-foreground">
                    Sandi Lama <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    [(ngModel)]="passwordData.old_password"
                    name="old_password"
                    required
                    placeholder="Sandi saat ini"
                    class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all shadow-xs"
                  />
                </div>

                <!-- Sandi Baru -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-foreground">
                    Sandi Baru <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    [(ngModel)]="passwordData.new_password"
                    name="new_password"
                    required
                    placeholder="Minimal 6 karakter"
                    class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all shadow-xs"
                  />
                </div>

                <!-- Konfirmasi Sandi Baru -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-foreground">
                    Konfirmasi Sandi <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    [(ngModel)]="passwordData.confirm_password"
                    name="confirm_password"
                    required
                    placeholder="Ulangi sandi baru"
                    class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2CC1] transition-all shadow-xs"
                  />
                </div>
              </div>

              <!-- Tombol Ubah Sandi -->
              <div class="pt-2 flex justify-end">
                <button
                  type="submit"
                  [disabled]="isChangingPassword()"
                  class="h-9 px-5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <app-icon
                    [name]="isChangingPassword() ? 'refresh' : 'lock'"
                    [size]="14"
                    [className]="isChangingPassword() ? 'animate-spin' : ''"
                  ></app-icon>
                  <span>{{ isChangingPassword() ? 'Memproses Sandi...' : 'Perbarui Kata Sandi' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);

  formData = {
    name: '',
    phone: '',
    school_name: '',
    city: '',
    profile_photo: '',
  };

  passwordData = {
    old_password: '',
    new_password: '',
    confirm_password: '',
  };

  isSavingProfile = signal<boolean>(false);
  isChangingPassword = signal<boolean>(false);

  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  ngOnInit(): void {
    this.populateCurrentData();
  }

  populateCurrentData(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.formData = {
        name: user.name || '',
        phone: user.phone || '',
        school_name: user.school || '',
        city: user.city || '',
        profile_photo: user.avatar || '',
      };
    }
  }

  handleAvatarError(): void {
    this.formData.profile_photo = '';
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => {
      if (this.toastMessage() === message) {
        this.toastMessage.set(null);
      }
    }, 4000);
  }

  saveProfile(): void {
    if (!this.formData.name.trim()) {
      this.showToast('Nama lengkap tidak boleh kosong!', 'error');
      return;
    }

    this.isSavingProfile.set(true);

    this.auth
      .updateProfile({
        name: this.formData.name.trim(),
        phone: this.formData.phone.trim(),
        school_name: this.formData.school_name.trim(),
        city: this.formData.city.trim(),
        profile_photo: this.formData.profile_photo.trim(),
      })
      .subscribe({
        next: () => {
          this.isSavingProfile.set(false);
          this.showToast('Data profil berhasil diperbarui!');
        },
        error: (err) => {
          this.isSavingProfile.set(false);
          this.showToast(err?.message || 'Gagal menyimpan profil', 'error');
        },
      });
  }

  changePassword(): void {
    if (!this.passwordData.old_password) {
      this.showToast('Masukkan kata sandi lama Anda!', 'error');
      return;
    }

    if (this.passwordData.new_password.length < 6) {
      this.showToast('Kata sandi baru minimal 6 karakter!', 'error');
      return;
    }

    if (this.passwordData.new_password !== this.passwordData.confirm_password) {
      this.showToast('Konfirmasi kata sandi baru tidak cocok!', 'error');
      return;
    }

    this.isChangingPassword.set(true);

    this.auth
      .changePassword({
        old_password: this.passwordData.old_password,
        new_password: this.passwordData.new_password,
      })
      .subscribe({
        next: (res) => {
          this.isChangingPassword.set(false);
          if (res.success) {
            this.passwordData = {
              old_password: '',
              new_password: '',
              confirm_password: '',
            };
            this.showToast('Kata sandi berhasil diperbarui!');
          } else {
            this.showToast(res.message || 'Gagal mengubah kata sandi', 'error');
          }
        },
        error: (err) => {
          this.isChangingPassword.set(false);
          this.showToast(err?.message || 'Gagal mengubah kata sandi', 'error');
        },
      });
  }
}
