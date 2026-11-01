'use client';

import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2, BookOpen } from 'lucide-react';
import { Subject, Teacher, SubjectType } from '@/types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface SubjectsViewProps {
  subjects: Subject[];
  teachers: Teacher[];
  onSaveSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
}

export function SubjectsView({
  subjects,
  teachers,
  onSaveSubject,
  onDeleteSubject,
}: SubjectsViewProps) {
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form State
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [course, setCourse] = useState('TY BSc CS');
  const [semester, setSemester] = useState<number>(5);
  const [division, setDivision] = useState('A');
  const [lecturesPerWeek, setLecturesPerWeek] = useState<number>(4);
  const [type, setType] = useState<SubjectType>('Theory');
  const [teacherId, setTeacherId] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const teacherMap = new Map<string, Teacher>();
  teachers.forEach((t) => teacherMap.set(t.id, t));

  function openAddModal() {
    setEditingSubject(null);
    setSubjectCode('');
    setSubjectName('');
    setCourse('TY BSc CS');
    setSemester(5);
    setDivision('A');
    setLecturesPerWeek(4);
    setType('Theory');
    setTeacherId(teachers[0]?.id || '');
    setIsModalOpen(true);
  }

  function openEditModal(sub: Subject) {
    setEditingSubject(sub);
    setSubjectCode(sub.subjectCode);
    setSubjectName(sub.subjectName);
    setCourse(sub.course);
    setSemester(sub.semester);
    setDivision(sub.division);
    setLecturesPerWeek(sub.lecturesPerWeek);
    setType(sub.type);
    setTeacherId(sub.teacherId);
    setIsModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectCode.trim() || !subjectName.trim()) {
      toastError('Validation Error', 'Subject Code and Name are required.');
      return;
    }

    const assignedTeacher = teacherMap.get(teacherId);

    const subjectToSave: Subject = {
      id: editingSubject ? editingSubject.id : `sub-${Date.now()}`,
      subjectCode: subjectCode.trim().toUpperCase(),
      subjectName: subjectName.trim(),
      course: course.trim(),
      year: 3,
      semester: Number(semester),
      division: division.trim().toUpperCase(),
      type,
      lecturesPerWeek: Number(lecturesPerWeek),
      teacherId,
      teacherName: assignedTeacher?.teacherName,
      duration: type === 'Practical' ? 2 : 1,
    };

    onSaveSubject(subjectToSave);
    success(
      editingSubject ? 'Subject Updated' : 'Subject Added',
      `${subjectToSave.subjectCode} - ${subjectToSave.subjectName} saved successfully.`
    );
    setIsModalOpen(false);
  }

  function handleDelete(id: string) {
    onDeleteSubject(id);
    success('Deleted', 'Subject has been removed.');
    setDeleteConfirmId(null);
  }

  const filteredSubjects = subjects.filter((s) => {
    const q = searchTerm.toLowerCase();
    const tName = teacherMap.get(s.teacherId)?.teacherName.toLowerCase() || '';
    return (
      s.subjectCode.toLowerCase().includes(q) ||
      s.subjectName.toLowerCase().includes(q) ||
      s.division.toLowerCase().includes(q) ||
      s.course.toLowerCase().includes(q) ||
      tName.includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Subjects</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure subjects, weekly lecture hours, and faculty assignments.
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

      {/* Table Container conforming to Modern Web Guidance */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Subjects table"
        className="table-wrapper bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs"
      >
        <table className="w-full text-left border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 z-10">
            <tr>
              <th scope="col" className="px-5 py-3.5">Subject Code</th>
              <th scope="col" className="px-5 py-3.5">Subject Name</th>
              <th scope="col" className="px-5 py-3.5">Semester</th>
              <th scope="col" className="px-5 py-3.5">Division</th>
              <th scope="col" className="px-5 py-3.5">Lectures / Week</th>
              <th scope="col" className="px-5 py-3.5">Type</th>
              <th scope="col" className="px-5 py-3.5">Assigned Teacher</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSubjects.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-400 dark:text-slate-500">
                  No subjects found. Click <strong>+ Add</strong> to create one.
                </td>
              </tr>
            ) : (
              filteredSubjects.map((sub) => {
                const teacher = teacherMap.get(sub.teacherId);
                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {sub.subjectCode}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                      {sub.subjectName}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      {sub.semester}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      {sub.division}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {sub.lecturesPerWeek}
                      </span>
                      {sub.type === 'Practical' && (
                        <span className="text-xs text-slate-400 ml-1">(2 hrs each)</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          sub.type === 'Theory'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                        }`}
                      >
                        {sub.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                      {teacher ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>{teacher.teacherName}</span>
                        </div>
                      ) : (
                        <span className="text-rose-500 italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(sub)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(sub.id)}
                          className="px-2.5 py-1 text-xs font-medium bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Record Dialog (matches Fig 11) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Add record'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Subject Code
            </label>
            <input
              type="text"
              required
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              placeholder="e.g. DBMS"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Subject Name
            </label>
            <input
              type="text"
              required
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g. Database Management"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Semester
              </label>
              <input
                type="number"
                min={1}
                max={8}
                required
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Division
              </label>
              <input
                type="text"
                required
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                placeholder="A"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Lectures / Week
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={lecturesPerWeek}
                onChange={(e) => setLecturesPerWeek(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SubjectType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Assigned Teacher
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.teacherName} ({t.teacherId} - {t.department})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/30 transition"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Deletion"
        maxWidth="sm"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this subject? This may affect any generated schedules.
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
