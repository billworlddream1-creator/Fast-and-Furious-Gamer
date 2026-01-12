import React, { useState, useEffect, useRef } from 'react';
import { LobbyPlayer, ChatMessage, Game } from '../types';
import { Users, Send, Shield, Monitor, Gamepad, Crown, CheckCircle, XCircle, AlertCircle, Scale, Coins, AlertTriangle, Share2 } from 'lucide-react';
import { InviteModal } from './InviteModal';

interface GameLobbyProps {
  game: Game;
  onStart: (team: 'RED' | 'BLUE' | 'SOLO', wager: number, pot: number) => void;
  onBack: () => void;
  walletBalance: number;
}

export const GameLobby: React.FC<GameLobbyProps> = ({ game, onStart, onBack, walletBalance }) => {
  const [userTeam, setUserTeam] = useState<'RED' | 'BLUE' | 'SOLO'>('SOLO');
  const [isReady, setIsReady] = useState(false);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [wager, setWager] = useState(1);
  const [showInvite, setShowInvite] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialPlayers: LobbyPlayer[] = [
      { id: '1', name: 'DriftKing', isReady: true, team: 'RED', avatar: 'DK', level: 45 },
    ];
    setPlayers(initialPlayers);
    setChatMessages([{ id: 'sys1', user: 'SYSTEM', text: `Welcome to the lobby for ${game.title}.`, timestamp: Date.now(), isSystem: true }]);
  }, [game]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg: ChatMessage = { id: Date.now().toString(), user: 'You', text: chatInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, msg]);
    setChatInput('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const currentPlayers = [
      { id: 'me', name: 'You', isReady, team: userTeam, avatar: 'ME', level: 42 },
      ...players
  ];

  const allReady = currentPlayers.every(p => p.isReady);
  const playerCount = currentPlayers.length;
  const potentialPot = wager === 0 ? 0 : (playerCount > 1 ? wager * playerCount : wager * 2);
  const canAfford = walletBalance >= wager;
  const isFreeMode = wager === 0;

  return (
    <div className="fixed inset-0 z-[55] bg-black/95 flex flex-col items-center justify-center p-4 md:p-8 backdrop-blur-md">
       <div className="w-full max-w-6xl h-full max-h-[800px] bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          
          <div className="flex-1 flex flex-col border-r border-gray-700">
             <div className="p-6 border-b border-gray-700 bg-gray-800/50 flex justify-between">
                <div>
                    <h2 className="text-3xl font-bold brand-font text-white mb-1">{game.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {currentPlayers.length} / 12 Players</span>
                        <button onClick={() => setShowInvite(true)} className="flex items-center gap-1 text-blue-400 hover:text-white"><Share2 className="w-4 h-4"/> Invite</button>
                    </div>
                </div>
                
                <div className="bg-black/40 border border-gray-700 rounded-xl p-3 min-w-[200px]">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                            <Coins className="w-3 h-3 text-yellow-500" /> WAGER
                        </label>
                        <span className={`text-sm font-mono ${canAfford ? 'text-white' : 'text-red-500'}`}>${wager}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" max="200" step="1"
                        value={wager}
                        onChange={(e) => setWager(parseInt(e.target.value))}
                        className="w-full accent-yellow-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
             </div>

             <div className="p-6">
                <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Select Team</h3>
                <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => setUserTeam('SOLO')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${userTeam === 'SOLO' ? 'bg-purple-900/30 border-purple-500 text-purple-400' : 'bg-black border-gray-800 text-gray-500'}`}><Crown className="w-6 h-6" /><span className="font-bold">SOLO</span></button>
                    <button onClick={() => setUserTeam('RED')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${userTeam === 'RED' ? 'bg-red-900/30 border-red-500 text-red-400' : 'bg-black border-gray-800 text-gray-500'}`}><Shield className="w-6 h-6" /><span className="font-bold">RED TEAM</span></button>
                    <button onClick={() => setUserTeam('BLUE')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${userTeam === 'BLUE' ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-black border-gray-800 text-gray-500'}`}><Shield className="w-6 h-6" /><span className="font-bold">BLUE TEAM</span></button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-2">
                {currentPlayers.map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-gray-800">
                         <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded center flex items-center justify-center text-xs font-bold text-white bg-gray-700`}>{p.avatar}</div>
                             <div><p className={`text-sm font-bold ${p.id === 'me' ? 'text-yellow-400' : 'text-gray-200'}`}>{p.name}</p></div>
                         </div>
                         <div className="flex items-center gap-3">
                             <div className="text-xs text-gray-400 font-mono flex items-center gap-1"><Coins className="w-3 h-3 text-yellow-600" /> ${wager}</div>
                             {p.isReady ? <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-900/20 px-2 py-1 rounded border border-green-900"><CheckCircle className="w-3 h-3" /> READY</div> : <div className="flex items-center gap-1 text-gray-600 text-xs font-bold bg-gray-900 px-2 py-1 rounded border border-gray-800"><XCircle className="w-3 h-3" /> WAITING</div>}
                         </div>
                    </div>
                ))}
             </div>

             <div className="p-6 border-t border-gray-700 bg-gray-800/50 flex justify-between items-center">
                 <button onClick={onBack} className="text-gray-400 hover:text-white text-sm font-bold px-4 py-2">LEAVE LOBBY</button>
                 <div className="flex items-center gap-4">
                     <button 
                        onClick={() => setIsReady(!isReady)}
                        disabled={!canAfford}
                        className={`px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${!canAfford ? 'bg-gray-700 opacity-50' : isReady ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-yellow-600 hover:bg-yellow-500 text-white'}`}
                     >
                        {isReady ? 'READY!' : 'READY UP'}
                     </button>
                     <button 
                        disabled={!allReady || !canAfford}
                        onClick={() => onStart(userTeam, wager, potentialPot)}
                        className={`px-8 py-3 font-bold rounded-lg flex items-center gap-2 transition-all ${allReady && canAfford ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)]' : 'bg-gray-800 text-gray-500 opacity-50'}`}
                     >
                        <Gamepad className="w-5 h-5" /> START MATCH
                    </button>
                 </div>
             </div>
          </div>
          
          <div className="hidden md:flex w-80 bg-black flex-col border-l border-gray-700 p-4">
             <h3 className="font-bold text-gray-300 mb-4 flex items-center gap-2"><Users className="w-4 h-4"/> Lobby Chat</h3>
             <div className="flex-1 overflow-y-auto space-y-3">
                 {chatMessages.map(msg => (
                     <div key={msg.id} className="text-sm text-gray-400"><span className="font-bold text-gray-200">{msg.user}:</span> {msg.text}</div>
                 ))}
                 <div ref={chatEndRef}></div>
             </div>
             <form onSubmit={handleSendChat} className="mt-4 flex gap-2">
                 <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-gray-800 rounded px-2 text-sm text-white" placeholder="Chat..."/>
                 <button type="submit" className="text-red-500"><Send className="w-4 h-4"/></button>
             </form>
          </div>
       </div>
       <InviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} gameTitle={game.title} />
    </div>
  );
};