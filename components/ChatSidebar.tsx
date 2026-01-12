import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Globe, MessageSquare, Bot } from 'lucide-react';
import { ChatMessage } from '../types';

export const ChatSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'System', text: 'Welcome to the Global Racing Network.', timestamp: Date.now(), isSystem: true },
    { id: 'tutor1', user: 'TutorBot', text: 'Hi! I am here to help. Ask me anything or just say "help".', timestamp: Date.now() + 100 },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Tutor Logic
  useEffect(() => {
      const tips = [
          "Tip: You can start with Free Mode to practice before betting real money.",
          "Tip: Deposits expire after 65 days of inactivity, so keep racing!",
          "Tip: You need to make a profit of $5 over your deposits to cash out.",
          "Tip: Use power-ups like Shields to survive longer runs."
      ];
      
      const interval = setInterval(() => {
          if (Math.random() > 0.8) {
              const tip = tips[Math.floor(Math.random() * tips.length)];
               setMessages(prev => [...prev.slice(-49), {
                  id: Date.now().toString(),
                  user: 'TutorBot',
                  text: tip,
                  timestamp: Date.now()
              }]);
          }
      }, 30000); // Tip every 30s
      return () => clearInterval(interval);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    // Tutor response
    if (input.toLowerCase().includes('help')) {
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                user: 'TutorBot',
                text: "To play, go to the Hub, select a game, and choose your wager. Good luck!",
                timestamp: Date.now()
            }]);
        }, 1000);
    }
  };

  return (
    <>
      {/* Toggle Button for Mobile/Desktop */}
      <button 
        onClick={toggleChat}
        className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg border border-red-400/50 transition-all active:scale-95 md:right-8"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-black/95 border-l border-gray-800 transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-500 animate-pulse" />
            <h3 className="font-bold brand-font text-lg text-white">Global Zone</h3>
          </div>
          <div className="flex items-center text-xs text-gray-400 space-x-1">
            <Users className="w-3 h-3" />
            <span>12,402 Online</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.user === 'You' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline space-x-2 mb-1">
                <span className={`text-xs font-bold flex items-center gap-1 ${
                    msg.user === 'TutorBot' ? 'text-purple-400' :
                    msg.isSystem ? 'text-red-500' : 
                    msg.user === 'You' ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {msg.user === 'TutorBot' && <Bot className="w-3 h-3" />}
                  {msg.user}
                </span>
                <span className="text-[10px] text-gray-600">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={`px-3 py-2 rounded-lg max-w-[90%] text-sm ${
                msg.user === 'TutorBot' ? 'bg-purple-900/20 text-purple-200 border border-purple-800' :
                msg.isSystem ? 'bg-red-900/20 text-red-200 border border-red-900/30' : 
                msg.user === 'You' ? 'bg-blue-900/30 text-white border border-blue-800/50' : 
                'bg-gray-800/50 text-gray-200 border border-gray-700'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 bg-gray-900/50 border-t border-gray-800">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Broadcast to global channel..."
              className="w-full bg-black border border-gray-700 rounded-full py-2 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-600"
            />
            <button 
              type="submit"
              className="absolute right-1 top-1 p-1.5 bg-red-600 rounded-full text-white hover:bg-red-500 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};