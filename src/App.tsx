import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import AboutView from './components/AboutView';
import CustomerHome from './components/CustomerHome';
import WorkerProfileModal from './components/WorkerProfileModal';
import WorkerDashboard from './components/WorkerDashboard';
import LoginModal from './components/LoginModal';
import ProfileSettings from './components/ProfileSettings';
import MyBookingsView from './components/MyBookingsView';
import AdminDashboard from './components/AdminDashboard';

import { INITIAL_WORKERS, INITIAL_BOOKINGS } from './data';
import { WorkerProfile, Booking, User, DayAvailability, SystemSettings, ReportItem } from './types';
import { Shield, Sparkles, BookOpen, UserCheck, Key, HelpCircle, Briefcase, AlertTriangle, CheckCircle } from 'lucide-react';
import { dbService, testSupabaseConnection, SCHEMA_SQL_INSTRUCTIONS } from './supabaseClient';

const SEEDED_USERS: User[] = [
  {
    id: 'admin1',
    name: 'Principal Administrator',
    email: 'admin@talenthive.com',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    deactivated: false,
    password: 'password'
  },
  {
    id: 'cust1',
    name: 'Marcus Vance',
    email: 'ceo.bloom@example.com',
    role: 'Customer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    deactivated: false,
    password: 'password'
  },
  {
    id: 'w1',
    name: 'Alex Mercer',
    email: 'alex.mercer@example.com',
    role: 'Worker',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    deactivated: false,
    password: 'password'
  },
  {
    id: 'w2',
    name: 'Emily Chen',
    email: 'emily.chen@example.com',
    role: 'Worker',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    deactivated: false,
    password: 'password'
  },
  {
    id: 'w3',
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    role: 'Worker',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    deactivated: false,
    password: 'password'
  },
  {
    id: 'w4',
    name: 'Sean O\'Connor',
    email: 'sean.oc@example.com',
    role: 'Worker',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    deactivated: false,
    password: 'password'
  },
  {
    id: 'w5',
    name: 'Nova Digital Systems',
    email: 'contact@novadigital.io',
    role: 'Worker',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    deactivated: false,
    password: 'password'
  },
  {
    id: 'w6',
    name: 'Priya Sharma',
    email: 'priya.tailor@example.com',
    role: 'Worker',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    deactivated: false,
    password: 'password'
  }
];

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'repo1',
    type: 'Review',
    targetId: 'w1@r1_2', // workerId@reviewId
    reporterName: 'Alex Mercer',
    reason: 'The content in this review is spam and duplicates another platform feedback block.',
    details: 'Please remove this review completely or prune the images associated with it.',
    date: '2026-06-18',
    resolved: false
  },
  {
    id: 'repo2',
    type: 'Profile',
    targetId: 'w2', // worker ID
    reporterName: 'Anonymous Startup',
    reason: 'The description mentions 10+ years experience, but they are currently an undergraduate student.',
    details: 'Mismatched biography coordinates compared to listed demographic details.',
    date: '2026-06-19',
    resolved: false
  }
];

const normalizeWorkerAvailability = (workerList: WorkerProfile[]): WorkerProfile[] => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return workerList.map(worker => {
    const hasRanges = worker.availability && worker.availability.length > 0 && 
                      (worker.availability[0] as any).startTime !== undefined;
                      
    if (hasRanges) {
      const updatedAvailability = daysOfWeek.map(dName => {
        const found = worker.availability.find(av => av.day.toLowerCase() === dName.toLowerCase());
        if (found) {
          return {
            day: found.day,
            startTime: found.startTime || '09:00 AM',
            endTime: found.endTime || '05:00 PM',
            enabled: found.enabled !== undefined ? found.enabled : true
          };
        }
        return {
          day: dName,
          startTime: '09:00 AM',
          endTime: '05:00 PM',
          enabled: false
        };
      });
      return { ...worker, availability: updatedAvailability };
    }
    
    // Otherwise, convert old slots structure
    const oldDays = worker.availability || [];
    const updatedAvailability = daysOfWeek.map(dName => {
      const oldDayObj = oldDays.find(av => av.day.toLowerCase() === dName.toLowerCase());
      const hasAnyOldSlots = oldDayObj ? (oldDayObj.slots && oldDayObj.slots.length > 0) : false;
      
      return {
        day: dName,
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        enabled: hasAnyOldSlots
      };
    });
    
    return { ...worker, availability: updatedAvailability };
  });
};

