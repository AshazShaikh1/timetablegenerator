-- ====================================================================
-- AUTOMATIC TIMETABLE GENERATOR - SUPABASE POSTGRESQL SCHEMA
-- ====================================================================

-- 1. Create Teachers Table
CREATE TABLE IF NOT EXISTS public.teachers (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL UNIQUE,
    teacher_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    subjects_assigned TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Classrooms Table
CREATE TABLE IF NOT EXISTS public.classrooms (
    id TEXT PRIMARY KEY,
    room_number TEXT NOT NULL UNIQUE,
    building TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 60,
    type TEXT NOT NULL CHECK (type IN ('Classroom', 'Laboratory')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Divisions Table
CREATE TABLE IF NOT EXISTS public.divisions (
    id TEXT PRIMARY KEY,
    course TEXT NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    division_name TEXT NOT NULL,
    student_count INTEGER NOT NULL DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(course, year, semester, division_name)
);

-- 4. Create Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    course TEXT NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    division TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Theory', 'Practical')),
    lectures_per_week INTEGER NOT NULL DEFAULT 3,
    teacher_id TEXT REFERENCES public.teachers(id) ON DELETE SET NULL,
    duration INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(subject_code, course, semester, division)
);

-- 5. Create TimeSlots Table
CREATE TABLE IF NOT EXISTS public.timeslots (
    id TEXT PRIMARY KEY,
    day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_break BOOLEAN DEFAULT false NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(day, start_time)
);

-- 6. Create Timetables Table
CREATE TABLE IF NOT EXISTS public.timetables (
    id TEXT PRIMARY KEY,
    division_id TEXT NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
    course TEXT NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    division_name TEXT NOT NULL,
    entries JSONB NOT NULL DEFAULT '[]'::jsonb,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Published',
    academic_year TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

-- 8. Create Public Access Policies (Allow read/write for authenticated and anon users for institutional demo)
CREATE POLICY "Public Read Access Teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Teachers" ON public.teachers FOR ALL USING (true);

CREATE POLICY "Public Read Access Classrooms" ON public.classrooms FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Classrooms" ON public.classrooms FOR ALL USING (true);

CREATE POLICY "Public Read Access Divisions" ON public.divisions FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Divisions" ON public.divisions FOR ALL USING (true);

CREATE POLICY "Public Read Access Subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Subjects" ON public.subjects FOR ALL USING (true);

CREATE POLICY "Public Read Access TimeSlots" ON public.timeslots FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update TimeSlots" ON public.timeslots FOR ALL USING (true);

CREATE POLICY "Public Read Access Timetables" ON public.timetables FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Timetables" ON public.timetables FOR ALL USING (true);

