import React from 'react';
import { Instagram, Twitter, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-bg-light/80 border-t border-white/5 pt-16 pb-8 relative z-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
               <img src="https://raw.githubusercontent.com/ranthulaAm/App/main/img/logo.png" alt="Logo" className="h-10 opacity-80" onError={(e) => e.currentTarget.style.display = 'none'} />
              <h3 className="text-2xl font-display font-bold text-white">I'm <span className="text-accent-purple">Ranthula</span></h3>
            </div>
            <p className="text-text-muted max-w-xs font-light">
              Elevating brands through strategic design and vivid visuals.
            </p>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-text-muted hover:text-accent-magenta transition-colors hover:scale-110 transform"><Instagram /></a>
            <a href="#" className="text-text-muted hover:text-accent-orange transition-colors hover:scale-110 transform"><Twitter /></a>
            <a href="#" className="text-text-muted hover:text-accent-purple transition-colors hover:scale-110 transform"><Mail /></a>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-text-muted/60 flex flex-col items-center gap-2">
          <p>&copy; {new Date().getFullYear()} Ranthula Amarasekara. All rights reserved.</p>
          <p className="flex items-center gap-1">Made with <Heart size={12} className="text-accent-magenta fill-accent-magenta" /> for Creators</p>
        </div>
      </div>
    </footer>
  );
};