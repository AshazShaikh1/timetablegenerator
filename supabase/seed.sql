-- Initial Seed Data for TY BSc CS, Semester 5, Division A

INSERT INTO public.teachers (id, teacher_id, teacher_name, email, department, subjects_assigned) VALUES
('t-1', 'T01', 'Dr. Mehta', 'mehta@college.edu', 'Computer Science', ARRAY['DBMS', 'OS']),
('t-2', 'T02', 'Prof. Iyer', 'iyer@college.edu', 'Computer Science', ARRAY['CN', 'AI']),
('t-3', 'T03', 'Prof. Khan', 'khan@college.edu', 'Computer Science', ARRAY['JAVA', 'JL'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.classrooms (id, room_number, building, capacity, type) VALUES
('r-1', '101', 'Main', 60, 'Classroom'),
('r-2', '102', 'Main', 60, 'Classroom'),
('r-3', 'Lab-1', 'Annex', 30, 'Laboratory')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.divisions (id, course, year, semester, division_name, student_count) VALUES
('div-1', 'TY BSc CS', 3, 5, 'A', 55),
('div-2', 'TY BSc CS', 3, 5, 'B', 50)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.subjects (id, subject_code, subject_name, course, year, semester, division, type, lectures_per_week, teacher_id, duration) VALUES
('sub-1', 'DBMS', 'Database Management', 'TY BSc CS', 3, 5, 'A', 'Theory', 4, 't-1', 1),
('sub-2', 'CN', 'Computer Networks', 'TY BSc CS', 3, 5, 'A', 'Theory', 3, 't-2', 1),
('sub-3', 'JAVA', 'Advanced Java', 'TY BSc CS', 3, 5, 'A', 'Theory', 4, 't-3', 1),
('sub-4', 'AI', 'Artificial Intelligence', 'TY BSc CS', 3, 5, 'A', 'Theory', 3, 't-2', 1),
('sub-5', 'OS', 'Operating Systems', 'TY BSc CS', 3, 5, 'A', 'Theory', 3, 't-1', 1),
('sub-6', 'JL', 'Java Lab', 'TY BSc CS', 3, 5, 'A', 'Practical', 2, 't-3', 2)
ON CONFLICT (id) DO NOTHING;
