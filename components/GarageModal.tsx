import React from 'react';
import { X, Zap, Cpu, ShoppingBag, CheckCircle, Lock, Sparkles, Gauge } from 'lucide-react';
import { Vehicle } from '../types';
import { VEHICLE_CATALOG } from '../constants/vehicles';

interface GarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  ownedVehicleIds: string[];
  selectedVehicleId: string;
  onPurchase: (vehicle: Vehicle) => void;
  onSelect: (vehicle: Vehicle) => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({ 
  isOpen, onClose, walletBalance, ownedVehicleIds, selectedVehicleId, onPurchase, onSelect 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.2)]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black brand-font italic text-white uppercase tracking-tighter">Fleet Showroom</h2>
            <div className="flex gap-4 mt-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Available Assets: {VEHICLE_CATALOG.length}</p>
                <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Liquid: ${walletBalance.toFixed(2)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-8 h-8 text-gray-500" />
          </button>
        </div>

        {/* Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scrollbar-hide">
          {VEHICLE_CATALOG.map((v) => {
            const isOwned = ownedVehicleIds.includes(v.id);
            const isSelected = selectedVehicleId === v.id;
            const canAfford = walletBalance >= v.price;

            return (
              <div 
                key={v.id} 
                className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
                    isSelected ? 'bg-red-950/20 border-red-500' : 
                    isOwned ? 'bg-gray-800/40 border-gray-700' : 'bg-black border-gray-800'
                }`}
              >
                {/* Visual Preview */}
                <div className="h-32 bg-gray-900 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundColor: v.color }}></div>
                    <div className="w-24 h-40 transform rotate-[30deg] shadow-2xl transition-transform group-hover:rotate-[25deg] group-hover:scale-110" style={{ backgroundColor: v.color }}>
                        <div className="w-full h-8 bg-black/40 mt-4"></div>
                    </div>
                    {v.category === 'SUPER' && <Sparkles className="absolute top-2 right-2 w-5 h-5 text-yellow-500 animate-pulse" />}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black brand-font uppercase text-lg text-white truncate pr-2">{v.name}</h3>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                            v.category === 'SUPER' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-700' :
                            v.category === 'DESIGNER' ? 'bg-blue-900/30 text-blue-500 border-blue-700' : 'bg-gray-800 text-gray-400 border-gray-700'
                        }`}>
                            {v.category}
                        </span>
                    </div>
                    
                    <p className="text-gray-500 text-xs mb-4 flex-1">{v.description}</p>

                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><Zap className="w-3 h-3"/> Nitro</span>
                            <div className="w-24 h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500" style={{ width: `${(v.nitroPower/3.5)*100}%` }}></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><Cpu className="w-3 h-3"/> Auto-Boost</span>
                            <span className={v.autoBoost ? 'text-green-500 font-black' : 'text-gray-700'}>{v.autoBoost ? 'READY' : 'OFF'}</span>
                        </div>
                    </div>

                    {isOwned ? (
                        isSelected ? (
                            <div className="w-full bg-red-600/20 text-red-500 py-3 rounded-xl border border-red-500/50 flex items-center justify-center gap-2 text-sm font-black italic uppercase">
                                <CheckCircle className="w-4 h-4" /> Active Unit
                            </div>
                        ) : (
                            <button 
                                onClick={() => onSelect(v)}
                                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black uppercase transition-all"
                            >
                                Deploy Machine
                            </button>
                        )
                    ) : (
                        <button 
                            onClick={() => onPurchase(v)}
                            disabled={!canAfford}
                            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black uppercase transition-all ${
                                canAfford ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20' : 'bg-gray-900 text-gray-700 cursor-not-allowed border border-gray-800'
                            }`}
                        >
                            {canAfford ? (
                                <><ShoppingBag className="w-4 h-4" /> Acquire: ${v.price}</>
                            ) : (
                                <><Lock className="w-4 h-4" /> Need ${v.price.toFixed(2)}</>
                            )}
                        </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};