import React, { useState, useEffect } from 'react';

export const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-6 right-24 z-[60] pointer-events-none hidden lg:block">
      <div className="bg-black/60 backdrop-blur-md border border-gray-800 px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-3">
        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Grid Time (UTC)</span>
          <span className="text-xl font-black font-mono text-white brand-font tracking-tighter leading-none italic">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
        </div>
      </div>
    </div>
  );
};