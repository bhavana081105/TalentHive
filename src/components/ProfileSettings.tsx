import React, { useState } from 'react';
import { Settings, Shield, User, Bell, Key, Check, Info, Lock } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileSettingsProps {
  currentUser: UserType | null;
  onUpdateUserProfile: (newName: string, newAvatar: string) => void;
  onClose: () => void;
}

export default function ProfileSettings({
  currentUser,
  onUpdateUserProfile,
  onClose,
}: ProfileSettingsProps) {
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [phone, setPhone] = useState('');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [isSecureMode, setIsSecureMode] = useState(true);
  
  const [isSuccess, setIsSuccess] = useState(false);

  if (!currentUser) {
    return (
      <div id="settings-unauthorized" className="bg-white rounded-2xl border border-slate-100 p-8 text-center max-w-sm mx-auto my-12 shadow-md">
        <Lock className="w-12 h-12 text-slate-350 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-lg">Sign In Required</h3>
        <p className="text-xs text-slate-500 mt-2">
          You must be logged in to inspect and modify profile settings or system preferences.
        </p>
      </div>
    );
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdateUserProfile(name.trim(), avatar.trim());
    }
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2500);
  };

  return (
    <div id="settings-section" className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 max-w-2xl mx-auto py-8">
      
      {/* Title block */}
      <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-850">Profile & Settings Control Panel</h2>
          <p className="text-xs text-slate-500">Configure notifications, security credentials, and view role attributes.</p>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4 text-xs">
        <img
          src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
          alt={name}
          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
          referrerPolicy="no-referrer"
        />
        <div>
          <p className="font-bold text-slate-800">{name || 'Your Name'}</p>
          <p className="text-slate-500">{currentUser.email}</p>
          <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-full text-[9px] uppercase tracking-wider">
            Role: {currentUser.role} {currentUser.profession ? `(${currentUser.profession})` : ''}
          </span>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Core Coordinates */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" />
            Personal Identification & Avatar
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Modify Public Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all text-slate-750 font-sans"
                  placeholder="Eleanor Mercer"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Phone Number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-010-0921"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all text-slate-750"
                />
              </div>
            </div>

            {/* Avatar URL Edit Input and Presets */}
            <div className="space-y-2 bg-slate-50/50 p-4.5 rounded-xl border border-slate-150">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Profile Picture (Avatar Image URL)</span>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full text-xs px-3 py-2 bg-white border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-550 transition-all text-slate-800"
              />
              
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase mt-2 mb-1.5">Or Choose Elegant Presets:</span>
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
                      className={`flex items-center gap-1.5 p-1 pr-2.5 rounded-full border text-[10px] font-semibold transition-all hover:bg-white cursor-pointer ${
                        avatar === preset.url 
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 font-extrabold shadow-3xs' 
                          : 'border-slate-200 bg-white/50 text-slate-600'
                      }`}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name} 
                        className="w-5 h-5 rounded-full object-cover border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications mock preference */}
        <div className="space-y-4 pt-4 border-t border-slate-50">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-slate-400" />
            Talent Alerts & Notifications
          </h3>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded-md focus:ring-blue-550"
              />
              <span className="text-slate-655 font-medium">Forward system emails when booking requests update</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifSMS}
                onChange={(e) => setNotifSMS(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded-md focus:ring-blue-550"
              />
              <span className="text-slate-655 font-medium">Enable SMS appointment slot confirmations</span>
            </label>
          </div>
        </div>

        {/* Safety parameters */}
        <div className="space-y-4 pt-4 border-t border-slate-50">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-slate-400" />
            Security Mode & Compliance
          </h3>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSecureMode}
                onChange={(e) => setIsSecureMode(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-205 rounded-md focus:ring-blue-500"
              />
              <span className="text-slate-655 font-medium">Restrict contact details to confirmed appointment partners</span>
            </label>
            <p className="text-[10px] text-slate-450 italic leading-relaxed pl-6">
              When checked, telephone numbers and direct addresses are withheld from public portfolios until a specialist accepts a booking.
            </p>
          </div>
        </div>

        {/* Save button and confirmations */}
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
          {isSuccess ? (
            <div className="flex items-center gap-1 text-xs text-emerald-850 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 font-bold animate-in fade-in-50">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Settings stored safely!</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 font-medium">
              Changes persist instantly inside browser storage.
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Back Home
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
