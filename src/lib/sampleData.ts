import { Classroom, Division, Subject, Teacher, TimeSlot, SystemSettings } from '@/types';

export const DEFAULT_SETTINGS: SystemSettings = {
  collegeName: 'Lord Universal College',
  academicYear: '2026-27',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  theme: 'light',
};

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-1',
    teacherId: 'T01',
    teacherName: 'Dr. Mehta',
    email: 'mehta@college.edu',
    department: 'Computer Science',
    subjectsAssigned: ['DBMS', 'OS'],
  },
  {
    id: 't-2',
    teacherId: 'T02',
    teacherName: 'Prof. Iyer',
    email: 'iyer@college.edu',
    department: 'Computer Science',
    subjectsAssigned: ['CN', 'AI'],
  },
  {
    id: 't-3',
    teacherId: 'T03',
    teacherName: 'Prof. Khan',
    email: 'khan@college.edu',
    department: 'Computer Science',
    subjectsAssigned: ['JAVA', 'JL'],
  },
];

export const INITIAL_CLASSROOMS: Classroom[] = [
  {
    id: 'r-1',
    roomNumber: '101',
    building: 'Main',
    capacity: 60,
    type: 'Classroom',
  },
  {
    id: 'r-2',
    roomNumber: '102',
    building: 'Main',
    capacity: 60,
    type: 'Classroom',
  },
  {
    id: 'r-3',
    roomNumber: 'Lab-1',
    building: 'Annex',
    capacity: 30,
    type: 'Laboratory',
  },
];

export const INITIAL_DIVISIONS: Division[] = [
  {
    id: 'div-1',
    course: 'TY BSc CS',
    year: 3,
    semester: 5,
    divisionName: 'A',
    studentCount: 55,
  },
  {
    id: 'div-2',
    course: 'TY BSc CS',
    year: 3,
    semester: 5,
    divisionName: 'B',
    studentCount: 50,
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-1',
    subjectCode: 'DBMS',
    subjectName: 'Database Management',
    course: 'TY BSc CS',
    year: 3,
    semester: 5,
    division: 'A',
    type: 'Theory',
    lecturesPerWeek: 4,
    teacherId: 't-1',
    teacherName: 'Dr. Mehta',
    duration: 1,
  },
  {
    id: 'sub-2',
    subjectCode: 'CN',
    subjectName: 'Computer Networks',
    course: 'TY BSc CS',
    year: 3,
    semester: 5,
    division: 'A',
    type: 'Theory',
    lecturesPerWeek: 3,
    teacherId: 't-2',
    teacherName: 'Prof. Iyer',
    duration: 1,
  },
  {
    id: 'sub-3',
    subjectCode: 'JAVA',
    subjectName: 'Advanced Java',
    course: 'TY BSc CS',
    year: 3,
    semester: 5,
    division: 'A',
    type: 'Theory',
    lecturesPerWeek: 4,
    teacherId: 't-3',
    teacherName: 'Prof. Khan',
    duration: 1,
  },
  {
    id: 'sub-4',
    subjectCode: 'AI',
    subjectName: 'Artificial Intelligence',
    course: 'TY BSc CS',
    year: 3,
    semester: 5,
    division: 'A',
    type: 'Theory',
    lecturesPerWeek: 3,
    teacherId: 't-2',
    teacherName: 'Prof. Iyer',
    duration: 1,
  },
  {
    id: 'sub-5',
    subjectCode: 'OS',
    subjectName: 'Operating Systems',
    course: 'TY BSc CS',
    year: 3,
    semester: 5,
    division: 'A',
    type: 'Theory',
    lecturesPerWeek: 3,
    teacherId: 't-1',
    teacherName: 'Dr. Mehta',
    duration: 1,
  },
  {
    id: 'sub-6',
    subjectCode: 'JL',
    subjectName: 'Java Lab',
    course: 'TY BSc CS',
    year: 3,
    semester: 5,
    division: 'A',
    type: 'Practical',
    lecturesPerWeek: 2, // 2 sessions of duration 2 = 4 slots total
    teacherId: 't-3',
    teacherName: 'Prof. Khan',
    duration: 2,
  },
];

const STANDARD_PERIODS: { startTime: string; endTime: string; isBreak: boolean }[] = [
  { startTime: '09:00', endTime: '10:00', isBreak: false },
  { startTime: '10:00', endTime: '11:00', isBreak: false },
  { startTime: '11:00', endTime: '11:15', isBreak: true }, // Short Break
  { startTime: '11:15', endTime: '12:15', isBreak: false },
  { startTime: '12:15', endTime: '13:15', isBreak: false },
  { startTime: '13:15', endTime: '14:00', isBreak: true }, // Lunch Break
  { startTime: '14:00', endTime: '15:00', isBreak: false },
  { startTime: '15:00', endTime: '16:00', isBreak: false },
];

export const INITIAL_TIMESLOTS: TimeSlot[] = (
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const
).flatMap((day) =>
  STANDARD_PERIODS.map((period, index) => ({
    id: `slot-${day.toLowerCase()}-${index}`,
    day,
    startTime: period.startTime,
    endTime: period.endTime,
    isBreak: period.isBreak,
    orderIndex: index,
  }))
);

