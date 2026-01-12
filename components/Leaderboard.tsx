import React, { useState } from 'react';
import { Trophy, Medal, ChevronUp, ChevronDown, Minus, Search, Shield } from 'lucide-react';
import { LeaderboardEntry } from '../types';

const MOCK_DATA: LeaderboardEntry[] = [
  { rank: 1, username: "DriftKing_JP", score: 154200, vehicle: "Nissan GTR Cyber", change: "same" },
  { rank: 2, username: "SpeedDemon_99", score: 149800, vehicle: "Tesla Roadster X", change: "up" },
  { rank: 3, username: "NeonRider", score: 145000, vehicle: "Porsche 911 Future", change: "down" },
  { rank: 4, username: "V8_Interceptor", score: 138900, vehicle: "Ford Mustang 2077", change: "up" },
  { rank: 5, username: "GhostRacer", score: 132000, vehicle: "Bike Akira Type", change: "same" },
  { rank: 6, username: "TorettoFamily", score: 128500, vehicle: "Dodge Charger Hellcat", change: "down" },
  { rank: 7, username: "PixelDriver", score: 115000, vehicle: "Cybertruck Rally", change: "up" },
  { rank: 8, username: "NightOwl", score: 102000, vehicle: "Rx-7 Spirit", change: "same" },
];

export const Leaderboard: React.FC = () => {
  const [filter, setFilter] = useState<'GLOBAL' | 'FRIENDS'>('GLOBAL');

  return (
    <div className="p-6 md:p-12 pb-24 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
           <h1 className="text-4xl md:text-5xl font-bold brand-font text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
             GLOBAL RANKINGS
           </h1>
           <p className="text-gray-400">The fastest drivers in the metaverse.</p>
        </div>
        
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
           <button 
             onClick={() => setFilter('GLOBAL')}
             className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${filter === 'GLOBAL' ? 'bg-yellow-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
           >
             GLOBAL
           </button>
           <button 
             onClick={() => setFilter('FRIENDS')}
             className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${filter === 'FRIENDS' ? 'bg-yellow-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
           >
             FRIENDS
           </button>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm overflow-hidden">
         {/* Search Bar */}
         <div className="p-4 border-b border-gray-800 flex gap-4">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
               <input 
                 type="text" 
                 placeholder="Search driver..." 
                 className="w-full bg-black/50 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:border-yellow-500 focus:outline-none"
               />
            </div>
         </div>

         {/* Table Header */}
         <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-800 bg-black/40">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-1"></div>
            <div className="col-span-4">Driver</div>
            <div className="col-span-3">Vehicle</div>
            <div className="col-span-3 text-right">Score</div>
         </div>

         {/* List */}
         <div className="divide-y divide-gray-800/50">
            {MOCK_DATA.map((entry) => (
               <div key={entry.rank} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group">
                  <div className="col-span-1 flex justify-center">
                     {entry.rank === 1 && <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />}
                     {entry.rank === 2 && <Medal className="w-6 h-6 text-gray-300" />}
                     {entry.rank === 3 && <Medal className="w-6 h-6 text-amber-700" />}
                     {entry.rank > 3 && <span className="font-mono font-bold text-gray-500">#{entry.rank}</span>}
                  </div>
                  
                  <div className="col-span-1 flex justify-center">
                     {entry.change === 'up' && <ChevronUp className="w-4 h-4 text-green-500" />}
                     {entry.change === 'down' && <ChevronDown className="w-4 h-4 text-red-500" />}
                     {entry.change === 'same' && <Minus className="w-4 h-4 text-gray-600" />}
                  </div>

                  <div className="col-span-4 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold border border-gray-500">
                        {entry.username.substring(0,2).toUpperCase()}
                     </div>
                     <span className={`font-bold ${entry.rank <= 3 ? 'text-white' : 'text-gray-300'} group-hover:text-yellow-400 transition-colors`}>
                        {entry.username}
                     </span>
                     {entry.rank === 1 && <Shield className="w-3 h-3 text-blue-400" />}
                  </div>

                  <div className="col-span-3 text-sm text-gray-400 font-mono">
                     {entry.vehicle}
                  </div>

                  <div className="col-span-3 text-right font-mono font-bold text-lg text-yellow-500">
                     {entry.score.toLocaleString()}
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};
