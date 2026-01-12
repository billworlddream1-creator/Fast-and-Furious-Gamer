import React, { useState } from 'react';
import { Hammer, Sparkles, Save, Box, Info } from 'lucide-react';
import { generateGameLore } from '../services/geminiService';
import { Game } from '../types';

interface GameBuilderProps {
  onSave: (game: Game) => void;
}

const GAME_TYPES = [
    'RACING', 'DRIFT', 'ACTION', 'STRATEGY', 
    'SPORTS', 'SHOOTER', 'FLIGHT', 'SIMULATION', 
    'WATER', 'RETRO', 'WARFARE'
];

export const GameBuilder: React.FC<GameBuilderProps> = ({ onSave }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Game['type']>('RACING');
  const [prompt, setPrompt] = useState('');
  const [generatedLore, setGeneratedLore] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    const lore = await generateGameLore(prompt);
    setGeneratedLore(lore);
    setIsGenerating(false);
  };

  const handleSave = () => {
    if (!title || !generatedLore) return;
    
    const newGame: Game = {
      id: Date.now().toString(),
      title,
      description: generatedLore,
      type,
      thumbnail: `https://picsum.photos/seed/${title}/400/250`, 
      author: 'You',
      rating: 0,
      onlinePlayers: 0,
      isCustom: true
    };
    
    onSave(newGame);
    setTitle('');
    setPrompt('');
    setGeneratedLore('');
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold brand-font mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 uppercase italic">
          Engineering Hub
        </h1>
        <div className="flex items-center gap-2 text-blue-400 bg-blue-900/20 p-3 rounded-lg border border-blue-900/50 mt-4">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-bold uppercase tracking-tight">
                Creator Program: Build 10 games to earn a constant $0.75 every 30 days while active in the zone.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Project Codename</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-bold"
              placeholder="e.g. Battle for Berlin"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Operational Mode</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GAME_TYPES.map((t) => (
                <button 
                  key={t}
                  onClick={() => setType(t as any)}
                  className={`p-2 rounded-lg border text-[10px] font-bold transition-all uppercase tracking-tighter ${
                    type === t ? 'bg-red-900/30 border-red-500 text-red-400' : 'bg-black border-gray-800 text-gray-500 hover:border-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-400 mb-2 flex justify-between uppercase">
                <span>Scenario Blueprint</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
             </label>
             <textarea 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               className="w-full h-32 bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none text-sm"
               placeholder="Describe the warfare or race scenario: e.g. A desert tank battle with incoming airstrikes."
             />
             <button 
               onClick={handleGenerate}
               disabled={isGenerating || !prompt}
               className="mt-2 w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all uppercase"
             >
               {isGenerating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Sparkles className="w-4 h-4" />}
               Sync with AI
             </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold text-gray-300 mb-4 border-b border-gray-800 pb-2 uppercase brand-font italic">Hologram Preview</h3>
                
                <div className="bg-black rounded-lg overflow-hidden border border-gray-800 mb-4">
                    <img 
                      src={`https://picsum.photos/seed/${title || 'default'}/400/200`} 
                      className="w-full h-40 object-cover opacity-70"
                      alt="Preview"
                    />
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-lg text-white uppercase">{title || 'Awaiting Input'}</h4>
                            <span className="text-[10px] bg-red-900/50 text-red-300 px-2 py-0.5 rounded border border-red-900 font-bold">{type}</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed italic">
                            {generatedLore || "Describe your vision and press Sync..."}
                        </p>
                    </div>
                </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={!title || !generatedLore}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(22,163,74,0.3)] uppercase"
            >
                <Save className="w-5 h-5" /> Deploy to Global Grid
            </button>
        </div>
      </div>
    </div>
  );
};