'use client';

import React, { useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { Teacher } from '@/types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface TeachersViewProps {
  teachers: Teacher[];
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
}

export function TeachersView({
  teachers,
  onSaveTeacher,
  onDeleteTeacher,
}: TeachersViewProps) {
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form State
  const [teacherName, setTeacherName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [subjectsStr, setSubjectsStr] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  function openAddModal() {
    setEditingTeacher(null);
    setTeacherName('');
    setTeacherId('');
    setEmail('');
    setDepartment('Computer Science');
    setSubjectsStr('');
    setIsModalOpen(true);
  }

  function openEditModal(t: Teacher) {
    setEditingTeacher(t);
    setTeacherName(t.teacherName);
    setTeacherId(t.teacherId);
    setEmail(t.email);
    setDepartment(t.department);
    setSubjectsStr(t.subjectsAssigned.join(', '));
    setIsModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!teacherName.trim() || !teacherId.trim() || !email.trim()) {
      toastError('Validation Error', 'Teacher Name, ID and Email are required.');
      return;
    }

    const assigned = subjectsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const teacherToSave: Teacher = {
      id: editingTeacher ? editingTeacher.id : `t-${Date.now()}`,
      teacherName: teacherName.trim(),
      teacherId: teacherId.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      subjectsAssigned: assigned,
    };

    onSaveTeacher(teacherToSave);
    success(
      editingTeacher ? 'Teacher Updated' : 'Teacher Added',
      `${teacherToSave.teacherName} (${teacherToSave.teacherId}) saved.`
    );
    setIsModalOpen(false);
  }

  function handleDelete(id: string) {
    onDeleteTeacher(id);
    success('Deleted', 'Teacher has been removed.');
    setDeleteConfirmId(null);
  }

  const filteredTeachers = teachers.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.teacherName.toLowerCase().includes(q) ||
      t.teacherId.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q) ||
      t.subjectsAssigned.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Teachers</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage faculty records, departments, and course assignments.
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
        aria-label="Teachers table"
        className="table-wrapper bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs"
      >
        <table className="w-full text-left border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 z-10">
            <tr>
              <th scope="col" className="px-5 py-3.5">Teacher Name</th>
              <th scope="col" className="px-5 py-3.5">Teacher ID</th>
              <th scope="col" className="px-5 py-3.5">Email</th>
              <th scope="col" className="px-5 py-3.5">Department</th>
              <th scope="col" className="px-5 py-3.5">Subjects Assigned</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400 dark:text-slate-500">
                  No teachers found. Click <strong>+ Add</strong> to create one.
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                    {teacher.teacherName}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold">
                      {teacher.teacherId}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                    {teacher.email}
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                    {teacher.department}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjectsAssigned.map((sub, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(teacher.id)}
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
        title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Teacher Name
            </label>
            <input
              type="text"
              required
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="e.g. Dr. Mehta"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Teacher ID
              </label>
              <input
                type="text"
                required
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                placeholder="T01"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Department
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Computer Science"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mehta@college.edu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Subjects Assigned (comma-separated codes)
            </label>
            <input
              type="text"
              value={subjectsStr}
              onChange={(e) => setSubjectsStr(e.target.value)}
              placeholder="DBMS, OS"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
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
        title="Delete Teacher"
        maxWidth="sm"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this faculty record?
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
