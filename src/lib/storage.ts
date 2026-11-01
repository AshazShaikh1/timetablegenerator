import { 
  Classroom, 
  Division, 
  Subject, 
  Teacher, 
  TimeSlot, 
  Timetable, 
  SystemSettings, 
  UserProfile 
} from '@/types';
import { 
  DEFAULT_SETTINGS, 
  INITIAL_CLASSROOMS, 
  INITIAL_DIVISIONS, 
  INITIAL_SUBJECTS, 
  INITIAL_TEACHERS, 
  INITIAL_TIMESLOTS 
} from './sampleData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  TEACHERS: 'attg_teachers',
  SUBJECTS: 'attg_subjects',
  CLASSROOMS: 'attg_classrooms',
  DIVISIONS: 'attg_divisions',
  TIMESLOTS: 'attg_timeslots',
  TIMETABLES: 'attg_timetables',
  SETTINGS: 'attg_settings',
  AUTH_USER: 'attg_user',
};

// Simple event emitter for reactive updates across components
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToDataChanges(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyChange() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Error in subscriber callback', err);
    }
  });
}

function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to parse ${key} from localStorage`, e);
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyChange();
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

// ----------------- Data Retrieval & Modification -----------------

export async function getTeachers(): Promise<Teacher[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('teachers').select('*').order('teacher_name');
      if (!error && data && data.length > 0) {
        return data.map((t) => ({
          id: t.id,
          teacherId: t.teacher_id,
          teacherName: t.teacher_name,
          email: t.email,
          department: t.department,
          subjectsAssigned: t.subjects_assigned || [],
          createdAt: t.created_at,
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage', e);
    }
  }
  return safeGetItem<Teacher[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
}

export async function saveTeachers(teachers: Teacher[]): Promise<void> {
  safeSetItem(STORAGE_KEYS.TEACHERS, teachers);
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = teachers.map((t) => ({
        id: t.id,
        teacher_id: t.teacherId,
        teacher_name: t.teacherName,
        email: t.email,
        department: t.department,
        subjects_assigned: t.subjectsAssigned,
      }));
      await supabase.from('teachers').upsert(payload);
    } catch (e) {
      console.error('Supabase saveTeachers error', e);
    }
  }
}

export async function getSubjects(): Promise<Subject[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('subjects').select('*').order('subject_name');
      if (!error && data && data.length > 0) {
        return data.map((s) => ({
          id: s.id,
          subjectCode: s.subject_code,
          subjectName: s.subject_name,
          course: s.course,
          year: s.year,
          semester: s.semester,
          division: s.division,
          type: s.type,
          lecturesPerWeek: s.lectures_per_week,
          teacherId: s.teacher_id,
          duration: s.duration,
          createdAt: s.created_at,
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage', e);
    }
  }
  return safeGetItem<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
}

export async function saveSubjects(subjects: Subject[]): Promise<void> {
  safeSetItem(STORAGE_KEYS.SUBJECTS, subjects);
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = subjects.map((s) => ({
        id: s.id,
        subject_code: s.subjectCode,
        subject_name: s.subjectName,
        course: s.course,
        year: s.year,
        semester: s.semester,
        division: s.division,
        type: s.type,
        lectures_per_week: s.lecturesPerWeek,
        teacher_id: s.teacherId,
        duration: s.duration,
      }));
      await supabase.from('subjects').upsert(payload);
    } catch (e) {
      console.error('Supabase saveSubjects error', e);
    }
  }
}

export async function getClassrooms(): Promise<Classroom[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('classrooms').select('*').order('room_number');
      if (!error && data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          roomNumber: c.room_number,
          building: c.building,
          capacity: c.capacity,
          type: c.type,
          createdAt: c.created_at,
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage', e);
    }
  }
  return safeGetItem<Classroom[]>(STORAGE_KEYS.CLASSROOMS, INITIAL_CLASSROOMS);
}

export async function saveClassrooms(classrooms: Classroom[]): Promise<void> {
  safeSetItem(STORAGE_KEYS.CLASSROOMS, classrooms);
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = classrooms.map((c) => ({
        id: c.id,
        room_number: c.roomNumber,
        building: c.building,
        capacity: c.capacity,
        type: c.type,
      }));
      await supabase.from('classrooms').upsert(payload);
    } catch (e) {
      console.error('Supabase saveClassrooms error', e);
    }
  }
}

export async function getDivisions(): Promise<Division[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('divisions').select('*').order('division_name');
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          course: d.course,
          year: d.year,
          semester: d.semester,
          divisionName: d.division_name,
          studentCount: d.student_count,
          createdAt: d.created_at,
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage', e);
    }
  }
  return safeGetItem<Division[]>(STORAGE_KEYS.DIVISIONS, INITIAL_DIVISIONS);
}

export async function saveDivisions(divisions: Division[]): Promise<void> {
  safeSetItem(STORAGE_KEYS.DIVISIONS, divisions);
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = divisions.map((d) => ({
        id: d.id,
        course: d.course,
        year: d.year,
        semester: d.semester,
        division_name: d.divisionName,
        student_count: d.studentCount,
      }));
      await supabase.from('divisions').upsert(payload);
    } catch (e) {
      console.error('Supabase saveDivisions error', e);
    }
  }
}

export async function getTimeSlots(): Promise<TimeSlot[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('timeslots').select('*').order('order_index');
      if (!error && data && data.length > 0) {
        return data.map((ts) => ({
          id: ts.id,
          day: ts.day,
          startTime: ts.start_time,
          endTime: ts.end_time,
          isBreak: ts.is_break,
          orderIndex: ts.order_index,
          createdAt: ts.created_at,
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage', e);
    }
  }
  return safeGetItem<TimeSlot[]>(STORAGE_KEYS.TIMESLOTS, INITIAL_TIMESLOTS);
}

export async function saveTimeSlots(slots: TimeSlot[]): Promise<void> {
  safeSetItem(STORAGE_KEYS.TIMESLOTS, slots);
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = slots.map((s) => ({
        id: s.id,
        day: s.day,
        start_time: s.startTime,
        end_time: s.endTime,
        is_break: s.isBreak,
        order_index: s.orderIndex,
      }));
      await supabase.from('timeslots').upsert(payload);
    } catch (e) {
      console.error('Supabase saveTimeSlots error', e);
    }
  }
}

export async function getTimetables(): Promise<Timetable[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('timetables').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((t) => ({
          id: t.id,
          divisionId: t.division_id,
          course: t.course,
          year: t.year,
          semester: t.semester,
          divisionName: t.division_name,
          entries: t.entries || [],
          generatedAt: t.generated_at,
          status: t.status,
          academicYear: t.academic_year,
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage', e);
    }
  }
  return safeGetItem<Timetable[]>(STORAGE_KEYS.TIMETABLES, []);
}

export async function saveTimetable(timetable: Timetable): Promise<void> {
  const current = await getTimetables();
  const existingIdx = current.findIndex((t) => t.divisionId === timetable.divisionId);
  let updated: Timetable[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = timetable;
  } else {
    updated = [timetable, ...current];
  }
  safeSetItem(STORAGE_KEYS.TIMETABLES, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('timetables').upsert({
        id: timetable.id,
        division_id: timetable.divisionId,
        course: timetable.course,
        year: timetable.year,
        semester: timetable.semester,
        division_name: timetable.divisionName,
        entries: timetable.entries,
        generated_at: timetable.generatedAt,
        status: timetable.status,
        academic_year: timetable.academicYear,
      });
    } catch (e) {
      console.error('Supabase saveTimetable error', e);
    }
  }
}

export async function deleteTimetable(id: string): Promise<void> {
  const current = await getTimetables();
  const filtered = current.filter((t) => t.id !== id);
  safeSetItem(STORAGE_KEYS.TIMETABLES, filtered);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('timetables').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase deleteTimetable error', e);
    }
  }
}

export function getSettings(): SystemSettings {
  return safeGetItem<SystemSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: SystemSettings): void {
  safeSetItem(STORAGE_KEYS.SETTINGS, settings);
}

export function resetToSampleData(): void {
  safeSetItem(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
  safeSetItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  safeSetItem(STORAGE_KEYS.CLASSROOMS, INITIAL_CLASSROOMS);
  safeSetItem(STORAGE_KEYS.DIVISIONS, INITIAL_DIVISIONS);
  safeSetItem(STORAGE_KEYS.TIMESLOTS, INITIAL_TIMESLOTS);
  safeSetItem(STORAGE_KEYS.TIMETABLES, []);
  safeSetItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  notifyChange();
}

export function getCurrentUser(): UserProfile | null {
  return safeGetItem<UserProfile | null>(STORAGE_KEYS.AUTH_USER, null);
}

export function setCurrentUser(user: UserProfile | null): void {
  if (typeof window !== 'undefined') {
    if (!user) {
      try {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      } catch (e) {
        console.error('Error removing auth user session', e);
      }
    } else {
      safeSetItem(STORAGE_KEYS.AUTH_USER, user);
    }
  }
  notifyChange();
}

