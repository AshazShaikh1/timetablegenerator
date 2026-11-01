'use client';

import React, { useState } from 'react';
import {
  Settings,
  Database,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { SystemSettings } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase';
import { resetToSampleData } from '@/lib/storage';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface SettingsViewProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  currentTheme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function SettingsView({
  settings,
  onUpdateSettings,
  currentTheme,
  onThemeChange,
}: SettingsViewProps) {
  const { success, info } = useToast();
  const [collegeName, setCollegeName] = useState(settings.collegeName);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [selectedTheme, setSelectedTheme] = useState(settings.theme || 'system');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [hasCopiedSql, setHasCopiedSql] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const updated: SystemSettings = {
      ...settings,
      collegeName: collegeName.trim(),
      academicYear: academicYear.trim(),
      theme: selectedTheme,
    };
    onUpdateSettings(updated);

    if (selectedTheme === 'light' || selectedTheme === 'dark') {
      onThemeChange(selectedTheme);
    }
    success('Settings Saved', 'College details and display settings updated.');
  }

  function handleReset() {
    resetToSampleData();
    setIsResetModalOpen(false);
    success('Reset Complete', 'Loaded sample data for TY BSc CS Sem 5 Div A.');
  }

  const sampleSchema = `-- Supabase SQL Schema for Automatic Timetable Generator
-- Paste into Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.teachers (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL UNIQUE,
    teacher_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    subjects_assigned TEXT[] DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS public.classrooms (
    id TEXT PRIMARY KEY,
    room_number TEXT NOT NULL UNIQUE,
    building TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 60,
    type TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS public.divisions (
    id TEXT PRIMARY KEY,
    course TEXT NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    division_name TEXT NOT NULL,
    student_count INTEGER NOT NULL DEFAULT 60
);
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    course TEXT NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    division TEXT NOT NULL,
    type TEXT NOT NULL,
    lectures_per_week INTEGER NOT NULL,
    teacher_id TEXT,
    duration INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS public.timeslots (
    id TEXT PRIMARY KEY,
    day TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_break BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS public.timetables (
    id TEXT PRIMARY KEY,
    division_id TEXT NOT NULL,
    course TEXT NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    division_name TEXT NOT NULL,
    entries JSONB NOT NULL DEFAULT '[]'::jsonb,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL,
    academic_year TEXT NOT NULL
);`;

  function copySql() {
    navigator.clipboard.writeText(sampleSchema);
    setHasCopiedSql(true);
    info('Copied SQL', 'SQL schema copied to clipboard.');
    setTimeout(() => setHasCopiedSql(false), 2500);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span>Settings</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure institutional metadata, appearance, and Supabase database connection.
        </p>
      </div>

      {/* College Configuration Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          Institutional Details
        </h2>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              College Name
            </label>
            <input
              type="text"
              required
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="Lord Universal College"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Academic Year
            </label>
            <input
              type="text"
              required
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2026-27"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Theme
            </label>
            <select
              value={selectedTheme}
              onChange={(e) =>
                setSelectedTheme(e.target.value as 'light' | 'dark' | 'system')
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="system">System Default</option>
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/30 transition"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* Supabase Integration Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Supabase PostgreSQL Backend
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cloud database sync status and connection guide
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              isSupabaseConfigured
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            {isSupabaseConfigured ? 'Connected' : 'Offline / Local Fallback'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          The app works out of the box with offline storage. To connect your live Supabase project on Vercel or locally, create a project at{' '}
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 dark:text-indigo-400 font-semibold underline inline-flex items-center gap-0.5"
          >
            <span>supabase.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>{' '}
          and set these environment variables in <code>.env.local</code> or Vercel Settings:
        </p>

        <div className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs space-y-1 overflow-x-auto">
          <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
          <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Copy the schema SQL to initialize your Supabase tables:
          </span>
          <button
            onClick={copySql}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            {hasCopiedSql ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy SQL Schema</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reset Sample Data */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Demo Sample Data
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Reset all records to the original Lord Universal College TY BSc CS dataset.
          </p>
        </div>

        <button
          onClick={() => setIsResetModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs sm:text-sm font-semibold transition whitespace-nowrap self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Sample Data</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset to Sample Data"
        maxWidth="sm"
      >
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This will replace current subjects, teachers, classrooms, divisions, and time slots with the initial project sample data. Continue?
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={() => setIsResetModalOpen(false)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold"
          >
            Confirm Reset
          </button>
        </div>
      </Modal>
    </div>
  );
}
