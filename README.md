# Talent Hive — Full-Stack Service Marketplace

A full-stack platform connecting local freelancers, students, and independent workers with customers looking to book their services. Built solo, with role-based dashboards for Customers, Workers, and Admins.

**Live demo:

## Features

- Custom email/password authentication with bcrypt password hashing
- Role-based access: separate Customer, Worker, and Admin dashboards
- Service browsing with category, location, budget, and rating filters (10+ categories)
- Booking creation and management
- Worker profile management (pricing, availability, bio, work samples)
- Admin dashboard for user/worker/booking oversight

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Supabase (PostgreSQL) as Backend-as-a-Service — no custom server; the frontend calls Supabase's auto-generated REST API directly
- **Auth:** Custom-built email/password system (not Supabase Auth), with bcrypt hashing
- **Hosting:** Netlify

## Architecture Notes

This project uses Supabase as a Backend-as-a-Service rather than a custom Node/Express server — all data operations (including login/signup logic) call Supabase's REST API directly from the frontend. Filtering and search run client-side on data fetched once at load, which works well at this scale but wouldn't be optimal with a much larger dataset (a future improvement would be moving filters into the Supabase query itself).

## Setup / Run Locally

**Prerequisites:** Node.js

1. Clone the repo and install dependencies:
git clone https://github.com/bhavana081105/TalentHive.git
cd TalentHive
npm install
2. Create a `.env` file in the root directory (see `.env.example`) with your own Supabase project's URL and anon/publishable key:
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
3. Run the setup SQL (see `SCHEMA_SQL_INSTRUCTIONS` in `src/supabaseClient.ts`) in your Supabase project's SQL Editor to create the required tables.
4. Run the app:
npm run dev

## Known Limitations

- Authentication is custom-built rather than using a managed provider (e.g., Supabase Auth or OAuth) — a good next step for production use
- Filtering/search is done client-side rather than via database queries, which is fine at small scale but not optimized for large datasets
- Row Level Security is enabled with broad read/write policies for the app's anon key (delete is restricted), since the app doesn't yet use per-user session-based auth that RLS's per-user policies typically rely on

## Credits

Initially scaffolded using Google AI Studio, then extended and debugged manually — including implementing password hashing, fixing a data-sync race condition, restricting admin signup, and enabling database-level access controls.