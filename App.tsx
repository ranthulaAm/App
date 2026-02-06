import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { IntroSequence } from './components/IntroSequence';
import { AdminGuard } from './components/AdminGuard';
import { Home } from './pages/Home';
import { Order } from './pages/Order';
import { Tracking } from './pages/Tracking';
import { AdminDashboard } from './pages/AdminDashboard';
import { User } from './types';
import { saveUserProfile } from './services/storageService';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// ScrollToTop component to reset scroll position on every route change
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname, search]);
  return null;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Intro State
  const [showIntro, setShowIntro] = useState(true);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
         const appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/shapes/svg?seed=${firebaseUser.uid}`,
          provider: 'email',
        };
        setUser(appUser);
        saveUserProfile(appUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handle returning to intro from Admin
  useEffect(() => {
    if (location.state && (location.state as any).showIntro) {
      setShowIntro(true);
    }
  }, [location]);

  // Determine the background mode based on the current route
  const isStaticPage = location.pathname.startsWith('/order') || location.pathname.startsWith('/tracking');
  const isAdmin = location.pathname.startsWith('/admin');
  const backgroundMode = isStaticPage ? 'minimal' : 'vibrant';

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    // Navigation is now handled inside IntroSequence
  };

  return (
    <>
      {showIntro && (
        <IntroSequence 
          onComplete={handleIntroComplete} 
          skipAnimation={location.state && (location.state as any).skipAnimation} 
        />
      )}

      <div className={`relative min-h-screen font-sans selection:bg-accent-magenta selection:text-white flex flex-col transition-opacity duration-1000 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Scroll restoration */}
        <ScrollToTop />
        
        {/* Background Canvas handles the smooth transition between modes - Hidden on Admin */}
        {!isAdmin && <BackgroundCanvas mode={backgroundMode} />}

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar 
            user={user} 
            onLoginClick={() => setIsAuthModalOpen(true)} 
            onLogout={handleLogout} 
          />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home user={user} onLoginClick={() => setIsAuthModalOpen(true)} />} />
              <Route 
                path="/order" 
                element={<Order user={user} onLoginRequest={() => setIsAuthModalOpen(true)} />} 
              />
              <Route 
                path="/tracking" 
                element={<Tracking user={user} />} 
              />
              <Route 
                path="/admin" 
                element={
                  <AdminGuard>
                    <AdminDashboard />
                  </AdminGuard>
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          {!isAdmin && <Footer />}
        </div>
        
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onLogin={() => {}} // No longer needed as AuthModal handles logic
        />
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;