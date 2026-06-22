import React, { useState } from 'react';
import { X, Calendar, DollarSign, Star, Briefcase, MapPin, Sparkles, Phone, MessageSquare, ShieldAlert, Clock, Flag } from 'lucide-react';
import { WorkerProfile, Booking, User } from '../types';

interface WorkerProfileModalProps {
  worker: WorkerProfile;
  currentUser: User | null;
  bookings: Booking[];
  onClose: () => void;
  onBookAppointment: (booking: Omit<Booking, 'id' | 'status'>) => void;
  onOpenLogin: () => void;
  onAddReport: (type: 'Profile' | 'Review' | 'Booking', targetId: string, reason: string, details?: string) => void;
}

export default function WorkerProfileModal({
  worker,
  currentUser,
  bookings,
  onClose,
  onBookAppointment,
  onOpenLogin,
  onAddReport,
}: WorkerProfileModalProps) {
  // Form coordinates
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [bookSuccess, setBookSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Reporting States
  const [showProfileReportForm, setShowProfileReportForm] = useState(false);
  const [profileReportReason, setProfileReportReason] = useState('');
  const [profileReportDetails, setProfileReportDetails] = useState('');
  const [profileReportSuccess, setProfileReportSuccess] = useState(false);

  const [activeReportingReviewId, setActiveReportingReviewId] = useState<string | null>(null);
  const [reviewReportReason, setReviewReportReason] = useState('');
  const [reviewReportSuccessId, setReviewReportSuccessId] = useState<string | null>(null);

  // 1. Generate 14 upcoming days starting from today as a scrollable calendar
  const upcomingDays = React.useMemo(() => {
    return Array.from({ length: 14 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { dateStr, dayName, label };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(upcomingDays[0]?.dateStr || '');

  // 2. Identify selected weekday availability configuration
  const selectedDayName = React.useMemo(() => {
    const foundDay = upcomingDays.find(d => d.dateStr === selectedDate);
    return foundDay ? foundDay.dayName : '';
  }, [selectedDate, upcomingDays]);

  const activeAvailability = React.useMemo(() => {
    return worker.availability.find(av => av.day.toLowerCase() === selectedDayName.toLowerCase());
  }, [selectedDayName, worker.availability]);

  // 3. Filter other customers' active bookings on selected date
  const reservedIntervals = React.useMemo(() => {
    return bookings.filter(b => 
      b.workerId === worker.id && 
      b.date === selectedDate && 
      b.status !== 'Rejected' &&
      b.status !== 'Cancelled'
    );
  }, [bookings, worker.id, selectedDate]);

  // Time conversion helpers (convert "09:00 AM" or "17:00" to minutes from midnight)
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const clean = timeStr.trim().toUpperCase();
    const isPm = clean.includes('PM');
    const isAm = clean.includes('AM');
    
    let parts = clean.replace('AM', '').replace('PM', '').trim().split(':');
    let hours = parseInt(parts[0], 10);
    let minutes = parts[1] ? parseInt(parts[1], 10) : 0;
    
    if (isPm && hours < 12) hours += 12;
    if (isAm && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

  const formatMinutesTo12Hr = (minutes: number): string => {
    let hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    if (hrs === 0) hrs = 12;
    const minsStr = mins < 10 ? `0${mins}` : mins;
    const hrsStr = hrs < 10 ? `0${hrs}` : hrs;
    return `${hrsStr}:${minsStr} ${ampm}`;
  };

  // 4. Time selection parameters
  const [selectedStartMin, setSelectedStartMin] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(1); // default 1 hour booking

  // Auto-set the first available start slot when selectedDate changes
  React.useEffect(() => {
    if (activeAvailability && activeAvailability.enabled) {
      const startMin = timeToMinutes(activeAvailability.startTime);
      setSelectedStartMin(startMin);
    } else {
      setSelectedStartMin(null);
    }
  }, [selectedDate, activeAvailability]);

  // 5. Eligible start increments of 30 minutes from shift start to end
  const eligibleStartTimes = React.useMemo(() => {
    if (!activeAvailability || !activeAvailability.enabled) return [];
    
    const startMin = timeToMinutes(activeAvailability.startTime);
    const endMin = timeToMinutes(activeAvailability.endTime);
    const options: { label: string; valueMin: number; isReserved: boolean }[] = [];
    
    for (let current = startMin; current < endMin; current += 30) {
      const label = formatMinutesTo12Hr(current);
      // Check overlap
      const isReserved = reservedIntervals.some(b => {
        const slotsParts = b.timeSlot.split('-');
        if (slotsParts.length !== 2) return false;
        const bStart = timeToMinutes(slotsParts[0]);
        const bEnd = timeToMinutes(slotsParts[1]);
        return (current >= bStart && current < bEnd);
      });
      options.push({ label, valueMin: current, isReserved });
    }
    return options;
  }, [activeAvailability, reservedIntervals]);

  // Calculations for requested interval block
  const bookingTimeRangeStr = React.useMemo(() => {
    if (selectedStartMin === null) return '';
    const endMin = selectedStartMin + selectedDuration * 60;
    return `${formatMinutesTo12Hr(selectedStartMin)} - ${formatMinutesTo12Hr(endMin)}`;
  }, [selectedStartMin, selectedDuration]);

  const hasOverlapError = React.useMemo(() => {
    if (selectedStartMin === null || !activeAvailability) return false;
    const startMin = selectedStartMin;
    const endMin = selectedStartMin + selectedDuration * 60;
    
    // Bounds check
    const dailyEndMin = timeToMinutes(activeAvailability.endTime);
    if (endMin > dailyEndMin) return true;
    
    // Check overlaps
    return reservedIntervals.some(b => {
      const slotsParts = b.timeSlot.split('-');
      if (slotsParts.length !== 2) return false;
      const bStart = timeToMinutes(slotsParts[0]);
      const bEnd = timeToMinutes(slotsParts[1]);
      return Math.max(startMin, bStart) < Math.min(endMin, bEnd);
    });
  }, [selectedStartMin, selectedDuration, reservedIntervals, activeAvailability]);

  const estimatedTotal = React.useMemo(() => {
    if (selectedStartMin === null) return 0;
    return Math.ceil(worker.pricePerHour * selectedDuration + worker.materialCosts);
  }, [selectedStartMin, selectedDuration, worker.pricePerHour, worker.materialCosts]);

  // Auto-fill logged in user email & name if they sign in later
  React.useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!currentUser) {
      setValidationError('Please sign in or register to submit a booking appointment request!');
      return;
    }

    if (selectedStartMin === null || !activeAvailability || !activeAvailability.enabled) {
      setValidationError('Please select a date where the specialist is offering scheduling windows.');
      return;
    }

    if (hasOverlapError) {
      setValidationError('Overlap Error: The requested timeframe is already reserved or exceeds availability.');
      return;
    }

    if (!customerEmail || !customerName) {
      setValidationError('Name and Email coordinate fields are required.');
      return;
    }

    // Submit Booking back up to state
    onBookAppointment({
      workerId: worker.id,
      workerName: worker.name,
      workerProfession: worker.profession,
      customerId: currentUser.id,
      customerName,
      customerEmail,
      customerPhone,
      date: selectedDate, // e.g. "2026-06-20"
      timeSlot: bookingTimeRangeStr,
      totalCost: estimatedTotal,
      notes: serviceNotes,
    });

    setBookSuccess(true);
    setServiceNotes('');
  };

  const handleProfileReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileReportReason.trim()) return;
    
    onAddReport(
      'Profile',
      worker.id,
      profileReportReason,
      `Reporters Email context: ${currentUser?.email || 'Anonymous guest'}. Extra Details: ${profileReportDetails}`
    );
    setProfileReportSuccess(true);
    setTimeout(() => {
      setProfileReportSuccess(false);
      setShowProfileReportForm(false);
      setProfileReportReason('');
      setProfileReportDetails('');
    }, 2000);
  };

  const handleReviewReport = (reviewId: string) => {
    if (!reviewReportReason.trim()) return;
    
    // We send targetId packed as workerId@reviewId
    onAddReport(
      'Review',
      `${worker.id}@${reviewId}`,
      reviewReportReason,
      `Reported review authored on template specialist profile of ${worker.name}.`
    );
    setReviewReportSuccessId(reviewId);
    setTimeout(() => {
      setReviewReportSuccessId(null);
      setActiveReportingReviewId(null);
      setReviewReportReason('');
    }, 2000);
  };

  return (
    <div id="worker-profile-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Container Card */}
      <div 
        id="worker-profile-card"
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-250"
      >
        {/* Modal Top Header Bar with Close */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-md bg-blue-105 text-blue-700 text-xs font-bold uppercase tracking-wider font-mono">
              Expert Portfolio Card
            </span>
          </div>
          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-650 transition-colors"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          
          {/* Section 1: Hero Profile Row */}
          <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-slate-50">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-55 shadow-md flex-shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {worker.category} Demographic
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{worker.rating} Verified Rating</span>
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{worker.name}</h1>
                
                {/* Profile Moderation Flag action */}
                <button
                  type="button"
                  onClick={() => setShowProfileReportForm(!showProfileReportForm)}
                  className="p-1 text-slate-400 hover:text-red-650 transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold border border-slate-205 rounded-lg px-2 hover:bg-red-50/50"
                  title="Flag this profile for platform violations"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Profiles</span>
                </button>
              </div>

              <p className="text-sm font-semibold text-slate-500">{worker.profession}</p>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {worker.location}
                </span>
                <span className="text-slate-200">|</span>
                <span>Completed Jobs: {worker.completedJobs}</span>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-105 shrink-0 text-left md:text-right min-w-[160px]">
              <span className="text-[10px] text-blue-600 font-extrabold tracking-wider uppercase block">Hourly Tariff</span>
              <p className="text-2xl font-black text-slate-800">${worker.pricePerHour}<span className="text-sm font-medium text-slate-500">/hr</span></p>
              {worker.materialCosts > 0 ? (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-1.5 py-0.5 mt-2 font-semibold text-center md:text-right">
                  + ${worker.materialCosts} material fee
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-2 font-medium">No initial material charge</p>
              )}
            </div>
          </div>

          {/* Profile Report Rationale overlay dropdown */}
          {showProfileReportForm && (
            <form onSubmit={handleProfileReport} className="bg-red-50 p-4 rounded-xl border border-red-200 text-xs space-y-3.5 animate-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-800 uppercase font-mono tracking-wider flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 text-red-650" />
                  <span>File Formal Profile Violation Complaint</span>
                </span>
                <button type="button" onClick={() => setShowProfileReportForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {profileReportSuccess ? (
                <p className="text-emerald-705 font-bold">✓ Profile report submitted. The Hive moderation staff will evaluate.</p>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-semibold block text-slate-705">Reason for Profile Flag:</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., Fraudulent profile bio, fake pricing rates, duplicate portfolio samples..."
                      value={profileReportReason}
                      onChange={(e) => setProfileReportReason(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-205 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-755"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold block text-slate-705">Specific Details (Optional):</label>
                    <textarea 
                      placeholder="Provide any extra details or proof information..."
                      value={profileReportDetails}
                      onChange={(e) => setProfileReportDetails(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 bg-white border border-slate-205 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-755"
                    />
                  </div>

                  <div className="flex justify-end gap-2 text-xs">
                    <button 
                      type="button" 
                      onClick={() => setShowProfileReportForm(false)} 
                      className="px-3 py-1.5 bg-white border border-slate-205 text-slate-605 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold cursor-pointer"
                    >
                      Submit Flag
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* Grid Layout: Biography & Samples Left, Appointment Booker Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Columns (Biography, Work Samples, Reviews) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Bio block */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Biography</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{worker.bio}</p>
              </div>

              {/* Work Samples / Portfolio Gallery (as requested) */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Portfolio Work Samples</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {worker.workSamples.map((sample) => (
                    <div 
                      key={sample.id}
                      className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex flex-col"
                    >
                      <img
                        src={sample.imageUrl}
                        alt={sample.title}
                        className="w-full h-36 object-cover hover:scale-103 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="p-3.5 space-y-1">
                        <h4 className="font-bold text-xs text-slate-850 line-clamp-1">{sample.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{sample.description}</p>
                      </div>
                    </div>
                  ))}
                  {worker.workSamples.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No reference work images uploaded yet.</p>
                  )}
                </div>
              </div>

              {/* Client Reviews Section */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Recent Client Reviews</h3>
                <div className="space-y-3.5">
                  {worker.reviews.map((rev) => (
                    <div 
                      key={rev.id}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 text-xs space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-705">{rev.customerName}</span>
                          
                          {/* Review moderation flag action */}
                          <button
                            type="button"
                            onClick={() => setActiveReportingReviewId(activeReportingReviewId === rev.id ? null : rev.id)}
                            className="text-slate-404 hover:text-red-500 transition-colors font-bold flex items-center gap-0.5 text-[9px] cursor-pointer bg-slate-100/50 hover:bg-red-50 border border-slate-205 rounded px-1"
                            title="Report fake or abusive review to admin"
                          >
                            <Flag className="w-2.5 h-2.5" />
                            <span>Report Review</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-3xs">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                          <span className="font-bold">{rev.rating}.0</span>
                        </div>
                      </div>

                      {/* Flag Review form overlay inline */}
                      {activeReportingReviewId === rev.id && (
                        <div className="p-3 bg-red-50 rounded-xl border border-red-150 text-[10px] space-y-2 my-1 animate-in slide-in-from-top-2 duration-150">
                          {reviewReportSuccessId === rev.id ? (
                            <p className="text-emerald-705 font-bold">✓ Admin ticket filed successfully.</p>
                          ) : (
                            <div className="space-y-1.5">
                              <p className="font-bold text-red-800">Flag this review as fraudulent or offensive:</p>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  placeholder="Reason (e.g. offensive terms, spam, promotional slop...)"
                                  value={reviewReportReason}
                                  onChange={(e) => setReviewReportReason(e.target.value)}
                                  className="flex-1 p-1 px-2 border border-slate-205 rounded bg-white text-[10px] focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-705"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => handleReviewReport(rev.id)}
                                  className="px-3 bg-red-600 text-white rounded font-bold hover:bg-red-700 cursor-pointer text-[9px]"
                                >
                                  File Action
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-slate-600 italic leading-relaxed">"{rev.content}"</p>

                      {/* Review Photo Uploads Display */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-2 pt-1.5 overflow-x-auto scrollbar-none">
                          {rev.images.map((imgUrl, i) => (
                            <img
                              key={i}
                              src={imgUrl}
                              alt="Completed work screenshot"
                              className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-3xs cursor-zoom-in hover:brightness-90 hover:scale-103 transition-all shrink-0"
                              referrerPolicy="no-referrer"
                              onClick={() => {
                                const w = window.open();
                                if (w) {
                                  w.document.write(`<img src="${imgUrl}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                }
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <p className="text-[10px] text-slate-400 font-mono text-right">{rev.date}</p>
                    </div>
                  ))}
                  {worker.reviews.length === 0 && (
                    <p className="text-xs text-slate-400 italic">This specialist is freshly registered. Be the first to book and write a review!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Appointment Booking Calendar & Slots Form */}
            <div className="lg:col-span-5 bg-slate-55 rounded-2xl p-5 border border-slate-100 space-y-4">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 mb-1">
                <Calendar className="w-5 h-5 text-blue-600" />
                Book Appointment
              </h2>
              <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                Unlock your calendar slots. Select exact session times, review pricing multiplying indicators, and lock them in.
              </p>

              {bookSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center text-xs space-y-3 text-emerald-800 animate-in fade-in-50 duration-200">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 font-bold text-lg">
                    ✓
                  </div>
                  <h4 className="font-semibold text-sm">Booking Request Submitted!</h4>
                  <p>
                    Your appointment request with <strong>{worker.name}</strong> on <strong>{selectedDate}</strong> was registered. The worker can instantly review the request details.
                  </p>
                  <p className="text-[11px] text-slate-405 font-mono">
                    Track the request state under the "My Bookings" menu link!
                  </p>
                  <button
                    onClick={() => setBookSuccess(false)}
                    className="w-full py-2 bg-emerald-650 hover:bg-emerald-750 text-white font-bold rounded-lg cursor-pointer transition-colors animate-in hover:brightness-95"
                  >
                    Reschedule or Book Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  
                  {/* Select Day (14 upcoming dates horizontal calendar list) */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                      1. Swipe / Select Calendar Date
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                      {upcomingDays.map((elem) => {
                        const isSelected = selectedDate === elem.dateStr;
                        const hasAvailability = worker.availability.find(av => av.day.toLowerCase() === elem.dayName.toLowerCase())?.enabled;
                        return (
                          <button
                            key={elem.dateStr}
                            type="button"
                            onClick={() => {
                              setSelectedDate(elem.dateStr);
                            }}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border min-w-[70px] shrink-0 text-center transition-all cursor-pointer focus:outline-none ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : hasAvailability
                                  ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                  : 'bg-slate-50 text-slate-350 border-slate-100 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <span className="text-[9px] uppercase tracking-wider font-extrabold">{elem.dayName.slice(0, 3)}</span>
                            <span className="text-xs font-black mt-1">{elem.label.split(' ')[1]}</span>
                            <span className="text-[8px] font-medium mt-0.5">{elem.label.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Select Slots Range Picker */}
                  {activeAvailability && activeAvailability.enabled ? (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-3xs">
                      <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-50">
                        <span className="font-bold text-slate-505 uppercase">Shift Hours Window:</span>
                        <span className="bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded-md font-mono">
                          {activeAvailability.startTime} – {activeAvailability.endTime}
                        </span>
                      </div>

                      {/* Dropdown for Start Time */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-405 uppercase block">Start Session Time</label>
                        <select
                           value={selectedStartMin !== null ? selectedStartMin : ''}
                          onChange={(e) => setSelectedStartMin(Number(e.target.value))}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-755 font-mono"
                        >
                          {eligibleStartTimes.map((opt) => (
                            <option key={opt.valueMin} value={opt.valueMin} disabled={opt.isReserved}>
                              {opt.label} {opt.isReserved ? '(❌ Occupied / Reserved)' : ''}
                            </option>
                          ))}
                          {eligibleStartTimes.length === 0 && (
                            <option value="">No working slots remain on this day</option>
                          )}
                        </select>
                      </div>

                      {/* Dropdown for Duration */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-405 uppercase block">Duration Multiplier</label>
                        <select
                          value={selectedDuration}
                          onChange={(e) => setSelectedDuration(Number(e.target.value))}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-755"
                        >
                          <option value="1">1.0 Hour Appointment</option>
                          <option value="1.5">1.5 Hours Appointment</option>
                          <option value="2">2.0 Hours Appointment</option>
                          <option value="2.5">2.5 Hours Appointment</option>
                          <option value="3">3.0 Hours Appointment</option>
                          <option value="4">4.0 Hours Appointment</option>
                          <option value="5">5.0 Hours Appointment</option>
                        </select>
                      </div>

                      {/* Overlap verification warnings */}
                      {selectedStartMin !== null && (
                        <div className={`p-2 rounded-lg text-center font-bold text-xs ${hasOverlapError ? 'bg-red-50 text-red-700 border border-red-105' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'}`}>
                          {hasOverlapError ? (
                            <span>🛑 Intersects reserved blocks! Shift starting times.</span>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Requested Interval: {bookingTimeRangeStr}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-xl text-xs text-center font-medium">
                      ⚠️ Specialist is fully blocked / Out-of-Office on {selectedDayName}s. Please swipe the calendar to choose another working day.
                    </div>
                  )}

                  {/* Client Coordinates Information */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      2. Client Information
                    </label>

                    {currentUser ? (
                      <div className="bg-slate-100/60 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5">
                        <p className="text-slate-650 font-medium">
                          Booking as <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.email})
                        </p>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Phone Number (e.g. 555-010-221)"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-205 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-705"
                        />
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-slate-705 space-y-2">
                        <div className="flex gap-1.5 items-start font-medium">
                          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <p>You must be signed in to request bookings. If you do not have a profile, join instantly.</p>
                        </div>
                        <button
                          type="button"
                          onClick={onOpenLogin}
                          className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Sign In / Register First
                        </button>
                      </div>
                    )}

                    <div>
                      <textarea
                        value={serviceNotes}
                        onChange={(e) => setServiceNotes(e.target.value)}
                        placeholder="Add specific details about the service required (e.g. website fixes, catering scope, craft material requests)..."
                        rows={3}
                        className="w-full p-2.5 text-xs bg-white border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-705 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Pricing Overview Row */}
                  {selectedStartMin !== null && !hasOverlapError && (
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs bg-white/50 p-2.5 rounded-lg font-sans">
                      <div className="text-slate-500 text-left">
                        <span>Rate: ${worker.pricePerHour}/hr × {selectedDuration} hrs</span>
                        {worker.materialCosts > 0 && <span className="block italic text-[11px]">+ ${worker.materialCosts} material cost</span>}
                      </div>
                      <div className="text-right font-black text-slate-800 text-sm">
                        Estimated Total: ${estimatedTotal}
                      </div>
                    </div>
                  )}

                  {/* Error notifications */}
                  {validationError && (
                    <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold">
                      {validationError}
                    </div>
                  )}

                  <button
                    type="submit"
                    id="submit-appointment-btn"
                    disabled={hasOverlapError || selectedStartMin === null}
                    className={`w-full py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer ${
                      hasOverlapError || selectedStartMin === null
                        ? 'bg-slate-300 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Submit Booking Request</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
