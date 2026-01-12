
import React, { useState, useEffect, useRef } from 'react';
// Added missing ShieldAlert icon import
import { Send, Users, Globe, MessageSquare, Bot, Code, Mail, Phone, ShieldAlert } from 'lucide-react';
import { ChatMessage } from '../types';

export const ChatSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'SYSTEM', text: 'Initializing neural link to Global Zone...', timestamp: Date.now(), isSystem: true },
    { id: 'dev1', user: 'Bill World', text: 'Welcome Pilots! For business, support, or custom builds, reach me at +2348108802044 or billworlddream1@gmail.com. Good luck out there!', timestamp: Date.now() + 50 },
    { id: 'tutor1', user: 'TutorBot', text: 'I am your co-pilot. Build 10 games in the Hub to unlock monthly $0.75 rewards! Type "help" for intel.', timestamp: Date.now() + 100 },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
      const tips = [
          "INTEL: Practice in Free Mode before wagering hard-earned credits.",
          "INTEL: Developer Bill World is monitoring the zones for top talent.",
          "INTEL: Custom Warfare game modes are now available in the Builder.",
          "CONTACT: Support Line: +2348108802044 | billworlddream1@gmail.com",
          "REWARD: $25 Loyalty Bonus pays out automatically for dedicated pilots."
      ];
      
      const interval = setInterval(() => {
          if (Math.random() > 0.8 && isOpen) {
              const tip = tips[Math.floor(Math.random() * tips.length)];
               setMessages(prev => [...prev.slice(-49), {
                  id: Date.now().toString(),
                  user: 'TutorBot',
                  text: tip,
                  timestamp: Date.now()
              }]);
          }
      }, 45000);
      return () => clearInterval(interval);
  }, [isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: 'You',
      text: input,
      timestamp: Date.now()
    }]);
    setInput('');
    
    const lowInput = input.toLowerCase();
    if (lowInput.includes('help') || lowInput.includes('bill') || lowInput.includes('contact')) {
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                user: 'TutorBot',
                text: "Direct Intel from Developer Bill World: +2348108802044 | Email: billworlddream1@gmail.com. Use the Engineering Hub to build your own missions!",
                timestamp: Date.now()
            }]);
        }, 1000);
    }
  };

  return (
    <>
      <button 
        onClick={toggleChat}
        className="fixed top-6 right-6 z-50 bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] border border-red-400/30 transition-all active:scale-90 group md:right-8"
      >
        <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        {!isOpen && <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-ping"></span>}
      </button>

      <div className={`fixed top-0 right-0 h-full w-80 bg-black/98 border-l border-gray-800/50 backdrop-blur-3xl transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-40 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-6 border-b border-gray-800 bg-gray-900/30">
          <div className="flex flex-col">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-red-500 animate-pulse" />
              <h3 className="font-black brand-font text-2xl text-white italic tracking-tighter">GLOBAL <span className="text-red-600">HUB</span></h3>
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                    <Code className="w-3 h-3 text-blue-500" /> Dev: Bill World
                </div>
                <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold">
                    <Mail className="w-3 h-3" /> billworlddream1@gmail.com
                </div>
                <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold">
                    <Phone className="w-3 h-3" /> +2348108802044
                </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.user === 'You' ? 'items-end' : 'items-start'} animate-in slide-in-from-right-2 duration-300`}>
              <div className="flex items-center space-x-2 mb-1.5 opacity-60">
                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                    msg.user === 'TutorBot' ? 'text-purple-500' :
                    msg.user === 'Bill World' ? 'text-red-500' :
                    msg.isSystem ? 'text-gray-500' : 
                    msg.user === 'You' ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  {msg.user === 'TutorBot' && <Bot className="w-3 h-3" />}
                  {msg.user === 'Bill World' && <ShieldAlert className="w-3 h-3" />}
                  {msg.user}
                </span>
                <span className="text-[9px] text-gray-700 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              </div>
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.user === 'TutorBot' ? 'bg-purple-900/10 text-purple-200 border border-purple-900/30' :
                msg.user === 'Bill World' ? 'bg-red-950/20 text-red-200 border border-red-900/30 font-bold' :
                msg.isSystem ? 'bg-gray-900/50 text-gray-500 border border-gray-800 text-xs italic' : 
                msg.user === 'You' ? 'bg-blue-600/10 text-white border border-blue-500/20' : 
                'bg-gray-900/80 text-gray-300 border border-gray-800'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-6 bg-black border-t border-gray-800 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Signal to Hub..."
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-3 pl-5 pr-12 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder-gray-700"
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 p-2 bg-red-600 rounded-xl text-white hover:bg-red-500 transition-all active:scale-90"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
