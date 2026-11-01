'use client';

import React from 'react';
import { Menu, Database, ShieldCheck, Moon, Sun, School } from 'lucide-react';
import { SystemSettings, UserProfile } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase';

interface HeaderProps {
  onToggleSidebar: () => void;
  settings: SystemSettings;
  user: UserProfile | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({
  onToggleSidebar,
  settings,
  user,
  theme,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 transition-colors print:hidden">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg md:hidden transition"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400 hidden sm:block" />
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <span className="font-bold text-slate-900 dark:text-white text-base">
              {settings.collegeName || 'Lord Universal College'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 self-start sm:self-auto">
              AY {settings.academicYear || '2026-27'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Supabase Status Badge */}
        <div
          title={
            isSupabaseConfigured
              ? 'Connected to live Supabase PostgreSQL backend'
              : 'Running in Local Storage / In-memory Mode. Add NEXT_PUBLIC_SUPABASE_URL and KEY in .env.local to link cloud database.'
          }
          className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            isSupabaseConfigured
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isSupabaseConfigured ? 'Supabase Sync Active' : 'Offline / Demo Data Mode'}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {user.username.substring(0, 2)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                {user.role}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
