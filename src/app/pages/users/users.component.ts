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
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold tracking-tight text-foreground">Direktori Pengguna & Siswa</h1>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono border border-border bg-muted/60 text-muted-foreground">
              RBAC DIRECTORY
            </span>
          </div>
          <p class="text-xs text-muted-foreground mt-0.5">
            Manajemen akun terdaftar, hak akses peran (Role-Based Access Control), dan status operasional
          </p>
        </div>
      </div>

      <!-- User Stats Strip -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-4 rounded-lg border border-border bg-card">
          <div class="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">Total Entitas</div>
          <div class="text-lg font-bold font-mono text-foreground mt-1">
            {{ users().length }} Pengguna
          </div>
          <div class="text-[10px] text-muted-foreground mt-0.5">Seluruh basis data</div>
        </div>

        <div class="p-4 rounded-lg border border-border bg-card">
          <div class="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">Siswa Aktif</div>
          <div class="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {{ studentCount() }} Akun
          </div>
          <div class="text-[10px] text-muted-foreground mt-0.5">Pembelajar aktif</div>
        </div>

        <div class="p-4 rounded-lg border border-border bg-card">
          <div class="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">Master Tutor</div>
          <div class="text-lg font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
            {{ tutorCount() }} Pengajar
          </div>
          <div class="text-[10px] text-muted-foreground mt-0.5">Instruktur bersertifikasi</div>
        </div>

        <div class="p-4 rounded-lg border border-border bg-card">
          <div class="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">Administrator</div>
          <div class="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {{ adminCount() }} Staf
          </div>
          <div class="text-[10px] text-muted-foreground mt-0.5">Akses penuh sistem</div>
        </div>
      </div>

      <!-- Search & Role Toolbar -->
      <div class="p-3 rounded-lg border border-border bg-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1">
          <app-icon name="search" [size]="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></app-icon>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Cari berdasarkan nama, email resmi, sekolah, atau kota..."
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

        <!-- Role Filter Tabs -->
        <div class="flex items-center gap-1 text-xs">
          <button
            type="button"
            (click)="roleFilter.set('ALL')"
            [class]="roleFilter() === 'ALL' ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
            class="h-8 px-3 rounded-md transition-colors"
          >
            Semua ({{ users().length }})
          </button>
          <button
            type="button"
            (click)="roleFilter.set('user')"
            [class]="roleFilter() === 'user' ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
            class="h-8 px-3 rounded-md transition-colors"
          >
            Siswa ({{ studentCount() }})
          </button>
          <button
            type="button"
            (click)="roleFilter.set('tutor')"
            [class]="roleFilter() === 'tutor' ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
            class="h-8 px-3 rounded-md transition-colors"
          >
            Tutor ({{ tutorCount() }})
          </button>
          <button
            type="button"
            (click)="roleFilter.set('admin')"
            [class]="roleFilter() === 'admin' ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
            class="h-8 px-3 rounded-md transition-colors"
          >
            Admin ({{ adminCount() }})
          </button>
        </div>
      </div>

      <!-- DESKTOP DATA TABLE -->
      <div class="hidden sm:block rounded-lg border border-border bg-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-muted/40 border-b border-border text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th class="px-4 py-3 font-medium">Profil Pengguna</th>
                <th class="px-4 py-3 font-medium">Peran / Role</th>
                <th class="px-4 py-3 font-medium">Institusi / Sekolah</th>
                <th class="px-4 py-3 font-medium">Kota</th>
                <th class="px-4 py-3 font-medium">Status Akun</th>
                <th class="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (user of filteredUsers(); track user.id) {
                <tr class="hover:bg-muted/30 transition-colors">
                  <!-- User Name & Avatar -->
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="h-7 w-7 rounded-md bg-muted text-foreground flex items-center justify-center font-mono font-semibold text-xs border border-border">
                        {{ user.name.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="font-medium text-foreground">{{ user.name }}</div>
                        <div class="text-[11px] text-muted-foreground font-mono">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Role Pill -->
                  <td class="px-4 py-3 font-mono text-[11px]">
                    @if (user.role === 'admin') {
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 font-medium">
                        ADMINISTRATOR
                      </span>
                    } @else if (user.role === 'tutor') {
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 font-medium">
                        TUTOR
                      </span>
                    } @else {
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-muted-foreground bg-muted border border-border font-medium">
                        SISWA
                      </span>
                    }
                  </td>

                  <!-- School -->
                  <td class="px-4 py-3 text-muted-foreground">
                    {{ user.school || '-' }}
                  </td>

                  <!-- City -->
                  <td class="px-4 py-3 text-muted-foreground">
                    {{ user.city || '-' }}
                  </td>

                  <!-- Status -->
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>ACTIVE</span>
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="px-4 py-3 text-right">
                    @if (user.role !== 'admin') {
                      <button
                        (click)="toggleUser(user.id)"
                        class="h-7 px-2.5 rounded border border-border bg-card hover:bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Kelola
                      </button>
                    } @else {
                      <span class="text-[11px] font-mono text-muted-foreground/60 italic">Terkunci</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center py-12 text-muted-foreground">
                    <p class="text-xs font-medium text-foreground">Tidak ada pengguna ditemukan</p>
                    <p class="text-[11px] text-muted-foreground mt-0.5">Periksa kata kunci pencarian atau ganti filter peran</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MOBILE VIEW (< 640px) -->
      <div class="sm:hidden space-y-2.5">
        @for (user of filteredUsers(); track user.id) {
          <div class="rounded-lg border border-border bg-card p-3.5 space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="h-7 w-7 rounded-md bg-muted text-foreground flex items-center justify-center font-mono font-semibold text-xs border border-border">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="font-medium text-xs text-foreground">{{ user.name }}</div>
                  <div class="text-[10px] text-muted-foreground font-mono">{{ user.email }}</div>
                </div>
              </div>

              @if (user.role === 'admin') {
                <span class="px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-600 bg-amber-500/10 border border-amber-500/20">ADMIN</span>
              } @else if (user.role === 'tutor') {
                <span class="px-1.5 py-0.5 rounded text-[10px] font-mono text-purple-600 bg-purple-500/10 border border-purple-500/20">TUTOR</span>
              } @else {
                <span class="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted border border-border">SISWA</span>
              }
            </div>

            <div class="text-[11px] text-muted-foreground pt-1.5 border-t border-border flex items-center justify-between">
              <span>{{ user.school || '-' }} • {{ user.city || '-' }}</span>
              <span class="text-emerald-600 font-mono text-[10px]">ACTIVE</span>
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
  roleFilter = signal<'ALL' | 'admin' | 'tutor' | 'user'>('ALL');

  studentCount = computed(() => this.users().filter((u) => u.role === 'user' || !u.role).length);
  tutorCount = computed(() => this.users().filter((u) => u.role === 'tutor').length);
  adminCount = computed(() => this.users().filter((u) => u.role === 'admin').length);

  filteredUsers = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const rf = this.roleFilter();

    return this.users().filter((u) => {
      // Role filter
      if (rf !== 'ALL') {
        if (rf === 'user' && u.role && u.role !== 'user') return false;
        if (rf !== 'user' && u.role !== rf) return false;
      }

      // Query filter
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.school && u.school.toLowerCase().includes(q)) ||
        (u.city && u.city.toLowerCase().includes(q))
      );
    });
  });

  ngOnInit(): void {
    this.adminService.getUsers().subscribe((res) => this.users.set(res));
  }

  toggleUser(id: string): void {
    this.adminService.toggleUserActive(id).subscribe(() => {
      // State updated cleanly
    });
  }
}
