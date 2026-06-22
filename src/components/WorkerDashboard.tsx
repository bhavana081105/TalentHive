import React, { useState } from 'react';
import { 
  DollarSign, Clock, CheckCircle, Star, Edit, Wallet, Calendar, 
  Trash2, Plus, Image, AlertCircle, Save, Check, X, ClipboardList 
} from 'lucide-react';
import { WorkerProfile, Booking, WorkSample, DayAvailability } from '../types';

interface WorkerDashboardProps {
  worker: WorkerProfile;
  bookings: Booking[];
  onUpdateWorkerProfile: (updatedProfile: WorkerProfile) => void;
  onUpdateBookingStatus: (bookingId: string, status: 'Accepted' | 'Rejected' | 'Completed') => void;
}

export default function WorkerDashboard({
  worker,
  bookings,
  onUpdateWorkerProfile,
  onUpdateBookingStatus,
}: WorkerDashboardProps) {
  // Local sub-tabs to organize the massive features
  const [activeTab, setActiveTab] = useState<'requests' | 'stats' | 'edit'>('requests');

  // Edit Profile Form State
  const [avatar, setAvatar] = useState(worker.avatar || '');
  const [bio, setBio] = useState(worker.bio);
  const [pricePerHour, setPricePerHour] = useState(worker.pricePerHour);
  const [materialCosts, setMaterialCosts] = useState(worker.materialCosts);
  const [bankName, setBankName] = useState(worker.paymentDetails.bankName || '');
  const [accountNumber, setAccountNumber] = useState(worker.paymentDetails.accountNumber || '');
  const [routingNumber, setRoutingNumber] = useState(worker.paymentDetails.routingNumber || '');
  const [payPalEmail, setPayPalEmail] = useState(worker.paymentDetails.payPalEmail || '');
  
  // Availability Schedule State
  const [availability, setAvailability] = useState<DayAvailability[]>(worker.availability || []);

  // Work sample creator local state
  const [workSamples, setWorkSamples] = useState<WorkSample[]>(worker.workSamples);
  const [newSampleTitle, setNewSampleTitle] = useState('');
  const [newSampleDesc, setNewSampleDesc] = useState('');
  const [newSampleUrl, setNewSampleUrl] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if worker profile switches
  React.useEffect(() => {
    setAvatar(worker.avatar || '');
    setBio(worker.bio);
    setPricePerHour(worker.pricePerHour);
    setMaterialCosts(worker.materialCosts);
    setWorkSamples(worker.workSamples);
    setBankName(worker.paymentDetails.bankName || '');
    setAccountNumber(worker.paymentDetails.accountNumber || '');
    setRoutingNumber(worker.paymentDetails.routingNumber || '');
    setPayPalEmail(worker.paymentDetails.payPalEmail || '');
    setAvailability(worker.availability || []);
  }, [worker]);

  // Filter bookings specific to this worker
  const workerBookings = bookings.filter(b => b.workerId === worker.id);
  const pendingRequests = workerBookings.filter(b => b.status === 'Pending');

  // Modify availability ranges
  const handleAvailabilityChange = (dayName: string, field: 'startTime' | 'endTime' | 'enabled', value: any) => {
    const updated = availability.map(av => {
      if (av.day.toLowerCase() === dayName.toLowerCase()) {
        return { ...av, [field]: value };
      }
      return av;
    });
    setAvailability(updated);
  };

  // Handle saving the biography, pricing, and routing details
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWorkerProfile({
      ...worker,
      avatar,
      bio,
      pricePerHour: Number(pricePerHour),
      materialCosts: Number(materialCosts),
      workSamples,
      availability,
      paymentDetails: {
        bankName,
        accountNumber,
        routingNumber,
        payPalEmail,
      }
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Helper to add mock work sample
  const handleAddSample = () => {
    if (!newSampleTitle) return;
    const newSample: WorkSample = {
      id: `s_${Date.now()}`,
      title: newSampleTitle,
      description: newSampleDesc || 'Creative showcase resource',
      imageUrl: newSampleUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600'
    };
    setWorkSamples([...workSamples, newSample]);
    setNewSampleTitle('');
    setNewSampleDesc('');
    setNewSampleUrl('');
  };

  // Helper to remove work sample
  const handleRemoveSample = (id: string) => {
    setWorkSamples(workSamples.filter(s => s.id !== id));
  };

  return (
    <div id="worker-dashboard-panel" className="py-6 space-y-6">
      
      {/* Upper Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src={avatar || worker.avatar}
            alt={worker.name}
            className="w-14 h-14 rounded-full object-cover border border-slate-100"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-xl font-bold text-slate-800">Welcome, {worker.name}</h1>
            <p className="text-xs text-slate-450 font-medium">Specialty: <strong className="text-blue-600">{worker.profession}</strong> | Category: <strong className="text-indigo-600">{worker.category}</strong></p>
          </div>
        </div>

        {/* Inner Tab bar selector */}
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 gap-1 self-start md:self-auto scroll-smooth">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all focus:outline-none cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all focus:outline-none cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            My Stats & Reviews
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all focus:outline-none cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            Edit Profile & Fields
          </button>
        </div>
      </div>

      {/* Main Tab Render Grid */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* TAB 1: Booking requests (Accept/Reject as requested) */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                Active Appointment Requests
              </h2>
              <span className="text-xs text-slate-400">Showing {workerBookings.length} bookings total</span>
            </div>

            {/* List */}
            <div className="space-y-4">
              {workerBookings.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-205 max-w-md mx-auto">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-705">No bookings yet</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Once customers discover your specialty on the frontpage, their appointment schedules will pop up here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Categorized rendering: Pending first, then Accepted/Rejected in history */}
                  {pendingRequests.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-amber-600 tracking-wider uppercase mb-1">Needs Action</h3>
                      {pendingRequests.map(req => (
                        <div 
                          key={req.id}
                          className="bg-white rounded-xl border border-amber-100 shadow-xs p-5 hover:border-amber-200 transition-all space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">Request from {req.customerName}</h4>
                              <p className="text-xs text-slate-500">{req.customerEmail} {req.customerPhone && `• ${req.customerPhone}`}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                Pending confirmation
                              </span>
                              <p className="text-xs font-mono font-bold text-slate-850 mt-1">Estimated: ${req.totalCost}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                            <div className="space-y-1 bg-slate-50 p-2 rounded-lg">
                              <span className="text-[10px] text-slate-410 uppercase font-black block">Preferred Slot</span>
                              <strong className="text-slate-800">{req.date}</strong> at <strong className="text-slate-800">{req.timeSlot}</strong>
                            </div>
                            <div className="space-y-1 bg-slate-50 p-2 rounded-lg">
                              <span className="text-[10px] text-slate-410 uppercase font-black block">Customer Notes</span>
                              <p className="italic text-slate-705">"{req.notes || 'No project description added'}"</p>
                            </div>
                          </div>

                          {/* Accept / Reject buttons */}
                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              id={`reject-btn-${req.id}`}
                              onClick={() => onUpdateBookingStatus(req.id, 'Rejected')}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-500 text-red-700 hover:text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1 focus:outline-none"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject Appointment</span>
                            </button>
                            <button
                              id={`accept-btn-${req.id}`}
                              onClick={() => onUpdateBookingStatus(req.id, 'Accepted')}
                              className="px-4 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white text-xs font-extrabold rounded-lg cursor-pointer transition-colors flex items-center gap-1 focus:outline-none"
                            >
                              <Check className="w-4 h-4" />
                              <span>Accept Request</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Booking Archive/History */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">Appointment Archive</h3>
                    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
                      {workerBookings.filter(b => b.status !== 'Pending').map(req => {
                        const isAccepted = req.status === 'Accepted';
                        return (
                          <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <strong className="text-slate-800">{req.customerName}</strong>
                                <span className="text-slate-400">({req.customerEmail})</span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Date: {req.date} • Block: {req.timeSlot} • Income: <strong className="font-semibold text-slate-800">${req.totalCost}</strong>
                              </p>
                              {req.notes && <p className="italic text-slate-400 text-[11px]">"{req.notes}"</p>}
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {isAccepted ? (
                                <span className="flex items-center gap-1 text-emerald-750 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-bold text-[10px] uppercase">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accepted</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-red-650 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 font-bold text-[10px] uppercase">
                                  <X className="w-3.5 h-3.5" />
                                  <span>Rejected</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {workerBookings.filter(b => b.status !== 'Pending').length === 0 && (
                        <p className="p-4 text-xs text-slate-400 text-center italic">No processed bookings in history.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Performance metrics (completed jobs, hours, reviews) */}
        {activeTab === 'stats' && (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Earnings card */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Total Income</span>
                  <strong className="text-xl font-black text-slate-800">${worker.earnings}</strong>
                  <span className="block text-[9px] text-slate-400">Transferred successfully</span>
                </div>
              </div>

              {/* Working hours */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 flex items-center gap-4 border-l-3 border-l-indigo-505">
                <div className="p-3 bg-indigo-100 text-indigo-650 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Logged Hours</span>
                  <strong className="text-xl font-black text-slate-800">{worker.workingHours} hrs</strong>
                  <span className="block text-[9px] text-slate-400">Total session engagement</span>
                </div>
              </div>

              {/* Jobs Completed */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-emerald-150 text-emerald-600 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Completed Jobs</span>
                  <strong className="text-xl font-black text-slate-800">{worker.completedJobs} projects</strong>
                  <span className="block text-[9px] text-slate-400">98.5% user satisfaction</span>
                </div>
              </div>

              {/* Rating */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-500 rounded-xl">
                  <Star className="w-6 h-6 fill-amber-300" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Average Rating</span>
                  <strong className="text-xl font-black text-slate-800">{worker.rating} Stars</strong>
                  <span className="block text-[9px] text-slate-400">Based on {worker.reviews.length} reviews</span>
                </div>
              </div>
            </div>

            {/* Client feedback comments */}
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Client Comments Log</h3>
              <div className="space-y-4">
                {worker.reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-slate-50 pb-4 last:border-0 last:pb-0 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-slate-850">{rev.customerName}</strong>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500 mb-2">
                      {Array.from({ length: Math.round(rev.rating) }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 italic">"{rev.content}"</p>
                  </div>
                ))}
                {worker.reviews.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No scores or comments logged yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Editable Fields (bio, portfolio images, pricing, payments) */}
        {activeTab === 'edit' && (
          <form onSubmit={handleProfileSave} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-3">
              Configure Freelance Details
            </h2>

            {/* Profile Picture (Avatar) update section */}
            <div className="space-y-3 bg-slate-50 p-4.5 rounded-xl border border-slate-200/60 shadow-3xs">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Profile Avatar Picture
              </label>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                  alt="Avatar Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                  referrerPolicy="no-referrer"
                />
                
                <div className="flex-1 w-full space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Custom Image URL</span>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase mb-1.5">Or choose from professional specialist presets:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Creative Palette', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
                    { name: 'Studio Focus', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
                    { name: 'Vocal Spark', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
                    { name: 'Design Craft', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' },
                    { name: 'Writer Mind', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150' },
                    { name: 'Classic Code', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setAvatar(preset.url)}
                      className={`flex items-center gap-1.5 p-1 pr-2 rounded-full border text-[9px] font-bold transition-all hover:bg-white cursor-pointer ${
                        avatar === preset.url 
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-3xs' 
                          : 'border-slate-200 bg-white/50 text-slate-600'
                      }`}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name} 
                        className="w-4 h-4 rounded-full object-cover border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Public Biography (Bio)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-750 font-sans"
                placeholder="Give clients a detailed view about your skills, workspace setups, and background..."
                required
              />
            </div>

            {/* Pricing Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Salary/Hourly rate ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(Math.max(0, Number(e.target.value)))}
                    className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-710"
                    placeholder="Rate per hour"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Estimating Material Costs ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={materialCosts}
                    onChange={(e) => setMaterialCosts(Math.max(0, Number(e.target.value)))}
                    className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-710"
                    placeholder="Incidental material cost"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Incidentals like courier fees, baking ingredients, sewing fabric, stationery etc.</p>
              </div>
            </div>

            {/* Editable Portfolios as Work Samples */}
            <div className="space-y-4 pt-2 border-t border-slate-50">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Portfolio & Project Images</label>
                <p className="text-[10px] text-slate-400">Display reference pictures highlighting your actual past work samples to prospects.</p>
              </div>

              {/* Sample list */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {workSamples.map((sample) => (
                  <div key={sample.id} className="relative bg-slate-50 rounded-xl p-2 border border-slate-205/60 flex items-center gap-2">
                    <img
                      src={sample.imageUrl}
                      alt={sample.title}
                      className="w-10 h-10 object-cover rounded-lg shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate text-slate-800">{sample.title}</p>
                      <p className="text-[9px] text-slate-500 truncate">{sample.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSample(sample.id)}
                      className="p-1 hover:bg-red-50 text-red-500 rounded-md shrink-0 cursor-pointer"
                      title="Remove Sample"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Create new sample input structure with base64 file upload support */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-205/60 space-y-3">
                <p className="text-[10px] font-bold text-slate-550 uppercase tracking-widest flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-blue-650" /> Add Work Sample Card
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={newSampleTitle}
                    onChange={(e) => setNewSampleTitle(e.target.value)}
                    placeholder="Work title (e.g. Sourdough plate, Shopify API)"
                    className="text-xs p-2.5 bg-white border border-slate-205 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newSampleDesc}
                    onChange={(e) => setNewSampleDesc(e.target.value)}
                    placeholder="Short summary description"
                    className="text-xs p-2.5 bg-white border border-slate-205 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-550"
                  />
                  <input
                    type="url"
                    value={newSampleUrl}
                    onChange={(e) => setNewSampleUrl(e.target.value)}
                    placeholder="Image URL (e.g. Unsplash link)"
                    className="text-xs p-2.5 bg-white border border-slate-205 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-550"
                  />
                  <div className="relative text-xs p-2 bg-white border border-slate-205 rounded-lg flex flex-col justify-center min-h-[42px]">
                    <span className="text-[9px] text-slate-400 block mb-1 font-bold uppercase">Or Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewSampleUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-[9px] text-slate-500 cursor-pointer w-full"
                    />
                  </div>
                </div>

                {newSampleUrl && (
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-100 max-w-sm">
                    <img 
                      src={newSampleUrl} 
                      alt="Thumbnail draft" 
                      className="w-10 h-10 rounded-md object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Thumbnail Registered</span>
                      <p className="text-[8px] text-slate-500 truncate">{newSampleUrl.substring(0, 70)}...</p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddSample}
                  className="px-3 py-1.5 bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Append Sample To List
                </button>
              </div>
            </div>

            {/* Weekly Schedule Ranges (Availability Setup) as requested */}
            <div className="space-y-4 pt-2 border-t border-slate-50">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Weekly Schedule & Availability Ranges
                </label>
                <p className="text-[10px] text-slate-400">
                  Configure the hours clients are authorized to reserve appointments on your calendar. Unchecked weekdays are fully blocked.
                </p>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-205/60 divide-y divide-slate-100 space-y-1">
                {availability.map((dayAvail) => (
                  <div key={dayAvail.day} className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <input
                        type="checkbox"
                        checked={dayAvail.enabled}
                        onChange={(e) => handleAvailabilityChange(dayAvail.day, 'enabled', e.target.checked)}
                        className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        id={`avail-enable-${dayAvail.day}`}
                      />
                      <label htmlFor={`avail-enable-${dayAvail.day}`} className="font-bold text-slate-705 cursor-pointer">
                        {dayAvail.day}
                      </label>
                    </div>

                    {dayAvail.enabled ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 uppercase">Available window:</span>
                        <input
                          type="text"
                          value={dayAvail.startTime}
                          onChange={(e) => handleAvailabilityChange(dayAvail.day, 'startTime', e.target.value)}
                          placeholder="e.g. 09:00 AM"
                          className="p-1 px-2.5 bg-white border border-slate-205 rounded-md text-xs w-24 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                          type="text"
                          value={dayAvail.endTime}
                          onChange={(e) => handleAvailabilityChange(dayAvail.day, 'endTime', e.target.value)}
                          placeholder="e.g. 05:00 PM"
                          className="p-1 px-2.5 bg-white border border-slate-250 rounded-md text-xs w-24 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Fully Out of Office (Reserved Block)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details (as requested) */}
            <div className="space-y-4 pt-2 border-t border-slate-50">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Payment Details & Direct Transfer
                </label>
                <p className="text-[10px] text-slate-400">Specify safe wire routing details so clients can credit and checkout instantly.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Bank Name</span>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. JPMorgan Chase"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Account Number</span>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. ••••9912 or exact"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Routing transit number (RTN)</span>
                  <input
                    type="text"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. 021000021"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">PayPal Email (Alternative option)</span>
                  <input
                    type="email"
                    value={payPalEmail}
                    onChange={(e) => setPayPalEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-550"
                    placeholder="e.g. yourname.paypal@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Feedback Notifications & Save Button */}
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
              {saveSuccess ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 font-semibold animate-in fade-in-50">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Profile variables updated successfully!</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-450 italic flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Save to sync information live to public listings of Talent Hive.</span>
                </div>
              )}

              <button
                type="submit"
                id="save-profile-btn"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wider flex items-center gap-2 outline-none"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
