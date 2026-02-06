import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';

interface IntroSequenceProps {
  onComplete: () => void;
  skipAnimation?: boolean;
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete, skipAnimation = false }) => {
  const [stage, setStage] = useState(skipAnimation ? 3 : 0); 
  const [showLogo, setShowLogo] = useState(skipAnimation ? true : false);
  const [showButtons, setShowButtons] = useState(skipAnimation ? true : false);
  const navigate = useNavigate();

  // LOGO HANDLING
  // If the image fails, we show the typographic fallback.
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
    const fallback = document.getElementById('intro-logo-fallback');
    if (fallback) fallback.style.display = 'flex';
  };

  useEffect(() => {
    if (skipAnimation) return;

    // Animation Timeline
    const schedule = [
      setTimeout(() => setShowLogo(true), 200),
      setTimeout(() => setStage(1), 800),   // Show "Focus"
      setTimeout(() => setStage(2), 1600),  // Show "Flow"
      setTimeout(() => setStage(3), 3000),  // Switch "Flow" -> "Create"
      setTimeout(() => setShowButtons(true), 3500), // Show Buttons
    ];

    return () => schedule.forEach(clearTimeout);
  }, [skipAnimation]);

  const handleEnter = () => {
    setStage(4); // Trigger fade out
    setTimeout(() => {
      navigate('/');
      onComplete();
    }, 800);
  };

  const handleAdmin = () => {
    setStage(4); // Trigger fade out
    setTimeout(() => {
      navigate('/admin');
      onComplete();
    }, 800);
  };

  // CSS for transitions
  const fadeTransition = "transition-all duration-1000 ease-in-out";

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between cursor-default touch-none h-[100dvh] w-full py-12 ${fadeTransition} ${stage === 4 ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Top Spacer */}
      <div className="flex-1 w-full"></div>

      {/* Centered Typography Animation */}
      <div className="flex-none flex flex-col items-center justify-center relative z-10 w-full px-4">
        {/* 'Focus' - Top Word */}
        <h1 className={`text-6xl md:text-8xl font-display font-medium tracking-tight mb-2 text-white text-center ${fadeTransition} ${stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Focus
        </h1>

        {/* Bottom Word Container - Stacking 'Flow' and 'Create' */}
        <div className="relative h-24 w-full flex items-center justify-center mb-12">
           {/* 'Flow' */}
           <h1 className={`absolute text-6xl md:text-8xl font-display font-medium tracking-tight text-white/50 text-center ${fadeTransition} ${stage === 2 ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-95'}`}>
             Flow
           </h1>
           {/* 'Create' */}
           <h1 className={`absolute text-6xl md:text-8xl font-display font-medium tracking-tight text-white text-center ${fadeTransition} ${stage === 3 ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-105'}`}>
             Create
           </h1>
        </div>

        {/* Buttons Section */}
        <div className={`flex flex-col items-center gap-4 transition-all duration-1000 ${showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button 
            onClick={handleEnter}
            className="group relative bg-white text-black px-10 py-4 rounded-full font-bold uppercase tracking-[0.2em] hover:bg-accent-magenta hover:text-white transition-all duration-300 scale-100 hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(213,0,249,0.5)] flex items-center gap-3"
          >
            <span>Get Started</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={handleAdmin}
            className="group flex items-center gap-2 text-white/30 hover:text-white text-[10px] uppercase tracking-[0.2em] font-bold py-2 px-4 transition-colors"
          >
            <Lock size={12} className="group-hover:text-accent-purple transition-colors" />
            <span>Admin Access</span>
          </button>
        </div>
      </div>

      {/* Bottom Logo Area */}
      <div className={`flex-1 w-full flex flex-col items-center justify-end ${fadeTransition} ${showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
         
         {/* Fixed Dimensions Container to prevent collapse */}
         <div className="w-16 h-16 md:w-20 md:h-20 mb-4 relative flex items-center justify-center">
            <img 
              src="https://raw.githubusercontent.com/ranthulaAm/App/main/img/logo.png" 
              alt="RA Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              onError={handleImageError}
            />
            {/* Fallback Element */}
            <div id="intro-logo-fallback" style={{ display: 'none' }} className="w-full h-full border-2 border-white/20 rounded-full items-center justify-center bg-white/5 backdrop-blur-sm absolute inset-0">
               <span className="font-display font-bold text-2xl text-white">RA</span>
            </div>
         </div>

         <div className="text-[10px] md:text-xs font-sans uppercase tracking-[0.3em] text-white/40 border border-white/10 px-3 py-1.5 rounded-full bg-white/5 text-center">
            Personal Portfolio
         </div>
      </div>

    </div>
  );
};