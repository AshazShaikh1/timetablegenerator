'use client';

import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Building2,
  GraduationCap,
  Clock,
  Sparkles,
  CalendarDays,
  Settings,
  LogOut,
  CalendarCheck,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'subjects'
  | 'teachers'
  | 'classrooms'
  | 'divisions'
  | 'timeslots'
  | 'generate'
  | 'timetable'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  onLogout,
  isOpen,
  onClose,
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects' as NavTab, label: 'Subjects', icon: BookOpen },
    { id: 'teachers' as NavTab, label: 'Teachers', icon: Users },
    { id: 'classrooms' as NavTab, label: 'Classrooms', icon: Building2 },
    { id: 'divisions' as NavTab, label: 'Divisions', icon: GraduationCap },
    { id: 'timeslots' as NavTab, label: 'Time Slots', icon: Clock },
    { id: 'generate' as NavTab, label: 'Generate Timetable', icon: Sparkles, highlight: true },
    { id: 'timetable' as NavTab, label: 'View Timetable', icon: CalendarDays },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 print:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-tight">Timetable Gen</h1>
            <p className="text-xs text-indigo-400 font-medium">Automatic Scheduler</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : item.highlight
                    ? 'text-indigo-400 hover:text-white hover:bg-slate-800/80 bg-indigo-950/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

