import { createClient } from '@supabase/supabase-js';
import { User, WorkerProfile, Booking, SystemSettings, ReportItem, Review, DayAvailability, WorkSample } from './types';

// Supabase Connection Credentials (provided by user, with fallback to env variables)
const metaEnv = (import.meta as any).env || {};
const SUPABASE_URL = (metaEnv.VITE_SUPABASE_URL || 'https://ykidawdyrnhhubsqzyyr.supabase.co').replace(/\/rest\/v1\/?$/, '');
const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraWRhd2R5cm5oaHVic3F6eXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODQ5NTIsImV4cCI6MjA5NzM2MDk1Mn0.SsLby4odyhOnoZRG9HJLjBfqQrlbGOFa6dMSwou5Fjc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// SQL schema scripts helper for copy-pasting into Supabase SQL editor
export const SCHEMA_SQL_INSTRUCTIONS = `-- Talent Hive Database Schema Setup
-- Paste these commands into your Supabase project's SQL Editor (https://supabase.com/dashboard/project/ykidawdyrnhhubsqzyyr/sql/new)

CREATE TABLE IF NOT EXISTS th_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  profession TEXT,
  deactivated BOOLEAN DEFAULT false,
  password TEXT, -- Added for secure logins
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Failsafe patch in case table already exists
ALTER TABLE th_users ADD COLUMN IF NOT EXISTS password TEXT;

CREATE TABLE IF NOT EXISTS th_workers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  profession TEXT NOT NULL,
  category TEXT NOT NULL,
  bio TEXT,
  rating NUMERIC DEFAULT 5.0,
  price_per_hour NUMERIC DEFAULT 0,
  material_costs NUMERIC DEFAULT 0,
  location TEXT,
  earnings NUMERIC DEFAULT 0,
  working_hours NUMERIC DEFAULT 0,
  completed_jobs NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active',
  deactivated BOOLEAN DEFAULT false,
  reviews JSONB DEFAULT '[]'::jsonb,
  work_samples JSONB DEFAULT '[]'::jsonb,
  availability JSONB DEFAULT '[]'::jsonb,
  payment_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS th_bookings (
  id TEXT PRIMARY KEY,
  worker_id TEXT NOT NULL,
  worker_name TEXT NOT NULL,
  worker_profession TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL,
  total_cost NUMERIC NOT NULL,
  notes TEXT,
  dispute_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS th_reports (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  date TEXT NOT NULL,
  details TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS th_settings (
  key TEXT PRIMARY KEY,
  commission_fee NUMERIC DEFAULT 10,
  auto_approve_workers BOOLEAN DEFAULT true,
  allow_guest_bookings BOOLEAN DEFAULT true,
  announcement_text TEXT,
  maintenance_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial default settings values
INSERT INTO th_settings (key, commission_fee, auto_approve_workers, allow_guest_bookings, announcement_text, maintenance_mode)
VALUES ('global', 10, true, true, '📢 Welcome to Talent Hive! Verified Specialists demographic onboarded for startups, housewives, students, and active disabled consultants.', false)
ON CONFLICT (key) DO NOTHING;

-- Disable Row Level Security (RLS) policies completely to permit client-side Anonymous Key writes
ALTER TABLE th_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE th_workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE th_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE th_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE th_settings DISABLE ROW LEVEL SECURITY;
`;

// --- Mappers ---

export function mapUserFromDb(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar: row.avatar || '',
    profession: row.profession,
    deactivated: row.deactivated ?? false,
    password: row.password || '',
  };
}

export function mapUserToDb(u: User) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    profession: u.profession || null,
    deactivated: u.deactivated ?? false,
    password: u.password || null,
  };
}

export function mapWorkerFromDb(row: any): WorkerProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar || '',
    profession: row.profession,
    category: row.category,
    bio: row.bio || '',
    rating: Number(row.rating ?? 5.0),
    reviews: Array.isArray(row.reviews) ? row.reviews : [],
    pricePerHour: Number(row.price_per_hour ?? 0),
    materialCosts: Number(row.material_costs ?? 0),
    location: row.location || '',
    workSamples: Array.isArray(row.work_samples) ? row.work_samples : [],
    availability: Array.isArray(row.availability) ? row.availability : [],
    earnings: Number(row.earnings ?? 0),
    workingHours: Number(row.working_hours ?? 0),
    completedJobs: Number(row.completed_jobs ?? 0),
    paymentDetails: row.payment_details || { bankName: '', accountNumber: '', routingNumber: '' },
    status: row.status || 'Active',
    deactivated: row.deactivated ?? false,
  };
}

