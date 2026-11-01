# Automatic Timetable Generator

An automated academic timetable generator built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, **Supabase (PostgreSQL)**, and ready for deployment on **Vercel**.

Based on the computer science academic project by **Unesh Farooqui** (TYBSc CS, Lord Universal College).

---

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **Database / Backend**: Supabase (PostgreSQL) with seamless offline local storage fallback
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

---

## ✨ Features & Constraints

### Constraint Satisfaction Problem (CSP) Engine
- **Randomized Greedy Search with Restarts**: Explores valid schedule permutations with backtracking heuristics (up to 200 attempts).
- **Teacher Clash Prevention**: No teacher is assigned to two divisions in the same period.
- **Classroom Clash Prevention**: No room or lab is assigned to two classes simultaneously.
- **Division Clash Prevention**: No division has multiple simultaneous lectures.
- **Break Time Preservation**: Slots flagged with `isBreak: true` (e.g., recess, lunch) are strictly skipped.
- **Laboratory Allocation**: Practical sessions (duration = 2) are allocated two consecutive back-to-back periods in a `Laboratory`.
- **Theory Classroom Allocation**: Theory lectures prefer standard `Classroom` facilities.
- **Spreading**: Distributes lectures of each subject evenly throughout the week.
- **Independent Validation (`verifySchedule`)**: Validates 100% of hard constraints before persisting.

### Complete Administrative Suite
- **Dashboard**: Summary metrics (Subjects, Teachers, Classrooms, Divisions, Time Slots, Generated Timetables) with quick action shortcuts.
- **Subjects**: Add, edit, delete, search subjects, weekly lecture hours, and assigned faculty.
- **Teachers**: Manage faculty directory, departments, and assigned subject tags.
- **Classrooms & Labs**: Manage rooms, buildings, student capacities, and room types.
- **Courses & Divisions**: Configure academic years, semesters, division sections, and student headcount.
- **Time Slots**: Grouped by weekday, customizable start/end times, and breaks.
- **Timetable Grid**: Color-coded visualization (Blue for Theory, Green for Practical, Yellow for Break).
- **Export & Print**: One-click **Export CSV** and responsive **Print / PDF** layout.
- **Settings**: Update college name, academic year, theme (dark/light), copy Supabase SQL DDL, and 1-click sample data reset.

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Demo Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

*(You can also click the **"Use demo login"** button on the sign-in screen).*

---

## 🗄️ Supabase Setup (Optional)

The application includes an automatic local storage fallback so it works immediately out of the box with zero external configuration!

To connect to a live Supabase PostgreSQL database:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run the script in `supabase/schema.sql` (and optionally `supabase/seed.sql`).
3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
4. Restart your Next.js server (`npm run dev`). The status badge in the header will display **"Supabase Sync Active"**.

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. If using Supabase, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the **Environment Variables** in Vercel.
4. Deploy!
