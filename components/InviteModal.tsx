import React, { useState } from 'react';
import { Share2, Copy, Check, Users, Mail, X } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle?: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, gameTitle = "Fast & Furious" }) => {
  const [copied, setCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState<string[]>([]);

  if (!isOpen) return null;

  const inviteLink = `https://fast-furious-zone.com/join/${Math.random().toString(36).substring(7)}`;

  const handleCopy = () => {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleInternalInvite = (friend: string) => {
      setInviteSent([...inviteSent, friend]);
      // Logic to actually send invite would go here
  };

  const mockFriends = ["DriftKing_JP", "NeonRider", "SpeedDemon"];

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md relative overflow-hidden">
         <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
         
         <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <Share2 className="text-red-500" /> INVITE PLAYERS
             </h2>
             <p className="text-gray-400 text-xs mt-1">Bring friends to {gameTitle}</p>
         </div>

         <div className="p-6 space-y-6">
             {/* External Link */}
             <div>
                 <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Share Link (Outside Game)</label>
                 <div className="flex gap-2">
                     <div className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 truncate font-mono">
                         {inviteLink}
                     </div>
                     <button 
                        onClick={handleCopy}
                        className={`px-3 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${copied ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                     >
                         {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                     </button>
                 </div>
             </div>

             {/* Internal Friends */}
             <div>
                 <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Online Friends</label>
                 <div className="space-y-2">
                     {mockFriends.map(friend => (
                         <div key={friend} className="flex items-center justify-between bg-black/40 p-2 rounded border border-gray-800">
                             <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">{friend.substring(0,2)}</div>
                                 <span className="text-sm font-bold text-gray-300">{friend}</span>
                             </div>
                             <button 
                                onClick={() => handleInternalInvite(friend)}
                                disabled={inviteSent.includes(friend)}
                                className={`px-3 py-1 rounded text-xs font-bold ${inviteSent.includes(friend) ? 'text-green-500' : 'bg-red-600 text-white hover:bg-red-500'}`}
                             >
                                 {inviteSent.includes(friend) ? 'SENT' : 'INVITE'}
                             </button>
                         </div>
                     ))}
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};