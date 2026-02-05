import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check session persistence
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
    } else {
      alert('Invalid Password');
    }
  };

  const handleBack = () => {
    // Navigate back to root, triggering the Intro Screen but skipping animation
    navigate('/', { state: { showIntro: true, skipAnimation: true } });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 relative z-50 px-4">
        <form onSubmit={handleLogin} className="relative bg-white border border-gray-200 p-8 md:p-12 rounded-2xl w-full max-w-sm text-center shadow-xl">
          
          <button 
            type="button"
            onClick={handleBack}
            className="absolute top-5 left-5 text-gray-300 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="mx-auto bg-gray-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-gray-500">
             <Lock size={24} />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-500 text-sm mb-8">Please enter your password to continue.</p>
          
          <div className="space-y-4">
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Password"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-center outline-none focus:border-blue-500 focus:bg-white transition-all"
              autoFocus
            />
            <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-all text-sm shadow-md">
                Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  return <>{children}</>;
};