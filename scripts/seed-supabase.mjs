import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_CLASSROOMS,
  INITIAL_DIVISIONS,
  INITIAL_SUBJECTS,
  INITIAL_TEACHERS,
  INITIAL_TIMESLOTS,
} from '../src/lib/sampleData.js';

const url = 'https://hlxxgnwxskycqmewfekj.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseHhnbnd4c2t5Y3FtZXdmZWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MzAwNDAsImV4cCI6MjEwOTEwNjA0MH0.uz64cnLGeK1xjjWwjRgfG_8Nsw979_SY-k4T77csgS0';

const client = createClient(url, key);

async function runSeed() {
  console.log('Seeding Supabase database...');

  // 1. Teachers
  const teacherPayload = INITIAL_TEACHERS.map(t => ({
    id: t.id,
    teacher_id: t.teacherId,
    teacher_name: t.teacherName,
    email: t.email,
    department: t.department,
    subjects_assigned: t.subjectsAssigned
  }));
  const { error: tErr } = await client.from('teachers').upsert(teacherPayload);
  if (tErr) console.error('Error seeding teachers:', tErr);
  else console.log('✓ Seeded teachers');

  // 2. Classrooms
  const classroomPayload = INITIAL_CLASSROOMS.map(c => ({
    id: c.id,
    room_number: c.roomNumber,
    building: c.building,
    capacity: c.capacity,
    type: c.type
  }));
  const { error: cErr } = await client.from('classrooms').upsert(classroomPayload);
  if (cErr) console.error('Error seeding classrooms:', cErr);
  else console.log('✓ Seeded classrooms');

  // 3. Divisions
  const divisionPayload = INITIAL_DIVISIONS.map(d => ({
    id: d.id,
    course: d.course,
    year: d.year,
    semester: d.semester,
    division_name: d.divisionName,
    student_count: d.studentCount
  }));
  const { error: dErr } = await client.from('divisions').upsert(divisionPayload);
  if (dErr) console.error('Error seeding divisions:', dErr);
  else console.log('✓ Seeded divisions');

  // 4. Subjects
  const subjectPayload = INITIAL_SUBJECTS.map(s => ({
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
    duration: s.duration
  }));
  const { error: sErr } = await client.from('subjects').upsert(subjectPayload);
  if (sErr) console.error('Error seeding subjects:', sErr);
  else console.log('✓ Seeded subjects');

  // 5. TimeSlots
  const timeslotPayload = INITIAL_TIMESLOTS.map(ts => ({
    id: ts.id,
    day: ts.day,
    start_time: ts.startTime,
    end_time: ts.endTime,
    is_break: ts.isBreak,
    order_index: ts.orderIndex
  }));
  const { error: tsErr } = await client.from('timeslots').upsert(timeslotPayload);
  if (tsErr) console.error('Error seeding timeslots:', tsErr);
  else console.log('✓ Seeded timeslots');

  console.log('🎉 Supabase database seeding complete!');
}

runSeed();

