'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Classroom,
  Division,
  Subject,
  Teacher,
  TimeSlot,
  Timetable,
  SystemSettings,
  UserProfile,
} from '@/types';
import {
  getTeachers,
  getSubjects,
  getClassrooms,
  getDivisions,
  getTimeSlots,
  getTimetables,
  getSettings,
  getCurrentUser,
  saveTeachers,
  saveSubjects,
  saveClassrooms,
  saveDivisions,
  saveTimeSlots,
  saveTimetable,
  deleteTimetable,
  saveSettings,
  setCurrentUser,
  subscribeToDataChanges,
} from '@/lib/storage';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ToastProvider, useToast } from '@/components/common/Toast';
import { LoginView } from '@/components/views/LoginView';
import { DashboardView } from '@/components/views/DashboardView';
import { SubjectsView } from '@/components/views/SubjectsView';
import { TeachersView } from '@/components/views/TeachersView';
import { ClassroomsView } from '@/components/views/ClassroomsView';
import { DivisionsView } from '@/components/views/DivisionsView';
import { TimeSlotsView } from '@/components/views/TimeSlotsView';
import { GenerateView } from '@/components/views/GenerateView';
import { TimetableGridView } from '@/components/views/TimetableGridView';
import { SettingsView } from '@/components/views/SettingsView';

