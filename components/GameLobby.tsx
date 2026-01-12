import React, { useState, useEffect, useRef } from 'react';
import { LobbyPlayer, ChatMessage, Game, Vehicle } from '../types';
import { Users, Send, Shield, Monitor, Gamepad, Crown, CheckCircle, XCircle, Coins, Share2, Car, Zap, Cpu } from 'lucide-react';
import { InviteModal } from './InviteModal';

interface GameLobbyProps {
  game: Game;
  onStart: (team: 'RED' | 'BLUE' | 'SOLO', wager: number, pot: number) => void;
  onBack: () => void;
  walletBalance: number;
  selectedVehicle: Vehicle;
  onOpenGarage: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({ game, onStart, onBack, walletBalance, selectedVehicle, onOpenGarage }) => {
  const [userTeam, setUserTeam] = useState<'RED' | 'BLUE' | 'SOLO'>('SOLO');
  const [isReady, setIsReady] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [wager, setWager] = useState(1);
  const [showInvite, setShowInvite] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatMessages([{ id: 'sys1', user: 'SYSTEM', text: `Tactical briefing for ${game.title} initialized.`, timestamp: Date.now(), isSystem: true }]);
  }, [game]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { id: Date.now().toString(), user: 'You', text: chatInput, timestamp: Date.now() }]);
    setChatInput('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const potentialPot = wager === 0 ? 0 : (wager * 2);
  const canAfford = walletBalance >= wager;

  return (
    <div className="fixed inset-0 z-[55] bg-black/98 flex flex-col items-center justify-center p-4 md:p-8 backdrop-blur-xl">
       <div className="w-full max-w-6xl h-full max-h-[850px] bg-gray-900 border border-gray-800 rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
          
          {/* Main Controls */}
          <div className="flex-1 flex flex-col border-r border-gray-800">
             <div className="p-8 border-b border-gray-800 bg-gray-900/50 flex flex-col md:flex-row justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="bg-red-600/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20">Operational Lobby</span>
                        <h2 className="text-3xl font-black brand-font italic text-white uppercase tracking-tighter">{game.title}</h2>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase">
                            <Users className="w-4 h-4 text-gray-600" /> Slot 1/12
                        </div>
                        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 text-xs text-blue-500 hover:text-blue-400 font-bold uppercase transition-colors">
                            <Share2 className="w-4 h-4"/> Signal Friends
                        </button>
                    </div>
                </div>
                
                <div className="bg-black/60 border border-gray-800 rounded-2xl p-4 min-w-[240px]">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-black text-gray-500 flex items-center gap-2 uppercase tracking-widest">
                            <Coins className="w-3 h-3 text-yellow-500" /> Tactical Wager
                        </label>
                        <span className={`text-xl font-black font-mono ${canAfford ? 'text-white' : 'text-red-500'}`}>${wager}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" max="250" step="1"
                        value={wager}
                        onChange={(e) => setWager(parseInt(e.target.value))}
                        className="w-full accent-red-600 h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer mb-2"
                    />
                    <div className="flex justify-between text-[10px] text-gray-600 font-bold uppercase mt-1">
                        <span>Recon (Free)</span>
                        <span>Elite ($250)</span>
                    </div>
                </div>
             </div>

             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Team Select */}
                <div>
                    <h3 className="text-xs font-black text-gray-500 mb-4 uppercase tracking-[0.2em]">Assignment</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setUserTeam('SOLO')} className={`flex-1 py-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${userTeam === 'SOLO' ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/20' : 'bg-black border-gray-800 text-gray-600 hover:border-gray-700'}`}><Crown className="w-6 h-6" /><span className="text-[10px] font-black">SOLO</span></button>
                        <button onClick={() => setUserTeam('RED')} className={`flex-1 py-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${userTeam === 'RED' ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/20' : 'bg-black border-gray-800 text-gray-600 hover:border-gray-700'}`}><Shield className="w-6 h-6" /><span className="text-[10px] font-black">RED</span></button>
                        <button onClick={() => setUserTeam('BLUE')} className={`flex-1 py-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${userTeam === 'BLUE' ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20' : 'bg-black border-gray-800 text-gray-600 hover:border-gray-700'}`}><Shield className="w-6 h-6" /><span className="text-[10px] font-black">BLUE</span></button>
                    </div>
                </div>

                {/* Vehicle Choice */}
                <div>
                    <h3 className="text-xs font-black text-gray-500 mb-4 uppercase tracking-[0.2em]">Assigned Unit</h3>
                    <button 
                        onClick={onOpenGarage}
                        className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 group hover:border-red-500/50 transition-all"
                    >
                        <div className="w-16 h-12 rounded-xl flex items-center justify-center relative overflow-hidden bg-black border border-gray-800">
                             <div className="absolute inset-0 opacity-20" style={{ backgroundColor: selectedVehicle.color }}></div>
                             <Car className="w-6 h-6 relative z-10" style={{ color: selectedVehicle.color }} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-xs font-black text-white uppercase italic tracking-tight">{selectedVehicle.name}</p>
                            <div className="flex gap-3 mt-1">
                                <span className="flex items-center gap-1 text-[9px] font-bold text-gray-500 uppercase"><Zap className="w-2 h-2 text-red-500"/> Nitro Lvl {selectedVehicle.nitroPower.toFixed(1)}</span>
                                {selectedVehicle.autoBoost && <span className="flex items-center gap-1 text-[9px] font-bold text-blue-500 uppercase"><Cpu className="w-2 h-2"/> Boost Active</span>}
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-red-500 uppercase">Change Unit</span>
                    </button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                     <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-xs font-black text-white">ME</div>
                         <div><p className="text-sm font-black text-white uppercase italic tracking-tighter">You <span className="text-[10px] text-gray-500 not-italic ml-2">(Pilot lvl 42)</span></p></div>
                     </div>
                     <div className="flex items-center gap-4">
                         <div className="text-xs text-gray-400 font-mono font-bold uppercase tracking-tight">${wager} Stake</div>
                         {isReady ? <div className="text-[10px] font-black text-green-500 bg-green-900/20 px-3 py-1 rounded-full border border-green-900/30 uppercase">Confirmed</div> : <div className="text-[10px] font-black text-gray-600 bg-gray-900 px-3 py-1 rounded-full border border-gray-800 uppercase italic">Pending...</div>}
                     </div>
                </div>
             </div>

             <div className="p-8 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center">
                 <button onClick={onBack} className="text-gray-600 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Abadon Mission</button>
                 <div className="flex items-center gap-4">
                     <button 
                        onClick={() => setIsReady(!isReady)}
                        disabled={!canAfford}
                        className={`px-10 py-4 rounded-2xl font-black uppercase italic tracking-tighter transition-all active:scale-95 ${!canAfford ? 'bg-gray-800 text-gray-700 grayscale cursor-not-allowed' : isReady ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                     >
                        {isReady ? 'Locked In' : 'Confirm Status'}
                     </button>
                     <button 
                        disabled={!isReady || !canAfford}
                        onClick={() => onStart(userTeam, wager, potentialPot)}
                        className={`px-12 py-4 font-black uppercase italic tracking-tighter rounded-2xl flex items-center gap-3 transition-all ${isReady && canAfford ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_40px_rgba(220,38,38,0.4)]' : 'bg-gray-900 text-gray-800 grayscale cursor-not-allowed'}`}
                     >
                        <Gamepad className="w-6 h-6" /> Deploy Sortie
                    </button>
                 </div>
             </div>
          </div>
          
          <div className="hidden md:flex w-80 bg-black flex-col p-6">
             <h3 className="font-black text-gray-500 text-xs mb-6 flex items-center gap-2 uppercase tracking-[0.2em]"><Users className="w-4 h-4 text-red-600"/> Tactical Comms</h3>
             <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
                 {chatMessages.map(msg => (
                     <div key={msg.id} className={`text-xs ${msg.isSystem ? 'text-gray-600 italic' : 'text-gray-400'}`}>
                         {!msg.isSystem && <span className="font-black text-gray-200 uppercase mr-2">{msg.user}:</span>}
                         {msg.text}
                     </div>
                 ))}
                 <div ref={chatEndRef}></div>
             </div>
             <form onSubmit={handleSendChat} className="mt-6 flex gap-2">
                 <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-600" placeholder="Type message..."/>
                 <button type="submit" className="text-red-600 p-2 hover:scale-110 transition-transform"><Send className="w-5 h-5"/></button>
             </form>
          </div>
       </div>
       <InviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} gameTitle={game.title} />
    </div>
  );
};