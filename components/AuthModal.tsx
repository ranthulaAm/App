import React, { useState } from 'react';
import { X, Mail, AlertCircle, ArrowRight, Loader } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (provider: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Google sign-in failed.');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative glass-effect border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-[0_0_50px_rgba(213,0,249,0.15)] animate-float overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors z-20">
          <X size={24} />
        </button>

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-display text-white mb-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-text-muted text-sm">{isSignUp ? 'Join to start your creative journey' : 'Sign in to manage your design projects'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-accent-purple focus:bg-black/60 transition-all placeholder:text-white/20"
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-mono text-xs">***</div>
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-accent-purple focus:bg-black/60 transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-fade-in">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-white text-black font-bold font-sans py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-accent-magenta hover:text-white transition-all shadow-lg hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader size={18} className="animate-spin" /> : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-3">
               <span className="text-[11px] font-bold text-white/30 uppercase tracking-wider">
                 {isSignUp ? 'Already have an account?' : "Don't have an account?"}
               </span>
               <button 
                type="button"
                onClick={toggleMode}
                className="bg-white/5 text-white font-black py-2.5 px-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest"
              >
                {isSignUp ? 'Log In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">OR</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            className="bg-white/5 border border-white/10 text-white font-bold text-xs py-3 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
          >
            Google
          </button>
          <button 
              className="bg-white/5 border border-white/10 text-white font-bold text-xs py-3 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              onClick={() => alert('Apple Auth not configured in this demo')}
          >
            Apple
          </button>
        </div>
      </div>
    </div>
  );
};