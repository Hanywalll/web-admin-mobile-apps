import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/models';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Pengguna & Siswa</h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Manajemen akun siswa terdaftar, pengajar/tutor, dan administrator KPM Academy
          </p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="p-3 sm:p-4 rounded-xl border border-border bg-card shadow-sm">
        <div class="relative">
          <app-icon name="search" [size]="16" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></app-icon>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Cari nama siswa, email, atau asal sekolah..."
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
      </div>

      <!-- Desktop / Tablet Users Table -->
      <div class="hidden sm:block rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th class="px-5 py-3.5">Nama Pengguna</th>
                <th class="px-5 py-3.5">Role / Peran</th>
                <th class="px-5 py-3.5">Sekolah / Instansi</th>
                <th class="px-5 py-3.5">Kota</th>
                <th class="px-5 py-3.5">Status Akun</th>
                <th class="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (user of filteredUsers(); track user.id) {
                <tr class="hover:bg-muted/30 transition-colors">
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {{ user.name.charAt(0) }}
                      </div>
                      <div>
                        <div class="font-bold text-foreground">{{ user.name }}</div>
                        <div class="text-[10px] text-muted-foreground">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-3.5">
                    @if (user.role === 'admin') {
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Admin
                      </span>
                    } @else if (user.role === 'tutor') {
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                        Master Tutor
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        Siswa
                      </span>
                    }
                  </td>
                  <td class="px-5 py-3.5 text-muted-foreground">{{ user.school || '-' }}</td>
                  <td class="px-5 py-3.5 text-muted-foreground">{{ user.city || '-' }}</td>
                  <td class="px-5 py-3.5">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Aktif
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-right">
                    @if (user.role !== 'admin') {
                      <button
                        (click)="toggleUser(user.id)"
                        class="h-7 px-2.5 rounded-md border border-border bg-muted/40 hover:bg-destructive hover:text-destructive-foreground text-[11px] font-bold transition-all"
                      >
                        Nonaktifkan
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center py-12 text-muted-foreground">
                    <app-icon name="users" [size]="32" className="mx-auto mb-2 text-muted-foreground/60"></app-icon>
                    <p class="text-xs font-bold text-foreground">Tidak Ada Pengguna Ditemukan</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Card List (< 640px) -->
      <div class="sm:hidden space-y-3">
        @for (user of filteredUsers(); track user.id) {
          <div class="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {{ user.name.charAt(0) }}
                </div>
                <div>
                  <div class="font-bold text-xs text-foreground">{{ user.name }}</div>
                  <div class="text-[10px] text-muted-foreground">{{ user.email }}</div>
                </div>
              </div>
              @if (user.role === 'admin') {
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Admin
                </span>
              } @else if (user.role === 'tutor') {
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  Tutor
                </span>
              } @else {
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  Siswa
                </span>
              }
            </div>

            <div class="text-xs text-muted-foreground pt-1 border-t border-border flex items-center justify-between">
              <span>{{ user.school || 'KPM Academy' }} ({{ user.city || 'Bogor' }})</span>
              <span class="text-emerald-600 font-bold">Aktif</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class UsersComponent implements OnInit {
  adminService = inject(AdminService);
  users = signal<User[]>([]);
  searchQuery = signal<string>('');

  filteredUsers = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.users();
    return this.users().filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.school && u.school.toLowerCase().includes(q))
    );
  });

  ngOnInit(): void {
    this.adminService.getUsers().subscribe((res) => this.users.set(res));
  }

  toggleUser(id: string): void {
    this.adminService.toggleUserActive(id).subscribe(() => {
      alert('Status pengguna berhasil diubah.');
    });
  }
}
