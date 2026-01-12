import { Vehicle } from '../types';

export const VEHICLE_CATALOG: Vehicle[] = [
  // FREE TIER
  { id: 'f1', name: 'Starter Blade', category: 'FREE', price: 0, nitroPower: 1.0, autoBoost: false, color: '#64748b', description: 'Standard issue reliable runner.' },
  { id: 'f2', name: 'Desert Rat', category: 'FREE', price: 0, nitroPower: 1.1, autoBoost: false, color: '#92400e', description: 'Rugged terrain specialist.' },
  { id: 'f3', name: 'Neon Scout', category: 'FREE', price: 0, nitroPower: 1.0, autoBoost: false, color: '#059669', description: 'City lights entry-level racer.' },

  // DESIGNER TIER ($1 - $10)
  { id: 'd1', name: 'Silver Phantom', category: 'DESIGNER', price: 1.5, nitroPower: 1.4, autoBoost: false, color: '#e2e8f0', description: 'Sleek, aerodynamic, and stylish.' },
  { id: 'd2', name: 'Carbon Reaper', category: 'DESIGNER', price: 3.0, nitroPower: 1.6, autoBoost: false, color: '#171717', description: 'Ultra-lightweight chassis for quick bursts.' },
  { id: 'd3', name: 'Azure Strike', category: 'DESIGNER', price: 5.0, nitroPower: 1.8, autoBoost: false, color: '#2563eb', description: 'Engineered for high-speed lane switching.' },
  { id: 'd4', name: 'Golden Hornet', category: 'DESIGNER', price: 7.5, nitroPower: 1.9, autoBoost: false, color: '#eab308', description: 'Luxury designer car with premium nitro.' },
  { id: 'd5', name: 'Crimson Fury', category: 'DESIGNER', price: 10.0, nitroPower: 2.1, autoBoost: false, color: '#dc2626', description: 'Aggressive styling with massive torque.' },

  // SUPER RACING TIER ($11 - $30)
  { id: 's1', name: 'Apex Predator', category: 'SUPER', price: 12.5, nitroPower: 2.3, autoBoost: true, color: '#7c3aed', description: 'Features Level 1 Auto-Boost system.' },
  { id: 's2', name: 'Zenith X-1', category: 'SUPER', price: 15.0, nitroPower: 2.4, autoBoost: true, color: '#06b6d4', description: 'Experimental tech with frequent surges.' },
  { id: 's3', name: 'Titan Marauder', category: 'SUPER', price: 18.5, nitroPower: 2.5, autoBoost: true, color: '#b91c1c', description: 'Heavyweight power with infinite auto-boost.' },
  { id: 's4', name: 'Nebula Wraith', category: 'SUPER', price: 22.0, nitroPower: 2.6, autoBoost: true, color: '#db2777', description: 'Space-age materials, superior acceleration.' },
  { id: 's5', name: 'Eclipse Prime', category: 'SUPER', price: 25.0, nitroPower: 2.8, autoBoost: true, color: '#111827', description: 'Dark matter engine core with Max Nitro.' },
  { id: 's6', name: 'Quantum Ghost', category: 'SUPER', price: 28.0, nitroPower: 3.0, autoBoost: true, color: '#ffffff', description: 'The pinnacle of racing engineering.' },
  { id: 's7', name: 'F&F Legacy', category: 'SUPER', price: 30.0, nitroPower: 3.2, autoBoost: true, color: '#facc15', description: 'The ultimate collection centerpiece.' },
  
  // EXTRA VARIATIONS
  { id: 'd6', name: 'Poison Ivy', category: 'DESIGNER', price: 4.5, nitroPower: 1.5, autoBoost: false, color: '#166534', description: 'Eco-nitro hybrid for smooth runs.' },
  { id: 'd7', name: 'Nightshade', category: 'DESIGNER', price: 6.2, nitroPower: 1.7, autoBoost: false, color: '#4c1d95', description: 'Stealth-coated designer chassis.' },
  { id: 's8', name: 'Sun flare Ultra', category: 'SUPER', price: 20.0, nitroPower: 2.5, autoBoost: true, color: '#f97316', description: 'Solar-powered auto-boost technology.' },
  { id: 's9', name: 'Vortex S4', category: 'SUPER', price: 26.5, nitroPower: 2.9, autoBoost: true, color: '#4f46e5', description: 'Warp-speed propulsion integrated.' },
  { id: 's10', name: 'Bill World Edition', category: 'SUPER', price: 30.0, nitroPower: 3.5, autoBoost: true, color: '#ef4444', description: 'Custom dev machine. Pure power.' },
];