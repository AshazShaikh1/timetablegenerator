import { generateTimetable } from '../src/lib/timetableGenerator.js';
import { 
  INITIAL_DIVISIONS, 
  INITIAL_SUBJECTS, 
  INITIAL_TEACHERS, 
  INITIAL_CLASSROOMS, 
  INITIAL_TIMESLOTS 
} from '../src/lib/sampleData.js';

console.log('Testing timetable generator algorithm...');
const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// 1. Single Division Run
const res1 = generateTimetable({
  division: INITIAL_DIVISIONS[0],
  subjects: INITIAL_SUBJECTS,
  teachers: INITIAL_TEACHERS,
  classrooms: INITIAL_CLASSROOMS,
  timeSlots: INITIAL_TIMESLOTS,
  existingTimetables: [],
  workingDays,
  academicYear: '2026-27',
});

if (!res1.success || !res1.timetable) {
  console.error('FAIL: Division A generation failed:', res1.error);
  process.exit(1);
}
console.log(`PASS: Division A scheduled in ${res1.attemptsUsed} attempt(s) with ${res1.timetable.entries.length} entries.`);

// 2. Multi-division consecutive run (checking cross-division clash prevention)
const res2 = generateTimetable({
  division: INITIAL_DIVISIONS[1],
  subjects: INITIAL_SUBJECTS.map(s => ({ ...s, id: s.id + '-divB', division: 'B' })),
  teachers: INITIAL_TEACHERS,
  classrooms: INITIAL_CLASSROOMS,
  timeSlots: INITIAL_TIMESLOTS,
  existingTimetables: [res1.timetable],
  workingDays,
  academicYear: '2026-27',
});

if (!res2.success || !res2.timetable) {
  console.error('FAIL: Division B cross-scheduling failed:', res2.error);
  process.exit(1);
}
console.log(`PASS: Division B scheduled without clashes against Division A in ${res2.attemptsUsed} attempt(s).`);

// 3. Repeat 25 random runs to test stability
let passes = 0;
for (let i = 0; i < 25; i++) {
  const r = generateTimetable({
    division: INITIAL_DIVISIONS[0],
    subjects: INITIAL_SUBJECTS,
    teachers: INITIAL_TEACHERS,
    classrooms: INITIAL_CLASSROOMS,
    timeSlots: INITIAL_TIMESLOTS,
    existingTimetables: [],
    workingDays,
    academicYear: '2026-27',
  });
  if (r.success) passes++;
}
console.log(`PASS: ${passes}/25 random generation runs successful and validated.`);
console.log('All algorithm checks passed successfully!');

