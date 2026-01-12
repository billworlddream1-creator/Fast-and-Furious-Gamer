import React from 'react';
import { Gamepad2, Hammer, Home, Trophy, User, BarChart2, DollarSign, PieChart } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  walletBalance?: number;
  onOpenWallet?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, walletBalance = 0, onOpenWallet }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Hub' },
    { id: 'play', icon: Gamepad2, label: 'Play' },
    { id: 'rankings', icon: BarChart2, label: 'Rankings' },
    { id: 'analysis', icon: PieChart, label: 'Analysis' },
    { id: 'build', icon: Hammer, label: 'Builder' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full md:w-20 md:h-screen bg-black/90 border-t md:border-t-0 md:border-r border-red-900/30 backdrop-blur-lg z-50 flex md:flex-col justify-around md:justify-start items-center py-4 md:py-8 space-y-0 md:space-y-8">
      <div className="hidden md:block mb-8">
        <Trophy className="w-10 h-10 text-red-600 animate-pulse" />
      </div>
      
      {navItems.map((item) => {
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center space-y-1 p-2 transition-all duration-300 ${
              isActive ? 'text-red-500 scale-110' : 'text-gray-500 hover:text-white'
            }`}
          >
            <item.icon className={`w-6 h-6 md:w-8 md:h-8 ${isActive ? 'drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]' : ''}`} />
            <span className="text-[10px] md:text-xs uppercase tracking-widest">{item.label}</span>
          </button>
        );
      })}

      {/* Wallet Trigger - Desktop */}
      <div className="hidden md:flex flex-col items-center mt-auto pt-8 border-t border-gray-800 w-full">
         <button 
           onClick={onOpenWallet}
           className="flex flex-col items-center justify-center p-2 text-green-500 hover:text-green-400 transition-colors"
         >
            <DollarSign className="w-6 h-6" />
            <span className="text-[10px] font-mono mt-1">${walletBalance.toFixed(0)}</span>
         </button>
      </div>
    </nav>
  );
};