export function mapWorkerToDb(w: WorkerProfile) {
  return {
    id: w.id,
    name: w.name,
    email: w.email,
    avatar: w.avatar,
    profession: w.profession,
    category: w.category,
    bio: w.bio,
    rating: w.rating,
    reviews: w.reviews,
    price_per_hour: w.pricePerHour,
    material_costs: w.materialCosts,
    location: w.location,
    work_samples: w.workSamples,
    availability: w.availability,
    earnings: w.earnings,
    working_hours: w.workingHours,
    completed_jobs: w.completedJobs,
    payment_details: w.paymentDetails,
    status: w.status || 'Active',
    deactivated: w.deactivated ?? false,
  };
}

export function mapBookingFromDb(row: any): Booking {
  return {
    id: row.id,
    workerId: row.worker_id,
    workerName: row.worker_name,
    workerProfession: row.worker_profession,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone || undefined,
    date: row.date,
    timeSlot: row.time_slot,
    status: row.status,
    totalCost: Number(row.total_cost ?? 0),
    notes: row.notes || undefined,
    disputeReason: row.dispute_reason || undefined,
  };
}

export function mapBookingToDb(b: Booking) {
  return {
    id: b.id,
    worker_id: b.workerId,
    worker_name: b.workerName,
    worker_profession: b.workerProfession,
    customer_id: b.customerId,
    customer_name: b.customerName,
    customer_email: b.customerEmail,
    customer_phone: b.customerPhone || null,
    date: b.date,
    time_slot: b.timeSlot,
    status: b.status,
    total_cost: b.totalCost,
    notes: b.notes || null,
    dispute_reason: b.disputeReason || null,
  };
}

export function mapReportFromDb(row: any): ReportItem {
  return {
    id: row.id,
    type: row.type,
    targetId: row.target_id,
    reporterName: row.reporter_name,
    reason: row.reason,
    date: row.date,
    details: row.details || undefined,
    resolved: row.resolved ?? false,
  };
}

export function mapReportToDb(r: ReportItem) {
  return {
    id: r.id,
    type: r.type,
    target_id: r.targetId,
    reporter_name: r.reporterName,
    reason: r.reason,
    date: r.date,
    details: r.details || null,
    resolved: r.resolved ?? false,
  };
}

// Check database connection and verify table existence
export async function testSupabaseConnection(): Promise<{ connected: boolean; issues: string[] }> {
  try {
    const issues: string[] = [];
    
    // Check th_settings as a test connection
    const { error } = await supabase.from('th_settings').select('count', { count: 'exact', head: true });
    
    if (error) {
      issues.push(`Connection issue / Missing tables: ${error.message} (Code: ${error.code})`);
      return { connected: false, issues };
    }
    
    // Check if other tables are accessible
    const tables = ['th_users', 'th_workers', 'th_bookings', 'th_reports'];
    for (const t of tables) {
      const { error: tErr } = await supabase.from(t).select('count', { count: 'exact', head: true });
      if (tErr) {
        issues.push(`Table "${t}" is not reachable or hasn't been created: ${tErr.message}`);
      }
    }
    
    return { connected: issues.length === 0, issues };
  } catch (err: any) {
    return { connected: false, issues: [err.message || 'Unknown network error'] };
  }
}

// --- High-Level Database APIs with Fallback ---

