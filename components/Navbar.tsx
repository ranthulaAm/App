import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleReturnToIntro = () => {
    // Navigate to root with state to trigger IntroSequence with skipAnimation
    // This allows returning to the landing screen without the long animation loop
    navigate('/', { state: { showIntro: true, skipAnimation: true } });
  };

  return (
    <header className="fixed w-full z-50 top-0 left-0 p-4 md:p-8 pointer-events-none flex justify-between items-start">
        {/* Left Side: Logo -> Return to Intro */}
        <button 
          onClick={handleReturnToIntro}
          className="pointer-events-auto group opacity-70 hover:opacity-100 transition-opacity"
          title="Return to Start"
        >
             <img 
               src="https://raw.githubusercontent.com/ranthulaAm/App/main/img/logo.png" 
               alt="RA Logo" 
               className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 const fallback = document.getElementById('nav-logo-fallback');
                 if (fallback) fallback.style.display = 'flex';
               }}
             />
             {/* Fallback element if image fails to load */}
             <div id="nav-logo-fallback" style={{display: 'none'}} className="h-10 w-10 bg-white/10 rounded-full items-center justify-center border border-white/20 backdrop-blur-md">
                <span className="font-display font-bold text-white text-sm">RA</span>
             </div>
        </button>

        {/* Right Side: User Profile (Only if logged in) */}
        {user ? (
          <div className="pointer-events-auto animate-fade-in">
            <div className="flex items-center gap-2 md:gap-3 bg-black/60 backdrop-blur-md px-3 py-2 md:px-4 md:py-2 rounded-full border border-white/10 shadow-lg hover:border-accent-purple/50 transition-colors">
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-accent-magenta" />
              <span className="text-xs md:text-sm font-bold text-text-light hidden md:block max-w-[100px] truncate">{user.name}</span>
              <button onClick={onLogout} className="text-text-muted hover:text-accent-magenta ml-1 md:ml-2 p-1 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div></div> /* Spacer for flex justify-between if user is null */
        )}
    </header>
  );
};