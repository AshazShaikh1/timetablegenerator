'use client';

import React, { useState } from 'react';
import { Plus, Search, GraduationCap } from 'lucide-react';
import { Division } from '@/types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface DivisionsViewProps {
  divisions: Division[];
  onSaveDivision: (division: Division) => void;
  onDeleteDivision: (id: string) => void;
}

export function DivisionsView({
  divisions,
  onSaveDivision,
  onDeleteDivision,
}: DivisionsViewProps) {
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);

  // Form State
  const [course, setCourse] = useState('TY BSc CS');
  const [year, setYear] = useState<number>(3);
  const [semester, setSemester] = useState<number>(5);
  const [divisionName, setDivisionName] = useState('A');
  const [studentCount, setStudentCount] = useState<number>(55);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  function openAddModal() {
    setEditingDivision(null);
    setCourse('TY BSc CS');
    setYear(3);
    setSemester(5);
    setDivisionName('A');
    setStudentCount(55);
    setIsModalOpen(true);
  }

  function openEditModal(d: Division) {
    setEditingDivision(d);
    setCourse(d.course);
    setYear(d.year);
    setSemester(d.semester);
    setDivisionName(d.divisionName);
    setStudentCount(d.studentCount);
    setIsModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!divisionName.trim() || !course.trim()) {
      toastError('Validation Error', 'Course and Division Name are required.');
      return;
    }

    const divisionToSave: Division = {
      id: editingDivision ? editingDivision.id : `div-${Date.now()}`,
      course: course.trim(),
      year: Number(year),
      semester: Number(semester),
      divisionName: divisionName.trim().toUpperCase(),
      studentCount: Number(studentCount),
    };

    onSaveDivision(divisionToSave);
    success(
      editingDivision ? 'Division Updated' : 'Division Added',
      `${divisionToSave.course} - Div ${divisionToSave.divisionName} saved.`
    );
    setIsModalOpen(false);
  }

  function handleDelete(id: string) {
    onDeleteDivision(id);
    success('Deleted', 'Division has been removed.');
    setDeleteConfirmId(null);
  }

  const filteredDivisions = divisions.filter((d) => {
    const q = searchTerm.toLowerCase();
    return (
      d.course.toLowerCase().includes(q) ||
      d.divisionName.toLowerCase().includes(q) ||
      `sem ${d.semester}`.includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Courses & Divisions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Define academic programs, semesters, divisions, and student counts.
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
        aria-label="Divisions table"
        className="table-wrapper bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs"
      >
        <table className="w-full text-left border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 z-10">
            <tr>
              <th scope="col" className="px-5 py-3.5">Course</th>
              <th scope="col" className="px-5 py-3.5">Year</th>
              <th scope="col" className="px-5 py-3.5">Semester</th>
              <th scope="col" className="px-5 py-3.5">Division Name</th>
              <th scope="col" className="px-5 py-3.5">Student Count</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDivisions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400 dark:text-slate-500">
                  No divisions found. Click <strong>+ Add</strong> to create one.
                </td>
              </tr>
            ) : (
              filteredDivisions.map((div) => (
                <tr
                  key={div.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                    {div.course}
                  </td>
                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                    Year {div.year}
                  </td>
                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                    Semester {div.semester}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    Div {div.divisionName}
                  </td>
                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                    {div.studentCount} students
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(div)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(div.id)}
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
        title={editingDivision ? 'Edit Division' : 'Add Division'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Course / Degree
            </label>
            <input
              type="text"
              required
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. TY BSc CS"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Year
              </label>
              <input
                type="number"
                min={1}
                max={5}
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Semester
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Division Name
              </label>
              <input
                type="text"
                required
                value={divisionName}
                onChange={(e) => setDivisionName(e.target.value)}
                placeholder="A"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Student Count
              </label>
              <input
                type="number"
                min={1}
                max={300}
                required
                value={studentCount}
                onChange={(e) => setStudentCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
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
        title="Delete Division"
        maxWidth="sm"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this division?
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
