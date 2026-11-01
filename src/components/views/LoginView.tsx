'use client';

import React, { useState } from 'react';
import { CalendarCheck, Lock, User, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { UserProfile } from '@/types';
import { setCurrentUser } from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const trimmedUser = username.trim();

    // 1. If Supabase is configured and email format is used, check Supabase Auth first
    if (isSupabaseConfigured && supabase && trimmedUser.includes('@')) {
      try {
        const { data, error: supaError } = await supabase.auth.signInWithPassword({
          email: trimmedUser,
          password: password,
        });

        if (!supaError && data.user) {
          const userSession: UserProfile = {
            id: data.user.id,
            username: data.user.email?.split('@')[0] || 'unesh',
            name: data.user.user_metadata?.full_name || 'Unesh Farooqui',
            email: data.user.email || trimmedUser,
            role: 'admin',
          };
          setCurrentUser(userSession);
          onLoginSuccess(userSession);
          return;
        }
      } catch (err) {
        console.warn('Supabase auth attempt error', err);
      }
    }

    // 2. Validate dedicated project credentials: username "unesh", password "Unesh@113"
    setTimeout(() => {
      const lowerUser = trimmedUser.toLowerCase();
      if (lowerUser === 'unesh' && password === 'Unesh@113') {
        const userSession: UserProfile = {
          id: 'usr-unesh-13',
          username: 'unesh',
          name: 'Unesh Farooqui',
          email: 'unesh@college.edu',
          role: 'admin',
        };
        // Persist session
        setCurrentUser(userSession);
        onLoginSuccess(userSession);
      } else {
        setError('Invalid username or password.');
        setIsLoading(false);
      }
    }, 350);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 relative overflow-hidden">
        {/* Top badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Automatic Timetable Generator
            </h1>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              TY BSc Computer Science Mini Project
            </p>
          </div>
        </div>

        <div className="mb-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>Please sign in to access the timetable management dashboard.</span>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="unesh"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Show password</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-600/30 transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Lord Universal College &bull; Academic Year 2026-27
          </p>
        </div>
      </div>
    </div>
  );
}
