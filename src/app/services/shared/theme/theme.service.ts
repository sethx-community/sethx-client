import { Injectable, signal } from '@angular/core';

export type SethxTheme = 'dark' | 'light';

const STORAGE_KEY = 'sethx.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<SethxTheme>('dark');

  constructor() {
    const stored = this.readStoredTheme();
    this.theme.set(stored);
    this.applyTheme(stored);
  }

  setTheme(theme: SethxTheme): void {
    this.theme.set(theme);
    this.applyTheme(theme);
    this.storeTheme(theme);
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }

  isLight(): boolean {
    return this.theme() === 'light';
  }

  private readStoredTheme(): SethxTheme {
    if (typeof window === 'undefined') return 'dark';

    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'light' ? 'light' : 'dark';
  }

  private storeTheme(theme: SethxTheme): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }

  private applyTheme(theme: SethxTheme): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.toggle('theme-light', theme === 'light');
    root.classList.toggle('theme-dark', theme === 'dark');
    root.dataset['sethxTheme'] = theme;
  }
}