export default function App() {
  // --- Supabase Integration States ---
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [supabaseChecking, setSupabaseChecking] = useState<boolean>(true);
  const [supabaseIssues, setSupabaseIssues] = useState<string[]>([]);
  const [isSyncingData, setIsSyncingData] = useState<boolean>(false);

  // --- Persisted State Engines ---
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // --- Admin Specific State Engines ---
  const [users, setUsers] = useState<User[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    commissionFee: 10,
    autoApproveWorkers: true,
    allowGuestBookings: true,
    announcementText: '📢 Welcome to Talent Hive! Verified Specialists demographic onboarded for startups, housewives, students, and active disabled consultants.',
    maintenanceMode: false
  });
  const [reports, setReports] = useState<ReportItem[]>([]);

  // --- UI Routing States ---
  const [currentView, setCurrentView] = useState<string>('home'); // home, search, about, dashboard, my-bookings, settings, admin-dashboard
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState('');

  // --- Initial Mount Bootstrap ---
  useEffect(() => {
    // 1. Fetch Workers
    const storedWorkers = localStorage.getItem('talent_hive_workers');
    let loadedWorkers = INITIAL_WORKERS;
    if (storedWorkers) {
      try {
        loadedWorkers = JSON.parse(storedWorkers);
      } catch (e) {}
    }
    setWorkers(normalizeWorkerAvailability(loadedWorkers));

    // 2. Fetch Bookings
    const storedBookings = localStorage.getItem('talent_hive_bookings');
    let loadedBookings = INITIAL_BOOKINGS;
    if (storedBookings) {
      try {
        loadedBookings = JSON.parse(storedBookings);
      } catch (e) {}
    }
    setBookings(loadedBookings);

    // 3. Fetch Session
    const storedSession = localStorage.getItem('talent_hive_session');
    if (storedSession) {
      try {
        setCurrentUser(JSON.parse(storedSession));
      } catch (e) {}
    }

    // 4. Fetch Users Master List
    const storedUsers = localStorage.getItem('talent_hive_users');
    let loadedUsers = SEEDED_USERS;
    if (storedUsers) {
      try {
        loadedUsers = JSON.parse(storedUsers);
      } catch (e) {}
    }
    setUsers(loadedUsers);

    // 5. Fetch Global Settings
    const storedSettings = localStorage.getItem('talent_hive_system_settings');
    let loadedSettings = systemSettings;
    if (storedSettings) {
      try {
        loadedSettings = JSON.parse(storedSettings);
        setSystemSettings(loadedSettings);
      } catch (e) {}
    }

    // 6. Fetch Reports Queue
    const storedReports = localStorage.getItem('talent_hive_moderator_reports');
    let loadedReports = INITIAL_REPORTS;
    if (storedReports) {
      try {
        loadedReports = JSON.parse(storedReports);
      } catch (e) {}
    }
    setReports(loadedReports);

    // 7. Verify Supabase & Pull Live Overrides
    async function initSupabase() {
      setSupabaseChecking(true);
      const conn = await testSupabaseConnection();
      setSupabaseConnected(conn.connected);
      setSupabaseIssues(conn.issues);

      if (conn.connected) {
        try {
          const [dbUsers, dbWorkers, dbBookings, dbReports, dbSettings] = await Promise.all([
            dbService.getUsers(),
            dbService.getWorkers(),
            dbService.getBookings(),
            dbService.getReports(),
            dbService.getSettings()
          ]);

          if (dbUsers && dbUsers.length > 0) {
            setUsers(dbUsers);
            localStorage.setItem('talent_hive_users', JSON.stringify(dbUsers));
          }
          if (dbWorkers && dbWorkers.length > 0) {
            setWorkers(normalizeWorkerAvailability(dbWorkers));
            localStorage.setItem('talent_hive_workers', JSON.stringify(dbWorkers));
          }
          if (dbBookings && dbBookings.length > 0) {
            setBookings(dbBookings);
            localStorage.setItem('talent_hive_bookings', JSON.stringify(dbBookings));
          }
          if (dbReports) {
            setReports(dbReports);
            localStorage.setItem('talent_hive_moderator_reports', JSON.stringify(dbReports));
          }
          if (dbSettings) {
            setSystemSettings(dbSettings);
            localStorage.setItem('talent_hive_system_settings', JSON.stringify(dbSettings));
          }
        } catch (err) {
          console.error("Failed to load records from Supabase:", err);
        }
      }
      setSupabaseChecking(false);
    }

    initSupabase();
  }, []);

  // Sync state helpers to update localStorage and Supabase
  const saveWorkersToStorage = (updatedList: WorkerProfile[]) => {
    const normalized = normalizeWorkerAvailability(updatedList);
    setWorkers(normalized);
    localStorage.setItem('talent_hive_workers', JSON.stringify(normalized));
    if (supabaseConnected) {
      Promise.all(normalized.map(w => dbService.upsertWorker(w))).catch(err => {
        console.error("Failed to sync worker profile updates directly to Supabase:", err);
      });
    }
  };

  const saveBookingsToStorage = (updatedList: Booking[]) => {
    setBookings(updatedList);
    localStorage.setItem('talent_hive_bookings', JSON.stringify(updatedList));
    if (supabaseConnected) {
      Promise.all(updatedList.map(b => dbService.upsertBooking(b))).catch(err => {
        console.error("Failed to sync booking status directly to Supabase:", err);
      });
    }
  };

  const saveUsersToStorage = (updatedList: User[]) => {
    setUsers(updatedList);
    localStorage.setItem('talent_hive_users', JSON.stringify(updatedList));
    if (supabaseConnected) {
      Promise.all(updatedList.map(u => dbService.upsertUser(u))).catch(err => {
        console.error("Failed to sync users list directly to Supabase:", err);
      });
    }
  };

  // Sync local offline states directly up to remote active Supabase PG tables
  const handleSyncLocalDataToSupabase = async () => {
    setIsSyncingData(true);
    try {
      await dbService.pushLocalDataToSupabase(users, workers, bookings, reports, systemSettings);
      const conn = await testSupabaseConnection();
      setSupabaseConnected(conn.connected);
      setSupabaseIssues(conn.issues);
      alert('🚀 Synchronization successful! Your current Local Mock Data state (Specialists, Bookings, System configurations) has been pushed to your active remote Supabase tables.');
    } catch (err: any) {
      alert(`⚠️ Sync failed: ${err.message}. Ensure tables are created first using the SQL script in your Supabase dashboard.`);
    } finally {
      setIsSyncingData(false);
    }
  };

  // Keep check if current logged-in user was deactivated in directory
  const isDeactivated = useMemo(() => {
    if (!currentUser) return false;
    const match = users.find(u => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
    return match ? !!match.deactivated : false;
  }, [currentUser, users]);

  useEffect(() => {
    if (isDeactivated && currentUser) {
      handleLogout();
      alert('🔒 Your account session has been suspended or deactivated by the platform administrators.');
    }
  }, [isDeactivated, currentUser]);

  // --- Auth Session Triggers ---
  const handleLoginSuccess = async (
    user: User, 
    createdWorkerProfile?: Omit<WorkerProfile, 'id' | 'rating' | 'reviews' | 'earnings' | 'workingHours' | 'completedJobs'>
  ) => {
    // Security Guard: block suspended users logging in
    const existing = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (existing?.deactivated) {
      alert('🔒 Account Suspended: Your access has been restricted by administrators due to guidelines violations.');
      return;
    }

    setCurrentUser(user);
    localStorage.setItem('talent_hive_session', JSON.stringify(user));

    // Ensure they exist in the users master list state and sync with Supabase
    const userExists = users.some(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (!userExists) {
      const newUser = { ...user, deactivated: false };
      const withNew = [...users, newUser];
      saveUsersToStorage(withNew);
      const savedToSupabase = await dbService.upsertUser(newUser);
      if (!savedToSupabase) {
        throw new Error('Account created locally, but Supabase rejected the user record. Check that the th_users table exists and permits inserts.');
      }
    }

    if (user.role === 'Worker') {
      // Check if they already exist in our workers registry
      const existsInWorkers = workers.some(w => w.email.toLowerCase() === user.email.toLowerCase());
      
      if (!existsInWorkers && createdWorkerProfile) {
        // Build worker model with "Pending" or "Active" based on system autoApprove toggled settings
        const newWorker: WorkerProfile = {
          ...createdWorkerProfile,
          id: user.id, // match user ID
          rating: 5.0,
          reviews: [],
          earnings: 0,
          workingHours: 0,
          completedJobs: 0,
          status: systemSettings.autoApproveWorkers ? 'Active' : 'Pending',
          deactivated: false
        };

        const updatedWorkers = [...workers, newWorker];
        saveWorkersToStorage(updatedWorkers);
      }
      
      // Auto-route workers straight to dashboard
      setCurrentView('dashboard');
    } else if (user.role === 'Admin') {
      // Auto-route admin straight to console
      setCurrentView('admin-dashboard');
    } else {
      // Auto-route customers to main registry
      setCurrentView('home');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('talent_hive_session');
    setCurrentView('home');
  };

  // --- Core State Mutators ---

  // 1. Submit Appointment
  const handleAddNewBooking = (newBookingData: Omit<Booking, 'id' | 'status'>) => {
    const freshBooking: Booking = {
      ...newBookingData,
      id: `book_${Date.now()}`,
      status: 'Pending',
    };

    const updated = [freshBooking, ...bookings];
    saveBookingsToStorage(updated);
  };

  // 2. Reject / Accept / Complete (Accepting mutates worker statistics realistically!)
  const handleUpdateBookingStatus = (bookingId: string, status: 'Accepted' | 'Rejected' | 'Completed') => {
    const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status };
      }
      return b;
    });
    saveBookingsToStorage(updatedBookings);

    // If accepted, let's gracefully enhance the worker's earnings & completed jobs
    if (status === 'Accepted') {
      const matchBooking = bookings.find(b => b.id === bookingId);
      if (matchBooking) {
        const updatedWorkers = workers.map(w => {
          if (w.id === matchBooking.workerId) {
            return {
              ...w,
              earnings: w.earnings + matchBooking.totalCost,
              workingHours: w.workingHours + 2, // assume 2 hours
              completedJobs: w.completedJobs + 1
            };
          }
          return w;
        });
        saveWorkersToStorage(updatedWorkers);
      }
    }
  };

  // 2.5 Add reviews with ratings and optional screenshots
  const handleAddReview = (workerId: string, bookingId: string, rating: number, content: string, images: string[]) => {
    const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: 'Completed' as const };
      }
      return b;
    });
    saveBookingsToStorage(updatedBookings);

    const updatedWorkers = workers.map(w => {
      if (w.id === workerId) {
        const newReview = {
          id: `rev_${Date.now()}`,
          customerName: currentUser?.name || 'Anonymous Client',
          rating,
          content,
          date: new Date().toISOString().split('T')[0],
          images
        };
        const updatedReviews = [newReview, ...w.reviews];
        const sum = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = parseFloat((sum / updatedReviews.length).toFixed(1));
        return {
          ...w,
          reviews: updatedReviews,
          rating: avg
        };
      }
      return w;
    });
    saveWorkersToStorage(updatedWorkers);
  };

  // 3. Worker editable fields save
  const handleUpdateWorkerProfile = (updatedProfile: WorkerProfile) => {
    const updatedWorkers = workers.map(w => {
      if (w.id === updatedProfile.id) {
        return updatedProfile;
      }
      return w;
    });
    saveWorkersToStorage(updatedWorkers);
  };

  // 4. Cancel a reservation
  const handleCancelBooking = (bookingId: string) => {
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    saveBookingsToStorage(updatedBookings);
    if (supabaseConnected) {
      dbService.deleteBooking(bookingId).catch(err => {
        console.error("Failed to delete booking from Supabase:", err);
      });
    }
  };

  // 5. Settings username & avatar edits
  const handleUpdateUserProfile = (newName: string, newAvatar: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, name: newName, avatar: newAvatar };
    setCurrentUser(updatedUser);
    localStorage.setItem('talent_hive_session', JSON.stringify(updatedUser));

    // Update in users directory
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, name: newName, avatar: newAvatar };
      }
      return u;
    });
    saveUsersToStorage(updatedUsers);

    // Also update Name/Avatar in matching worker listing if applicable
    if (currentUser.role === 'Worker') {
      const updatedWorkers = workers.map(w => {
        if (w.id === currentUser.id) {
          return { ...w, name: newName, avatar: newAvatar };
        }
        return w;
      });
      saveWorkersToStorage(updatedWorkers);
    }
  };

  // ----------------------------------------------------
  // --- Admin Moderation & Arbitrate Actions ---
  // ----------------------------------------------------

  const handleUpdateSystemSettings = (newSettings: SystemSettings) => {
    setSystemSettings(newSettings);
    localStorage.setItem('talent_hive_system_settings', JSON.stringify(newSettings));
    if (supabaseConnected) {
      dbService.saveSettings(newSettings).catch(err => {
        console.error("Failed to sync system settings to Supabase:", err);
      });
    }
  };

  const handleApproveWorker = (id: string) => {
    const updated = workers.map(w => {
      if (w.id === id) {
        return { ...w, status: 'Active' as const };
      }
      return w;
    });
    saveWorkersToStorage(updated);
  };

  const handleRejectWorker = (id: string) => {
    const updated = workers.map(w => {
      if (w.id === id) {
        return { ...w, status: 'Rejected' as const };
      }
      return w;
    });
    saveWorkersToStorage(updated);
  };

  const handleToggleUserDeactivate = (id: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === id) {
        return { ...u, deactivated: !u.deactivated };
      }
      return u;
    });
    saveUsersToStorage(updatedUsers);

    // Update in workers too
    const updatedWorkers = workers.map(w => {
      if (w.id === id) {
        return { ...w, deactivated: !w.deactivated };
      }
      return w;
    });
    saveWorkersToStorage(updatedWorkers);
  };

  const handleDeleteUser = (id: string) => {
    if (id === 'admin') {
      alert("❌ Cannot delete the core system Administrator account.");
      return;
    }

    const confirmDel = window.confirm(`Are you sure you want to permanently delete user account "${id}"? This will erase all connected login details.`);
    if (!confirmDel) return;

    // Filter out user and worker
    const updatedUsers = users.filter(u => u.id !== id);
    saveUsersToStorage(updatedUsers);

    const updatedWorkers = workers.filter(w => w.id !== id);
    saveWorkersToStorage(updatedWorkers);

    // If deleting active session
    if (currentUser && currentUser.id === id) {
      setCurrentUser(null);
      localStorage.removeItem('talent_hive_session');
    }

    if (supabaseConnected) {
      dbService.deleteUser(id).catch(err => {
        console.error("Failed to delete user from Supabase:", err);
      });
      dbService.deleteWorker(id).catch(err => {
        console.error("Failed to delete worker from Supabase:", err);
      });
    }
  };

  const handleDeleteAllCreatedUsers = () => {
    const confirmReset = window.confirm("⚠️ DANGER: Are you sure you want to delete ALL custom-created users from the platform? This will keep only default seeded accounts.");
    if (!confirmReset) return;

    const seededIds = SEEDED_USERS.map(u => u.id);
    const updatedUsers = SEEDED_USERS;
    saveUsersToStorage(updatedUsers);

    const updatedWorkers = workers.filter(w => seededIds.includes(w.id));
    saveWorkersToStorage(updatedWorkers);

    // If current session is a custom-created user, log them out
    if (currentUser && !seededIds.includes(currentUser.id)) {
      setCurrentUser(null);
      localStorage.removeItem('talent_hive_session');
    }

    if (supabaseConnected) {
      // Find all user IDs in current state that are not in seededIds list
      const customUsers = users.filter(u => !seededIds.includes(u.id));
      Promise.all(
        customUsers.map(async (u) => {
          await dbService.deleteUser(u.id);
          if (u.role === 'Worker') {
            await dbService.deleteWorker(u.id);
          }
        })
      )
      .then(() => alert("🧹 All custom-created users have been deleted from Supabase!"))
      .catch(err => {
        console.error("Failed to batch delete users:", err);
        alert(`⚠️ Cleaned local state, but Supabase reported an error: ${err.message}`);
      });
    } else {
      alert("🧹 Local Sandbox cleaned successfully! All custom-created user profiles deleted.");
    }
  };

  const handleResolveDispute = (bookingId: string, resolution: 'refund' | 'payout') => {
    const updatedList = bookings.map(b => {
      if (b.id === bookingId) {
        return { 
          ...b, 
          status: (resolution === 'refund' ? 'Cancelled' : 'Completed') as any,
          disputeReason: `Settled by Admin arbitration: ${resolution === 'refund' ? 'Refund issued to client' : 'Payout confirmed for worker'}`
        };
      }
      return b;
    });
    saveBookingsToStorage(updatedList);
  };

  const handleForceCancelBooking = (bookingId: string) => {
    const updatedList = bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: 'Cancelled' as any };
      }
      return b;
    });
    saveBookingsToStorage(updatedList);
  };

  const handleDeleteReview = (workerId: string, reviewId: string) => {
    const updatedWorkers = workers.map(w => {
      if (w.id === workerId) {
        const filteredReviews = w.reviews.filter(r => r.id !== reviewId);
        const sum = filteredReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = filteredReviews.length > 0 
          ? parseFloat((sum / filteredReviews.length).toFixed(1))
          : 5.0;
        return {
          ...w,
          reviews: filteredReviews,
          rating: avg
        };
      }
      return w;
    });
    saveWorkersToStorage(updatedWorkers);
  };

  const handleClearReviewImages = (workerId: string, reviewId: string) => {
    const updatedWorkers = workers.map(w => {
      if (w.id === workerId) {
        const updatedReviews = w.reviews.map(r => {
          if (r.id === reviewId) {
            return { ...r, images: [] };
          }
          return r;
        });
        return { ...w, reviews: updatedReviews };
      }
      return w;
    });
    saveWorkersToStorage(updatedWorkers);
  };

  const handleResolveReport = (reportId: string) => {
    const updatedReports = reports.filter(r => r.id !== reportId);
    setReports(updatedReports);
    localStorage.setItem('talent_hive_moderator_reports', JSON.stringify(updatedReports));
    if (supabaseConnected) {
      dbService.deleteReport(reportId).catch(err => {
        console.error("Failed to delete report from Supabase:", err);
      });
    }
  };

  const handleAddReport = (type: 'Profile' | 'Review' | 'Booking', targetId: string, reason: string, details?: string) => {
    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      type,
      targetId,
      reporterName: currentUser?.name || 'Anonymous Platform Guest',
      reason,
      details,
      date: new Date().toISOString().split('T')[0],
      resolved: false
    };
    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    localStorage.setItem('talent_hive_moderator_reports', JSON.stringify(updatedReports));
    if (supabaseConnected) {
      dbService.upsertReport(newReport).catch(err => {
        console.error("Failed to save report to Supabase:", err);
      });
    }
  };

  // Find worker profile matching logged in user (used for dashboard editing state)
  const loggedInWorkerProfile = useMemo(() => {
    if (!currentUser || currentUser.role !== 'Worker') return null;
    return workers.find(w => w.id === currentUser.id) || null;
  }, [currentUser, workers]);

  // Public Catalog view list (hides pending, rejected, and deactivated specialists!)
  const publicActiveWorkers = useMemo(() => {
    return workers.filter(w => w.status !== 'Pending' && w.status !== 'Rejected' && !w.deactivated);
  }, [workers]);

  // Navigate trigger helper
  const handleNavigationChange = (view: string) => {
    if (view === 'search') {
      setSearchFocused('');
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
      
      {/* 1. App Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => setLoginOpen(true)}
        onNavigate={handleNavigationChange}
        onOpenSettings={() => handleNavigationChange('settings')}
        searchQuery={searchFocused}
        onSearchChange={setSearchFocused}
        currentView={currentView}
        supabaseConnected={supabaseConnected}
        supabaseChecking={supabaseChecking}
      />

      {/* 2. System Announcement Alert Preview for Public */}
      {systemSettings.announcementText && (
        <div className="bg-indigo-600 text-white text-xs py-2 text-center animate-pulse tracking-wide font-medium shrink-0">
          <div className="max-w-7xl mx-auto px-4">
            {systemSettings.announcementText}
          </div>
        </div>
      )}

      {/* 3. Main Stage Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* MAINTENANCE SCREEN BLOCKS GUESTS */}
        {systemSettings.maintenanceMode && currentUser?.role !== 'Admin' ? (
          <div className="bg-white rounded-3xl border border-amber-200 p-12 text-center max-w-xl mx-auto my-12 shadow-md space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black text-slate-850">Hive Under Active Sandbox Upgrades</h1>
              <p className="text-xs text-slate-505 leading-relaxed">
                The Talent Hive service portal is undergoing planned system configurations. The administrators have enabled standard offline maintenance mode.
              </p>
              <p className="text-[11px] text-indigo-600 font-mono font-bold bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                Notice: "Only certified staff accounts may bypass this screen to adjust configurations."
              </p>
            </div>
            
            <div className="pt-2 border-t border-slate-50">
              <button
                onClick={() => setLoginOpen(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Sign In as Staff / Administrator
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* VIEW: HOME (Main Specialists Listing Hub) */}
            {currentView === 'home' && (
              <CustomerHome
                workers={publicActiveWorkers}
                onSelectWorker={(w) => setSelectedWorker(w)}
                initialSearchQuery=""
                isSearchPage={false}
              />
            )}

            {/* VIEW: SEARCH & EXPLORE */}
            {currentView === 'search' && (
              <CustomerHome
                workers={publicActiveWorkers}
                onSelectWorker={(w) => setSelectedWorker(w)}
                initialSearchQuery={searchFocused}
                onClearSearch={() => setSearchFocused('')}
                isSearchPage={true}
              />
            )}

            {/* VIEW: ABOUT (Empowerment vision narrative) */}
            {currentView === 'about' && (
              <AboutView />
            )}

            {/* VIEW: WORKER DASHBOARD */}
            {currentView === 'dashboard' && currentUser?.role === 'Worker' && (
              loggedInWorkerProfile ? (
                <WorkerDashboard
                  worker={loggedInWorkerProfile}
                  bookings={bookings}
                  onUpdateWorkerProfile={handleUpdateWorkerProfile}
                  onUpdateBookingStatus={handleUpdateBookingStatus}
                />
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
                  <Shield className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-805">Setting up Listing Profile...</h3>
                  <p className="text-xs text-slate-505">
                    Hi {currentUser.name}! It looks like you parsed as an administrative worker, but don't have matching public variables populated yet. Please save your onboarding fields below.
                  </p>
                  <button
                    onClick={() => {
                      if (currentUser) {
                        const freshWorkerProfile: WorkerProfile = {
                          id: currentUser.id,
                          name: currentUser.name,
                          email: currentUser.email,
                          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                          profession: currentUser.profession || 'Freelance Specialist',
                          category: 'Developer',
                          bio: 'New verified specialist ready to offer high fidelity services...',
                          rating: 5.0,
                          reviews: [],
                          pricePerHour: 30,
                          materialCosts: 0,
                          location: 'Austin, TX',
                          workSamples: [],
                          availability: [
                            { day: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
                            { day: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
                            { day: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
                            { day: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
                            { day: 'Friday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: true },
                            { day: 'Saturday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false },
                            { day: 'Sunday', startTime: '09:00 AM', endTime: '05:00 PM', enabled: false }
                          ],
                          earnings: 0,
                          workingHours: 0,
                          completedJobs: 0,
                          status: systemSettings.autoApproveWorkers ? 'Active' : 'Pending',
                          deactivated: false,
                          paymentDetails: { bankName: '', accountNumber: '', routingNumber: '' }
                        };
                        saveWorkersToStorage([...workers, freshWorkerProfile]);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer animate-pulse"
                  >
                    Instantiate Framework Profile
                  </button>
                </div>
              )
            )}

            {/* VIEW: CUSTOMER BOOKINGS LIST */}
            {currentView === 'my-bookings' && currentUser?.role === 'Customer' && (
              <MyBookingsView
                bookings={bookings}
                workers={workers}
                customerId={currentUser.id}
                onCancelBooking={handleCancelBooking}
                onNavigateHome={() => handleNavigationChange('home')}
                onAddReview={handleAddReview}
                onDisputeBooking={(bookingId, reason) => {
                  const updatedBookings = bookings.map(b => {
                    if (b.id === bookingId) {
                      return { ...b, status: 'Disputed' as const, disputeReason: reason };
                    }
                    return b;
                  });
                  saveBookingsToStorage(updatedBookings);
                  // Auto file report ticket for administrative visibility
                  handleAddReport('Booking', bookingId, `Customer dispute reason: "${reason}"`, `Formal dispute filed by client.`);
                }}
              />
            )}

            {/* VIEW: ADMIN CONSOLE */}
            {currentView === 'admin-dashboard' && currentUser?.role === 'Admin' && (
              <AdminDashboard
                workers={workers}
                bookings={bookings}
                users={users}
                systemSettings={systemSettings}
                reports={reports}
                onUpdateSystemSettings={handleUpdateSystemSettings}
                onApproveWorker={handleApproveWorker}
                onRejectWorker={handleRejectWorker}
                onToggleUserDeactivate={handleToggleUserDeactivate}
                onDeleteUser={handleDeleteUser}
                onDeleteAllCreatedUsers={handleDeleteAllCreatedUsers}
                onResolveDispute={handleResolveDispute}
                onForceCancelBooking={handleForceCancelBooking}
                onDeleteReview={handleDeleteReview}
                onClearReviewImages={handleClearReviewImages}
                onResolveReport={handleResolveReport}
                onAddReport={handleAddReport}
                supabaseConnected={supabaseConnected}
                supabaseChecking={supabaseChecking}
                supabaseIssues={supabaseIssues}
                onSyncLocalDataToSupabase={handleSyncLocalDataToSupabase}
                isSyncingData={isSyncingData}
              />
            )}

            {/* VIEW: SETTINGS (Standard preference edits) */}
            {currentView === 'settings' && (
              <ProfileSettings
                currentUser={currentUser}
                onUpdateUserProfile={handleUpdateUserProfile}
                onClose={() => handleNavigationChange('home')}
              />
            )}

            {/* SEC_GUARD: Worker trying to view Customer Bookings or vice versa */}
            {currentView === 'my-bookings' && (!currentUser || currentUser.role !== 'Customer') && (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center max-w-sm mx-auto my-12 shadow-sm">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">Permissions Withheld</h3>
                <p className="text-xs text-slate-500 mt-2">Only Customer-role accounts can view reservation histories. Shift your session roles to proceed.</p>
              </div>
            )}

            {currentView === 'dashboard' && (!currentUser || currentUser.role !== 'Worker') && (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center max-w-sm mx-auto my-12 shadow-sm">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">Permissions Withheld</h3>
                <p className="text-xs text-slate-500 mt-2">Only registered Service Worker accounts have private panels. Shift roles or Onboard a profile to view.</p>
              </div>
            )}

            {currentView === 'admin-dashboard' && (!currentUser || currentUser.role !== 'Admin') && (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center max-w-sm mx-auto my-12 shadow-sm">
                <Shield className="w-10 h-10 text-red-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">Access Restricted</h3>
                <p className="text-xs text-slate-500 mt-2">Administrative Workbench is only accessible by principal staff. Sign in with designated staff codes to proceed.</p>
              </div>
            )}
          </>
        )}

      </main>

      {/* 4. Shared Onboarding On-demand Welcome Splash (Visible for unregistered users) */}
      {!currentUser && currentView === 'home' && (
        <section id="onboarding-welcome-splash" className="bg-white border-t border-slate-100 py-10 mt-12 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-indigo-655 bg-indigo-50 px-2.5 py-0.5 rounded-md inline-block">Sandbox Quickstart Mode</span>
              <h2 className="text-xl font-extrabold text-slate-850 tracking-tight">Onboard your specialty as a student, housewife, or engineer!</h2>
              <p className="text-xs text-slate-505 max-w-2xl">
                Ready to explore both service customer and worker perspectives? Join immediately to test-drive creating custom agendas, accepting schedules, updating bank details, or editing portfolio samples.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setLoginOpen(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Join / Sign In Now
              </button>
              <button
                onClick={() => handleNavigationChange('about')}
                className="px-5 py-2.5 bg-slate-50 hover:bg-slate-105 border border-slate-150 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Inspect About Story
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. Minimalist Elegant Footer (No telemetry or slop as requested) */}
      <footer id="main-footer" className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-auto shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <strong className="text-white font-semibold">Talent Hive</strong>
            <span>© 2026. All rights and rates belong directly to community contributors.</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => handleNavigationChange('about')} className="hover:text-white cursor-pointer transition-colors bg-transparent border-0 text-slate-400">About Story</button>
            <button onClick={handleLogout} className="hover:text-red-400 cursor-pointer transition-colors bg-transparent border-0 text-slate-400">System Log Out</button>
          </div>
        </div>
      </footer>

      {/* --- OVERLAY MODALS --- */}

      {/* MODAL 1: Individual Worker Profile Detailed Modal (With appointment booker inside!) */}
      {selectedWorker && (
        <WorkerProfileModal
          worker={selectedWorker}
          currentUser={currentUser}
          bookings={bookings}
          onClose={() => setSelectedWorker(null)}
          onBookAppointment={handleAddNewBooking}
          onOpenLogin={() => {
            setSelectedWorker(null);
            setLoginOpen(true);
          }}
          onAddReport={handleAddReport}
        />
      )}

      {/* MODAL 2: Shared Login & Registration Portal Modal */}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          users={users}
        />
      )}
    </div>
  );
}
