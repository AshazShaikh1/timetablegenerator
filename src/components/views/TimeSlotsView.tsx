'use client';

import React, { useState } from 'react';
import { Plus, Clock, Copy } from 'lucide-react';
import { TimeSlot, Weekday } from '@/types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface TimeSlotsViewProps {
  timeSlots: TimeSlot[];
  onSaveTimeSlot: (slot: TimeSlot) => void;
  onDeleteTimeSlot: (id: string) => void;
  onBulkUpdateSlots: (slots: TimeSlot[]) => void;
}

const ALL_DAYS: Weekday[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function TimeSlotsView({
  timeSlots,
  onSaveTimeSlot,
  onDeleteTimeSlot,
  onBulkUpdateSlots,
}: TimeSlotsViewProps) {
  const { success, error: toastError } = useToast();
  const [selectedDay, setSelectedDay] = useState<Weekday>('Monday');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);

  // Form State
  const [day, setDay] = useState<Weekday>('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isBreak, setIsBreak] = useState(false);
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  function openAddModal() {
    setEditingSlot(null);
    setDay(selectedDay);
    setStartTime('09:00');
    setEndTime('10:00');
    setIsBreak(false);
    setOrderIndex(daySlots.length);
    setIsModalOpen(true);
  }

  function openEditModal(slot: TimeSlot) {
    setEditingSlot(slot);
    setDay(slot.day);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setIsBreak(slot.isBreak);
    setOrderIndex(slot.orderIndex);
    setIsModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!startTime || !endTime) {
      toastError('Validation Error', 'Start and End times are required.');
      return;
    }

    const slotToSave: TimeSlot = {
      id: editingSlot ? editingSlot.id : `slot-${day.toLowerCase()}-${Date.now()}`,
      day,
      startTime,
      endTime,
      isBreak,
      orderIndex: Number(orderIndex),
    };

    onSaveTimeSlot(slotToSave);
    success(
      editingSlot ? 'Slot Updated' : 'Slot Added',
      `${slotToSave.day} ${slotToSave.startTime}-${slotToSave.endTime} saved.`
    );
    setIsModalOpen(false);
  }

  function handleDelete(id: string) {
    onDeleteTimeSlot(id);
    success('Deleted', 'Time slot removed.');
    setDeleteConfirmId(null);
  }

  // Duplicate current day's structure to all other weekdays
  function duplicateScheduleToAllDays() {
    const currentSlots = timeSlots.filter((s) => s.day === selectedDay);
    if (currentSlots.length === 0) {
      toastError('Error', `No slots to duplicate for ${selectedDay}.`);
      return;
    }

    const targetDays = ALL_DAYS.filter((d) => d !== selectedDay);
    const newSlots = [...timeSlots.filter((s) => s.day === selectedDay)];

    for (const d of targetDays) {
      currentSlots.forEach((s) => {
        newSlots.push({
          id: `slot-${d.toLowerCase()}-${s.startTime.replace(':', '')}`,
          day: d,
          startTime: s.startTime,
          endTime: s.endTime,
          isBreak: s.isBreak,
          orderIndex: s.orderIndex,
        });
      });
    }

    onBulkUpdateSlots(newSlots);
    success('Applied to All Days', `Copied ${selectedDay}'s ${currentSlots.length} slots to Monday–Saturday.`);
  }

  const daySlots = timeSlots
    .filter((s) => s.day === selectedDay)
    .sort((a, b) => a.orderIndex - b.orderIndex || a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Time Slots & Periods</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Define daily periods, lecture hours, short breaks, and lunch timings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={duplicateScheduleToAllDays}
            title="Duplicate selected day's periods to all weekdays"
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            <Copy className="w-4 h-4 text-slate-500" />
            <span>Copy to All Days</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add</span>
          </button>
        </div>
      </div>

      {/* Weekday Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto">
        {ALL_DAYS.map((d) => {
          const count = timeSlots.filter((s) => s.day === d).length;
          const isActive = selectedDay === d;
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{d}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        tabIndex={0}
        role="region"
        aria-label="Time slots table"
        className="table-wrapper bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs"
      >
        <table className="w-full text-left border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 z-10">
            <tr>
              <th scope="col" className="px-5 py-3.5">Start</th>
              <th scope="col" className="px-5 py-3.5">End</th>
              <th scope="col" className="px-5 py-3.5">Break?</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {daySlots.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-slate-400 dark:text-slate-500">
                  No slots configured for {selectedDay}. Click <strong>+ Add</strong> or <strong>Copy to All Days</strong>.
                </td>
              </tr>
            ) : (
              daySlots.map((slot) => (
                <tr
                  key={slot.id}
                  className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                    slot.isBreak ? 'bg-amber-50/40 dark:bg-amber-950/10' : ''
                  }`}
                >
                  <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                    {slot.startTime}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                    {slot.endTime}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        slot.isBreak
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {slot.isBreak ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(slot)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(slot.id)}
                        className="px-2.5 py-1 text-xs font-medium bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Weekday
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as Weekday)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {ALL_DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isBreakCheck"
              checked={isBreak}
              onChange={(e) => setIsBreak(e.target.checked)}
              className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isBreakCheck" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Is this a Break / Recess period? (No classes will be scheduled)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/30"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Time Slot"
        maxWidth="sm"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this time slot?
        </p>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

