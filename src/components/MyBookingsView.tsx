import React, { useState } from 'react';
import { Calendar, Trash2, Clock, Check, X, ShieldAlert, HeartHandshake, Star, Plus, Camera, Trash, AlertTriangle } from 'lucide-react';
import { Booking, WorkerProfile } from '../types';

interface MyBookingsViewProps {
  bookings: Booking[];
  workers: WorkerProfile[];
  customerId: string;
  onCancelBooking: (bookingId: string) => void;
  onNavigateHome: () => void;
  onAddReview: (workerId: string, bookingId: string, rating: number, content: string, images: string[]) => void;
  onDisputeBooking: (bookingId: string, reason: string) => void;
}

export default function MyBookingsView({
  bookings,
  workers,
  customerId,
  onCancelBooking,
  onNavigateHome,
  onAddReview,
  onDisputeBooking,
}: MyBookingsViewProps) {
  // Filter for this customer
  const clientBookings = bookings.filter(b => b.customerId === customerId);

  // Review Form local states
  const [activeReviewBookingId, setActiveReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Dispute Form local states
  const [activeDisputeBookingId, setActiveDisputeBookingId] = useState<string | null>(null);
  const [disputeText, setDisputeText] = useState<string>('');

  // Helper to find worker details for avatar display
  const getWorkerAvatar = (workerId: string) => {
    const w = workers.find(item => item.id === workerId);
    return w?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
  };

  const statusThemes = (status: Booking['status']) => {
    switch(status) {
      case 'Accepted':
        return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      case 'Rejected':
        return 'bg-red-50 text-red-800 border-red-101';
      case 'Completed':
        return 'bg-blue-50 text-blue-805 border-blue-105';
      case 'Disputed':
        return 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-205';
      default:
        return 'bg-stone-50 text-stone-800 border-stone-100';
    }
  };

  const handleReviewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              setReviewImages((prev) => [...prev, reader.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleRemoveUploadedImage = (index: number) => {
    setReviewImages((curr) => curr.filter((_, i) => i !== index));
  };

  const handleReviewSubmission = (e: React.FormEvent, booking: Booking) => {
    e.preventDefault();
    setErrorMsg('');

    if (!reviewText.trim()) {
      setErrorMsg('Feedback text message cannot be blank.');
      return;
    }

    onAddReview(
      booking.workerId,
      booking.id,
      reviewRating,
      reviewText,
      reviewImages
    );

    // Reset Form
    setActiveReviewBookingId(null);
    setReviewText('');
    setReviewRating(5);
    setReviewImages([]);
  };

  const handleDisputeSubmission = (e: React.FormEvent, bookingId: string) => {
    e.preventDefault();
    if (!disputeText.trim()) {
      return;
    }
    onDisputeBooking(bookingId, disputeText);
    setActiveDisputeBookingId(null);
    setDisputeText('');
  };

  return (
    <div id="bookings-archive-view" className="py-6 space-y-6">
      
      {/* View Title */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">My Active Appointments</h1>
          <p className="text-xs text-slate-500">Track accepted calendars, notes, and direct fees of your requested services.</p>
        </div>
        <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
          {clientBookings.length} Total Bookings
        </span>
      </div>

      {clientBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto border border-slate-100 shadow-2xs space-y-4">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">No appointments booked yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              You haven't requested any services. Navigate back to the home directory of workers, inspect custom bios, and submit a session block.
            </p>
          </div>
          <button
            onClick={onNavigateHome}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Explore Active Specialists
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {clientBookings.map((b) => {
            const isReviewingThis = activeReviewBookingId === b.id;
            const isDisputingThis = activeDisputeBookingId === b.id;
            return (
              <div 
                key={b.id}
                className="bg-white rounded-2xl border border-slate-150 shadow-2xs hover:shadow-xs p-5 space-y-4 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  {/* Slot and status header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getWorkerAvatar(b.workerId)}
                        alt={b.workerName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-150 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h3 className="font-bold text-sm text-slate-850">{b.workerName}</h3>
                        <p className="text-[11px] text-slate-505">{b.workerProfession}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusThemes(b.status)}`}>
                        {b.status}
                      </span>
                      <p className="text-xs font-mono font-bold text-slate-850 mt-1.5">${b.totalCost}</p>
                    </div>
                  </div>

                  {/* Booking specifications */}
                  <div className="text-xs p-1 space-y-2 text-slate-600 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Scheduled on: <strong className="text-slate-800">{b.date}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reserved hours block: <strong className="text-slate-800">{b.timeSlot}</strong></span>
                    </div>
                    
                    {b.notes && (
                      <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 text-[11px] mt-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Your project details</span>
                        <p className="italic text-slate-650">"{b.notes}"</p>
                      </div>
                    )}

                    {b.status === 'Disputed' && b.disputeReason && (
                      <div className="bg-amber-50/75 p-2.5 rounded-lg border border-amber-200 text-[11px] mt-2 text-amber-900">
                        <span className="text-[9px] font-bold text-amber-500 uppercase block mb-1">Arbitration claim filed:</span>
                        <p className="italic font-medium">"{b.disputeReason}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Review Panel form slider inside card */}
                {isReviewingThis && (
                  <form onSubmit={(e) => handleReviewSubmission(e, b)} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-3 space-y-3.5 animate-in slide-in-from-top-3 duration-250">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Completed Work Evaluation</span>
                      <button 
                        type="button" 
                        onClick={() => setActiveReviewBookingId(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Interactive Stars Selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block">Rating score:</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((stars) => (
                          <button
                            key={stars}
                            type="button"
                            onClick={() => setReviewRating(stars)}
                            className="p-1 focus:outline-none focus:scale-110 transition-transform cursor-pointer"
                          >
                            <Star 
                              className={`w-5 h-5 ${
                                stars <= reviewRating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review text message */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block">Written Feedback:</label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Write details of the completed service, work quality, professionalism..."
                        rows={3}
                        className="w-full p-2 bg-white border border-slate-205 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-705"
                      />
                    </div>

                    {/* Optional Proof-of-work Multiple Image Uploads */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block">Upload proof pictures (Optional):</label>
                      <div className="flex items-center gap-2">
                        <label className="p-2 bg-white border border-slate-205 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer shrink-0">
                          <Camera className="w-3.5 h-3.5 text-blue-600" />
                          <span>Add Photo proofs</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleReviewFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Display Uploaded base64 results previews with simple remove action file */}
                      {reviewImages.length > 0 && (
                        <div className="flex gap-2 p-2 bg-white rounded-lg border border-slate-100 overflow-x-auto">
                          {reviewImages.map((b64, idx) => (
                            <div key={idx} className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shrink-0 group">
                              <img src={b64} alt="proof draft" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveUploadedImage(idx)}
                                className="absolute inset-0 bg-red-600/90 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                title="Remove Image"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {errorMsg && (
                      <p className="text-[10px] font-semibold text-red-650">{errorMsg}</p>
                    )}

                    <div className="flex justify-end gap-2 pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveReviewBookingId(null)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Submit Review & Complete</span>
                      </button>
                    </div>
                  </form>
                )}


                {/* Optional Dispute Form panel */}
                {isDisputingThis && (
                  <form onSubmit={(e) => handleDisputeSubmission(e, b.id)} className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 mt-3 space-y-3.5 animate-in slide-in-from-top-3 duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-mono flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>File Arbitration Dispute</span>
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setActiveDisputeBookingId(null)}
                        className="text-amber-700 hover:text-amber-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block">Filing Reason:</label>
                      <textarea
                        value={disputeText}
                        onChange={(e) => setDisputeText(e.target.value)}
                        placeholder="Please elaborate on the issue (e.g. contractor didn't show up, failed expectations, pricing error...). This goes straight to the Platform Administrator."
                        rows={3}
                        className="w-full p-2 bg-white border border-slate-205 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-705"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDisputeBookingId(null);
                          setDisputeText('');
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-650 rounded-lg font-bold cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold cursor-pointer transition-colors"
                      >
                        File Formal Dispute
                      </button>
                    </div>
                  </form>
                )}


                {/* Actions Row */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-50 text-[11px] mt-2 shrink-0">
                  
                  {b.status === 'Accepted' && !isReviewingThis && !isDisputingThis && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setActiveReviewBookingId(b.id);
                          setActiveDisputeBookingId(null);
                          setErrorMsg('');
                          setReviewImages([]);
                          setReviewText('');
                        }}
                        className="p-1 px-3 bg-emerald-55 hover:bg-emerald-600 hover:text-white border border-emerald-100 text-emerald-800 rounded-xl font-extrabold cursor-pointer transition-all uppercase tracking-wider flex items-center gap-1 text-[10px]"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Complete & Write Review</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setActiveDisputeBookingId(b.id);
                          setActiveReviewBookingId(null);
                          setDisputeText('');
                        }}
                        className="p-1 px-2.5 bg-amber-50 hover:bg-amber-600 hover:text-white border border-amber-200 text-amber-700 rounded-xl font-bold cursor-pointer transition-all uppercase tracking-wider flex items-center gap-1 text-[10px]"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Dispute</span>
                      </button>
                    </div>
                  )}

                  {b.status === 'Completed' && !isDisputingThis && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-blue-750 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-105 font-extrabold font-mono text-[9px] uppercase tracking-wider">
                        ✓ Successfully Completed & Evaluated
                      </span>
                      <button
                        onClick={() => {
                          setActiveDisputeBookingId(b.id);
                          setActiveReviewBookingId(null);
                          setDisputeText('');
                        }}
                        className="p-1 px-2.5 bg-amber-50 hover:bg-amber-600 hover:text-white border border-amber-200 text-amber-700 rounded-xl font-bold cursor-pointer transition-all uppercase tracking-wider flex items-center gap-1 text-[9px]"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>File dispute on this</span>
                      </button>
                    </div>
                  )}

                  {b.status === 'Disputed' && (
                    <span className="text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 font-extrabold text-[9px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Under Admin Arbitration Review</span>
                    </span>
                  )}

                  {b.status === 'Cancelled' && (
                    <span className="text-slate-650 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-bold font-mono text-[9px] uppercase tracking-wider">
                      Cancelled by Administration
                    </span>
                  )}

                  {b.status !== 'Completed' && b.status !== 'Rejected' && b.status !== 'Disputed' && b.status !== 'Cancelled' && (
                    <button
                      onClick={() => onCancelBooking(b.id)}
                      className="p-1 px-2 text-slate-400 hover:text-red-550 transition-colors flex items-center gap-1 font-bold outline-none cursor-pointer"
                      title="Cancel Booking Request"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
