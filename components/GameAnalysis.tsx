import React from 'react';
import { Trophy, Clock, Skull, TrendingUp } from 'lucide-react';
import { PlayerStat } from '../types';

const MOCK_STATS: PlayerStat[] = [
    { username: "DriftKing_JP", category: 'BEST_PLAYER', value: "98% Win Rate", detail: "Dominating the tracks with precision.", avatarColor: "from-yellow-400 to-orange-500" },
    { username: "NightOwl_247", category: 'BEST_GAMER', value: "142 Hours", detail: "Most time spent in the Zone this week.", avatarColor: "from-blue-400 to-purple-500" },
    { username: "CrashDummy_X", category: 'BEST_LOSER', value: "452 Crashes", detail: "Most resilient driver. Keeps coming back.", avatarColor: "from-gray-500 to-gray-700" }
];

export const GameAnalysis: React.FC = () => {
  return (
    <div className="p-6 md:p-12 pb-24 max-w-6xl mx-auto">
        <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-black brand-font text-white mb-4">GAME <span className="text-red-600">ANALYSIS</span></h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
                Comprehensive data analysis of the current season. Recognizing the champions, the grinders, and those who never give up.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_STATS.map((stat) => (
                <div key={stat.category} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-red-600 transition-all duration-500">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.category === 'BEST_PLAYER' ? 'from-yellow-900/50 to-orange-900/50 text-yellow-500' : stat.category === 'BEST_GAMER' ? 'from-blue-900/50 to-purple-900/50 text-blue-500' : 'from-gray-800 to-gray-900 text-gray-400'}`}>
                            {stat.category === 'BEST_PLAYER' && <Trophy className="w-8 h-8" />}
                            {stat.category === 'BEST_GAMER' && <Clock className="w-8 h-8" />}
                            {stat.category === 'BEST_LOSER' && <Skull className="w-8 h-8" />}
                        </div>
                        <div className="text-xs font-bold tracking-widest text-gray-500 bg-black/50 px-2 py-1 rounded border border-gray-800">
                            {stat.category.replace('_', ' ')}
                        </div>
                    </div>

                    <div className="flex flex-col items-center mb-6">
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${stat.avatarColor} p-1 mb-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
                            <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                {stat.username.substring(0,2).toUpperCase()}
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white">{stat.username}</h3>
                        <p className="text-red-500 font-mono font-bold text-lg mt-1">{stat.value}</p>
                    </div>

                    <div className="bg-black/40 rounded-xl p-4 border border-gray-800 text-center">
                        <p className="text-gray-400 text-sm italic">"{stat.detail}"</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-12 bg-gray-900/40 border border-gray-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><TrendingUp className="text-green-500" /> Platform Stats</h3>
                <p className="text-gray-400 text-sm">Real-time metrics from the Fast & Furious Zone.</p>
            </div>
            <div className="flex gap-8 text-center">
                <div>
                    <div className="text-3xl font-bold text-white font-mono">1.2M</div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Races Run</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-white font-mono">$450K</div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Rewards Paid</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-white font-mono">24/7</div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Uptime</div>
                </div>
            </div>
        </div>
    </div>
  );
};