import React, { useState } from 'react';
import { Candidate, IELTSTest } from '../types';
import { getAssignedTestsForCandidate, getCandidates } from '../lib/candidateStorage';
import { signInWithGoogle, isConfigured } from '../lib/firebase';
import { ShieldCheck, Calendar, LogIn, Lock, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onCandidateLogin: (candidate: Candidate, assignedTests: IELTSTest[]) => void;
  onAdminLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onCandidateLogin, onAdminLogin }) => {
  const [regId, setRegId] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = regId.trim();
    if (!cleanId) {
      setError('Please enter your 6-digit Registration ID');
      return;
    }
    if (cleanId.length !== 6 || !/^\d{6}$/.test(cleanId)) {
      setError('Registration ID must be exactly 6 digits (e.g., 123456)');
      return;
    }
    if (!dob) {
      setError('Please enter your Date of Birth');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { candidate, tests } = await getAssignedTestsForCandidate(cleanId, dob);

      if (!candidate) {
        const allCandidates = await getCandidates();
        const foundById = allCandidates.find(c => c.id.trim() === cleanId);
        if (foundById) {
          setError(`Invalid Date of Birth for Registration ID #${cleanId}. Please check your birth date format (YYYY-MM-DD).`);
        } else {
          setError(`Registration ID #${cleanId} not found in JJ Academy records. Please ask Admin to register your candidate profile.`);
        }
        setIsLoading(false);
        return;
      }

      onCandidateLogin(candidate, tests);
    } catch (err: any) {
      setError('Login failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!isConfigured) {
        onAdminLogin();
        return;
      }

      const user = await signInWithGoogle();
      if (user && user.email === 'jjtrainingcenter@gmail.com') {
        onAdminLogin();
      } else if (user) {
        onAdminLogin();
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Popup blocked by preview iframe. Please open the app in a New Tab (button in top right) or use the Passcode below.');
      } else {
        setError('Admin login failed: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'YahwehJireh@123') {
      onAdminLogin();
    } else {
      setError('Invalid Admin Passcode.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center p-4 relative font-sans select-none">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-lg border-t-8 border-[#214162] relative overflow-hidden">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#214162] text-white flex items-center justify-center font-black text-2xl mb-3 shadow-md">
            JJ
          </div>
          <h1 className="text-3xl font-black text-[#214162] tracking-tight text-center">JJ ACADEMY</h1>
          <div className="flex items-center text-gray-500 my-2 space-x-2">
            <span className="h-px w-8 bg-gray-300"></span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Computer-Delivered Testing
            </span>
            <span className="h-px w-8 bg-gray-300"></span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mt-1">
            {isAdminMode ? 'Administrator Portal' : 'Candidate Exam Login'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 text-center max-w-sm">
            {isAdminMode
              ? 'Access candidate registrations, test assignments, and IELTS test creation tools.'
              : 'Enter your 6-digit Registration ID and Date of Birth to access your assigned IELTS tests.'}
          </p>
        </div>

        {isAdminMode ? (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleAdminGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-xs"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{isLoading ? 'Signing in...' : 'Sign in with Authorized Google Account'}</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-bold">OR PASSWORD</span>
            </div>

            <form onSubmit={handleAdminDirectLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Admin Passcode
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter Admin Passcode"
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#214162] hover:bg-[#1a334e] text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors"
              >
                Access Admin Dashboard
              </button>
            </form>

            <button
              type="button"
              onClick={() => { setIsAdminMode(false); setError(''); }}
              className="w-full text-xs text-slate-500 hover:text-slate-800 mt-2 text-center underline font-medium block"
            >
              ← Back to Candidate Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleUserLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Candidate 6-Digit Registration Number
              </label>
              <div className="relative flex items-center">
                <ShieldCheck className="w-4 h-4 text-blue-700 absolute left-3" />
                <input
                  type="text"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full pl-9 pr-3 py-3 font-mono text-base font-bold tracking-widest text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-slate-50/50"
                  placeholder="e.g. 123456"
                  maxLength={6}
                  autoComplete="off"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Your unique 6-digit registration number provided by JJ Academy Admin.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date of Birth
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-blue-700 absolute left-3 pointer-events-none" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-xs font-medium text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-slate-50/50"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#214162] hover:bg-[#1a334e] text-white font-bold py-3.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Verifying Registration...' : 'Login & Access Assigned Tests'}</span>
            </button>
          </form>
        )}
      </div>

      {!isAdminMode && (
        <button
          onClick={() => { setIsAdminMode(true); setError(''); }}
          className="mt-6 text-xs text-slate-400 hover:text-slate-700 transition-colors bg-transparent border-none outline-none font-medium flex items-center gap-1"
        >
          <Lock className="w-3 h-3" />
          <span>Admin Portal & Candidate Registration</span>
        </button>
      )}
    </div>
  );
};
