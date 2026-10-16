import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CMSComponent } from './pages/cms/cms.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { UsersComponent } from './pages/users/users.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { TryoutsComponent } from './pages/tryouts/tryouts.component';
import { SupportComponent } from './pages/support/support.component';
import { TestimonialsComponent } from './pages/testimonials/testimonials.component';
import { EnrollKeysComponent } from './pages/enroll-keys/enroll-keys.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
      },
      {
        path: 'cms',
        pathMatch: 'full',
        redirectTo: 'banners',
      },
      {
        path: 'banners',
        component: CMSComponent,
        data: { tab: 'banner' },
      },
      {
        path: 'packages',
        component: CMSComponent,
        data: { tab: 'package' },
      },
      {
        path: 'live-classes',
        component: CMSComponent,
        data: { tab: 'live' },
      },
      {
        path: 'videos',
        component: CMSComponent,
        data: { tab: 'video' },
      },
      {
        path: 'modules',
        component: CMSComponent,
        data: { tab: 'module' },
      },
      {
        path: 'vouchers',
        component: CMSComponent,
        data: { tab: 'voucher' },
      },
      {
        path: 'orders',
        component: OrdersComponent,
      },
      {
        path: 'enroll-keys',
        component: EnrollKeysComponent,
      },
      {
        path: 'tryouts',
        component: TryoutsComponent,
      },
      {
        path: 'testimonials',
        component: TestimonialsComponent,
      },
      {
        path: 'support',
        component: SupportComponent,
      },
      {
        path: 'users',
        component: UsersComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
