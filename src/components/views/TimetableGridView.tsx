'use client';

import React, { useState } from 'react';
import {
  Printer,
  Download,
  RotateCcw,
  CalendarCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Classroom, Division, Subject, Teacher, TimeSlot, Timetable, Weekday } from '@/types';
import { generateTimetable } from '@/lib/timetableGenerator';
import { useToast } from '../common/Toast';

interface TimetableGridViewProps {
  timetables: Timetable[];
  divisions: Division[];
  subjects: Subject[];
  teachers: Teacher[];
  classrooms: Classroom[];
  timeSlots: TimeSlot[];
  collegeName: string;
  academicYear: string;
  onSaveTimetable: (tt: Timetable) => void;
  onDeleteTimetable: (id: string) => void;
  onNavigateToGenerate: () => void;
}

export function TimetableGridView({
  timetables,
  divisions,
  subjects,
  teachers,
  classrooms,
  timeSlots,
  collegeName,
  academicYear,
  onSaveTimetable,
  onDeleteTimetable,
  onNavigateToGenerate,
}: TimetableGridViewProps) {
  const { success, error: toastError } = useToast();

  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(
    timetables[0]?.divisionId || divisions[0]?.id || ''
  );

  const currentTimetable = timetables.find((t) => t.divisionId === selectedDivisionId);
  const selectedDivision = divisions.find((d) => d.id === selectedDivisionId);

  // Collect unique time ranges sorted chronologically
  const timeRanges = Array.from(
    new Set(timeSlots.map((s) => `${s.startTime}-${s.endTime}`))
  ).sort((a, b) => a.localeCompare(b));

  const weekDays: Weekday[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  function handlePrint() {
    window.print();
  }

  function handleExportCsv() {
    if (!currentTimetable || !selectedDivision) {
      toastError('Error', 'No timetable available to export.');
      return;
    }

    const headers = ['Time', ...weekDays];
    const rows: string[][] = [];

    timeRanges.forEach((range) => {
      const [start] = range.split('-');
      const row: string[] = [range];

      weekDays.forEach((day) => {
        const entry = currentTimetable.entries.find(
          (e) => e.day === day && e.startTime === start
        );
        if (!entry) {
          row.push('-');
        } else if (entry.isBreak) {
          row.push('BREAK');
        } else {
          row.push(`${entry.subjectCode} (${entry.teacherName || entry.teacherId}, ${entry.roomNumber})`);
        }
      });
      rows.push(row);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        `"${collegeName} - Timetable"`,
        `"Course: ${selectedDivision.course} - Div ${selectedDivision.divisionName} (Sem ${selectedDivision.semester})"`,
        `"Academic Year: ${academicYear}"`,
        '',
        headers.map((h) => `"${h}"`).join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Timetable_${selectedDivision.course.replace(/\s+/g, '_')}_Div${selectedDivision.divisionName}_${academicYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success('CSV Exported', 'Timetable file downloaded successfully.');
  }

  function handleRegenerate() {
    if (!selectedDivision) return;
    const result = generateTimetable({
      division: selectedDivision,
      subjects,
      teachers,
      classrooms,
      timeSlots,
      existingTimetables: timetables.filter((t) => t.divisionId !== selectedDivision.id),
      workingDays: weekDays,
      academicYear,
    });

    if (result.success && result.timetable) {
      onSaveTimetable(result.timetable);
      success(
        'Regenerated',
        `New schedule calculated for Div ${selectedDivision.divisionName} in ${result.attemptsUsed} attempt(s).`
      );
    } else {
      toastError('Regeneration Failed', result.error);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Timetable</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View, print, and export generated academic schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Division Selector */}
          <select
            value={selectedDivisionId}
            onChange={(e) => setSelectedDivisionId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
          >
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.course} - Sem {d.semester} - Div {d.divisionName}
              </option>
            ))}
          </select>

          {currentTimetable && (
            <>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleRegenerate}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Regenerate</span>
              </button>

              <button
                onClick={() => onDeleteTimetable(currentTimetable.id)}
                title="Delete this generated timetable"
                className="p-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Timetable Card */}
      {!currentTimetable ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
          <CalendarCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            No Timetable Found for Division {selectedDivision?.divisionName || ''}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Click Generate to run the constraint satisfaction solver and construct a complete, conflict-free weekly schedule.
          </p>
          <button
            onClick={onNavigateToGenerate}
            className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/30 transition"
          >
            Generate Schedule Now
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Institutional Banner inside grid (matching Fig 17) */}
          <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {collegeName} &bull; {academicYear}
            </h2>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {selectedDivision?.course} &bull; Semester {selectedDivision?.semester} &bull; Division {selectedDivision?.divisionName}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Classroom: Main / Annex &bull; Generated on{' '}
              {new Date(currentTimetable.generatedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Timetable Grid Table conforming to Modern Web Guidance */}
          <div
            tabIndex={0}
            role="region"
            aria-label="Weekly timetable schedule"
            className="table-wrapper border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-2xs"
          >
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/90 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 divide-x divide-slate-200 dark:divide-slate-700">
                  <th scope="col" className="px-4 py-3 text-left w-32 font-black">
                    Time
                  </th>
                  {weekDays.map((day) => (
                    <th key={day} scope="col" className="px-4 py-3 min-w-[130px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {timeRanges.map((range) => {
                  const [start] = range.split('-');

                  // Check if this time range is a break slot across all days
                  const isBreakRow = currentTimetable.entries.some(
                    (e) => e.startTime === start && e.isBreak
                  );

                  return (
                    <tr
                      key={range}
                      className={`divide-x divide-slate-200 dark:divide-slate-800 ${
                        isBreakRow
                          ? 'bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      {/* Time Column */}
                      <th
                        scope="row"
                        className="px-4 py-3.5 font-mono font-bold text-left text-slate-700 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-800/50 whitespace-nowrap"
                      >
                        {range}
                      </th>

                      {/* Day Columns */}
                      {weekDays.map((day) => {
                        const entry = currentTimetable.entries.find(
                          (e) => e.day === day && e.startTime === start
                        );

                        if (!entry) {
                          return (
                            <td key={day} className="px-3 py-3 text-slate-300 dark:text-slate-600">
                              &mdash;
                            </td>
                          );
                        }

                        if (entry.isBreak) {
                          return (
                            <td
                              key={day}
                              className="px-3 py-3 bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-black tracking-wider text-[11px]"
                            >
                              BREAK
                            </td>
                          );
                        }

                        // Blue for Theory, Green for Practical (matching project Fig 17)
                        const isPractical = entry.type === 'Practical';

                        return (
                          <td
                            key={day}
                            className={`p-2.5 transition-colors ${
                              isPractical
                                ? 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 border border-emerald-300/40'
                                : 'bg-blue-100/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 border border-blue-300/40'
                            }`}
                          >
                            <div className="font-extrabold text-[13px] tracking-tight">
                              {entry.subjectCode}
                            </div>
                            <div className="text-[11px] font-medium opacity-90 mt-0.5">
                              {entry.teacherName || entry.teacherId}
                            </div>
                            <div className="text-[10px] font-semibold opacity-75 mt-0.5">
                              {entry.roomNumber} &bull; {isPractical ? 'P' : 'T'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Color Legend (matching Fig 17) */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-blue-200 dark:bg-blue-800 border border-blue-400 inline-block"></span>
              <span>Blue = Theory</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-200 dark:bg-emerald-800 border border-emerald-400 inline-block"></span>
              <span>Green = Practical</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-200 dark:bg-amber-800 border border-amber-400 inline-block"></span>
              <span>Yellow = Break</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
