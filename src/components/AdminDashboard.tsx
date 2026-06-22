import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Star, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Settings, 
  AlertCircle, 
  ToggleLeft, 
  ToggleRight, 
  MessageSquare, 
  Calendar, 
  Eye, 
  Ban, 
  CheckCircle, 
  Info,
  Flag,
  FileText,
  Database,
  Copy,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { WorkerProfile, Booking, User, SystemSettings, ReportItem, Review } from '../types';
import { SCHEMA_SQL_INSTRUCTIONS } from '../supabaseClient';

interface AdminDashboardProps {
  workers: WorkerProfile[];
  bookings: Booking[];
  users: User[];
  systemSettings: SystemSettings;
  reports: ReportItem[];
  onUpdateSystemSettings: (s: SystemSettings) => void;
  onApproveWorker: (id: string) => void;
  onRejectWorker: (id: string) => void;
  onToggleUserDeactivate: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onDeleteAllCreatedUsers: () => void;
  onResolveDispute: (bookingId: string, resolution: 'refund' | 'payout') => void;
  onForceCancelBooking: (bookingId: string) => void;
  onDeleteReview: (workerId: string, reviewId: string) => void;
  onClearReviewImages: (workerId: string, reviewId: string) => void;
  onResolveReport: (reportId: string) => void;
  onAddReport: (type: 'Profile' | 'Review' | 'Booking', targetId: string, reason: string, details?: string) => void;
  // Supabase Integration Props
  supabaseConnected: boolean;
  supabaseChecking: boolean;
  supabaseIssues: string[];
  onSyncLocalDataToSupabase: () => Promise<void>;
  isSyncingData: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function AdminDashboard({
  workers,
  bookings,
  users,
  systemSettings,
  reports,
  onUpdateSystemSettings,
  onApproveWorker,
  onRejectWorker,
  onToggleUserDeactivate,
  onDeleteUser,
  onDeleteAllCreatedUsers,
  onResolveDispute,
  onForceCancelBooking,
  onDeleteReview,
  onClearReviewImages,
  onResolveReport,
  onAddReport,
  supabaseConnected,
  supabaseChecking,
  supabaseIssues,
  onSyncLocalDataToSupabase,
  isSyncingData,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'moderation' | 'bookings' | 'settings'>('analytics');
  
  // Local Settings States
  const [commission, setCommission] = useState(systemSettings.commissionFee);
  const [autoApprove, setAutoApprove] = useState(systemSettings.autoApproveWorkers);
  const [allowGuest, setAllowGuest] = useState(systemSettings.allowGuestBookings);
  const [announcement, setAnnouncement] = useState(systemSettings.announcementText);
  const [maintenance, setMaintenance] = useState(systemSettings.maintenanceMode);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Search filter states for User tab
  const [userQuery, setUserQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'Customer' | 'Worker'>('all');

  // Booking dispute reason states
  const [bookingQuery, setBookingQuery] = useState('');

  // Save Settings Trigger
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSystemSettings({
      commissionFee: Number(commission),
      autoApproveWorkers: autoApprove,
      allowGuestBookings: allowGuest,
      announcementText: announcement,
      maintenanceMode: maintenance
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 2500);
  };

  // ----------------------------------------------------
  // Computations & Analytics Metrics
  // ----------------------------------------------------
  
  // Total completed bookings
  const completedBookings = bookings.filter(b => b.status === 'Completed');
  const disputedBookings = bookings.filter(b => b.status === 'Disputed');
  
  // Calculate aggregate metrics
  const totalVolume = bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
  const completedRevenue = completedBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
  const platformRevenue = parseFloat((completedRevenue * (systemSettings.commissionFee / 100)).toFixed(2));
  
  // Average Worker Rating score
  const workersWithReviews = workers.filter(w => w.reviews && w.reviews.length > 0);
  const systemAvgRating = workersWithReviews.length > 0
    ? parseFloat((workersWithReviews.reduce((sum, w) => sum + w.rating, 0) / workersWithReviews.length).toFixed(2))
    : 4.8;

  // Count active vs deactivated users
  const totalActiveUsers = users.filter(u => !u.deactivated).length;

  // Category statistics helper
  const categoryStats = React.useMemo(() => {
    const stats: { [key: string]: { count: number, earnings: number } } = {
      'Developer': { count: 0, earnings: 0 },
      'Student': { count: 0, earnings: 0 },
      'Housewife': { count: 0, earnings: 0 },
      'Disabled': { count: 0, earnings: 0 },
      'Startup': { count: 0, earnings: 0 }
    };

    workers.forEach(w => {
      if (stats[w.category]) {
        stats[w.category].count += 1;
        stats[w.category].earnings += w.earnings || 0;
      }
    });

    return Object.keys(stats).map(key => ({
      name: key,
      specialists: stats[key].count,
      earnings: stats[key].earnings
    }));
  }, [workers]);

  // Dynamic booking history line chart data helper
  const bookingsTimelineData = React.useMemo(() => {
    // Group count by date
    const groups: { [key: string]: number } = {};
    bookings.forEach(b => {
      groups[b.date] = (groups[b.date] || 0) + 1;
    });
    
    return Object.keys(groups).sort().slice(-7).map(date => ({
      date: date.substring(5), // extract MM-DD
      volume: groups[date]
    }));
  }, [bookings]);

  return (
    <div id="admin-workbench" className="space-y-6">
      
      {/* Header Board / Brand Accent in Space Slate style */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 transform translate-x-8 -translate-y-4 opacity-5 pointer-events-none">
          <Shield className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5Packed">
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-purple-500/30 tracking-widest font-mono">
                System Moderator Access
              </span>
              <span className="bg-white/10 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
                Active
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight font-sans">
              Hive Administrator Dashboard
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Platform-wide moderation controls, verified account reviews, content reports processing, active dispute arbitration, and micro-analytics metrics.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center gap-3.5">
            <img 
              src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150" 
              alt="Admin head" 
              className="w-10 h-10 rounded-full border border-purple-400"
            />
            <div>
              <p className="text-xs font-bold text-slate-200">Principal Administrator</p>
              <p className="text-[10px] text-slate-400 font-mono">admin@talenthive.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Setting Warning Bar if Maintenance on */}
      {systemSettings.maintenanceMode && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>Sandbox Maintenance Mode Activated:</strong> Direct guest viewers of the layout will see a customized service announcement page instead of standard lists. Only Admins can tweak listing assets now.</span>
          </div>
        </div>
      )}

      {/* System Announcement Banner Preview */}
      {systemSettings.announcementText && (
        <div className="bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl p-3 flex items-center gap-2.5 text-xs">
          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
          <span><strong>Broadcasting Notice:</strong> "{systemSettings.announcementText}"</span>
        </div>
      )}

      {/* Tab select bar */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-150 shadow-2xs gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm font-black'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Platform Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm font-black'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User & Worker Management</span>
          {workers.filter(w => w.status === 'Pending').length > 0 && (
            <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              {workers.filter(w => w.status === 'Pending').length} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'moderation'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm font-black'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Content Moderation</span>
          {reports.length > 0 && (
            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              {reports.length} Reports
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm font-black'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Disputes & Bookings Controls</span>
          {disputedBookings.length > 0 && (
            <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              {disputedBookings.length} Disputed
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm font-black'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Site Settings Configuration</span>
        </button>
      </div>

      {/* ----------------------------------------------------
          TAB 1: DYNAMIC ANALYTICS
          ---------------------------------------------------- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Bento grid of KPI metric plates */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-3xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Gross Booked Volume</span>
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-800">${totalVolume}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Cumulative transaction value</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-3xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Platform Earnings</span>
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-xl font-extrabold text-emerald-700">${platformRevenue}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Based on {systemSettings.commissionFee}% platform fee</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-3xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Completed Deliveries</span>
                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-800">{completedBookings.length}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{bookings.length} total request cycles</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-3xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Active Hive Users</span>
                <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-800">{totalActiveUsers}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{users.filter(u => u.deactivated).length} deactivated accounts</p>
              </div>
            </div>

          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Revenue & Workers count by custom category */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Earnings Distribution & Presence</h3>
                <p className="text-[11px] text-slate-400">Total accumulated earnings grouped by demographic community categories.</p>
              </div>
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} />
                    <Bar dataKey="earnings" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Bookings activity over time */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Recent Booking Velocity</h3>
                <p className="text-[11px] text-slate-400">Daily appointment requests created by active guild customers over the last week.</p>
              </div>
              <div className="h-64 mt-2">
                {bookingsTimelineData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    No booking records recorded yet to build timeline.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bookingsTimelineData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Line type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

          {/* Quick Listings summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Top Earners</span>
              <div className="divide-y divide-slate-150">
                {workers.sort((a,b) => b.earnings - a.earnings).slice(0, 3).map(w => (
                  <div key={w.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={w.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-705">{w.name}</p>
                        <p className="text-[10px] text-slate-400">{w.profession}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-800">${w.earnings}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Highest Star Ratings</span>
              <div className="divide-y divide-slate-150">
                {workers.sort((a,b) => b.rating - a.rating).slice(0, 3).map(w => (
                  <div key={w.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={w.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-705">{w.name}</p>
                        <p className="text-[10px] text-slate-400">{w.category} specialist</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-650 flex items-center gap-1">
                      ★ {w.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}


      {/* ----------------------------------------------------
          TAB 2: USER & WORKER MANAGEMENT
          ---------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          
          {/* Worker Approvals Sub-section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-2xs space-y-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>Worker Registration Approvals Queue</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-bold">
                  {workers.filter(w => w.status === 'Pending').length} Pending Validation
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Onboarded specialists requiring account approval before showing up in client explore feeds.</p>
            </div>

            {workers.filter(w => w.status === 'Pending').length === 0 ? (
              <div className="text-center p-8 bg-slate-50 rounded-xl text-slate-400 text-xs">
                🎉 Excellent! All worker applications are currently processed.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px] font-monoBg bg-slate-50">
                      <th className="p-3">Specialist</th>
                      <th className="p-3">Origin / Category</th>
                      <th className="p-3">Hourly Charge</th>
                      <th className="p-3">Profile Bio</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workers.filter(w => w.status === 'Pending').map(w => (
                      <tr key={w.id} className="hover:bg-slate-50/50">
                        <td className="p-3 flex items-center gap-2.5">
                          <img src={w.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">{w.name}</span>
                            <span className="text-[10px] text-slate-400">{w.email}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold block">{w.profession}</span>
                          <span className="bg-indigo-50 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                            {w.category}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-755">
                          ${w.pricePerHour}/hr
                        </td>
                        <td className="p-3 text-slate-500 max-w-xs truncate" title={w.bio}>
                          {w.bio}
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => onRejectWorker(w.id)}
                            className="p-1.5 px-3 border border-red-200 hover:bg-red-50 text-red-650 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Reject Application
                          </button>
                          <button
                            onClick={() => onApproveWorker(w.id)}
                            className="p-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Verify & Approve</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Master User Directory list */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-2xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>Master Member Directory</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Total list of active client accounts, contractors, and general platform users.</p>
                  </div>
                  
                  <button
                    onClick={onDeleteAllCreatedUsers}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-[10px] rounded-xl border border-red-200 uppercase tracking-widest cursor-pointer shadow-3xs transition-all shrink-0 sm:mt-1 self-start sm:self-center"
                    title="Permanently reset users to default seeded lists, deleting all custom profiles"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-650" />
                    <span>Delete All Created Users</span>
                  </button>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search user email or title..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="p-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value as any)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none text-slate-600"
                >
                  <option value="all">All Roles</option>
                  <option value="Customer">Customers</option>
                  <option value="Worker">Workers</option>
                </select>
              </div>
            </div>

            {/* Filtered Users Listing Table */}
            {(() => {
              const filtered = users.filter(u => {
                const matchesSearch = u.name.toLowerCase().includes(userQuery.toLowerCase()) || 
                                     u.email.toLowerCase().includes(userQuery.toLowerCase());
                const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                return matchesSearch && matchesRole;
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center p-8 text-slate-400 text-xs">
                    No users matching criteria search query.
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] font-mono tracking-wider bg-slate-50">
                        <th className="p-3">User Status</th>
                        <th className="p-3">Full User Details</th>
                        <th className="p-3">Assigned Role</th>
                        <th className="p-3">User Account Status</th>
                        <th className="p-3 text-right">Restrictive Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <span className={`w-2 h-2 rounded-full inline-block ${
                              u.deactivated ? 'bg-red-500' : 'bg-emerald-500'
                            }`} />
                          </td>
                          <td className="p-3 flex items-center gap-2.5">
                            <img src={u.avatar} alt="" className="w-6.5 h-6.5 rounded-full object-cover" />
                            <div>
                              <span className="font-bold text-slate-800 text-xs block">{u.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                              u.role === 'Admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                : u.role === 'Worker'
                                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3">
                            {u.deactivated ? (
                              <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-md font-medium border border-red-105">
                                Account Deactivated
                              </span>
                            ) : (
                              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-105">
                                Account Active
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {u.role === 'Admin' ? (
                              <span className="text-[10px] text-slate-400 italic">Core Staff Guarded</span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => onToggleUserDeactivate(u.id)}
                                  className={`p-1 px-2.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors ${
                                    u.deactivated
                                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-200'
                                  }`}
                                >
                                  {u.deactivated ? 'Re-Activate User' : 'Deactivate / Ban User'}
                                </button>
                                
                                <button
                                  onClick={() => onDeleteUser(u.id)}
                                  className="p-1 px-2 rounded-lg text-[10px] bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-750 border border-red-100 hover:border-red-200 font-extrabold cursor-pointer transition-colors flex items-center gap-1"
                                  title="Permanently remove user"
                                >
                                  <Trash2 className="w-3 h-3 text-red-550" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

          </div>

        </div>
      )}


      {/* ----------------------------------------------------
          TAB 3: CONTENT MODERATION QUEUE
          ---------------------------------------------------- */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          
          {/* List of reported items */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-550" />
                <span>Submitted Content Issues & User Reports Queue</span>
                <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                  {reports.length} Open Tickets
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Claims made by platform users regarding review validity, image content, or service worker violations.</p>
            </div>

            {reports.length === 0 ? (
              <div className="text-center p-8 bg-slate-50 rounded-xl text-slate-400 text-xs">
                🕊️ Awesome! There are no flagged reports or outstanding content moderation issues.
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map(rep => {
                  // Find related worker if relevant
                  const targetWorker = workers.find(w => w.id === rep.targetId);
                  
                  return (
                    <div 
                      key={rep.id} 
                      className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3 text-xs flex flex-col md:flex-row justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                            Report Type: {rep.type}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Sent on: {rep.date}
                          </span>
                        </div>

                        <div>
                          <p className="text-slate-500">
                            Claim from <strong className="text-slate-800">{rep.reporterName}</strong>:
                          </p>
                          <p className="font-semibold text-slate-800 text-sm italic mt-1 bg-white p-2 border border-slate-150 rounded-lg">
                            "{rep.reason}"
                          </p>
                        </div>

                        {rep.details && (
                          <p className="text-[11px] text-slate-500">
                            <strong>Context Details:</strong> {rep.details}
                          </p>
                        )}

                        {/* If report is on a profile, render mini bio view */}
                        {rep.type === 'Profile' && targetWorker && (
                          <div className="bg-white p-3 rounded-lg border border-slate-150 text-xs flex items-center gap-3 mt-2">
                            <img src={targetWorker.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                            <div>
                              <p className="font-bold text-slate-800">{targetWorker.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{targetWorker.profession}</p>
                              <p className="text-slate-500 text-[10px] italic line-clamp-1">"{targetWorker.bio}"</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Side tools */}
                      <div className="flex sm:flex-col justify-end items-end gap-2 shrink-0">
                        <button
                          onClick={() => onResolveReport(rep.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold cursor-pointer flex items-center gap-1 transition-colors w-full justify-center"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Dismiss report</span>
                        </button>

                        {rep.type === 'Profile' && targetWorker && (
                          <button
                            onClick={() => {
                              onToggleUserDeactivate(targetWorker.id);
                              onResolveReport(rep.id);
                            }}
                            className="px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-[10px] font-extrabold cursor-pointer flex items-center gap-1 transition-colors w-full justify-center"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>{targetWorker.deactivated ? 'Activate' : 'Deactivate'} Profile</span>
                          </button>
                        )}

                        {rep.type === 'Review' && (
                          <div className="space-y-1.5 w-full">
                            <button
                              onClick={() => {
                                // Match and parse targetId (workerId@reviewId)
                                const [wId, revId] = rep.targetId.split('@');
                                if (wId && revId) {
                                  onDeleteReview(wId, revId);
                                  onResolveReport(rep.id);
                                }
                              }}
                              className="px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-[10px] font-extrabold cursor-pointer flex items-center gap-1 transition-colors w-full justify-center text-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Review content</span>
                            </button>
                            <button
                              onClick={() => {
                                const [wId, revId] = rep.targetId.split('@');
                                if (wId && revId) {
                                  onClearReviewImages(wId, revId);
                                  onResolveReport(rep.id);
                                }
                              }}
                              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-350 hover:text-slate-900 text-slate-700 rounded-lg text-[9px] font-bold cursor-pointer flex items-center gap-1 transition-colors w-full justify-center"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Clear uploaded images</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Review Directory moderation panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Complete Review Registry Moderation</h3>
              <p className="text-[11px] text-slate-400">Inspect customer submitted reviews across all registered workers, and delete or strip images if necessary.</p>
            </div>

            <div className="divide-y divide-slate-150 max-h-96 overflow-y-auto pr-2">
              {workers.flatMap(w => (w.reviews || []).map(r => ({ worker: w, review: r }))).length === 0 ? (
                <p className="text-xs text-slate-405 text-center py-6">No reviews have been written in the platform yet.</p>
              ) : (
                workers.flatMap(w => (w.reviews || []).map(r => ({ worker: w, review: r }))).map(({ worker, review }) => (
                  <div key={review.id} className="py-3.5 flex flex-col sm:flex-row items-start justify-between gap-4 text-xs">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{review.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">wrote for {worker.name} ({worker.profession})</span>
                        <span className="text-amber-500 font-bold ml-1">★ {review.rating}</span>
                      </div>
                      
                      <p className="italic text-slate-650 bg-slate-50 p-2 border border-slate-100 rounded-lg">
                        "{review.content}"
                      </p>

                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2">
                          {review.images.map((img, idx) => (
                            <img 
                              key={idx} 
                              src={img} 
                              alt="Proof sample" 
                              className="w-12 h-12 rounded object-cover border border-slate-150 shrink-0" 
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0 self-center">
                      {review.images && review.images.length > 0 && (
                        <button
                          onClick={() => onClearReviewImages(worker.id, review.id)}
                          className="px-2 py-1 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold cursor-pointer"
                        >
                          Strip Images
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteReview(worker.id, review.id)}
                        className="px-2 py-1 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-[10px] font-bold cursor-pointer"
                      >
                        Delete Review
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}


      {/* ----------------------------------------------------
          TAB 4: APPOINTMENTS CONTROL & DISPUTE ARBITRATION
          ---------------------------------------------------- */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          
          {/* Dispute resolution queue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Arbitration Dispute Tickets</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {bookings.filter(b => b.status === 'Disputed').length} Open Handlest
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Claims containing custom dispute descriptions where consumers request refunding or dispute completed work sessions.</p>
            </div>

            {bookings.filter(b => b.status === 'Disputed').length === 0 ? (
              <div className="text-center p-8 bg-slate-50 rounded-xl text-slate-400 text-xs">
                🤝 No active disputes! Customers and specialists are collaborating smoothly.
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.filter(b => b.status === 'Disputed').map(b => (
                  <div 
                    key={b.id} 
                    className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3.5 text-xs flex flex-col md:flex-row justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 uppercase font-mono text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          Disputed Booking #{b.id}
                        </span>
                        <span className="font-mono text-slate-800 font-bold ml-auto">${b.totalCost} Value</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-white p-3 border border-slate-150 rounded-lg">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Customer (Plaintiff)</p>
                          <p className="font-bold text-slate-800">{b.customerName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{b.customerEmail}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Contractor Specialist</p>
                          <p className="font-bold text-slate-800">{b.workerName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{b.workerProfession}</p>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-405 block uppercase">Customer Dispute Reason:</span>
                        <p className="text-sm italic text-red-700 bg-red-50 p-2 rounded border border-red-101 mt-1 font-medium">
                          "{b.disputeReason || 'No descriptive reason text filed.'}"
                        </p>
                      </div>

                      <p className="text-slate-500 text-[10px]">
                        Scheduled Date: <strong className="text-slate-800">{b.date}</strong> | Slot: <strong className="text-slate-800">{b.timeSlot}</strong>
                      </p>
                    </div>

                    <div className="flex flex-row md:flex-col justify-end items-stretch gap-2 shrink-0 md:w-48 text-right self-center">
                      <button
                        onClick={() => onResolveDispute(b.id, 'refund')}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        Refund Customer (Cancel booking)
                      </button>
                      <button
                        onClick={() => onResolveDispute(b.id, 'payout')}
                        className="p-2 bg-emerald-600 hover:bg-emerald-705 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        Payout Specialist (Complete booking)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Complete Booking Audit Ledger */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-2xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Hive Master Appointments Ledger</h3>
                <p className="text-[11px] text-slate-400">Complete historical journal of session request cycles. Cancel fraudulent items instantly.</p>
              </div>

              <input
                type="text"
                placeholder="Search contractor or client name..."
                value={bookingQuery}
                onChange={(e) => setBookingQuery(e.target.value)}
                className="p-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-705"
              />
            </div>

            {(() => {
              const filteredBookings = bookings.filter(b => 
                b.customerName.toLowerCase().includes(bookingQuery.toLowerCase()) ||
                b.workerName.toLowerCase().includes(bookingQuery.toLowerCase())
              );

              if (filteredBookings.length === 0) {
                return <p className="text-xs text-slate-405 text-center py-6">No matching booking logs.</p>;
              }

              return (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left interface-ledger text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] font-mono tracking-wider bg-slate-50">
                        <th className="p-3">Reference ID</th>
                        <th className="p-3">Client Details</th>
                        <th className="p-3">Specialist Target</th>
                        <th className="p-3">Cost ($)</th>
                        <th className="p-3">Scheduling</th>
                        <th className="p-3">Current Status</th>
                        <th className="p-3 text-right">Moderator Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBookings.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-slate-500">#{b.id}</td>
                          <td className="p-3">
                            <span className="font-semibold block text-slate-800">{b.customerName}</span>
                            <span className="text-[10px] text-slate-400">{b.customerEmail}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold block text-slate-800">{b.workerName}</span>
                            <span className="text-[10px] text-slate-405">{b.workerProfession}</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-755">${b.totalCost}</td>
                          <td className="p-3">
                            <span className="block font-medium">{b.date}</span>
                            <span className="text-[10px] text-slate-400">{b.timeSlot}</span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              b.status === 'Completed'
                                ? 'bg-blue-50 text-blue-800 border-blue-100'
                                : b.status === 'Accepted'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                  : b.status === 'Rejected' || b.status === 'Cancelled'
                                    ? 'bg-red-50 text-red-800 border-red-100'
                                    : b.status === 'Disputed'
                                      ? 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                                      : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {b.status !== 'Cancelled' && b.status !== 'Rejected' && b.status !== 'Completed' ? (
                              <button
                                onClick={() => onForceCancelBooking(b.id)}
                                className="px-2 py-1 text-red-750 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-[10px] font-bold cursor-pointer"
                                title="Force cancel this request cycle instantly"
                              >
                                Cancel Booking
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Settled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

          </div>

        </div>
      )}


      {/* ----------------------------------------------------
          TAB 5: SYSTEM SETTINGS CONFIGURATION
          ---------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-2xs space-y-6">
          
          <div>
            <h3 className="text-sm font-bold text-slate-800">Site-Wide System Configuration</h3>
            <p className="text-[11px] text-slate-400">Modify global commission structures, onboarding flow mechanisms, safety flags, and active alerts.</p>
          </div>

          {settingsSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Configurations updated and broadcast successfully to all server-replicators.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Setting 1: Commission rate */}
            <div className="space-y-2 p-4 bg-slate-50 border border-slate-150 rounded-xl">
              <label className="block text-xs font-bold text-slate-755">
                Platform Service Transaction Commission (%)
              </label>
              <p className="text-[10px] text-slate-500">
                The percentage fee parsed and redirected to system owners from service worker completed gigs totals.
              </p>
              <div className="flex items-center gap-2.5 pt-1.5">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={commission}
                  onChange={(e) => setCommission(Math.min(50, Math.max(0, Number(e.target.value))))}
                  className="w-24 p-2 bg-white border border-slate-205 rounded-lg text-xs font-mono font-bold focus:outline-none"
                />
                <span className="text-xs text-slate-600 font-semibold">% Platform Cut</span>
              </div>
            </div>

            {/* Setting 2: Web on-boarding automation approve */}
            <div className="space-y-2 p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-755">
                  Automatic Specialist Profiles Verification
                </label>
                <p className="text-[10px] text-slate-550">
                  If enabled, new worker profiles go live instantly. If disabled, new signups will remain hidden pending Admin approval.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAutoApprove(!autoApprove)}
                  className="text-blue-600 p-1"
                >
                  {autoApprove ? (
                    <div className="flex items-center gap-2">
                      <ToggleRight className="w-9 h-9 text-blue-600" />
                      <span className="text-xs font-bold text-emerald-700">Auto-Approve Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ToggleLeft className="w-9 h-9 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">Manual Approvals Required</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Setting 3: Allow Booking without guest Auth */}
            <div className="space-y-2 p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-755">
                  Guest On-Demand Consultation Booking
                </label>
                <p className="text-[10px] text-slate-550">
                  Allow unregistered guests to view detailed worker contact rates without authenticating their session.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAllowGuest(!allowGuest)}
                  className="text-blue-600 p-1"
                >
                  {allowGuest ? (
                    <div className="flex items-center gap-2">
                      <ToggleRight className="w-9 h-9 text-blue-600" />
                      <span className="text-xs font-bold text-emerald-700">Guests Permitted</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ToggleLeft className="w-9 h-9 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">Restricted to Registered Customers</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Setting 4: Maintenance mode status */}
            <div className="space-y-2 p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-755">
                  Global Maintenance Flag
                </label>
                <p className="text-[10px] text-slate-550">
                  Stops database queries. Renders custom site-wide warning cards to public viewers indicating system configuration.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMaintenance(!maintenance)}
                  className="text-blue-600 p-1"
                >
                  {maintenance ? (
                    <div className="flex items-center gap-2">
                      <ToggleRight className="w-9 h-9 text-amber-600" />
                      <span className="text-xs font-bold text-amber-700">Maintenance Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ToggleLeft className="w-9 h-9 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">Maintenance Disabled</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Setting 5: Custom banner notification broadcast */}
          <div className="space-y-2 p-4 bg-slate-50 border border-slate-150 rounded-xl">
            <label className="block text-xs font-bold text-slate-755">
              Custom Site-Wide Announcement Banner Notice
            </label>
            <p className="text-[10px] text-slate-500 font-sans">
              Write a community banner alert displaying in real-time at the header of all browser layouts (e.g. system upgrades notice, promotional discounts, local weather news, etc). Leave empty to dismiss.
            </p>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="e.g. System upgrade scheduled for June 22. Some services may experience cold-boots."
              className="w-full text-xs p-2.5 bg-white border border-slate-205 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Broadcast Custom Configurations</span>
            </button>
          </div>

        </form>

        {/* SUPABASE CONNECTION PANEL */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Supabase Cloud Database Sync Settings</h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Integrate with your Postgres database on Supabase to persist your specialist marketplace details, bookings, user roles, system metrics, and dispute resolutions permanently.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Box */}
            <div className="p-4 rounded-xl border border-slate-150 bg-slate-50 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Connection status</span>
              {supabaseChecking ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Verifying Tables Integration...</span>
                </div>
              ) : supabaseConnected ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span>● Supabase Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span>● Offline Fallback (Local State)</span>
                </div>
              )}
              <div className="text-[10px] text-slate-500">
                {supabaseConnected 
                  ? "Live synchronized connection is active." 
                  : "Using LocalStorage replication."}
              </div>
            </div>

            {/* API and URL Endpoint Info Box */}
            <div className="p-4 rounded-xl border border-slate-150 bg-slate-50 space-y-1 md:col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supabase Endpoint</span>
              <code className="text-[10px] font-mono text-blue-800 bg-blue-50/50 px-1.5 py-0.5 rounded break-all block">
                https://ykidawdyrnhhubsqzyyr.supabase.co
              </code>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-2">Active Secrets Configuration</span>
              <span className="text-[10px] text-slate-600 truncate block">
                Anon Key: eyJhbGciOiJIUzI1NiIsIn...Fjc (Successfully Loaded)
              </span>
            </div>
          </div>

          {/* Sync trigger button */}
          <div className="p-4 rounded-xl border border-slate-150 bg-blue-50/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-700">Sync Local Mock Data with Live Cloud</h4>
              <p className="text-[10px] text-slate-500 max-w-xl">
                {supabaseConnected 
                  ? "Your database is online! You can overwrite your remote Supabase tables with your current local browser mock data (Seeded Specialists, Bookings, System configurations) to seed your database anytime."
                  : "Once your tables exist in Supabase (use schema script below), click this button to push all current local mock dataset states up to the cloud."}
              </p>
            </div>
            <button
              type="button"
              disabled={isSyncingData}
              onClick={onSyncLocalDataToSupabase}
              className={`px-4 py-2.5 text-xs font-bold rounded-lg uppercase tracking-wider select-none shrink-0 flex items-center gap-2 cursor-pointer transition-all ${
                isSyncingData 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-xs'
              }`}
            >
              {isSyncingData ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              <span>Push State to Cloud</span>
            </button>
          </div>

          {/* Issues detail box if any */}
          {!supabaseConnected && supabaseIssues.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Tables Missing or Relational Objects Not Verified:</span>
              </div>
              <ul className="list-disc list-inside text-[10px] text-amber-700 space-y-1 pl-1">
                {supabaseIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-600 italic font-medium">
                💡 Fix: If you haven't run the SQL creation scripts, please copy the code block below, run it inside your Supabase project's SQL Editor, then refresh the browser!
              </p>
            </div>
          )}

          {/* SQL Query Paste Assistance Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Interactive SQL Schema Creation DDL</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SCHEMA_SQL_INSTRUCTIONS);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="px-3 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy SQL DDL</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              Run this complete standard SQL code directly in your Supabase SQL Editor to automatically create the compatible tables hierarchy and disable RLS restrictions.
            </p>
            <div className="relative">
              <pre className="text-[10px] font-mono bg-slate-900 text-slate-200 p-4 rounded-xl max-h-56 overflow-y-auto leading-relaxed border border-slate-950 shadow-inner scrollbar-thin">
                {SCHEMA_SQL_INSTRUCTIONS}
              </pre>
            </div>
          </div>
        </div>
      </div>
      )}

    </div>
  );
}
