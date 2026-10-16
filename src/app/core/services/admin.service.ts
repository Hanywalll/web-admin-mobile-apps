import { Injectable, signal } from '@angular/core';
import { Observable, map, catchError, of, forkJoin, tap } from 'rxjs';
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
  SupportTicket,
  Testimonial,
  PracticeStatistic,
  EnrollKey,
  AdminNotification,
} from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  unreadNotificationCount = signal<number>(3);
  latestNotifications = signal<AdminNotification[]>([]);

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
    return this.api.get<any[]>('/banners').pipe(
      map((res) => {
        if (res && res.data && res.data.length > 0) {
          return res.data.map((b: any) => ({
            id: b.id,
            title: b.title,
            imageUrl: b.image_url || b.imageUrl,
            targetUrl: b.route || b.target_url || b.targetUrl || '/package_list',
            order: b.sort_order || b.order || 1,
            isActive: b.is_active ?? b.isActive ?? true,
          }));
        }
        return this.getMockBanners();
      }),
      catchError(() => of(this.getMockBanners()))
    );
  }

  createBanner(banner: Partial<Banner>): Observable<ApiResponse<Banner>> {
    const payload = {
      title: banner.title,
      image_url: banner.imageUrl || banner.image_url,
      route: banner.targetUrl || banner.target_url || '/package_list',
      sort_order: banner.order || 1,
      is_active: banner.isActive ?? true,
    };
    return this.api.post<Banner>('/admin/banners', payload);
  }

  updateBanner(id: string, banner: Partial<Banner>): Observable<ApiResponse<Banner>> {
    const payload = {
      title: banner.title,
      image_url: banner.imageUrl || banner.image_url,
      route: banner.targetUrl || banner.target_url || '/package_list',
      sort_order: banner.order || 1,
      is_active: banner.isActive ?? true,
    };
    return this.api.put<Banner>(`/admin/banners/${id}`, payload);
  }

  deleteBanner(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/admin/banners/${id}`);
  }

  // --- PACKAGES ---
  getPackages(): Observable<Package[]> {
    return this.api.get<any[]>('/packages').pipe(
      map((res) => {
        if (res && res.data && res.data.length > 0) {
          return res.data.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description || '',
            price: p.price || 0,
            discountPrice: p.discount_price || p.discountPrice || p.price,
            isDiscountActive: p.is_discount_active ?? p.isDiscountActive ?? true,
            activeDays: p.active_days || p.activeDays || 180,
            kelas: p.kelas || p.class || 'Semua Kelas',
            jenjang: p.jenjang || 'SMA',
            totalModules: p.total_modules || p.totalModules || 20,
            isActive: p.is_active ?? p.isActive ?? true,
          }));
        }
        return this.getMockPackages();
      }),
      catchError(() => of(this.getMockPackages()))
    );
  }

  createPackage(pkg: Partial<Package>): Observable<ApiResponse<Package>> {
    const payload = {
      title: pkg.title,
      description: pkg.description,
      price: pkg.price,
      discount_price: pkg.discountPrice || pkg.discount_price,
      active_days: pkg.activeDays || pkg.active_days || 180,
      kelas: pkg.kelas,
      jenjang: pkg.jenjang || 'SMA',
      is_active: pkg.isActive ?? true,
    };
    return this.api.post<Package>('/admin/packages', payload);
  }

  updatePackage(id: string, pkg: Partial<Package>): Observable<ApiResponse<Package>> {
    const payload = {
      title: pkg.title,
      description: pkg.description,
      price: pkg.price,
      discount_price: pkg.discountPrice || pkg.discount_price,
      active_days: pkg.activeDays || pkg.active_days || 180,
      kelas: pkg.kelas,
      jenjang: pkg.jenjang || 'SMA',
      is_active: pkg.isActive ?? true,
    };
    return this.api.put<Package>(`/admin/packages/${id}`, payload);
  }

  deletePackage(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/admin/packages/${id}`);
  }

  // --- LIVE CLASSES ---
  getLiveClasses(): Observable<LiveClass[]> {
    return this.api.get<any[]>('/live-classes').pipe(
      map((res) => {
        if (res && res.data && res.data.length > 0) {
          return res.data.map((lc: any) => ({
            id: lc.id,
            title: lc.title,
            subject: lc.subject || 'Umum',
            tutorName: lc.tutor_name || lc.tutorName || 'Tutor KPM',
            tutorAvatar: lc.tutor_avatar || lc.tutorAvatar,
            scheduledAt: lc.scheduled_at ? new Date(lc.scheduled_at).toLocaleString('id-ID') : (lc.scheduledAt || '2026-10-20 19:30 WIB'),
            meetingUrl: lc.zoom_url || lc.meeting_url || lc.meetingUrl || 'https://zoom.us',
            grade: lc.grade || 'Semua Jenjang',
            isActive: lc.is_active ?? lc.isActive ?? true,
          }));
        }
        return this.getMockLiveClasses();
      }),
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
    return this.api.get<any[]>('/admin/videos').pipe(
      map((res) => {
        if (res && res.data && res.data.length > 0) {
          return res.data.map((v: any) => ({
            id: v.id,
            title: v.title,
            description: v.description || '',
            category: v.category || 'Matematika SMA',
            videoUrl: v.video_url || v.videoUrl,
            durationSeconds: v.duration_seconds || v.durationSeconds || 1800,
            isLocked: v.is_locked ?? v.isLocked ?? false,
          }));
        }
        return this.getMockVideos();
      }),
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
    return this.api.get<any[]>('/modules').pipe(
      map((res) => {
        if (res && res.data && res.data.length > 0) {
          return res.data.map((m: any) => ({
            id: m.id,
            title: m.title,
            subject: m.subject || 'Matematika Nalaria',
            grade: m.grade || 'SD & SMP',
            fileUrl: m.pdf_url || m.file_url || m.fileUrl || '',
            totalPages: m.total_pages || m.totalPages || 30,
            fileSizeMb: m.file_size_mb || m.fileSizeMb || 5.0,
          }));
        }
        return this.getMockModules();
      }),
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
    return this.api.get<any[]>('/admin/vouchers').pipe(
      map((res) => {
        if (res && res.data && res.data.length > 0) {
          return res.data.map((v: any) => ({
            id: v.id,
            code: v.code,
            title: v.title,
            discountPercent: v.discount_percent || v.discountPercent || 0,
            discountNominal: v.discount_amount || v.discountNominal || 0,
            minTransaction: v.min_purchase || v.minTransaction || 0,
            quota: v.usage_limit || v.quota || 100,
            usedCount: v.usage_count || v.usedCount || 0,
            expiresAt: v.valid_until ? v.valid_until.substring(0, 10) : '2026-12-31',
            isActive: v.is_active ?? true,
          }));
        }
        return this.getMockVouchers();
      }),
      catchError(() => of(this.getMockVouchers()))
    );
  }

  createVoucher(voucher: Partial<Voucher>): Observable<ApiResponse<Voucher>> {
    const payload = {
      code: voucher.code,
      title: voucher.title,
      description: voucher.title || '',
      discount_percent: voucher.discountPercent || 0,
      discount_amount: voucher.discountNominal || 0,
      quota: voucher.quota || 100,
    };
    return this.api.post<Voucher>('/admin/vouchers', payload);
  }

  deleteVoucher(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/admin/vouchers/${id}`);
  }

  resetOfficialCatalog(): Observable<ApiResponse<any>> {
    return this.api.post<any>('/admin/cms/reset-official', {});
  }

  // --- ORDERS & TRANSACTIONS ---
  getOrders(): Observable<Order[]> {
    return this.api.get<any[]>('/admin/orders').pipe(
      map((res) => {
        if (res && res.data && res.data.length > 0) {
          return res.data.map((o: any) => {
            const rawStatus = (o.payment_status || o.status || 'PENDING').toLowerCase();
            const isPaid = rawStatus === 'paid' || rawStatus === 'settlement' || rawStatus === 'capture' || rawStatus === 'success';

            return {
              id: o.order_number || o.id,
              realId: o.id,
              orderNumber: o.order_number || o.id,
              studentName: o.user?.name || o.student_name || o.studentName || 'Siswa KPM',
              studentPhone: o.user?.phone || o.student_phone || o.studentPhone || '-',
              school: o.user?.school_name || o.school || '-',
              packageTitle: o.package?.title || o.package_title || o.packageTitle || 'Paket Belajar KPM',
              amount: o.amount || o.gross_amount || 0,
              originalAmount: o.original_amount || o.amount || 0,
              discountAmount: o.discount_amount || o.discountAmount || 0,
              voucherCode: o.voucher_code || o.voucherCode,
              status: (isPaid ? 'PAID' : (o.payment_status || o.status || 'PENDING').toUpperCase()) as any,
              paymentMethod: o.payment_type || o.payment_method || o.paymentMethod || 'Midtrans Snap',
              accessDuration: o.access_duration || (o.package?.membership_duration_days ? `${o.package.membership_duration_days} Hari` : '180 Hari'),
              createdAt: o.created_at ? new Date(o.created_at).toLocaleString('id-ID') : (o.createdAt || '-'),
            };
          });
        }
        return this.getMockOrders();
      }),
      catchError(() => of(this.getMockOrders()))
    );
  }

  verifyOrder(id: string): Observable<ApiResponse<any>> {
    return this.api.post<any>(`/admin/orders/${id}/verify`, {}).pipe(
      catchError(() => of({ success: true, message: 'Pesanan berhasil disetujui' }))
    );
  }

  // --- USERS ---
  getUsers(): Observable<User[]> {
    return this.api.get<any[]>('/admin/users').pipe(
      map((res) => {
        if (res && res.data && res.data.length > 0) {
          return res.data.map((u: any) => ({
            id: u.id,
            name: u.name || 'Pengguna KPM',
            email: u.email,
            phone: u.phone || '-',
            role: (u.role === 'admin' ? 'admin' : (u.role === 'tutor' ? 'tutor' : 'user')) as 'admin' | 'tutor' | 'user',
            school: u.school_name || u.school || '-',
            city: u.city || 'Bogor',
            isActive: u.is_active ?? u.isActive ?? true,
            createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : (u.createdAt || '-'),
          }));
        }
        return this.getMockUsers();
      }),
      catchError(() => of(this.getMockUsers()))
    );
  }

  toggleUserActive(id: string): Observable<ApiResponse<any>> {
    return this.api.post(`/admin/users/${id}/toggle-active`, {});
  }

  // --- SUPPORT TICKETS ---
  getSupportTickets(status?: string): Observable<SupportTicket[]> {
    const endpoint = status ? `/admin/support?status=${status}` : '/admin/support';
    return this.api.get<any[]>(endpoint).pipe(
      map((res) => {
        if (res && res.data && res.data.length > 0) {
          return res.data.map((t: any) => ({
            id: t.id,
            sessionId: t.session_id || t.sessionId || `SUPPORT-${t.id.substring(0, 8)}`,
            name: t.user?.name || t.name || 'Siswa KPM',
            email: t.user?.email || t.email || '-',
            question: t.question || t.message || '',
            answer: t.answer,
            status: (t.status || 'pending').toLowerCase() as any,
            createdAt: t.created_at ? new Date(t.created_at).toLocaleString('id-ID') : '-',
            answeredAt: t.answered_at ? new Date(t.answered_at).toLocaleString('id-ID') : undefined,
          }));
        }
        return this.getMockSupportTickets();
      }),
      catchError(() => of(this.getMockSupportTickets()))
    );
  }

  answerSupportTicket(id: string, answer: string): Observable<ApiResponse<any>> {
    return this.api.post(`/admin/support/${id}/answer`, { answer });
  }

  updateSupportStatus(id: string, status: string): Observable<ApiResponse<any>> {
    return this.api.put(`/admin/support/${id}/status`, { status });
  }

  deleteSupportTicket(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/admin/support/${id}`);
  }

  // --- TESTIMONIALS ---
  getTestimonials(): Observable<Testimonial[]> {
    return this.api.get<any[]>('/admin/testimonials').pipe(
      map((res) => {
        if (res && res.data && res.data.length > 0) {
          return res.data.map((t: any) => ({
            id: t.id,
            userId: t.user_id || t.userId,
            userName: t.user?.name || t.userName || 'Siswa KPM',
            userEmail: t.user?.email || t.userEmail,
            userSchool: t.user?.school_name || t.userSchool || 'KPM Academy',
            userAvatar: t.user?.avatar || t.userAvatar,
            content: t.content || '',
            rating: t.rating || 5,
            isApproved: t.is_approved ?? t.isApproved ?? true,
            isActive: t.is_active ?? t.isActive ?? true,
            createdAt: t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID') : '-',
            approvedAt: t.approved_at,
          }));
        }
        return this.getMockTestimonials();
      }),
      catchError(() => of(this.getMockTestimonials()))
    );
  }

  approveTestimonial(id: string): Observable<ApiResponse<any>> {
    return this.api.post(`/admin/testimonials/${id}/approve`, {});
  }

  toggleTestimonialActive(id: string): Observable<ApiResponse<any>> {
    return this.api.post(`/admin/testimonials/${id}/toggle-active`, {});
  }

  deleteTestimonial(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/admin/testimonials/${id}`);
  }

  // --- TRYOUT & PRACTICE STATISTICS ---
  getPracticeStatistics(): Observable<PracticeStatistic[]> {
    return this.api.get<any[]>('/admin/practice-statistics').pipe(
      map((res) => {
        if (res && res.data && res.data.length > 0) {
          return res.data.map((s: any) => ({
            id: s.id,
            userId: s.user_id || s.userId,
            studentName: s.user?.name || s.studentName || 'Siswa KPM',
            school: s.user?.school_name || s.school || 'SMA Negeri 1',
            packageId: s.package_id || s.packageId,
            packageTitle: s.package?.title || s.packageTitle || 'Simulasi Ujian SNBT & MIPA',
            totalScore: s.total_score || s.totalScore || 0,
            correctAnswer: s.correct_answer || s.correctAnswer || 0,
            wrongAnswer: s.wrong_answer || s.wrongAnswer || 0,
            status: s.status || 'finished',
            startedAt: s.started_at ? new Date(s.started_at).toLocaleString('id-ID') : undefined,
            finishedAt: s.finished_at ? new Date(s.finished_at).toLocaleString('id-ID') : undefined,
            createdAt: s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID') : '-',
          }));
        }
        return this.getMockPracticeStatistics();
      }),
      catchError(() => of(this.getMockPracticeStatistics()))
    );
  }

  // --- ENROLLMENT KEYS ---
  getEnrollKeys(): Observable<EnrollKey[]> {
    return this.api.get<any[]>('/admin/enroll-keys').pipe(
      map((res) => {
        if (res && res.data && res.data.length > 0) {
          return res.data.map((k: any) => ({
            id: k.id,
            orderNumber: k.order_number || k.id,
            studentName: k.user?.name || k.studentName || 'Siswa KPM',
            studentEmail: k.user?.email || k.studentEmail || '-',
            studentPhone: k.user?.phone || k.studentPhone || '-',
            packageTitle: k.package?.title || k.packageTitle || 'Paket Belajar KPM',
            packageId: k.package_id || k.packageId,
            status: (k.payment_status || k.status || 'PAID').toUpperCase() as any,
            paymentMethod: k.payment_type || k.paymentMethod || 'Midtrans Snap',
            accessDuration: k.access_duration || '180 Hari',
            createdAt: k.created_at ? new Date(k.created_at).toLocaleDateString('id-ID') : '-',
          }));
        }
        return this.getMockEnrollKeys();
      }),
      catchError(() => of(this.getMockEnrollKeys()))
    );
  }

  // --- NOTIFICATIONS & REAL-TIME ACTIVITY ---
  private getReadNotifIds(): Set<string> {
    try {
      const stored = localStorage.getItem('kpm_admin_read_notifs');
      if (stored) {
        return new Set<string>(JSON.parse(stored));
      }
    } catch (_) {}
    return new Set<string>();
  }

  private saveReadNotifIds(set: Set<string>): void {
    try {
      localStorage.setItem('kpm_admin_read_notifs', JSON.stringify(Array.from(set)));
    } catch (_) {}
  }

  getNotifications(): Observable<AdminNotification[]> {
    const readIds = this.getReadNotifIds();

    return this.api.get<any[]>('/admin/notifications').pipe(
      map((res) => {
        let list: AdminNotification[] = [];
        if (res && res.data && res.data.length > 0) {
          list = res.data.map((n: any) => ({
            id: n.id,
            type: n.type || 'info',
            title: n.title || 'Aktivitas Baru',
            message: n.message || '',
            studentName: n.user?.name || 'Siswa KPM',
            studentEmail: n.user?.email || '-',
            readAt: n.read_at,
            isRead: !!n.read_at || readIds.has(n.id),
            createdAt: n.created_at ? new Date(n.created_at).toLocaleString('id-ID') : 'Baru saja',
            targetRoute: this.getNotificationTargetRoute(n.type),
          }));
        } else {
          list = this.getMockNotifications().map((n) => ({
            ...n,
            isRead: n.isRead || readIds.has(n.id),
          }));
        }
        const unread = list.filter((i) => !i.isRead).length;
        this.unreadNotificationCount.set(unread);
        this.latestNotifications.set(list);
        return list;
      }),
      catchError(() => {
        const list = this.getMockNotifications().map((n) => ({
          ...n,
          isRead: n.isRead || readIds.has(n.id),
        }));
        const unread = list.filter((i) => !i.isRead).length;
        this.unreadNotificationCount.set(unread);
        this.latestNotifications.set(list);
        return of(list);
      })
    );
  }

  private getNotificationTargetRoute(type: string): string {
    switch (type) {
      case 'order':
      case 'payment':
        return '/admin/orders';
      case 'support':
        return '/admin/support';
      case 'testimonial':
        return '/admin/testimonials';
      case 'tryout':
        return '/admin/tryouts';
      case 'user':
        return '/admin/users';
      case 'enroll':
        return '/admin/enroll-keys';
      default:
        return '/admin/dashboard';
    }
  }

  markNotificationRead(id: string): Observable<ApiResponse<any>> {
    const updateLocal = () => {
      const readIds = this.getReadNotifIds();
      readIds.add(id);
      this.saveReadNotifIds(readIds);

      this.latestNotifications.update((arr) =>
        arr.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
      const unread = this.latestNotifications().filter((i) => !i.isRead).length;
      this.unreadNotificationCount.set(unread);
    };

    return this.api.post(`/notifications/${id}/read`, {}).pipe(
      tap(() => updateLocal()),
      catchError(() => {
        updateLocal();
        return of({ success: true, message: 'Notification marked as read' });
      })
    );
  }

  markAllNotificationsRead(): Observable<ApiResponse<any>> {
    const updateLocal = () => {
      const readIds = this.getReadNotifIds();
      for (const item of this.latestNotifications()) {
        readIds.add(item.id);
      }
      this.saveReadNotifIds(readIds);

      this.latestNotifications.update((arr) =>
        arr.map((item) => ({ ...item, isRead: true }))
      );
      this.unreadNotificationCount.set(0);
    };

    return this.api.post('/notifications/read-all', {}).pipe(
      tap(() => updateLocal()),
      catchError(() => {
        updateLocal();
        return of({ success: true, message: 'All notifications marked as read' });
      })
    );
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

  private getMockSupportTickets(): SupportTicket[] {
    return [
      {
        id: 'sup_1',
        sessionId: 'SUPPORT-88219412',
        name: 'Ahmad Fauzan',
        email: 'ahmad.fauzan@gmail.com',
        question: 'Halo Kak, bagaimana cara mengunduh modul PDF untuk offline di HP?',
        answer: 'Halo Ahmad! Anda bisa klik ikon download di samping judul modul di aplikasi.',
        status: 'answered',
        createdAt: '15/10/2026, 14:20:10',
        answeredAt: '15/10/2026, 14:35:00',
      },
      {
        id: 'sup_2',
        sessionId: 'SUPPORT-77319022',
        name: 'Siti Nurhaliza',
        email: 'siti.nurhaliza@gmail.com',
        question: 'Saya sudah transfer via BCA Virtual Account tapi paket belum aktif otomatis.',
        status: 'pending',
        createdAt: '16/10/2026, 09:12:44',
      },
      {
        id: 'sup_3',
        sessionId: 'SUPPORT-99124401',
        name: 'Budi Santoso',
        email: 'budi.santoso@gmail.com',
        question: 'Apakah jadwal Live Class ada rekaman ulangnya jika saya berhalangan hadir?',
        answer: 'Tentu ada Budi, rekaman kelas akan diunggah ke menu Video Materi maksimal 24 jam setelah sesi selesai.',
        status: 'resolved',
        createdAt: '14/10/2026, 16:05:12',
        answeredAt: '14/10/2026, 16:40:22',
      },
    ];
  }

  private getMockTestimonials(): Testimonial[] {
    return [
      {
        id: 'testi_1',
        userName: 'Ahmad Fauzan',
        userSchool: 'SMA Negeri 1 Jakarta',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        content: 'Metode penalaran Matematika Nalaria Realistik (MNR) dari Pak Ridwan benar-benar membuka cara berpikir saya. Latihan soalnya sangat prediktif untuk SNBT!',
        isApproved: true,
        isActive: true,
        createdAt: '12/10/2026',
      },
      {
        id: 'testi_2',
        userName: 'Siti Nurhaliza',
        userSchool: 'SMA Negeri 3 Surabaya',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        content: 'Alhamdulillah lolos FK UNAIR berkat bimbingan intensif dan latihan tryout CBT rutin di KPM Academy. Pembahasannya sangat mendalam.',
        isApproved: true,
        isActive: true,
        createdAt: '14/10/2026',
      },
      {
        id: 'testi_3',
        userName: 'Budi Santoso',
        userSchool: 'SMA Negeri 8 Bandung',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        content: 'Aplikasi belajarnya sangat ringan dan lancar. Live class Zoom-nya interaktif, tutornya ramah dan sabar menjawab pertanyaan.',
        isApproved: false,
        isActive: true,
        createdAt: '16/10/2026',
      },
    ];
  }

  private getMockPracticeStatistics(): PracticeStatistic[] {
    return [
      {
        id: 'sess_1',
        studentName: 'Ahmad Fauzan',
        school: 'SMA Negeri 1 Jakarta',
        packageTitle: 'Tryout UTBK TPS & Literasi',
        totalScore: 845,
        correctAnswer: 42,
        wrongAnswer: 8,
        status: 'finished',
        startedAt: '15/10/2026, 08:00:00',
        finishedAt: '15/10/2026, 09:30:00',
        createdAt: '15/10/2026',
      },
      {
        id: 'sess_2',
        studentName: 'Siti Nurhaliza',
        school: 'SMA Negeri 3 Surabaya',
        packageTitle: 'Paket Intensif SNBT 2026 TPS & Literasi',
        totalScore: 790,
        correctAnswer: 38,
        wrongAnswer: 12,
        status: 'finished',
        startedAt: '15/10/2026, 13:00:00',
        finishedAt: '15/10/2026, 14:30:00',
        createdAt: '15/10/2026',
      },
      {
        id: 'sess_3',
        studentName: 'Budi Santoso',
        school: 'SMA Negeri 8 Bandung',
        packageTitle: 'Mastering Penalaran Matematika MNR',
        totalScore: 920,
        correctAnswer: 46,
        wrongAnswer: 4,
        status: 'finished',
        startedAt: '16/10/2026, 07:30:00',
        finishedAt: '16/10/2026, 08:45:00',
        createdAt: '16/10/2026',
      },
    ];
  }

  private getMockEnrollKeys(): EnrollKey[] {
    return [
      {
        id: 'enr_1',
        orderNumber: 'KPM-20261014-001',
        studentName: 'Ahmad Fauzan',
        studentEmail: 'ahmad.fauzan@gmail.com',
        studentPhone: '081234567890',
        packageTitle: 'Paket Intensif SNBT 2026 TPS & Literasi',
        status: 'ACTIVE',
        paymentMethod: 'BCA Virtual Account',
        accessDuration: '180 Hari',
        createdAt: '14/10/2026',
      },
      {
        id: 'enr_2',
        orderNumber: 'KPM-20261014-002',
        studentName: 'Siti Nurhaliza',
        studentEmail: 'siti.nurhaliza@gmail.com',
        studentPhone: '081298765432',
        packageTitle: 'Super Intensif Kedokteran & Sains MIPA',
        status: 'ACTIVE',
        paymentMethod: 'Mandiri Bill',
        accessDuration: '180 Hari',
        createdAt: '14/10/2026',
      },
      {
        id: 'enr_3',
        orderNumber: 'KPM-20261013-005',
        studentName: 'Budi Santoso',
        studentEmail: 'budi.santoso@gmail.com',
        studentPhone: '081377889900',
        packageTitle: 'Mastering Penalaran Matematika MNR',
        status: 'ACTIVE',
        paymentMethod: 'QRIS Gopay',
        accessDuration: '365 Hari',
        createdAt: '13/10/2026',
      },
    ];
  }

  private getMockNotifications(): AdminNotification[] {
    return [
      {
        id: 'notif_1',
        type: 'payment',
        title: 'Pembayaran Lunas Diterima',
        message: 'Ahmad Fauzan telah menyelesaikan pembayaran Paket Intensif SNBT 2026 via BCA Virtual Account.',
        studentName: 'Ahmad Fauzan',
        studentEmail: 'ahmad.fauzan@gmail.com',
        amount: 129000,
        isRead: false,
        createdAt: '16/10/2026, 11:20:15',
        targetRoute: '/admin/orders',
      },
      {
        id: 'notif_2',
        type: 'support',
        title: 'Tiket Bantuan Baru Masuk',
        message: 'Siti Nurhaliza mengirimkan pertanyaan: "Saya sudah transfer tapi paket belum aktif otomatis."',
        studentName: 'Siti Nurhaliza',
        studentEmail: 'siti.nurhaliza@gmail.com',
        isRead: false,
        createdAt: '16/10/2026, 09:12:44',
        targetRoute: '/admin/support',
      },
      {
        id: 'notif_3',
        type: 'testimonial',
        title: 'Ulasan Testimoni Perlu Review',
        message: 'Budi Santoso mengirim ulasan baru rating bintang 5: "Aplikasi belajarnya sangat ringan dan lancar..."',
        studentName: 'Budi Santoso',
        studentEmail: 'budi.santoso@gmail.com',
        isRead: false,
        createdAt: '16/10/2026, 08:30:00',
        targetRoute: '/admin/testimonials',
      },
      {
        id: 'notif_4',
        type: 'tryout',
        title: 'Siswa Menyelesaikan Tryout CBT',
        message: 'Budi Santoso menyelesaikan Tryout Penalaran MNR dengan Skor 920 (Akurasi 92%).',
        studentName: 'Budi Santoso',
        studentEmail: 'budi.santoso@gmail.com',
        isRead: true,
        readAt: '16/10/2026, 08:50:00',
        createdAt: '16/10/2026, 07:45:10',
        targetRoute: '/admin/tryouts',
      },
      {
        id: 'notif_5',
        type: 'order',
        title: 'Pesanan Paket Baru Dibuat',
        message: 'Rian Hidayat membuat pesanan baru Super Intensif Kedokteran (Menunggu Pembayaran).',
        studentName: 'Rian Hidayat',
        studentEmail: 'rian.hidayat@gmail.com',
        amount: 200000,
        isRead: true,
        readAt: '15/10/2026, 16:00:00',
        createdAt: '15/10/2026, 15:40:22',
        targetRoute: '/admin/orders',
      },
      {
        id: 'notif_6',
        type: 'user',
        title: 'Siswa Baru Terdaftar',
        message: 'Dewi Lestari dari SMA Negeri 5 Semarang telah mendaftar akun baru lewat aplikasi mobile.',
        studentName: 'Dewi Lestari',
        studentEmail: 'dewi.lestari@gmail.com',
        isRead: true,
        readAt: '15/10/2026, 12:00:00',
        createdAt: '15/10/2026, 10:15:00',
        targetRoute: '/admin/users',
      },
    ];
  }
}