function MainApp() {
  const { success } = useToast();
  const [currentUser, setUser] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Master Data State
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [settings, setSettingsState] = useState<SystemSettings>({
    collegeName: 'Lord Universal College',
    academicYear: '2026-27',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    theme: 'light',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load all data
  const refreshAllData = useCallback(async () => {
    try {
      const [tList, sList, cList, dList, tsList, ttList] = await Promise.all([
        getTeachers(),
        getSubjects(),
        getClassrooms(),
        getDivisions(),
        getTimeSlots(),
        getTimetables(),
      ]);
      setTeachers(tList);
      setSubjects(sList);
      setClassrooms(cList);
      setDivisions(dList);
      setTimeSlots(tsList);
      setTimetables(ttList);
      const st = getSettings();
      setSettingsState(st);
    } catch (err) {
      console.error('Failed to load application data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check initial user
    const usr = getCurrentUser();
    setUser(usr);

    // Initial theme check
    const savedSettings = getSettings();
    if (savedSettings.theme === 'dark' || (!savedSettings.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }

    refreshAllData();

    // Subscribe to internal updates
    const unsubscribe = subscribeToDataChanges(() => {
      refreshAllData();
    });

    return () => {
      unsubscribe();
    };
  }, [refreshAllData]);

  function handleToggleTheme() {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const updatedSettings: SystemSettings = { ...settings, theme: nextTheme };
    setSettingsState(updatedSettings);
    saveSettings(updatedSettings);
  }

  function handleLogout() {
    setCurrentUser(null);
    setUser(null);
    success('Logged Out', 'You have been signed out.');
  }

  // ---------------- Handlers for CRUD ----------------
  async function handleSaveSubject(sub: Subject) {
    const existing = subjects.findIndex((s) => s.id === sub.id);
    let updated: Subject[];
    if (existing >= 0) {
      updated = [...subjects];
      updated[existing] = sub;
    } else {
      updated = [sub, ...subjects];
    }
    setSubjects(updated);
    await saveSubjects(updated);
  }

  async function handleDeleteSubject(id: string) {
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    await saveSubjects(updated);
  }

  async function handleSaveTeacher(t: Teacher) {
    const existing = teachers.findIndex((item) => item.id === t.id);
    let updated: Teacher[];
    if (existing >= 0) {
      updated = [...teachers];
      updated[existing] = t;
    } else {
      updated = [t, ...teachers];
    }
    setTeachers(updated);
    await saveTeachers(updated);
  }

  async function handleDeleteTeacher(id: string) {
    const updated = teachers.filter((t) => t.id !== id);
    setTeachers(updated);
    await saveTeachers(updated);
  }

  async function handleSaveClassroom(c: Classroom) {
    const existing = classrooms.findIndex((item) => item.id === c.id);
    let updated: Classroom[];
    if (existing >= 0) {
      updated = [...classrooms];
      updated[existing] = c;
    } else {
      updated = [c, ...classrooms];
    }
    setClassrooms(updated);
    await saveClassrooms(updated);
  }

  async function handleDeleteClassroom(id: string) {
    const updated = classrooms.filter((c) => c.id !== id);
    setClassrooms(updated);
    await saveClassrooms(updated);
  }

  async function handleSaveDivision(d: Division) {
    const existing = divisions.findIndex((item) => item.id === d.id);
    let updated: Division[];
    if (existing >= 0) {
      updated = [...divisions];
      updated[existing] = d;
    } else {
      updated = [d, ...divisions];
    }
    setDivisions(updated);
    await saveDivisions(updated);
  }

  async function handleDeleteDivision(id: string) {
    const updated = divisions.filter((d) => d.id !== id);
    setDivisions(updated);
    await saveDivisions(updated);
  }

  async function handleSaveTimeSlot(s: TimeSlot) {
    const existing = timeSlots.findIndex((item) => item.id === s.id);
    let updated: TimeSlot[];
    if (existing >= 0) {
      updated = [...timeSlots];
      updated[existing] = s;
    } else {
      updated = [...timeSlots, s];
    }
    setTimeSlots(updated);
    await saveTimeSlots(updated);
  }

  async function handleDeleteTimeSlot(id: string) {
    const updated = timeSlots.filter((s) => s.id !== id);
    setTimeSlots(updated);
    await saveTimeSlots(updated);
  }

  async function handleBulkUpdateSlots(slots: TimeSlot[]) {
    setTimeSlots(slots);
    await saveTimeSlots(slots);
  }

  async function handleSaveTimetable(tt: Timetable) {
    await saveTimetable(tt);
    refreshAllData();
  }

  async function handleDeleteTimetable(id: string) {
    await deleteTimetable(id);
    refreshAllData();
    success('Deleted', 'Timetable removed.');
  }

  function handleUpdateSettings(st: SystemSettings) {
    setSettingsState(st);
    saveSettings(st);
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={(u) => setUser(u)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Loading Timetable Generator...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Body */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          settings={settings}
          user={currentUser}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              subjects={subjects}
              teachers={teachers}
              classrooms={classrooms}
              divisions={divisions}
              timeSlots={timeSlots}
              timetables={timetables}
              onNavigate={setCurrentTab}
              onOpenAddModal={(type) => {
                if (type === 'subject') setCurrentTab('subjects');
                if (type === 'teacher') setCurrentTab('teachers');
                if (type === 'classroom') setCurrentTab('classrooms');
                if (type === 'division') setCurrentTab('divisions');
              }}
            />
          )}

          {currentTab === 'subjects' && (
            <SubjectsView
              subjects={subjects}
              teachers={teachers}
              onSaveSubject={handleSaveSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          )}

          {currentTab === 'teachers' && (
            <TeachersView
              teachers={teachers}
              onSaveTeacher={handleSaveTeacher}
              onDeleteTeacher={handleDeleteTeacher}
            />
          )}

          {currentTab === 'classrooms' && (
            <ClassroomsView
              classrooms={classrooms}
              onSaveClassroom={handleSaveClassroom}
              onDeleteClassroom={handleDeleteClassroom}
            />
          )}

          {currentTab === 'divisions' && (
            <DivisionsView
              divisions={divisions}
              onSaveDivision={handleSaveDivision}
              onDeleteDivision={handleDeleteDivision}
            />
          )}

          {currentTab === 'timeslots' && (
            <TimeSlotsView
              timeSlots={timeSlots}
              onSaveTimeSlot={handleSaveTimeSlot}
              onDeleteTimeSlot={handleDeleteTimeSlot}
              onBulkUpdateSlots={handleBulkUpdateSlots}
            />
          )}

          {currentTab === 'generate' && (
            <GenerateView
              divisions={divisions}
              subjects={subjects}
              teachers={teachers}
              classrooms={classrooms}
              timeSlots={timeSlots}
              existingTimetables={timetables}
              academicYear={settings.academicYear}
              onTimetableGenerated={(newTt) => {
                handleSaveTimetable(newTt);
              }}
              onViewSchedule={() => setCurrentTab('timetable')}
            />
          )}

          {currentTab === 'timetable' && (
            <TimetableGridView
              timetables={timetables}
              divisions={divisions}
              subjects={subjects}
              teachers={teachers}
              classrooms={classrooms}
              timeSlots={timeSlots}
              collegeName={settings.collegeName}
              academicYear={settings.academicYear}
              onSaveTimetable={handleSaveTimetable}
              onDeleteTimetable={handleDeleteTimetable}
              onNavigateToGenerate={() => setCurrentTab('generate')}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              currentTheme={theme}
              onThemeChange={setTheme}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
