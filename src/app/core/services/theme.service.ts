import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  isDarkMode = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('kpm_theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark;
      this.setTheme(initialDark);
    }
  }

  setTheme(dark: boolean): void {
    this.isDarkMode.set(dark);
    if (typeof document !== 'undefined') {
      if (dark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('kpm_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('kpm_theme', 'light');
      }
    }
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkMode());
  }
}
