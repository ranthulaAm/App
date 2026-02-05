import React, { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Maximize2, X, Package, User as UserIcon } from 'lucide-react';
import { SERVICES, PORTFOLIO_ITEMS } from '../constants';
import { User } from '../types';

interface HomeProps {
  user: User | null;
  onLoginClick: () => void;
}

const ServiceVisual: React.FC<{ id: string }> = ({ id }) => {
  const fillColor = "fill-white/10";

  switch (id) {
    case 's_social':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
             <clipPath id="screen-mask">
               <rect x="60" y="40" width="80" height="120" />
             </clipPath>
          </defs>
          <rect x="55" y="30" width="90" height="140" rx="10" className="fill-white/5 stroke-white/20 stroke-2" />
          <path d="M95 35 h10" className="stroke-white/20 stroke-2" />
          <circle cx="100" cy="160" r="3" className="fill-white/20" />
          <g clipPath="url(#screen-mask)">
             <g style={{ animation: 'scroll-feed 4s linear infinite' }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <g key={i} transform={`translate(65, ${45 + i * 55})`}>
                     <rect width="70" height="35" rx="2" className="fill-white/10" />
                     <line x1="0" y1="40" x2="60" y2="40" className="stroke-white/10 stroke-2" />
                     <line x1="0" y1="46" x2="40" y2="46" className="stroke-white/10 stroke-2" />
                  </g>
                ))}
             </g>
          </g>
          <circle cx="100" cy="130" r="12" className="fill-white/30 blur-sm animate-[scroll-touch_4s_ease-in-out_infinite]" />
        </svg>
      );
    case 's_invite':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
           <g transform="translate(0, 20)">
             <rect x="40" y="60" width="120" height="80" rx="4" className={fillColor + " stroke-white/20 stroke-2"} />
             <line x1="60" y1="90" x2="140" y2="90" className="stroke-white/20 stroke-2" />
             <line x1="60" y1="110" x2="110" y2="110" className="stroke-white/20 stroke-2" />
             <path d="M40 60 L100 100 L160 60" className="fill-none stroke-white/50 stroke-2" />
             <path d="M40 60 L100 20 L160 60" className="fill-white/5 stroke-white/50 stroke-2 animate-[float-slow_3s_ease-in-out_infinite]" />
           </g>
        </svg>
      );
    case 's_banner':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
           <path d="M80 180 L80 160 L120 160 L120 180" className="fill-white/5 stroke-white/10" />
           <g transform="translate(0, -10)">
              <rect x="95" y="100" width="10" height="60" className="fill-white/10" />
              <line x1="50" y1="100" x2="95" y2="140" className="stroke-white/20 stroke-1" />
              <line x1="150" y1="100" x2="105" y2="140" className="stroke-white/20 stroke-1" />
              <rect x="30" y="40" width="140" height="70" className="fill-white/5 stroke-white/30 stroke-2" />
              <rect x="35" y="45" width="130" height="60" className="fill-white/10" />
              <circle cx="60" cy="75" r="18" className="fill-white/10" />
              <rect x="90" y="65" width="60" height="8" className="fill-white/20" />
              <rect x="90" y="78" width="40" height="5" className="fill-white/10" />
              <g className="fill-white/40">
                <circle cx="45" cy="35" r="2" /><path d="M45 35 L45 40" className="stroke-white/30" />
                <circle cx="80" cy="35" r="2" /><path d="M80 35 L80 40" className="stroke-white/30" />
                <circle cx="120" cy="35" r="2" /><path d="M120 35 L120 40" className="stroke-white/30" />
                <circle cx="155" cy="35" r="2" /><path d="M155 35 L155 40" className="stroke-white/30" />
              </g>
           </g>
        </svg>
      );
    case 's_flyer':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
           <g transform="translate(100, 100)">
             <g style={{ transformOrigin: '50% 100%', animation: 'fan-out-left 6s ease-in-out infinite' }}>
                <rect x="-20" y="-30" width="40" height="60" rx="2" className="fill-white/5 stroke-white/20 stroke-2" />
                <rect x="-15" y="-25" width="30" height="20" className="fill-white/10" />
                <line x1="-15" y1="5" x2="15" y2="5" className="stroke-white/20" />
             </g>
             <g style={{ transformOrigin: '50% 100%', animation: 'fan-out-right 6s ease-in-out infinite' }}>
                <rect x="-20" y="-30" width="40" height="60" rx="2" className="fill-white/5 stroke-white/20 stroke-2" />
                <rect x="-15" y="-25" width="30" height="20" className="fill-white/10" />
                <line x1="-15" y1="5" x2="15" y2="5" className="stroke-white/20" />
             </g>
             <g>
                <rect x="-20" y="-30" width="40" height="60" rx="2" className="fill-white/10 stroke-white/60 stroke-2" />
                <circle cx="0" cy="-15" r="8" className="fill-white/20" />
                <line x1="-15" y1="5" x2="15" y2="5" className="stroke-white/40" />
             </g>
           </g>
        </svg>
      );
    case 's_tute':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
           <g transform="translate(75, 75)">
              <rect x="0" y="0" width="50" height="70" rx="2" className="fill-white/5 stroke-white/10" style={{ '--tx': '15px', '--ty': '-15px', animation: 'stack-float 6s ease-in-out infinite' } as React.CSSProperties} />
              <rect x="0" y="0" width="50" height="70" rx="2" className="fill-white/10 stroke-white/20" style={{ '--tx': '8px', '--ty': '-8px', animation: 'stack-float 6s ease-in-out infinite 0.2s' } as React.CSSProperties} />
              <rect x="0" y="0" width="50" height="70" rx="2" className="fill-white/20 stroke-white/50 stroke-2" />
              <line x1="10" y1="15" x2="40" y2="15" className="stroke-white/50 stroke-2" />
           </g>
        </svg>
      );
    case 's_letterhead':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
           <rect x="50" y="40" width="100" height="120" className="fill-white/5 stroke-white/20 stroke-2" />
           {[0, 1, 2, 3, 4].map(i => (
              <line key={i} x1="65" y1={70 + i * 15} x2="135" y2={70 + i * 15} className="stroke-white/60 stroke-2" style={{ strokeDasharray: 100, animation: `draw-line 4s ease-in-out infinite ${i * 0.5}s` }} />
           ))}
        </svg>
      );
    case 's_book':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
           <defs><filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
           <g transform="translate(100, 100)">
              <circle cx="0" cy="-40" r="20" className="fill-white/80 animate-[float-slow_5s_ease-in-out_infinite]" filter="url(#glow)" />
              <path d="M-50 60 Q0 80 50 60" className="fill-none stroke-white/30 stroke-2" />
              <g transform="translate(0, 10)">
                <rect x="-40" y="-10" width="38" height="50" className="fill-white/10 stroke-white/20" rx="2" />
                <rect x="2" y="-10" width="38" height="50" className="fill-white/10 stroke-white/20" rx="2" />
                <g className="origin-left" style={{ transformBox: 'fill-box' }}>
                   <rect x="2" y="-10" width="36" height="48" className="fill-white/40 opacity-80" rx="1" style={{ animation: 'page-flip 6s ease-in-out infinite', transformOrigin: '0 0' }} />
                </g>
              </g>
           </g>
        </svg>
      );
    case 's_businesscard':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
           <g transform="translate(100, 130)">
              <g style={{ animation: 'float-slow 5s ease-in-out infinite' }}>
                <path d="M-30 -20 Q-20 -40 -10 -20" className="fill-white/5 stroke-white/20" />
                <path d="M-10 -25 Q0 -45 10 -25" className="fill-white/5 stroke-white/20" />
                <path d="M10 -20 Q20 -40 30 -20" className="fill-white/5 stroke-white/20" />
                <g transform="rotate(-5)">
                  <rect x="-50" y="-80" width="100" height="60" rx="4" className="fill-white/10 stroke-white/40 stroke-2" />
                  <circle cx="-25" cy="-50" r="10" className="fill-white/20" />
                  <line x1="0" y1="-60" x2="35" y2="-60" className="stroke-white/30 stroke-2" />
                  <line x1="-35" y1="-35" x2="35" y2="-35" className="stroke-white/30 stroke-1" />
                </g>
                <path d="M-20 0 C-20 -20 20 -20 20 0 L20 40 L-20 40 Z" className="fill-white/20 stroke-white/30" />
              </g>
           </g>
        </svg>
      );
    default:
      return null;
  }
};

