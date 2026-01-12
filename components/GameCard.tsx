import React from 'react';
import { Play, Users, Star, Cpu } from 'lucide-react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
  return (
    <div className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-red-600 transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:-translate-y-1">
      {/* Thumbnail */}
      <div className="h-40 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <img 
          src={game.thumbnail} 
          alt={game.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {game.isCustom && (
           <span className="absolute top-2 left-2 z-20 bg-purple-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
             <Cpu className="w-3 h-3" /> COMMUNITY
           </span>
        )}
        <div className="absolute bottom-2 right-2 z-20 flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
          <Users className="w-3 h-3 text-green-400" />
          <span className="text-xs font-mono">{game.onlinePlayers.toLocaleString()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold brand-font text-white truncate">{game.title}</h3>
          <div className="flex items-center text-yellow-500">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs ml-1 font-bold">{game.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-400 text-xs line-clamp-2 mb-4 h-8">{game.description}</p>
        
        <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 border border-gray-800 px-2 py-1 rounded">
                {game.type}
            </span>
            <button 
                onClick={() => onPlay(game)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center space-x-1 transition-all active:scale-95 group-hover:neon-border-blue"
            >
                <Play className="w-3 h-3 fill-current" />
                <span>RACE</span>
            </button>
        </div>
      </div>
    </div>
  );
};