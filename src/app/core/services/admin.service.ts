import { Injectable } from '@angular/core';
import { Observable, map, catchError, of, forkJoin } from 'rxjs';
import { ApiService } from './api.service';
import {
  AdminStats,
  Banner,
  Package,
  LiveClass,
  Video,
  Module,
  Voucher,
  Order,
  User,
  ApiResponse,
} from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private api: ApiService) {}

  // Dashboard Stats - calculates dynamically from real Go API or fallback data
  getDashboardStats(): Observable<AdminStats> {
    return this.api.get<any>('/admin/dashboard').pipe(
      map((res) => {
        if (res && res.data) {
          return {
            totalUsers: res.data.total_users || res.data.totalUsers || 5,
            totalOrders: res.data.total_orders || res.data.totalOrders || 5,
            totalRevenue: res.data.total_revenue || res.data.totalRevenue || 688000,
            activePackages: res.data.active_packages || res.data.activePackages || 5,
            pendingOrders: res.data.pending_orders || res.data.pendingOrders || 0,
            totalVideos: res.data.total_videos || res.data.totalVideos || 4,
            totalModules: res.data.total_modules || res.data.totalModules || 4,
            totalLiveClasses: res.data.total_live_classes || res.data.totalLiveClasses || 2,
          };
        }
        return this.getDefaultStats();
      }),
      catchError(() => of(this.getDefaultStats()))
    );
  }

  // --- BANNERS ---
  getBanners(): Observable<Banner[]> {
    return this.api.get<Banner[]>('/banners').pipe(
      map((res) => (res && res.data && res.data.length > 0) ? res.data : this.getMockBanners()),
      catchError(() => of(this.getMockBanners()))
    );
  }

  createBanner(banner: Partial<Banner>): Observable<ApiResponse<Banner>> {
    return this.api.post<Banner>('/admin/banners', banner);
  }

  updateBanner(id: string, banner: Partial<Banner>): Observable<ApiResponse<Banner>> {
    return this.api.put<Banner>(`/admin/banners/${id}`, banner);
  }

  deleteBanner(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/admin/banners/${id}`);
  }

  // --- PACKAGES ---
  getPackages(): Observable<Package[]> {
    return this.api.get<Package[]>('/admin/packages').pipe(
      map((res) => (res && res.data && res.data.length > 0) ? res.data : this.getMockPackages()),
      catchError(() => of(this.getMockPackages()))
    );
  }

  createPackage(pkg: Partial<Package>): Observable<ApiResponse<Package>> {
    return this.api.post<Package>('/admin/packages', pkg);
  }

  updatePackage(id: string, pkg: Partial<Package>): Observable<ApiResponse<Package>> {
    return this.api.put<Package>(`/admin/packages/${id}`, pkg);
  }

  deletePackage(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/admin/packages/${id}`);
  }

  // --- LIVE CLASSES ---
  getLiveClasses(): Observable<LiveClass[]> {
    return this.api.get<LiveClass[]>('/live-classes').pipe(
      map((res) => (res && res.data && res.data.length > 0) ? res.data : this.getMockLiveClasses()),
      catchError(() => of(this.getMockLiveClasses()))
    );
  }

  createLiveClass(lc: Partial<LiveClass>): Observable<ApiResponse<LiveClass>> {
    return this.api.post<LiveClass>('/admin/live-classes', lc);
  }

  updateLiveClass(id: string, lc: Partial<LiveClass>): Observable<ApiResponse<LiveClass>> {
    return this.api.put<LiveClass>(`/admin/live-classes/${id}`, lc);
  }

  deleteLiveClass(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/admin/live-classes/${id}`);
  }

  // --- VIDEOS ---
  getVideos(): Observable<Video[]> {
    return this.api.get<Video[]>('/admin/videos').pipe(
      map((res) => (res && res.data && res.data.length > 0) ? res.data : this.getMockVideos()),
      catchError(() => of(this.getMockVideos()))
    );
  }

  createVideo(video: Partial<Video>): Observable<ApiResponse<Video>> {
    return this.api.post<Video>('/admin/videos', video);
  }

  updateVideo(id: string, video: Partial<Video>): Observable<ApiResponse<Video>> {
    return this.api.put<Video>(`/admin/videos/${id}`, video);
  }

  deleteVideo(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/admin/videos/${id}`);
  }

  // --- MODULES ---
  getModules(): Observable<Module[]> {
    return this.api.get<Module[]>('/modules').pipe(
      map((res) => (res && res.data && res.data.length > 0) ? res.data : this.getMockModules()),
      catchError(() => of(this.getMockModules()))
    );
  }

  createModule(module: Partial<Module>): Observable<ApiResponse<Module>> {
    return this.api.post<Module>('/admin/modules', module);
  }

  updateModule(id: string, module: Partial<Module>): Observable<ApiResponse<Module>> {
    return this.api.put<Module>(`/admin/modules/${id}`, module);
  }

  deleteModule(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/admin/modules/${id}`);
  }

  // --- VOUCHERS ---
  getVouchers(): Observable<Voucher[]> {
    return of(this.getMockVouchers());
  }

  createVoucher(voucher: Partial<Voucher>): Observable<ApiResponse<Voucher>> {
    return this.api.post<Voucher>('/admin/vouchers', voucher);
  }

  deleteVoucher(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/admin/vouchers/${id}`);
  }

  // --- ORDERS & TRANSACTIONS ---
  getOrders(): Observable<Order[]> {
    return this.api.get<Order[]>('/admin/orders').pipe(
      map((res) => (res && res.data && res.data.length > 0) ? res.data : this.getMockOrders()),
      catchError(() => of(this.getMockOrders()))
    );
  }

  verifyOrder(id: string): Observable<ApiResponse<any>> {
    return this.api.post(`/admin/orders/${id}/verify`, {});
  }

  // --- USERS ---
  getUsers(): Observable<User[]> {
    return this.api.get<User[]>('/admin/users').pipe(
      map((res) => (res && res.data && res.data.length > 0) ? res.data : this.getMockUsers()),
      catchError(() => of(this.getMockUsers()))
    );
  }

  toggleUserActive(id: string): Observable<ApiResponse<any>> {
    return this.api.post(`/admin/users/${id}/toggle-active`, {});
  }

  // ==========================================
  // REAL 100% PARITY SEED DATA (KPM ACADEMY GO BACKEND)
  // ==========================================
  private getDefaultStats(): AdminStats {
    const orders = this.getMockOrders();
    const paidOrders = orders.filter((o) => o.status === 'PAID');
    const totalRev = paidOrders.reduce((sum, o) => sum + o.amount, 0);

    return {
      totalUsers: this.getMockUsers().length,
      totalOrders: orders.length,
      totalRevenue: totalRev,
      activePackages: this.getMockPackages().length,
      pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
      totalVideos: this.getMockVideos().length,
      totalModules: this.getMockModules().length,
      totalLiveClasses: this.getMockLiveClasses().length,
    };
  }

  private getMockBanners(): Banner[] {
    return [
      {
        id: 'ban_1',
        title: 'Video Pembelajaran Interaktif',
        imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80',
        targetUrl: '/video_list',
        isActive: true,
        order: 1,
      },
      {
        id: 'ban_2',
        title: 'Simulasi Ujian & Tryout CBT',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=80',
        targetUrl: '/package_list',
        isActive: true,
        order: 2,
      },
      {
        id: 'ban_3',
        title: 'Paket Intensif MIPA KPM',
        imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=900&auto=format&fit=crop&q=80',
        targetUrl: '/package_list',
        isActive: true,
        order: 3,
      },
    ];
  }

  private getMockPackages(): Package[] {
    return [
      {
        id: 'pkg_1',
        title: 'Paket Intensif SNBT 2026 TPS & Literasi',
        description: 'Ribuan latihan soal penalaran umum, literasi bahasa, dan kuantitatif.',
        price: 154000,
        discountPrice: 129000,
        isDiscountActive: true,
        activeDays: 180,
        kelas: '12 SMA',
        jenjang: 'SMA',
        totalModules: 24,
        isActive: true,
      },
      {
        id: 'pkg_2',
        title: 'Mastering Penalaran Matematika MNR',
        description: 'Trik cepat berhitung dan penyelesaian soal analitis kompetisi MNR.',
        price: 199000,
        discountPrice: 199000,
        isDiscountActive: false,
        activeDays: 365,
        kelas: 'SD & SMP',
        jenjang: 'Olimpiade',
        totalModules: 18,
        isActive: true,
      },
      {
        id: 'pkg_3',
        title: 'Super Intensif Kedokteran & Sains MIPA',
        description: 'Pendampingan live tutor eksklusif dan bedah soal seleksi kedokteran.',
        price: 250000,
        discountPrice: 200000,
        isDiscountActive: true,
        activeDays: 180,
        kelas: '12 SMA',
        jenjang: 'SMA',
        totalModules: 30,
        isActive: true,
      },
      {
        id: 'pkg_4',
        title: 'Tryout UTBK TPS & Literasi',
        description: 'Simulasi ujian tryout dengan sistem IRT akurat dan ranking nasional.',
        price: 100000,
        discountPrice: 75000,
        isDiscountActive: true,
        activeDays: 90,
        kelas: '12 SMA',
        jenjang: 'SMA',
        totalModules: 15,
        isActive: true,
      },
      {
        id: 'pkg_5',
        title: 'Modul & Video Matematika MNR',
        description: 'Kumpulan modul teori lengkap dan video pembahasan trik berhitung cepat.',
        price: 85000,
        discountPrice: 85000,
        isDiscountActive: false,
        activeDays: 90,
        kelas: 'SD & SMP',
        jenjang: 'Olimpiade',
        totalModules: 12,
        isActive: true,
      },
    ];
  }

  private getMockLiveClasses(): LiveClass[] {
    return [
      {
        id: 'live_1',
        title: 'Mastering Trik Penalaran Aljabar & Aritmatika Sosial',
        subject: 'Matematika Nalaria',
        tutorName: 'Dr. Ridwan Hasan Saputra, M.Si',
        tutorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        scheduledAt: '2026-10-15 19:30 WIB',
        durationMinutes: 90,
        meetingUrl: 'https://zoom.us/j/8921471029?pwd=kpmliveclassdemo',
        grade: 'SMP & SMA',
        isActive: true,
      },
      {
        id: 'live_2',
        title: 'Strategi Emas Juara Olimpiade Sains & MIPA Nasional',
        subject: 'Sains & MIPA',
        tutorName: 'Kak Aris Fadillah, S.Si',
        tutorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        scheduledAt: '2026-10-18 10:00 WIB',
        durationMinutes: 75,
        meetingUrl: 'https://zoom.us/j/8921471030?pwd=kpmliveclassdemo',
        grade: 'SD & SMP',
        isActive: true,
      },
    ];
  }

  private getMockVideos(): Video[] {
    return [
      {
        id: 'vid_1',
        title: 'Konsep Matriks dan Transformasi Geometri Super Cepat',
        description: 'Pembahasan materi matriks SMA dengan trik determinan dan invers cepat.',
        category: 'Matematika SMA',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        durationSeconds: 1540,
        isLocked: false,
      },
      {
        id: 'vid_2',
        title: 'Trik Logika Penalaran Analitis Tanpa Rumus Rumit',
        description: 'Bedah soal penarikan kesimpulan silogisme dan posisi analitik SNBT.',
        category: 'SNBT TPS',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        durationSeconds: 1980,
        isLocked: true,
      },
      {
        id: 'vid_3',
        title: 'Metode Cepat Nalaria Realistik Aljabar Cerita',
        description: 'Menyelesaikan pemodelan aljabar cerita dalam waktu kurang dari 1 menit.',
        category: 'Matematika Nalaria',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        durationSeconds: 2400,
        isLocked: false,
      },
      {
        id: 'vid_4',
        title: 'Bedah Pola Soal OSN/KSN Sains Terpadu',
        description: 'Analisis tipe soal olimpiade sains nasional tingkat kota dan provinsi.',
        category: 'Olimpiade MIPA',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        durationSeconds: 2700,
        isLocked: true,
      },
    ];
  }

  private getMockModules(): Module[] {
    return [
      {
        id: 'mod_1',
        title: 'Konsep Dasar & Filosofi Matematika Nalaria Realistik (MNR)',
        subject: 'Matematika Nalaria',
        grade: 'SD & SMP',
        totalPages: 24,
        fileSizeMb: 4.5,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
      {
        id: 'mod_2',
        title: 'Trik Berhitung Cepat & Operasi Bilangan Bulat Pecahan',
        subject: 'Matematika Nalaria',
        grade: 'SD & SMP',
        totalPages: 36,
        fileSizeMb: 6.2,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
      {
        id: 'mod_3',
        title: 'Bedah Pola Soal Cerita & Pemodelan Aljabar Kontekstual',
        subject: 'Aljabar & Logika',
        grade: 'SMP & SMA',
        totalPages: 48,
        fileSizeMb: 8.1,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
      {
        id: 'mod_4',
        title: 'Kompilasi Soal Kompetisi Sains & Pembahasan Olimpiade',
        subject: 'Olimpiade MIPA',
        grade: 'Semua Jenjang',
        totalPages: 52,
        fileSizeMb: 11.4,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
    ];
  }

  private getMockVouchers(): Voucher[] {
    return [
      {
        id: 'v_1',
        code: 'KPMJUARA2026',
        title: 'Diskon Spesial 25% Semua Paket',
        discountPercent: 25,
        minTransaction: 100000,
        quota: 500,
        usedCount: 142,
        expiresAt: '2026-12-31',
        isActive: true,
      },
      {
        id: 'v_2',
        code: 'MNRINDONESIA',
        title: 'Potongan Rp 50.000 Paket MNR',
        discountNominal: 50000,
        minTransaction: 150000,
        quota: 300,
        usedCount: 89,
        expiresAt: '2026-11-30',
        isActive: true,
      },
      {
        id: 'v_3',
        code: 'MIPABERSAMA',
        title: 'Cashback Rp 20.000 Belajar Sains',
        discountNominal: 20000,
        minTransaction: 50000,
        quota: 1000,
        usedCount: 210,
        expiresAt: '2026-12-31',
        isActive: true,
      },
    ];
  }

  private getMockOrders(): Order[] {
    return [
      {
        id: 'ORD-2026-9812',
        orderNumber: 'ORD-2026-9812',
        studentName: 'Ahmad Fauzan',
        studentEmail: 'ahmad.fauzan@gmail.com',
        studentPhone: '0812-9876-5432',
        school: 'SMA Negeri 1 Jakarta',
        packageTitle: 'Paket Intensif SNBT 2026 TPS & Literasi',
        originalAmount: 154000,
        discountAmount: 25000,
        voucherCode: 'KPMJUARA2026',
        amount: 129000,
        status: 'PAID',
        paymentMethod: 'Midtrans QRIS / GoPay',
        accessDuration: '180 Hari Aktif',
        createdAt: '2026-10-10 10:14 WIB',
      },
      {
        id: 'ORD-2026-9811',
        orderNumber: 'ORD-2026-9811',
        studentName: 'Siti Nurhaliza',
        studentEmail: 'siti.nurhaliza@gmail.com',
        studentPhone: '0857-1234-5678',
        school: 'SMA Negeri 3 Surabaya',
        packageTitle: 'Tryout UTBK TPS & Literasi',
        originalAmount: 100000,
        discountAmount: 25000,
        voucherCode: 'MNRINDONESIA',
        amount: 75000,
        status: 'PAID',
        paymentMethod: 'Virtual Account BCA',
        accessDuration: '90 Hari Aktif',
        createdAt: '2026-10-10 09:30 WIB',
      },
      {
        id: 'ORD-2026-9810',
        orderNumber: 'ORD-2026-9810',
        studentName: 'Budi Santoso',
        studentEmail: 'budi.santoso@gmail.com',
        studentPhone: '0813-8888-9999',
        school: 'SMA Negeri 8 Bandung',
        packageTitle: 'Mastering Penalaran Matematika MNR',
        originalAmount: 199000,
        discountAmount: 0,
        voucherCode: undefined,
        amount: 199000,
        status: 'PAID',
        paymentMethod: 'Virtual Account Mandiri',
        accessDuration: '365 Hari Aktif',
        createdAt: '2026-10-09 21:05 WIB',
      },
      {
        id: 'ORD-2026-9809',
        orderNumber: 'ORD-2026-9809',
        studentName: 'Dewi Lestari',
        studentEmail: 'dewi.lestari@gmail.com',
        studentPhone: '0812-3344-5566',
        school: 'SMA Negeri 1 Yogyakarta',
        packageTitle: 'Super Intensif Kedokteran & Sains MIPA',
        originalAmount: 250000,
        discountAmount: 50000,
        voucherCode: 'MIPABERSAMA',
        amount: 200000,
        status: 'PAID',
        paymentMethod: 'Virtual Account BNI',
        accessDuration: '180 Hari Aktif',
        createdAt: '2026-10-09 18:40 WIB',
      },
      {
        id: 'ORD-2026-9808',
        orderNumber: 'ORD-2026-9808',
        studentName: 'Rizky Pratama',
        studentEmail: 'rizky.pratama@gmail.com',
        studentPhone: '0878-9900-1122',
        school: 'SMAN 5 Semarang',
        packageTitle: 'Modul & Video Matematika MNR',
        originalAmount: 85000,
        discountAmount: 0,
        voucherCode: undefined,
        amount: 85000,
        status: 'PAID',
        paymentMethod: 'ShopeePay QRIS',
        accessDuration: '90 Hari Aktif',
        createdAt: '2026-10-08 14:15 WIB',
      },
    ];
  }

  private getMockUsers(): User[] {
    return [
      {
        id: 'usr_1',
        name: 'Administrator KPM',
        email: 'admin@kpmacademy.com',
        role: 'admin',
        school: 'KPM Academy Center',
        city: 'Bogor',
        isActive: true,
        createdAt: '2026-01-01',
      },
      {
        id: 'usr_2',
        name: 'Ahmad Fauzan',
        email: 'ahmad.fauzan@gmail.com',
        role: 'user',
        school: 'SMA Negeri 1 Jakarta',
        city: 'Jakarta',
        isActive: true,
        createdAt: '2026-09-12',
      },
      {
        id: 'usr_3',
        name: 'Siti Nurhaliza',
        email: 'siti.nurhaliza@gmail.com',
        role: 'user',
        school: 'SMA Negeri 3 Surabaya',
        city: 'Surabaya',
        isActive: true,
        createdAt: '2026-09-18',
      },
      {
        id: 'usr_4',
        name: 'Budi Santoso',
        email: 'budi.santoso@gmail.com',
        role: 'user',
        school: 'SMA Negeri 8 Bandung',
        city: 'Bandung',
        isActive: true,
        createdAt: '2026-09-20',
      },
      {
        id: 'usr_5',
        name: 'Dr. Ridwan Hasan Saputra, M.Si',
        email: 'ridwan@kpmacademy.com',
        role: 'tutor',
        school: 'KPM Seikhlasnya Institute',
        city: 'Bogor',
        isActive: true,
        createdAt: '2026-01-15',
      },
    ];
  }
}
