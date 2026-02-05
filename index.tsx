import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SERVICES, PORTFOLIO_ITEMS } from './constants';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// --- Asset Preloading Logic (Non-blocking) ---
const preloadImages = () => {
  const imageUrls = [
    'https://raw.githubusercontent.com/ranthulaAm/App/main/img/logo.png', // Logo
    ...SERVICES.map(s => s.image),
    ...PORTFOLIO_ITEMS.map(p => p.img)
  ];

  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
    // We do not await this, just start the browser download
  });
};

// Start preloading in background
preloadImages();

// Render immediately to prevent white/black screen
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);