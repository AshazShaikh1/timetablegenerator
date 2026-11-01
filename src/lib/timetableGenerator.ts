import { 
  Classroom, 
  Division, 
  Subject, 
  Teacher, 
  TimeSlot, 
  Timetable, 
  TimetableEntry, 
  Weekday 
} from '@/types';

export interface GenerationOptions {
  division: Division;
  subjects: Subject[];
  teachers: Teacher[];
  classrooms: Classroom[];
  timeSlots: TimeSlot[];
  existingTimetables: Timetable[];
  workingDays: Weekday[];
  academicYear: string;
}

export interface GenerationResult {
  success: boolean;
  timetable?: Timetable;
  error?: string;
  attemptsUsed?: number;
  stats?: {
    totalLecturesPlaced: number;
    theoryCount: number;
    practicalCount: number;
    daysUsed: number;
  };
}

interface SessionBlock {
  subject: Subject;
  teacher: Teacher;
  duration: number; // 1 or 2
  sessionIndex: number;
}

interface SlotOption {
  day: Weekday;
  slots: TimeSlot[];
  room: Classroom;
  score: number;
}

export function generateTimetable(options: GenerationOptions): GenerationResult {
  const {
    division,
    subjects,
    teachers,
    classrooms,
    timeSlots,
    existingTimetables,
    workingDays,
    academicYear,
  } = options;

  // 1. Validation & Pre-checks
  if (!division) {
    return { success: false, error: 'No division selected.' };
  }

  const divisionSubjects = subjects.filter(
    (s) => s.division.toLowerCase() === division.divisionName.toLowerCase() || !s.division
  );

  if (divisionSubjects.length === 0) {
    return {
      success: false,
      error: `No subjects configured for Division ${division.divisionName} (${division.course} Sem ${division.semester}).`,
    };
  }

  // Check teacher assignment
  const teacherMap = new Map<string, Teacher>();
  teachers.forEach((t) => teacherMap.set(t.id, t));

  for (const sub of divisionSubjects) {
    if (!sub.teacherId || !teacherMap.has(sub.teacherId)) {
      return {
        success: false,
        error: `No teacher is assigned to subject "${sub.subjectCode}" (${sub.subjectName}).`,
      };
    }
  }

  // Filter slots for selected working days and non-break periods
  const activeDays = new Set(workingDays);
  const teachingSlots = timeSlots
    .filter((slot) => activeDays.has(slot.day) && !slot.isBreak)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  if (teachingSlots.length === 0) {
    return {
      success: false,
      error: 'No active teaching time slots configured for the selected working days.',
    };
  }

  // Group teaching slots by day and order
  const slotsByDay = new Map<Weekday, TimeSlot[]>();
  workingDays.forEach((day) => slotsByDay.set(day, []));
  teachingSlots.forEach((slot) => {
    const list = slotsByDay.get(slot.day);
    if (list) list.push(slot);
  });
  slotsByDay.forEach((list) => list.sort((a, b) => a.orderIndex - b.orderIndex));

  // Calculate required slot units
  let totalSlotsNeeded = 0;
  for (const sub of divisionSubjects) {
    totalSlotsNeeded += sub.lecturesPerWeek * sub.duration;
  }

  if (totalSlotsNeeded > teachingSlots.length) {
    return {
      success: false,
      error: `Insufficient time slots: subjects need ${totalSlotsNeeded} slots per week but only ${teachingSlots.length} teaching slots exist across the selected days.`,
    };
  }

  // Check room capacity & type availability
  const labs = classrooms.filter((r) => r.type === 'Laboratory');
  const theoryRooms = classrooms.filter((r) => r.type === 'Classroom');

  const hasPracticals = divisionSubjects.some((s) => s.type === 'Practical');
  if (hasPracticals && labs.length === 0) {
    return {
      success: false,
      error: 'Practical subjects are required, but no room of type "Laboratory" is configured in classrooms.',
    };
  }

  if (classrooms.length === 0) {
    return { success: false, error: 'No classrooms configured in the system.' };
  }

  // 2. Build cross-division busy sets
  const initialBusyTeachers = new Set<string>();
  const initialBusyRooms = new Set<string>();

  for (const otherTt of existingTimetables) {
    // Only consider other divisions
    if (otherTt.divisionId !== division.id) {
      for (const entry of otherTt.entries) {
        if (!entry.isBreak) {
          initialBusyTeachers.add(`${entry.teacherId}|${entry.day}|${entry.startTime}`);
          initialBusyRooms.add(`${entry.roomId}|${entry.day}|${entry.startTime}`);
        }
      }
    }
  }

  // 3. Expand subjects into session blocks
  const baseSessionBlocks: SessionBlock[] = [];
  for (const sub of divisionSubjects) {
    const teacher = teacherMap.get(sub.teacherId)!;
    for (let i = 0; i < sub.lecturesPerWeek; i++) {
      baseSessionBlocks.push({
        subject: sub,
        teacher,
        duration: sub.duration,
        sessionIndex: i,
      });
    }
  }

  // Randomized Greedy CSP with restarts
  const MAX_ATTEMPTS = 200;
  let bestEntries: TimetableEntry[] | null = null;
  let attemptsUsed = 0;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    attemptsUsed = attempt;
    const busyTeachers = new Set<string>(initialBusyTeachers);
    const busyRooms = new Set<string>(initialBusyRooms);
    const busyDivisionSlots = new Set<string>(); // `${day}|${startTime}`
    const subjectDayCount = new Map<string, number>(); // `${subjectId}|${day}` -> count
    const divisionDayTotal = new Map<Weekday, number>();
    workingDays.forEach((d) => divisionDayTotal.set(d, 0));

    // Shuffle within priority classes (Hardest first: duration 2 first, then by total weekly lectures)
    const blocks = [...baseSessionBlocks].sort((a, b) => {
      if (b.duration !== a.duration) {
        return b.duration - a.duration; // Practicals first
      }
      if (b.subject.lecturesPerWeek !== a.subject.lecturesPerWeek) {
        return b.subject.lecturesPerWeek - a.subject.lecturesPerWeek;
      }
      // Add random jitter to break ties
      return Math.random() - 0.5;
    });

    const scheduledEntries: TimetableEntry[] = [];
    let failed = false;

    for (const block of blocks) {
      const validOptions: SlotOption[] = [];

      // Find all valid slots and rooms
      for (const day of workingDays) {
        const daySlots = slotsByDay.get(day) || [];

        if (block.duration === 1) {
          // Single slot
          for (const slot of daySlots) {
            const slotKey = `${day}|${slot.startTime}`;
            if (busyDivisionSlots.has(slotKey)) continue;

            const teacherKey = `${block.teacher.id}|${day}|${slot.startTime}`;
            if (busyTeachers.has(teacherKey)) continue;

            // Pick candidate rooms
            const eligibleRooms = block.subject.type === 'Practical'
              ? labs
              : (theoryRooms.length > 0 ? theoryRooms : classrooms);

            for (const room of eligibleRooms) {
              const roomKey = `${room.id}|${day}|${slot.startTime}`;
              if (!busyRooms.has(roomKey)) {
                // Heuristic score: lower is better
                const daySubCount = subjectDayCount.get(`${block.subject.id}|${day}`) || 0;
                const totalDayLectures = divisionDayTotal.get(day) || 0;
                // Prefer days where subject is not taught yet, and days with fewer lectures
                const score = (daySubCount * 10) + totalDayLectures + Math.random() * 0.2;
                validOptions.push({
                  day,
                  slots: [slot],
                  room,
                  score,
                });
              }
            }
          }
        } else if (block.duration === 2) {
          // Two consecutive slots in the same room
          for (let i = 0; i < daySlots.length - 1; i++) {
            const s1 = daySlots[i];
            const s2 = daySlots[i + 1];

            // Verify they are consecutive time periods
            if (s1.endTime !== s2.startTime) continue;

            const k1 = `${day}|${s1.startTime}`;
            const k2 = `${day}|${s2.startTime}`;
            if (busyDivisionSlots.has(k1) || busyDivisionSlots.has(k2)) continue;

            const tk1 = `${block.teacher.id}|${day}|${s1.startTime}`;
            const tk2 = `${block.teacher.id}|${day}|${s2.startTime}`;
            if (busyTeachers.has(tk1) || busyTeachers.has(tk2)) continue;

            // Practical must be in a lab
            const eligibleRooms = block.subject.type === 'Practical' ? labs : classrooms;

            for (const room of eligibleRooms) {
              const rk1 = `${room.id}|${day}|${s1.startTime}`;
              const rk2 = `${room.id}|${day}|${s2.startTime}`;
              if (!busyRooms.has(rk1) && !busyRooms.has(rk2)) {
                const daySubCount = subjectDayCount.get(`${block.subject.id}|${day}`) || 0;
                const totalDayLectures = divisionDayTotal.get(day) || 0;
                const score = (daySubCount * 20) + totalDayLectures + Math.random() * 0.2;
                validOptions.push({
                  day,
                  slots: [s1, s2],
                  room,
                  score,
                });
              }
            }
          }
        }
      }

      if (validOptions.length === 0) {
        failed = true;
        break; // Restart with new random permutation
      }

      // Sort by best score (lowest)
      validOptions.sort((a, b) => a.score - b.score);
      const chosen = validOptions[0];

      // Assign the session
      for (const slot of chosen.slots) {
        busyDivisionSlots.add(`${chosen.day}|${slot.startTime}`);
        busyTeachers.add(`${block.teacher.id}|${chosen.day}|${slot.startTime}`);
        busyRooms.add(`${chosen.room.id}|${chosen.day}|${slot.startTime}`);

        scheduledEntries.push({
          id: `entry-${block.subject.id}-${chosen.day}-${slot.startTime}-${Math.random().toString(36).substring(2, 7)}`,
          day: chosen.day,
          slotId: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          subjectId: block.subject.id,
          subjectCode: block.subject.subjectCode,
          subjectName: block.subject.subjectName,
          teacherId: block.teacher.id,
          teacherName: block.teacher.teacherName,
          roomId: chosen.room.id,
          roomNumber: chosen.room.roomNumber,
          type: block.subject.type,
          isBreak: false,
        });
      }

      // Update counters
      const prevSubCount = subjectDayCount.get(`${block.subject.id}|${chosen.day}`) || 0;
      subjectDayCount.set(`${block.subject.id}|${chosen.day}`, prevSubCount + 1);

      const prevDayTotal = divisionDayTotal.get(chosen.day) || 0;
      divisionDayTotal.set(chosen.day, prevDayTotal + chosen.slots.length);
    }

    if (!failed) {
      // Independent schedule verification
      const verifyError = verifySchedule(scheduledEntries, divisionSubjects, initialBusyTeachers, initialBusyRooms);
      if (!verifyError) {
        bestEntries = scheduledEntries;
        break;
      }
    }
  }

  if (!bestEntries) {
    return {
      success: false,
      error: `Could not generate a clash-free schedule after ${MAX_ATTEMPTS} attempts. Please verify teacher availability, classroom allocations, or reduce constraints.`,
      attemptsUsed,
    };
  }

  // Also include break slots in the timetable view for complete display
  for (const day of workingDays) {
    const breakSlots = timeSlots.filter((s) => s.day === day && s.isBreak);
    for (const bSlot of breakSlots) {
      bestEntries.push({
        id: `break-${day}-${bSlot.startTime}`,
        day,
        slotId: bSlot.id,
        startTime: bSlot.startTime,
        endTime: bSlot.endTime,
        subjectId: 'BREAK',
        subjectCode: 'BREAK',
        subjectName: bSlot.startTime === '13:15' ? 'Lunch Break' : 'Short Break',
        teacherId: '',
        teacherName: '',
        roomId: '',
        roomNumber: '',
        type: 'Theory',
        isBreak: true,
      });
    }
  }

  // Sort entries chronologically by day and startTime
  const dayOrder: Record<Weekday, number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
  };

  bestEntries.sort((a, b) => {
    if (a.day !== b.day) return dayOrder[a.day] - dayOrder[b.day];
    return a.startTime.localeCompare(b.startTime);
  });

  const theoryCount = divisionSubjects
    .filter((s) => s.type === 'Theory')
    .reduce((sum, s) => sum + s.lecturesPerWeek, 0);

  const practicalCount = divisionSubjects
    .filter((s) => s.type === 'Practical')
    .reduce((sum, s) => sum + s.lecturesPerWeek, 0);

  const finalTimetable: Timetable = {
    id: `tt-${division.id}-${Date.now()}`,
    divisionId: division.id,
    course: division.course,
    year: division.year,
    semester: division.semester,
    divisionName: division.divisionName,
    entries: bestEntries,
    generatedAt: new Date().toISOString(),
    status: 'Published',
    academicYear,
  };

  return {
    success: true,
    timetable: finalTimetable,
    attemptsUsed,
    stats: {
      totalLecturesPlaced: baseSessionBlocks.length,
      theoryCount,
      practicalCount,
      daysUsed: workingDays.length,
    },
  };
}

