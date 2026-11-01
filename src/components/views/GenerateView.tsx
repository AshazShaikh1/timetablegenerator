'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Classroom, Division, Subject, Teacher, TimeSlot, Timetable, Weekday } from '@/types';
import { generateTimetable } from '@/lib/timetableGenerator';
import { useToast } from '../common/Toast';

interface GenerateViewProps {
  divisions: Division[];
  subjects: Subject[];
  teachers: Teacher[];
  classrooms: Classroom[];
  timeSlots: TimeSlot[];
  existingTimetables: Timetable[];
  academicYear: string;
  onTimetableGenerated: (timetable: Timetable) => void;
  onViewSchedule: () => void;
}

export function GenerateView({
  divisions,
  subjects,
  teachers,
  classrooms,
  timeSlots,
  existingTimetables,
  academicYear,
  onTimetableGenerated,
  onViewSchedule,
}: GenerateViewProps) {
  const { success, error: toastError } = useToast();

  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(
    divisions[0]?.id || ''
  );
  const [workingDays, setWorkingDays] = useState<Weekday[]>([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    error?: string;
    attemptsUsed?: number;
    stats?: {
      totalLecturesPlaced: number;
      theoryCount: number;
      practicalCount: number;
      daysUsed: number;
    };
  } | null>(null);

  const selectedDivision = divisions.find((d) => d.id === selectedDivisionId);
  const divisionSubjects = subjects.filter(
    (s) =>
      selectedDivision &&
      (s.division.toLowerCase() === selectedDivision.divisionName.toLowerCase() || !s.division)
  );

  const totalWeeklyLectures = divisionSubjects.reduce(
    (sum, s) => sum + s.lecturesPerWeek * s.duration,
    0
  );

  function toggleDay(day: Weekday) {
    if (workingDays.includes(day)) {
      if (workingDays.length === 1) {
        toastError('Warning', 'At least one working day must be selected.');
        return;
      }
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  }

  function handleGenerate() {
    if (!selectedDivision) {
      toastError('Error', 'Please select a division.');
      return;
    }

    setIsGenerating(true);
    setLastResult(null);

    setTimeout(() => {
      const result = generateTimetable({
        division: selectedDivision,
        subjects,
        teachers,
        classrooms,
        timeSlots,
        existingTimetables,
        workingDays,
        academicYear,
      });

      setIsGenerating(false);

      if (result.success && result.timetable) {
        onTimetableGenerated(result.timetable);
        setLastResult({
          success: true,
          attemptsUsed: result.attemptsUsed,
          stats: result.stats,
        });

        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }

        success(
          'Timetable Generated',
          `Clash-free schedule created for Div ${selectedDivision.divisionName} in ${result.attemptsUsed} attempt(s)!`
        );
      } else {
        setLastResult({
          success: false,
          error: result.error || 'Failed to generate timetable.',
          attemptsUsed: result.attemptsUsed,
        });
        toastError('Generation Failed', result.error);
      }
    }, 450);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span>Generate Timetable</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Run the constraint satisfaction solver to construct a clash-free weekly schedule.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Division Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Division
          </label>
          <select
            value={selectedDivisionId}
            onChange={(e) => {
              setSelectedDivisionId(e.target.value);
              setLastResult(null);
            }}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
          >
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.course} - Sem {d.semester} - Div {d.divisionName} ({d.studentCount} students)
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Subjects for this division: <strong>{divisionSubjects.length}</strong>
            </span>
            <span>
              Total lecture slots required: <strong>{totalWeeklyLectures} slots/week</strong>
            </span>
          </div>
        </div>

        {/* Working Days Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Working Days
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as Weekday[]).map(
              (day) => {
                const isChecked = workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                      isChecked
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Constraint Notice (Matching report Fig 16) */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-indigo-950 dark:text-indigo-200 text-xs sm:text-sm flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-indigo-900 dark:text-indigo-200">
              Active Scheduling Constraints
            </p>
            <p className="mt-0.5 text-xs text-indigo-800/80 dark:text-indigo-300/80">
              Rules: no teacher, room or division clashes; labs for practicals; breaks skipped; lectures spread across days; multi-division clash prevention enforced.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Running CSP Algorithm...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>GENERATE TIMETABLE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Card */}
      {lastResult && (
        <div
          className={`p-6 rounded-3xl border animate-in slide-in-from-top-2 duration-300 ${
            lastResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100'
          }`}
        >
          {lastResult.success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-base text-emerald-900 dark:text-emerald-200">
                    Timetable Generated Successfully!
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Conflict-free schedule verified in {lastResult.attemptsUsed} attempt(s).
                  </p>
                </div>
              </div>

              {lastResult.stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-emerald-900/30">
                    <span className="text-emerald-600 dark:text-emerald-400 block text-[11px] font-medium">
                      Total Placed
                    </span>
                    <span className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                      {lastResult.stats.totalLecturesPlaced} sessions
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-emerald-900/30">
                    <span className="text-emerald-600 dark:text-emerald-400 block text-[11px] font-medium">
                      Theory
                    </span>
                    <span className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                      {lastResult.stats.theoryCount} lectures
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-emerald-900/30">
                    <span className="text-emerald-600 dark:text-emerald-400 block text-[11px] font-medium">
                      Practicals
                    </span>
                    <span className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                      {lastResult.stats.practicalCount} lab blocks
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-emerald-900/30">
                    <span className="text-emerald-600 dark:text-emerald-400 block text-[11px] font-medium">
                      Days
                    </span>
                    <span className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                      {lastResult.stats.daysUsed} weekdays
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={onViewSchedule}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <span>Open Timetable Grid</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-base text-rose-900 dark:text-rose-200">
                  Scheduling Conflict Detected
                </h3>
                <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
                  {lastResult.error}
                </p>
                <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
                  Tip: Ensure sufficient classrooms, assign teachers to all subjects, or add more time slots.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
