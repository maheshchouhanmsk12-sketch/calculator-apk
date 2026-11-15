import React, { useState, useEffect } from 'react';
import { Calculator } from './components/Calculator';

export const App: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<{
    connected: boolean;
    dbConnected: boolean;
  }>({
    connected: false,
    dbConnected: false,
  });

  // Check MERN backend connectivity
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          setBackendStatus({
            connected: true,
            dbConnected: data?.database?.connected ?? false,
          });
        }
      } catch {
        setBackendStatus({
          connected: false,
          dbConnected: false,
        });
      }
    };

    checkBackend();
  }, []);

  return (
    <main className="min-h-screen w-full relative flex flex-col justify-between items-center p-4 sm:p-6 bg-gradient-to-br from-[#f6f3ff] via-[#eff6ff] to-[#f8f9fe] overflow-x-hidden">
      {/* Background Decorative Ambient Lighting & Abstract Flowing Gradient Orbs */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-br from-purple-400/25 via-indigo-300/25 to-blue-300/20 blur-3xl pointer-events-none animate-ambient-1"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-tl from-blue-400/25 via-purple-300/25 to-indigo-300/20 blur-3xl pointer-events-none animate-ambient-2"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 -left-20 w-72 h-72 rounded-full bg-purple-300/15 blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top spacer for clean vertical balance */}
      <div className="w-full h-3 sm:h-6 relative z-10" />

      {/* Central Focus: Premium Purple & Blue Glassmorphism Calculator */}
      <div className="w-full flex justify-center items-center my-auto relative z-10 py-4 sm:py-6">
        <Calculator />
      </div>

      {/* Subtle, Minimal MERN Stack Status Indicator */}
      <footer className="relative z-10 w-full max-w-md flex items-center justify-between py-3 text-[11px] text-purple-900/50 font-medium tracking-wide select-none">
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              backendStatus.connected ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
          <span>
            {backendStatus.connected
              ? `API Active ${backendStatus.dbConnected ? '• MongoDB Connected' : ''}`
              : 'Standalone Mode'}
          </span>
        </div>
        <div className="text-purple-900/40">
          MERN Engine
        </div>
      </footer>
    </main>
  );
};

export default App;