export const dbService = {
  // Sync all local state to Supabase
  async pushLocalDataToSupabase(
    users: User[],
    workers: WorkerProfile[],
    bookings: Booking[],
    reports: ReportItem[],
    settings: SystemSettings
  ) {
    // 1. Push settings
    await supabase.from('th_settings').upsert({
      key: 'global',
      commission_fee: settings.commissionFee,
      auto_approve_workers: settings.autoApproveWorkers,
      allow_guest_bookings: settings.allowGuestBookings,
      announcement_text: settings.announcementText,
      maintenance_mode: settings.maintenanceMode,
    });

    // 2. Push Users
    if (users.length > 0) {
      const dbUsers = users.map(mapUserToDb);
      await supabase.from('th_users').upsert(dbUsers);
    }

    // 3. Push Workers
    if (workers.length > 0) {
      const dbWorkers = workers.map(mapWorkerToDb);
      await supabase.from('th_workers').upsert(dbWorkers);
    }

    // 4. Push Bookings
    if (bookings.length > 0) {
      const dbBookings = bookings.map(mapBookingToDb);
      await supabase.from('th_bookings').upsert(dbBookings);
    }

    // 5. Push Reports
    if (reports.length > 0) {
      const dbReports = reports.map(mapReportToDb);
      await supabase.from('th_reports').upsert(dbReports);
    }
  },

  // Users Sync Hooks
  async getUsers(): Promise<User[] | null> {
    const { data, error } = await supabase.from('th_users').select('*');
    if (error) return null;
    return data.map(mapUserFromDb);
  },

  async upsertUser(u: User): Promise<boolean> {
    const { error } = await supabase.from('th_users').upsert(mapUserToDb(u));
    if (error) {
      console.error("Supabase upsertUser failure details:", error);
    }
    return !error;
  },

  // Workers Sync Hooks
  async getWorkers(): Promise<WorkerProfile[] | null> {
    const { data, error } = await supabase.from('th_workers').select('*');
    if (error) return null;
    return data.map(mapWorkerFromDb);
  },

  async upsertWorker(w: WorkerProfile): Promise<boolean> {
    const { error } = await supabase.from('th_workers').upsert(mapWorkerToDb(w));
    if (error) {
      console.error("Supabase upsertWorker failure details:", error);
    }
    return !error;
  },

  // Bookings Sync Hooks
  async getBookings(): Promise<Booking[] | null> {
    const { data, error } = await supabase.from('th_bookings').select('*');
    if (error) return null;
    return data.map(mapBookingFromDb);
  },

  async upsertBooking(b: Booking): Promise<boolean> {
    const { error } = await supabase.from('th_bookings').upsert(mapBookingToDb(b));
    if (error) {
      console.error("Supabase upsertBooking failure details:", error);
    }
    return !error;
  },

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase.from('th_users').delete().eq('id', id);
    if (error) {
      console.error("Supabase deleteUser failure details:", error);
    }
    return !error;
  },

  async deleteWorker(id: string): Promise<boolean> {
    const { error } = await supabase.from('th_workers').delete().eq('id', id);
    if (error) {
      console.error("Supabase deleteWorker failure details:", error);
    }
    return !error;
  },

  async deleteBooking(id: string): Promise<boolean> {
    const { error } = await supabase.from('th_bookings').delete().eq('id', id);
    if (error) {
      console.error("Supabase deleteBooking failure details:", error);
    }
    return !error;
  },

  // Reports Sync Hooks
  async getReports(): Promise<ReportItem[] | null> {
    const { data, error } = await supabase.from('th_reports').select('*');
    if (error) return null;
    return data.map(mapReportFromDb);
  },

  async upsertReport(r: ReportItem): Promise<boolean> {
    const { error } = await supabase.from('th_reports').upsert(mapReportToDb(r));
    if (error) {
      console.error("Supabase upsertReport failure details:", error);
    }
    return !error;
  },

  async deleteReport(id: string): Promise<boolean> {
    const { error } = await supabase.from('th_reports').delete().eq('id', id);
    if (error) {
      console.error("Supabase deleteReport failure details:", error);
    }
    return !error;
  },

  // Settings Sync Hooks
  async getSettings(): Promise<SystemSettings | null> {
    const { data, error } = await supabase.from('th_settings').select('*').eq('key', 'global').maybeSingle();
    if (error || !data) return null;
    return {
      commissionFee: Number(data.commission_fee ?? 10),
      autoApproveWorkers: !!data.auto_approve_workers,
      allowGuestBookings: !!data.allow_guest_bookings,
      announcementText: data.announcement_text || '',
      maintenanceMode: !!data.maintenance_mode,
    };
  },

  async saveSettings(settings: SystemSettings): Promise<boolean> {
    const { error } = await supabase.from('th_settings').upsert({
      key: 'global',
      commission_fee: settings.commissionFee,
      auto_approve_workers: settings.autoApproveWorkers,
      allow_guest_bookings: settings.allowGuestBookings,
      announcement_text: settings.announcementText,
      maintenance_mode: settings.maintenanceMode,
    });
    if (error) {
      console.error("Supabase saveSettings failure details:", error);
    }
    return !error;
  },
};
