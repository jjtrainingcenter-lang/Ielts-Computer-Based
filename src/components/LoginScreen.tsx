import React, { useState } from 'react';
import { db, isConfigured, signInWithGoogle } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface LoginScreenProps {
  onLogin: (id: string, name: string) => void;
  onAdminLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onAdminLogin }) => {
  const [regId, setRegId] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regId || !dob) {
      setError('Please enter both Registration ID and Date of Birth');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      if (isConfigured) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('id', '==', regId), where('dob', '==', dob));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Invalid Registration ID or Date of Birth');
        } else {
          const userData = querySnapshot.docs[0].data();
          onLogin(regId, userData.name || 'Student');
        }
      } else {
        // Fallback for unconfigured firebase
        if (regId.length === 6) {
           onLogin(regId, 'Demo Student');
        } else {
           setError('Invalid ID. (Enter any 6-digit ID in demo mode)');
        }
      }
    } catch (err: any) {
      setError('Login failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!isConfigured) {
         // for demo purposes without firebase configured
         onAdminLogin();
         return;
      }
      
      const user = await signInWithGoogle();
      if (user && user.email === 'jjtrainingcenter@gmail.com') {
        onAdminLogin();
      } else if (user) {
        setError('Unauthorized Admin Email');
      }
    } catch (err: any) {
      setError('Admin login failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-start text-red-600 mb-2">
            <span className="font-extrabold text-4xl tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>IELTS</span>
            <span className="text-xs mt-1 ml-0.5">TM</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Test Taker Login</h2>
        </div>
        
        {isAdminMode ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4 text-center">Please sign in with your authorized admin Google account.</p>
            {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}
            <button
              type="button"
              onClick={handleAdminGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-3 px-4 rounded transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAdminMode(false)}
              className="w-full text-sm text-gray-500 mt-2 hover:underline"
            >
              Back to Test Taker Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleUserLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration ID (6 digits)</label>
              <input
                type="text"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., 123456"
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (YYYY-MM-DD)</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
      </div>

      {!isAdminMode && (
        <button
          onClick={() => setIsAdminMode(true)}
          className="absolute bottom-4 right-4 text-xs text-gray-300 hover:text-gray-500 transition-colors bg-transparent border-none outline-none focus:outline-none"
        >
          Admin Login
        </button>
      )}
    </div>
  );
};
