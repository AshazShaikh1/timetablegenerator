export type SubjectType = 'Theory' | 'Practical';
export type RoomType = 'Classroom' | 'Laboratory';
export type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface Teacher {
  id: string;
  teacherId: string;
  teacherName: string;
  email: string;
  department: string;
  subjectsAssigned: string[]; // subject names or IDs
  createdAt?: string;
}

export interface Subject {
  id: string;
  subjectCode: string;
  subjectName: string;
  course: string;
  year: number;
  semester: number;
  division: string;
  type: SubjectType;
  lecturesPerWeek: number;
  teacherId: string;
  teacherName?: string;
  duration: number; // 1 for theory, 2 for practical
  createdAt?: string;
}

export interface Classroom {
  id: string;
  roomNumber: string;
  building: string;
  capacity: number;
  type: RoomType;
  createdAt?: string;
}

export interface Division {
  id: string;
  course: string;
  year: number;
  semester: number;
  divisionName: string;
  studentCount: number;
  createdAt?: string;
}

export interface TimeSlot {
  id: string;
  day: Weekday;
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  isBreak: boolean;
  orderIndex: number;
  createdAt?: string;
}

export interface TimetableEntry {
  id: string;
  day: Weekday;
  slotId: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomId: string;
  roomNumber: string;
  type: SubjectType;
  isBreak?: boolean;
}

export interface Timetable {
  id: string;
  divisionId: string;
  course: string;
  year: number;
  semester: number;
  divisionName: string;
  entries: TimetableEntry[];
  generatedAt: string;
  status: 'Draft' | 'Published';
  academicYear: string;
}

export interface SystemSettings {
  collegeName: string;
  academicYear: string;
  workingDays: Weekday[];
  theme: 'light' | 'dark' | 'system';
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'faculty' | 'student';
}
