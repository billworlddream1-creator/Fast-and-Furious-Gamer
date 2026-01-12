import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChatSidebar } from './components/ChatSidebar';
import { GameCard } from './components/GameCard';
import { RacingGame } from './components/RacingGame';
import { GameLobby } from './components/GameLobby';
import { Leaderboard } from './components/Leaderboard';
import { GameBuilder } from './pages/GameBuilder';
import { WalletModal } from './components/WalletModal';
import { GarageModal } from './components/GarageModal';
import { AuthScreen } from './components/AuthScreen';
import { GameAnalysis } from './components/GameAnalysis';
import { DigitalClock } from './components/DigitalClock';
import { Game, GameResult, PaymentDetails, Vehicle } from './types';
import { VEHICLE_CATALOG } from './constants/vehicles';
import { Zap, ArrowRight, X, Gift, Star, ShieldAlert, Car, Trophy, Gamepad2 } from 'lucide-react';

const INITIAL_GAMES: Game[] = [
  { id: 'g1', title: 'Neon Drift: Tokyo', description: 'Slide through the neon-drenched streets of Shinjuku.', type: 'DRIFT', thumbnail: 'https://picsum.photos/seed/drift/400/250', author: 'Official', rating: 4.8, onlinePlayers: 3421 },
  { id: 'w1', title: 'Warfare Zone: Black Ops', description: 'Military vehicle combat in a high-stakes desert zone. Defend the perimeter.', type: 'WARFARE', thumbnail: 'https://picsum.photos/seed/tank/400/250', author: 'Official', rating: 5.0, onlinePlayers: 25000 },
  { id: 'g4', title: 'Turbo Strikers', description: 'High-octane car football. Play 1v1, 2v2, or 3v3.', type: 'SPORTS', thumbnail: 'https://picsum.photos/seed/footballcar/400/250', author: 'Official', rating: 4.9, onlinePlayers: 15400 },
  { id: 'g2', title: 'Canyon Run Alpha', description: 'A deadly race through the Grand Canyon with no guardrails.', type: 'RACING', thumbnail: 'https://picsum.photos/seed/canyon/400/250', author: 'Official', rating: 4.5, onlinePlayers: 1205 },
  { id: 'g5', title: 'Galaxy Racing 3000', description: 'Race through asteroid fields and nebulae in zero gravity.', type: 'SPACE', thumbnail: 'https://picsum.photos/seed/galaxy/400/250', author: 'Official', rating: 4.9, onlinePlayers: 5600 },
  { id: 'w2', title: 'Frontline Blitz', description: 'Armor division breakthrough mission. Neutralize hazards at speed.', type: 'WARFARE', thumbnail: 'https://picsum.photos/seed/combat/400/250', author: 'Official', rating: 4.7, onlinePlayers: 18200 },
  { id: 'g9', title: 'Dragon Fighter', description: 'Dodge mythical spears and fireballs on dragonback.', type: 'FANTASY', thumbnail: 'https://picsum.photos/seed/dragon/400/250', author: 'Official', rating: 5.0, onlinePlayers: 12000 },
];

const OnboardingOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const steps = [
        { title: "Welcome to the Zone", text: "Fast & Furious is a next-gen platform for racers, warriors, and engineers.", icon: Zap },
        { title: "Fleet Showroom", text: "Acquire up to 20 elite machines ranging from $1 to $30. Super Racing units feature Auto-Boost tech!", icon: Car },
        { title: "Creator Program", text: "Build 10 games to earn a constant $0.75 every 30 days. Stay active to keep earning!", icon: Star },
    ];

    const current = steps[step];

    return (
        <div className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-gray-900 border border-red-500/50 rounded-2xl p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                <button onClick={onComplete} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="p-4 bg-red-600/20 rounded-full mb-4">
                        <current.icon className="w-8 h-8 text-red-500" />
                    </div>
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Module {step + 1}/{steps.length}</span>
                    <h2 className="text-2xl font-bold text-white uppercase brand-font italic">{current.title}</h2>
                    <p className="text-gray-400 mt-3 text-sm leading-relaxed">{current.text}</p>
                </div>
                <div className="flex justify-between items-center">
                    <button onClick={onComplete} className="text-gray-500 text-xs font-bold hover:text-white uppercase tracking-tighter">Skip Intel</button>
                    <button 
                        onClick={() => {
                            if (step < steps.length - 1) setStep(step + 1);
                            else onComplete();
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95"
                    >
                        {step === steps.length - 1 ? "Start Missions" : "Next Data"} <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const [currentPage, setCurrentPage] = useState('home');
  const [lobbyGame, setLobbyGame] = useState<Game | null>(null);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<'RED' | 'BLUE' | 'SOLO'>('SOLO');
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [activeWager, setActiveWager] = useState(0);
  const [activePot, setActivePot] = useState(0);

  // Rewards Tracking
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [lastRewardDate, setLastRewardDate] = useState<number>(Date.now());
  const [lastCreatorRewardDate, setLastCreatorRewardDate] = useState<number>(Date.now());

  // Wallet
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [totalDeposited, setTotalDeposited] = useState(0.00);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [adminDepositAddress, setAdminDepositAddress] = useState("Global Banking: FastPay-8829-192-334\nUSDT (TRC20): TArD... (Contact support)");

  // Vehicle Collection
  const [ownedVehicleIds, setOwnedVehicleIds] = useState<string[]>(['f1', 'f2', 'f3']);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('f1');
  const [isGarageOpen, setIsGarageOpen] = useState(false);

  const allGames = [...INITIAL_GAMES, ...userGames];
  const selectedVehicle = VEHICLE_CATALOG.find(v => v.id === selectedVehicleId) || VEHICLE_CATALOG[0];

  useEffect(() => {
    const checkRewards = () => {
        const now = Date.now();
        const sixtyFiveDays = 65 * 24 * 60 * 60 * 1000;
        if (walletBalance >= 200 && gamesPlayed >= 75 && (now - lastRewardDate > sixtyFiveDays)) {
             setWalletBalance(prev => prev + 25);
             setLastRewardDate(now);
        }
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (userGames.length >= 10 && (now - lastCreatorRewardDate > thirtyDays)) {
            setWalletBalance(prev => prev + 0.75);
            setLastCreatorRewardDate(now);
        }
    };
    const interval = setInterval(checkRewards, 10000);
    return () => clearInterval(interval);
  }, [walletBalance, gamesPlayed, lastRewardDate, userGames.length, lastCreatorRewardDate]);

  const handleLogin = (user: string, adminStatus: boolean) => {
      setUsername(user);
      setIsAdmin(adminStatus);
      setIsLoggedIn(true);
      if(adminStatus) setWalletBalance(10000);
      setShowTutorial(!adminStatus);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLobby = (game: Game) => setLobbyGame(game);
  
  const handleStartRace = (team: 'RED' | 'BLUE' | 'SOLO', wager: number, pot: number) => {
    if (walletBalance < wager) { alert("Insufficient Credits!"); return; }
    if (wager > 0) setWalletBalance(prev => prev - wager);
    setActiveWager(wager);
    setActivePot(pot);
    setSelectedTeam(team);
    setActiveGame(lobbyGame);
    setLobbyGame(null);
  };

  const handleGameResult = (result: GameResult) => {
    setGamesPlayed(prev => prev + 1);
    if (result.isWin) setWalletBalance(prev => prev + result.pot);
    setActiveGame(null);
  };

  const handleSaveGame = (game: Game) => {
    setUserGames([game, ...userGames]);
    setCurrentPage('home');
    if (userGames.length + 1 === 10) {
        alert("CREATOR ACHIEVEMENT: 10 Games Built! $0.75 monthly reward activated.");
    }
  };

  const handleDeposit = (amount: number) => {
    const credit = amount * 0.80; // 20% fee
    setWalletBalance(prev => prev + credit);
    setTotalDeposited(prev => prev + credit);
  };

  const handlePurchaseVehicle = (v: Vehicle) => {
      if (walletBalance >= v.price) {
          setWalletBalance(prev => prev - v.price);
          setOwnedVehicleIds(prev => [...prev, v.id]);
          setSelectedVehicleId(v.id);
          alert(`Success! ${v.name} has been added to your garage.`);
      }
  };

  if (!isLoggedIn) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {showTutorial && <OnboardingOverlay onComplete={() => setShowTutorial(false)} />}
      <DigitalClock />

      <div className="relative z-10 flex min-h-screen">
        <Navbar 
          currentPage={currentPage} 
          onNavigate={handleNavigate} 
          walletBalance={walletBalance}
          onOpenWallet={() => setIsWalletOpen(true)}
        />

        <main className="flex-1 md:ml-20 pb-20 md:pb-0">
          {currentPage === 'home' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <header className="px-6 py-12 md:px-16 md:py-16 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800/50 bg-gradient-to-b from-red-950/10 to-transparent gap-8">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 text-red-500 font-bold tracking-widest text-[10px] mb-4 uppercase bg-red-500/10 w-fit px-3 py-1 rounded-full border border-red-500/20">
                    <ShieldAlert className="w-3 h-3" /> Strategic Operations
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black brand-font italic tracking-tighter neon-text-red leading-none mb-6">
                    FAST <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">&</span> FURIOUS
                  </h1>
                  <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                    Access elite combat zones or sharpen skills in training. Elite gaming requires valid credits.
                  </p>
                  
                  <div className="mt-8 flex flex-wrap gap-4">
                      <button 
                        onClick={() => setIsGarageOpen(true)}
                        className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 backdrop-blur-sm group hover:border-red-500/50 transition-all text-left flex items-center gap-4"
                      >
                          <div className="p-3 bg-red-600/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Car className="w-6 h-6 text-red-500" />
                          </div>
                          <div>
                              <p className="text-red-500 text-xs font-bold uppercase mb-1">Elite Garage</p>
                              <p className="text-[11px] text-gray-400 font-mono font-bold uppercase">Active: {selectedVehicle.name}</p>
                          </div>
                      </button>

                      <button 
                        onClick={() => handleNavigate('rankings')}
                        className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 backdrop-blur-sm group hover:border-yellow-500/50 transition-all text-left flex items-center gap-4"
                      >
                          <div className="p-3 bg-yellow-600/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                          </div>
                          <div>
                              <p className="text-yellow-500 text-xs font-bold uppercase mb-1">Leaderboards</p>
                              <p className="text-[11px] text-gray-400 font-mono font-bold uppercase">View Global Rank</p>
                          </div>
                      </button>
                  </div>
                </div>
              </header>

              <div className="px-6 py-12 md:px-16">
                {/* Elite vs Free Split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Elite Tactical Area */}
                    <div className="bg-gradient-to-br from-red-950/40 to-black border border-red-900/40 p-8 rounded-[32px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-red-600 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                                <ShieldAlert className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black brand-font italic uppercase text-white tracking-tighter leading-none">Elite Missions</h3>
                                <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Staked PvP Sorties</p>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                            Deploy into high-risk zones where skill equals credits. Stake between $1 and $250 per sortie. 100% automated payouts to winners.
                        </p>
                        <button 
                            onClick={() => window.scrollTo({ top: document.getElementById('sorties')?.offsetTop || 1000, behavior: 'smooth' })}
                            className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-black uppercase italic tracking-tighter flex items-center gap-3 transition-all active:scale-95 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                        >
                            Enter Elite Grid <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Free Training Area */}
                    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8 rounded-[32px] group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-gray-800 rounded-2xl">
                                <Gamepad2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black brand-font italic uppercase text-white tracking-tighter leading-none">Free Practice</h3>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Simulated Environments</p>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                            Zero cost simulations. Perfect your handling, test your auto-boost cycles, and learn the layout of the canyon runs without risk.
                        </p>
                        <button 
                            onClick={() => window.scrollTo({ top: document.getElementById('sorties')?.offsetTop || 1000, behavior: 'smooth' })}
                            className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-black uppercase italic tracking-tighter flex items-center gap-3 transition-all active:scale-95"
                        >
                            Start Training <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div id="sorties" className="flex items-center justify-between mb-8 pt-8 border-t border-gray-800/50">
                    <div className="flex items-center gap-3">
                        <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500/20" />
                        <h3 className="text-3xl font-black text-white uppercase brand-font italic tracking-tighter">Operational Zones</h3>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {allGames.map((game) => (
                    <GameCard key={game.id} game={game} onPlay={handleOpenLobby} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentPage === 'rankings' && <Leaderboard />}
          {currentPage === 'analysis' && <GameAnalysis />}
          {currentPage === 'build' && <GameBuilder onSave={handleSaveGame} />}
          {currentPage === 'profile' && (
              <div className="p-12 animate-in fade-in zoom-in-95 duration-500">
                  <h1 className="text-5xl brand-font mb-10 uppercase italic font-black">Pilot Intelligence</h1>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-gray-900/40 p-10 rounded-3xl border border-gray-800 backdrop-blur-xl relative overflow-hidden group">
                          <div className="flex items-center gap-8 mb-10">
                              <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center text-4xl font-black brand-font">
                                  {username.substring(0,2).toUpperCase()}
                              </div>
                              <div>
                                  <h2 className="text-3xl font-black brand-font uppercase tracking-tight mb-2">{username}</h2>
                                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Active Vehicle: {selectedVehicle.name}</span>
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-black/60 p-5 rounded-2xl border border-gray-800">
                                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-tighter mb-1">Funding Log</p>
                                  <p className="text-3xl font-black text-blue-500 font-mono tracking-tighter">${totalDeposited.toFixed(2)}</p>
                              </div>
                              <div className="bg-black/60 p-5 rounded-2xl border border-gray-800">
                                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-tighter mb-1">Liquid Assets</p>
                                  <p className="text-3xl font-black text-yellow-500 font-mono tracking-tighter">${walletBalance.toFixed(2)}</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}
        </main>
      </div>

      <ChatSidebar />
      <WalletModal 
        isOpen={isWalletOpen} 
        onClose={() => setIsWalletOpen(false)} 
        currentBalance={walletBalance}
        totalDeposited={totalDeposited}
        onDeposit={handleDeposit}
        onWithdraw={(a, d) => setWalletBalance(prev => prev - a)}
        isAdmin={isAdmin}
        adminDepositText={adminDepositAddress}
        onUpdateAdminDepositText={setAdminDepositAddress}
      />

      <GarageModal 
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        walletBalance={walletBalance}
        ownedVehicleIds={ownedVehicleIds}
        selectedVehicleId={selectedVehicleId}
        onPurchase={handlePurchaseVehicle}
        onSelect={(v) => setSelectedVehicleId(v.id)}
      />
      
      {lobbyGame && (
        <GameLobby 
          game={lobbyGame} 
          onStart={handleStartRace} 
          onBack={() => setLobbyGame(null)} 
          walletBalance={walletBalance}
          selectedVehicle={selectedVehicle}
          onOpenGarage={() => setIsGarageOpen(true)}
        />
      )}
      
      {activeGame && (
        <RacingGame 
          gameData={activeGame} 
          onExit={() => setActiveGame(null)} 
          onGameComplete={handleGameResult}
          team={selectedTeam}
          wager={activeWager}
          pot={activePot}
          vehicle={selectedVehicle}
        />
      )}
    </div>
  );
}

export default App;