export const Home: React.FC<HomeProps> = ({ user, onLoginClick }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const workId = searchParams.get('work');

  const selectedWork = useMemo(() => {
    if (!workId) return null;
    return PORTFOLIO_ITEMS.find(item => item.id.toString() === workId) || null;
  }, [workId]);

  const closeLightbox = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('work');
    setSearchParams(nextParams);
  };

  const openWork = (id: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('work', id.toString());
    setSearchParams(nextParams);
  };

  useEffect(() => {
    if (selectedWork) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => { document.body.classList.remove('overflow-hidden'); }
  }, [selectedWork]);

  return (
    <div className="flex flex-col min-h-screen text-white">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-[90vh] flex flex-col justify-center items-center text-center px-4 md:px-12 max-w-7xl mx-auto pt-20 relative z-10">
        <div className="max-w-5xl">
            <h1 className="text-3xl sm:text-4xl md:text-8xl font-display font-bold mb-8 tracking-tight md:tracking-tighter leading-tight md:leading-none animate-fade-in select-none">
              <span className="block text-white mb-2 md:mb-0">Bring your ideas</span>
              <span className="block text-white/40 mb-2 md:mb-0">to life with</span>
              <span className="block" style={{ color: 'rgb(219, 0, 124)' }}>vivid visuals!</span>
            </h1>
            
            <p className="text-base md:text-2xl text-text-muted max-w-2xl mx-auto mb-12 md:mb-16 font-light leading-relaxed animate-fade-in px-2" style={{ animationDelay: '0.2s' }}>
              Immersive brand experiences crafted with precision. <br className="hidden md:block" />
              Visual soundscapes for your digital identity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in w-full max-w-sm sm:max-w-none mx-auto" style={{ animationDelay: '0.4s' }}>
                <Link to="/order" className="group flex items-center justify-center gap-4 px-8 py-4 rounded-full border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all duration-300 w-full sm:w-auto">
                  <span className="text-sm font-bold tracking-[0.2em]">START PROJECT</span>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </Link>

                <Link to="/tracking" className="group flex items-center justify-center gap-4 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 w-full sm:w-auto">
                  <span className="text-sm font-bold tracking-[0.2em] text-white/80 group-hover:text-white">TRACK ORDER</span>
                  <div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                    <Package size={18} />
                  </div>
                </Link>

                {!user && (
                  <button onClick={onLoginClick} className="group flex items-center justify-center gap-4 px-8 py-4 rounded-full bg-accent-purple/10 border border-accent-purple/30 hover:bg-accent-purple/20 transition-all duration-300 w-full sm:w-auto">
                     <span className="text-sm font-bold tracking-[0.2em] text-accent-purple">SIGN IN</span>
                     <div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center text-accent-purple group-hover:scale-110 transition-transform">
                       <UserIcon size={18} />
                     </div>
                  </button>
                )}
            </div>
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section id="services" className="py-24 relative z-10">
        <div className="px-6 md:px-12 max-w-7xl mx-auto mb-12 flex items-end justify-between">
          <h2 className="text-3xl font-display">Select Mode</h2>
          <span className="text-xs text-white/40 uppercase tracking-widest hidden md:block">Choose your workflow</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6 md:px-12 max-w-7xl mx-auto">
          {SERVICES.map((service, idx) => (
            <Link 
              key={service.id} 
              to={`/order?service=${service.id}`} 
              className="group relative h-[480px] glass-card rounded-[2rem] p-8 flex flex-col justify-between hover:border-white/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(213,0,249,0.2)]"
            >
              <div className="absolute top-0 left-0 w-full h-full opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none">
                <ServiceVisual id={service.id} />
              </div>
              
              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-4">
                   <span className="text-xs font-mono text-white/50 border border-white/10 px-2 py-1 rounded-full">0{idx + 1}</span>
                   <ArrowRight className="text-white/0 group-hover:text-white transition-all duration-300 -translate-x-4 group-hover:translate-x-0" />
                 </div>
                 <h3 className="text-2xl md:text-3xl font-display mb-2 leading-tight">{service.title}</h3>
                 <p className="text-white/50 text-xs md:text-sm leading-relaxed">{service.description}</p>
              </div>

              <div className="relative z-10 border-t border-white/10 pt-6">
                <div className="text-4xl font-light mb-4">${service.price}</div>
                <ul className="space-y-2">
                  {service.features.slice(0, 3).map((f, i) => (
                     <li key={i} className="text-xs text-white/70 flex items-center gap-2">
                       <div className="w-1 h-1 bg-accent-purple rounded-full"></div> {f}
                     </li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. SELECTED WORKS */}
      <section className="py-24 bg-black/40 backdrop-blur-sm">
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
             <h2 className="text-5xl md:text-7xl font-display tracking-tighter">Selected<br/>Works</h2>
             <div className="h-px bg-white/20 flex-1 mx-8 hidden md:block"></div>
             <p className="text-white/50 max-w-xs text-sm">Curated projects that define visual landscapes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {PORTFOLIO_ITEMS.map((item, idx) => (
              <div 
                key={item.id}
                onClick={() => openWork(item.id)}
                className={`group relative rounded-xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-300 
                  ${idx === 0 || idx === 5 ? 'md:col-span-2 aspect-[16/10] md:aspect-[21/9]' : 'aspect-[4/5]'} 
                  cursor-pointer hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] border border-white/5 hover:border-white/20`}
              >
                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="bg-black/60 backdrop-blur-md p-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-colors">
                    <Maximize2 size={20} />
                  </div>
                </div>

                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 opacity-60 group-hover:opacity-100" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('bg-white/5', 'flex', 'items-center', 'justify-center', 'border', 'border-white/10');
                    const div = document.createElement('div');
                    div.className = 'text-center p-6 w-full';
                    const fileName = item.img.split('/').pop();
                    div.innerHTML = `
                      <div class="text-white/40 mb-2 font-mono text-xs uppercase tracking-widest">Image Missing</div>
                      <div class="text-white font-display text-xl mb-3">${item.title}</div>
                      <div class="bg-black/50 p-2 rounded text-xs text-accent-orange font-mono break-all border border-accent-orange/30">${fileName}</div>
                    `;
                    e.currentTarget.parentElement?.appendChild(div);
                  }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute bottom-0 left-0 p-6 md:p-8 transform translate-y-4 md:translate-y-8 md:group-hover:translate-y-0 transition-transform duration-300 w-full">
                  <div className="text-xs text-accent-green uppercase tracking-widest mb-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity delay-100">
                    {item.category}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display text-white mb-2">{item.title}</h3>
                  <p className="text-white/70 text-sm max-w-lg line-clamp-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity delay-200 hidden md:block">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. STATS SECTION */}
      <section className="border-t border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
          {[
            { label: 'Happy Clients', value: '250+' },
            { label: 'Projects', value: '400+' },
            { label: 'Experience', value: '5 Yrs' },
            { label: 'Awards', value: '12' },
          ].map((stat, idx) => (
            <div key={idx} className="py-12 text-center group hover:bg-white/5 transition-colors cursor-default">
              <div className="text-3xl font-display text-white mb-2">{stat.value}</div>
              <div className="text-xs text-white/30 uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SMART LIGHTBOX MODAL - FIXED CENTER POSITIONING */}
      {selectedWork && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-[fadeIn_0.3s_ease-out_forwards] overflow-y-auto overflow-x-hidden">
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl" onClick={closeLightbox}></div>
          
          <div className="relative w-full max-w-6xl my-auto pointer-events-none">
            {/* Close Button Mobile (Sticky-style) */}
            <button 
              onClick={closeLightbox} 
              className="fixed top-6 right-6 text-white/70 hover:text-white pointer-events-auto transition-all z-[110] p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 md:hidden"
            >
              <X size={24} />
            </button>

            {/* Close Button Desktop */}
            <button 
              onClick={closeLightbox} 
              className="absolute -top-12 -right-12 text-white/50 hover:text-white pointer-events-auto transition-colors z-50 p-2 group hidden md:flex items-center"
            >
              <span className="mr-2 text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
              <X size={32} />
            </button>

            <div className="flex flex-col md:flex-row gap-6 md:gap-12 pointer-events-auto items-center">
              {/* Image Container */}
              <div className="flex-1 w-full flex items-center justify-center relative rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,1)] bg-neutral-950/50">
                 <img 
                   src={selectedWork.img} 
                   alt={selectedWork.title} 
                   className="max-w-full max-h-[70vh] md:max-h-[80vh] object-contain" 
                 />
              </div>

              {/* Text Container */}
              <div className="w-full md:w-[400px] flex flex-col justify-center bg-black/40 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none p-6 md:p-0 rounded-2xl md:rounded-none border border-white/5 md:border-none">
                  <div className="flex items-center gap-3 mb-4">
                     <span className="h-px w-8 bg-accent-purple"></span>
                     <span className="text-accent-purple text-xs font-bold uppercase tracking-widest">{selectedWork.category}</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">{selectedWork.title}</h2>
                  <p className="text-white/70 text-sm md:text-base leading-relaxed font-light border-l border-white/10 pl-5 py-1 mb-8">
                    {selectedWork.description}
                  </p>
                  
                  <div className="flex flex-col gap-4">
                     <Link to="/order" className="w-full py-4 bg-white text-black font-bold rounded-full text-center uppercase tracking-[0.2em] text-xs hover:bg-accent-magenta hover:text-white transition-all shadow-lg">
                        Start Similar Project
                     </Link>
                     <button onClick={closeLightbox} className="md:hidden w-full py-4 bg-white/5 text-white/50 border border-white/10 font-bold rounded-full uppercase tracking-wider text-xs">
                        Back to Portfolio
                     </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};