/**
 * Independent verification function ensuring all hard constraints hold.
 */
function verifySchedule(
  entries: TimetableEntry[],
  subjects: Subject[],
  preBusyTeachers: Set<string>,
  preBusyRooms: Set<string>
): string | null {
  const teacherOccurrences = new Set<string>();
  const roomOccurrences = new Set<string>();
  const slotOccurrences = new Set<string>();
  const subjectSlotCount = new Map<string, number>();

  for (const entry of entries) {
    if (entry.isBreak) continue;

    const slotKey = `${entry.day}|${entry.startTime}`;
    if (slotOccurrences.has(slotKey)) {
      return `Division overlap detected at ${slotKey}`;
    }
    slotOccurrences.add(slotKey);

    const teacherKey = `${entry.teacherId}|${entry.day}|${entry.startTime}`;
    if (teacherOccurrences.has(teacherKey) || preBusyTeachers.has(teacherKey)) {
      return `Teacher conflict detected for teacher ID ${entry.teacherId} at ${entry.day} ${entry.startTime}`;
    }
    teacherOccurrences.add(teacherKey);

    const roomKey = `${entry.roomId}|${entry.day}|${entry.startTime}`;
    if (roomOccurrences.has(roomKey) || preBusyRooms.has(roomKey)) {
      return `Room conflict detected for room ID ${entry.roomId} at ${entry.day} ${entry.startTime}`;
    }
    roomOccurrences.add(roomKey);

    subjectSlotCount.set(entry.subjectId, (subjectSlotCount.get(entry.subjectId) || 0) + 1);
  }

  for (const sub of subjects) {
    const actualSlots = subjectSlotCount.get(sub.id) || 0;
    const expectedSlots = sub.lecturesPerWeek * sub.duration;
    if (actualSlots !== expectedSlots) {
      return `Subject ${sub.subjectCode} expected ${expectedSlots} slots, got ${actualSlots}`;
    }
  }

  return null;
}

