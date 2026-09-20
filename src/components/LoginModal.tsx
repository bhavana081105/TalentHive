import bcrypt from 'bcryptjs';
import React, { useState } from 'react';
import { X, LogIn, UserPlus, Shield, User, Briefcase, Sparkles, Key, Mail, CheckCircle } from 'lucide-react';
import { UserRole, User as UserType, WorkerProfile } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserType, createdWorkerProfile?: Omit<WorkerProfile, 'id' | 'rating' | 'reviews' | 'earnings' | 'workingHours' | 'completedJobs'>) => void | Promise<void>;
  users: UserType[];
}

export default function LoginModal({ onClose, onLoginSuccess, users }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<UserRole>('Customer');

  // Input States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Worker Specific Input States
  const [profession, setProfession] = useState('Frontend Developer');
  const [category, setCategory] = useState<'Developer' | 'Student' | 'Housewife' | 'Disabled' | 'Startup'>('Developer');
  const [location, setLocation] = useState('Boston, MA');
  const [bio, setBio] = useState('Dedicated specialist with years of passion and craft...');
  const [pricePerHour, setPricePerHour] = useState(25);
  const [materialCosts, setMaterialCosts] = useState(0);

  const [errorMessage, setErrorMessage] = useState('');

  // Pre-seeded credentials quick click helper
  const handleQuickSignIn = (type: 'cust' | 'work' | 'admin') => {
    if (type === 'cust') {
      onLoginSuccess({
        id: 'cust1',
        name: 'Marcus Vance',
        email: 'ceo.bloom@example.com',
        role: 'Customer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
      });
    } else if (type === 'work') {
      onLoginSuccess({
        id: 'w1',
        name: 'Alex Mercer',
        email: 'alex.mercer@example.com',
        role: 'Worker',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        profession: 'Full-Stack Developer'
      });
    } else {
      onLoginSuccess({
        id: 'admin1',
        name: 'Principal Administrator',
        email: 'admin@talenthive.com',
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150'
      });
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in your login credentials.');
      return;
    }

    const existingUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!isSignUp) {
      // --- LOGIN/SIGN-IN MODE ---
      if (!existingUser) {
        // No account exists, switch to Sign Up as requested
        setErrorMessage("⚠️ No account found with this email. We've switched you to Sign Up to create your account.");
        setIsSignUp(true);
        return;
      }

      if (existingUser.deactivated) {
        setErrorMessage("🔒 Your account session has been suspended or deactivated by administrators.");
        return;
      }

      
     // Check password against stored hash
const storedHash = existingUser.password;
const isMatch = storedHash ? await bcrypt.compare(password, storedHash) : false;
if (!isMatch) {
  setErrorMessage("❌ Incorrect password. Please check your credentials and try again.");
  return;
}
      // Found the account! Perform successful login using the existing profile details
      onLoginSuccess(existingUser);
      onClose();
    } else {
      // --- REGISTER/SIGN-UP MODE ---
      if (existingUser) {
        // Already exists, redirect to Sign In
        setErrorMessage("ℹ️ An account with this email already exists. Switched to Sign In view for you.");
        setIsSignUp(false);
        return;
      }

      if (!name) {
        setErrorMessage('Please fill in your full name to register.');
        return;
      }

      if (password.length < 4) {
        setErrorMessage('Password is too short. Please use at least 4 characters.');
        return;
      }

      // Prepare new User return payload
      const userId = role === 'Worker' ? `w_${Date.now()}` : `usr_${Date.now()}`;
      const userPayload: UserType = {
        id: userId,
        name: name.trim(),
        email: email.trim(),
        role,
        password: await bcrypt.hash(password, 10), // Store hashed password, never plaintext
        avatar: role === 'Worker' 
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' 
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        profession: role === 'Worker' ? profession : undefined
      };

      if (role === 'Worker') {
        // Dynamic profile instantiation for Worker onboarding
        const workerDetails = {
          name: name.trim(),
          email: email.trim(),
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          profession,
          category,
          bio,
          pricePerHour: Number(pricePerHour),
          materialCosts: Number(materialCosts),
          location,
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
          paymentDetails: {
            bankName: 'Digital Native Bank',
            accountNumber: '••••0000',
            routingNumber: '000000000'
          }
        };

        try {
          await onLoginSuccess(userPayload, workerDetails);
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : 'Could not save your account to Supabase.');
          return;
        }
      } else {
        // Standard customer or administrator sign up
        try {
          await onLoginSuccess(userPayload);
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : 'Could not save your account to Supabase.');
          return;
        }
      }

      onClose();
    }
  };

  return (
    <div id="login-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      
      {/* Form Container */}
      <div 
        id="login-dialog-card"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative animate-in zoom-in-95 duration-200 space-y-6"
      >
        {/* Absolute cross-close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Dismiss Sign-In"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Slogan */}
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto text-blue-600 mb-3 shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {isSignUp ? 'Generate Account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isSignUp 
              ? 'Onboard with Talent Hive today and begin servicing.' 
              : 'Pick your credentials and resume your progress.'}
          </p>
        </div>

        {/* Option Select Role Toggle Switch (As requested) */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2.5 font-mono">
            Who are you today?
          </label>
              <div className={`grid ${isSignUp ? 'grid-cols-2' : 'grid-cols-3'} p-1 bg-slate-150 rounded-xl border border-slate-205 gap-1`}>            <button
              type="button"
              onClick={() => { setRole('Customer'); setErrorMessage(''); }}
              className={`py-2 px-1 text-[11px] font-bold rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition-all outline-none cursor-pointer ${
                role === 'Customer'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('Worker'); setErrorMessage(''); }}
              className={`py-2 px-1 text-[11px] font-bold rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition-all outline-none cursor-pointer ${
                role === 'Worker'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Worker</span>
            </button>
           {!isSignUp && (
            <button
              type="button"
              onClick={() => { setRole('Admin'); setErrorMessage(''); }}
              className={`py-2 px-1 text-[11px] font-bold rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition-all outline-none cursor-pointer ${
                role === 'Admin'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
      )}
          </div>
        </div>

        {/* Inner Form Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorMessage && (
            <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {isSignUp && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Your Full Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-750"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono border-l-2 border-l-blue-500 pl-1">Email Address</span>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-750"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Security Password</span>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-750"
                required
              />
            </div>
          </div>

          {/* WORKER SPECIALTIES - Dynamically exposed during Signup of Worker as requested */}
          {isSignUp && role === 'Worker' && (
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-105 space-y-3.5 animate-in slide-in-from-bottom-2 duration-200">
              <p className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-650" />
                Specialist Settings & Demographics
              </p>

              {/* Profession Title */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Profession Scope</span>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. Tailoring Expert, Junior UI Designer"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-205 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Category selector */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Origin Category</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs p-1.5 bg-white border border-slate-205 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  >
                    <option value="Developer">Freelance Developer</option>
                    <option value="Student">Student Specialist</option>
                    <option value="Housewife">Housewife / Stay-home</option>
                    <option value="Disabled">Disabled Individual</option>
                    <option value="Startup">Startup Pod</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Base Location</span>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Austin, TX"
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-205 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Price list and material */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Hourly rate ($)</span>
                  <input
                    type="number"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(Math.max(1, Number(e.target.value)))}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-205 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Material charging ($)</span>
                  <input
                    type="number"
                    value={materialCosts}
                    onChange={(e) => setMaterialCosts(Math.max(0, Number(e.target.value)))}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-205 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Bio Field */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Onboarding Bio</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Share a mini bio describing your workspace, availability or work background..."
                  className="w-full text-xs p-2 bg-white border border-slate-205 rounded-lg focus:outline-none text-slate-600 font-sans"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            id="auth-submit-button"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1 uppercase tracking-wider cursor-pointer"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{isSignUp ? 'Onboard Account' : 'Authenticate Session'}</span>
          </button>
        </form>

        {/* Swap Signup vs Signin Trigger */}
        <div className="text-center pt-2 text-xs text-slate-500">
          <span>{isSignUp ? 'Already have an profile?' : 'Want to offer services?'} </span>
          <button
            type="button"
            onClick={() => {
  const switchingToSignUp = !isSignUp;
  setIsSignUp(switchingToSignUp);
  setErrorMessage('');
  if (switchingToSignUp && role === 'Admin') {
    setRole('Customer');
  }
}}
            className="text-blue-600 font-bold hover:underline bg-transparent"
          >
            {isSignUp ? 'Sign In' : 'Sign Up / Onboard now'}
          </button>
        </div>

        {/* Preseed test helpers */}
        {!isSignUp && (
          <div className="border-t border-slate-100 pt-3.5 space-y-2">
            <span className="block text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest font-mono">
              Quick Sandbox Sign-In Profiles
            </span>
            <div className="grid grid-cols-3 gap-1 px-1 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickSignIn('cust')}
                className="py-1.5 px-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-slate-600 font-medium truncate text-center cursor-pointer"
                title="Sign in as customer Marcus Vance"
              >
                👤 Cust: Marcus
              </button>
              <button
                type="button"
                onClick={() => handleQuickSignIn('work')}
                className="py-1.5 px-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-slate-650 font-medium truncate text-center cursor-pointer"
                title="Sign in as developer Alex"
              >
                🚀 Work: Alex
              </button>
              <button
                type="button"
                onClick={() => handleQuickSignIn('admin')}
                className="py-1.5 px-1 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg text-blue-700 font-semibold truncate text-center cursor-pointer"
                title="Sign in as Admin Moderator"
              >
                🔑 Admin: Principal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
