export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user' | 'tutor';
  school?: string;
  city?: string;
  isActive?: boolean;
  is_active?: boolean;
  avatar?: string;
  createdAt?: string;
  created_at?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activePackages: number;
  pendingOrders?: number;
  totalVideos?: number;
  totalModules?: number;
  totalLiveClasses?: number;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl?: string;
  image_url?: string;
  targetUrl?: string;
  target_url?: string;
  isActive?: boolean;
  is_active?: boolean;
  order?: number;
  createdAt?: string;
}

export interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  discount_price?: number;
  isDiscountActive?: boolean;
  is_discount_active?: boolean;
  activeDays?: number;
  active_days?: number;
  category?: string;
  kelas?: string;
  jenjang?: string;
  totalModules?: number;
  total_modules?: number;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  features?: string[];
  isActive?: boolean;
  is_active?: boolean;
}

export interface LiveClass {
  id: string;
  title: string;
  subject: string;
  tutorName?: string;
  tutor_name?: string;
  tutorAvatar?: string;
  tutor_avatar?: string;
  scheduledAt?: string;
  scheduled_at?: string;
  durationMinutes?: number;
  duration_minutes?: number;
  meetingUrl?: string;
  meeting_url?: string;
  grade?: string;
  isActive?: boolean;
  is_active?: boolean;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  category: string;
  videoUrl?: string;
  video_url?: string;
  durationSeconds?: number;
  duration_seconds?: number;
  isLocked?: boolean;
  is_locked?: boolean;
  order?: number;
  thumbnailUrl?: string;
  thumbnail_url?: string;
}

export interface Module {
  id: string;
  title: string;
  subject: string;
  grade?: string;
  fileUrl?: string;
  file_url?: string;
  totalPages?: number;
  total_pages?: number;
  fileSizeMb?: number;
  file_size_mb?: number;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  discountPercent?: number;
  discount_percent?: number;
  discountNominal?: number;
  discount_nominal?: number;
  minTransaction?: number;
  min_transaction?: number;
  quota?: number;
  usedCount?: number;
  used_count?: number;
  expiresAt?: string;
  expires_at?: string;
  isActive?: boolean;
  is_active?: boolean;
}

export interface Order {
  id: string;
  orderNumber?: string;
  order_number?: string;
  userId?: string;
  user_id?: string;
  studentName?: string;
  student_name?: string;
  studentEmail?: string;
  student_email?: string;
  studentPhone?: string;
  student_phone?: string;
  school?: string;
  packageId?: string;
  package_id?: string;
  packageTitle?: string;
  package_title?: string;
  amount: number;
  originalAmount?: number;
  original_amount?: number;
  discountAmount?: number;
  discount_amount?: number;
  voucherCode?: string;
  voucher_code?: string;
  status: 'PENDING' | 'PAID' | 'SETTLEMENT' | 'CANCELLED' | 'EXPIRED';
  paymentMethod?: string;
  payment_method?: string;
  paymentType?: string;
  payment_type?: string;
  snapToken?: string;
  snap_token?: string;
  snapRedirectUrl?: string;
  snap_redirect_url?: string;
  accessDuration?: string;
  access_duration?: string;
  createdAt?: string;
  created_at?: string;
  paidAt?: string;
  paid_at?: string;
}
