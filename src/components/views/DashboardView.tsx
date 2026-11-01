'use client';

import React from 'react';
import {
  BookOpen,
  Users,
  Building2,
  GraduationCap,
  Clock,
  CalendarCheck2,
  PlusCircle,
  Sparkles,
  CalendarDays,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Classroom, Division, Subject, Teacher, TimeSlot, Timetable } from '@/types';
import { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  subjects: Subject[];
  teachers: Teacher[];
  classrooms: Classroom[];
  divisions: Division[];
  timeSlots: TimeSlot[];
  timetables: Timetable[];
  onNavigate: (tab: NavTab) => void;
  onOpenAddModal: (type: 'subject' | 'teacher' | 'classroom' | 'division') => void;
}

export function DashboardView({
  subjects,
  teachers,
  classrooms,
  divisions,
  timeSlots,
  timetables,
  onNavigate,
  onOpenAddModal,
}: DashboardViewProps) {
  // Count unique time slot periods (e.g., 8 periods per day)
  const uniquePeriodsCount = new Set(timeSlots.map((s) => `${s.startTime}-${s.endTime}`)).size;

  const statCards = [
    {
      title: 'Subjects',
      count: subjects.length,
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900',
      tab: 'subjects' as NavTab,
    },
    {
      title: 'Teachers',
      count: teachers.length,
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900',
      tab: 'teachers' as NavTab,
    },
    {
      title: 'Classrooms',
      count: classrooms.length,
      icon: Building2,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900',
      tab: 'classrooms' as NavTab,
    },
    {
      title: 'Divisions',
      count: divisions.length,
      icon: GraduationCap,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900',
      tab: 'divisions' as NavTab,
    },
    {
      title: 'Time Slots',
      count: uniquePeriodsCount || timeSlots.length,
      subtitle: `${timeSlots.length} slot entries`,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900',
      tab: 'timeslots' as NavTab,
    },
    {
      title: 'Generated Timetables',
      count: timetables.length,
      icon: CalendarCheck2,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900',
      tab: 'timetable' as NavTab,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Academic scheduling overview and fast shortcuts.
        </p>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => onNavigate(card.tab)}
              className={`p-5 rounded-2xl border text-left transition hover:scale-[1.02] shadow-xs hover:shadow-md cursor-pointer ${card.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {card.count}
                </span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {card.title}
              </p>
              {card.subtitle && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {card.subtitle}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onOpenAddModal('subject')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Add subject</span>
          </button>

          <button
            onClick={() => onOpenAddModal('teacher')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Add teacher</span>
          </button>

          <button
            onClick={() => onOpenAddModal('classroom')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Add classroom</span>
          </button>

          <button
            onClick={() => onOpenAddModal('division')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Add division</span>
          </button>

          <button
            onClick={() => onNavigate('generate')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Timetable</span>
          </button>

          <button
            onClick={() => onNavigate('timetable')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 text-sm font-semibold transition"
          >
            <CalendarDays className="w-4 h-4" />
            <span>View Timetable</span>
          </button>
        </div>
      </div>

      {/* Generated Timetables Status */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Current Timetable Status
          </h2>
          <button
            onClick={() => onNavigate('timetable')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Open schedule grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {timetables.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <CalendarCheck2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No timetables generated yet
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              Ready to generate conflict-free schedules using the CSP constraint solver engine.
            </p>
            <button
              onClick={() => onNavigate('generate')}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              Go to Generator
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetables.map((tt) => (
              <div
                key={tt.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-800 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {tt.course} &bull; Div {tt.divisionName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Semester {tt.semester} &bull; AY {tt.academicYear}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>{tt.status}</span>
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {tt.entries.filter((e) => !e.isBreak).length} total slots allocated
                  </span>
                  <button
                    onClick={() => onNavigate('timetable')}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View grid &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

