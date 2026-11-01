'use client';

import React, { useState } from 'react';
import { Plus, Search, Building2 } from 'lucide-react';
import { Classroom, RoomType } from '@/types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface ClassroomsViewProps {
  classrooms: Classroom[];
  onSaveClassroom: (classroom: Classroom) => void;
  onDeleteClassroom: (id: string) => void;
}

export function ClassroomsView({
  classrooms,
  onSaveClassroom,
  onDeleteClassroom,
}: ClassroomsViewProps) {
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

  // Form State
  const [roomNumber, setRoomNumber] = useState('');
  const [building, setBuilding] = useState('Main');
  const [capacity, setCapacity] = useState<number>(60);
  const [type, setType] = useState<RoomType>('Classroom');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  function openAddModal() {
    setEditingClassroom(null);
    setRoomNumber('');
    setBuilding('Main');
    setCapacity(60);
    setType('Classroom');
    setIsModalOpen(true);
  }

  function openEditModal(c: Classroom) {
    setEditingClassroom(c);
    setRoomNumber(c.roomNumber);
    setBuilding(c.building);
    setCapacity(c.capacity);
    setType(c.type);
    setIsModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!roomNumber.trim()) {
      toastError('Validation Error', 'Room Number is required.');
      return;
    }

    const classroomToSave: Classroom = {
      id: editingClassroom ? editingClassroom.id : `r-${Date.now()}`,
      roomNumber: roomNumber.trim(),
      building: building.trim(),
      capacity: Number(capacity),
      type,
    };

    onSaveClassroom(classroomToSave);
    success(
      editingClassroom ? 'Classroom Updated' : 'Classroom Added',
      `Room ${classroomToSave.roomNumber} (${classroomToSave.type}) saved.`
    );
    setIsModalOpen(false);
  }

  function handleDelete(id: string) {
    onDeleteClassroom(id);
    success('Deleted', 'Classroom has been removed.');
    setDeleteConfirmId(null);
  }

  const filteredClassrooms = classrooms.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.roomNumber.toLowerCase().includes(q) ||
      c.building.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Classrooms & Laboratories</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Define teaching spaces, capacities, and laboratory allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add</span>
          </button>
        </div>
      </div>

      <div
        tabIndex={0}
        role="region"
        aria-label="Classrooms table"
        className="table-wrapper bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs"
      >
        <table className="w-full text-left border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 z-10">
            <tr>
              <th scope="col" className="px-5 py-3.5">Classroom Number</th>
              <th scope="col" className="px-5 py-3.5">Building</th>
              <th scope="col" className="px-5 py-3.5">Capacity</th>
              <th scope="col" className="px-5 py-3.5">Room Type</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredClassrooms.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400 dark:text-slate-500">
                  No classrooms found. Click <strong>+ Add</strong> to create one.
                </td>
              </tr>
            ) : (
              filteredClassrooms.map((room) => (
                <tr
                  key={room.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                    {room.roomNumber}
                  </td>
                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                    {room.building}
                  </td>
                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                    {room.capacity} students
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        room.type === 'Classroom'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                          : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                      }`}
                    >
                      {room.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(room)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(room.id)}
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
        title={editingClassroom ? 'Edit Classroom' : 'Add Classroom'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Classroom / Lab Number
            </label>
            <input
              type="text"
              required
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. 101 or Lab-1"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Building
              </label>
              <input
                type="text"
                required
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="Main"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Capacity
              </label>
              <input
                type="number"
                min={10}
                max={300}
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Room Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RoomType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Classroom">Classroom (Theory)</option>
              <option value="Laboratory">Laboratory (Practicals)</option>
            </select>
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
        title="Delete Classroom"
        maxWidth="sm"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this classroom?
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
