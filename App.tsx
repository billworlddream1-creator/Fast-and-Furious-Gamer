import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChatSidebar } from './components/ChatSidebar';
import { GameCard } from './components/GameCard';
import { RacingGame } from './components/RacingGame';
import { GameLobby } from './components/GameLobby';
import { Leaderboard } from './components/Leaderboard';
import { GameBuilder } from './pages/GameBuilder';
import { WalletModal } from './components/WalletModal';
import { AuthScreen } from './components/AuthScreen';
import { InviteModal } from './components/InviteModal';
import { GameAnalysis } from './components/GameAnalysis';
import { Game, GameResult, PaymentDetails } from './types';
import { Users, Zap, Globe, ArrowRight, X, Gift } from 'lucide-react';

const INITIAL_GAMES: Game[] = [
  { id: 'g1', title: 'Neon Drift: Tokyo', description: 'Slide through the neon-drenched streets of Shinjuku.', type: 'DRIFT', thumbnail: 'https://picsum.photos/seed/drift/400/250', author: 'Official', rating: 4.8, onlinePlayers: 3421 },
  { id: 'g4', title: 'Turbo Strikers: Football League', description: 'High-octane car football. Play 1v1, 2v2, or 3v3.', type: 'SPORTS', thumbnail: 'https://picsum.photos/seed/footballcar/400/250', author: 'Official', rating: 4.9, onlinePlayers: 15400 },
  { id: 'g2', title: 'Canyon Run Alpha', description: 'A deadly race through the Grand Canyon with no guardrails.', type: 'RACING', thumbnail: 'https://picsum.photos/seed/canyon/400/250', author: 'Official', rating: 4.5, onlinePlayers: 1205 },
  // New Games
  { id: 'g5', title: 'Galaxy Racing 3000', description: 'Race through asteroid fields and nebulae in zero gravity.', type: 'SPACE', thumbnail: 'https://picsum.photos/seed/galaxy/400/250', author: 'Official', rating: 4.9, onlinePlayers: 5600 },
  { id: 'g6', title: 'Hydro Thunder: Boat Racing', description: 'High speed powerboats on treacherous water tracks.', type: 'WATER', thumbnail: 'https://picsum.photos/seed/boat/400/250', author: 'Official', rating: 4.6, onlinePlayers: 2300 },
  { id: 'g7', title: 'Rocket Locket League', description: 'Pilot rockets in a vertical ascent race.', type: 'FLIGHT', thumbnail: 'https://picsum.photos/seed/rocket/400/250', author: 'Official', rating: 4.7, onlinePlayers: 4100 },
  { id: 'g8', title: 'Derby Kings: Horse Racing', description: 'Classic equestrian racing with a high-stakes twist.', type: 'HORSE', thumbnail: 'https://picsum.photos/seed/horse/400/250', author: 'Official', rating: 4.4, onlinePlayers: 8900 },
  { id: 'g9', title: 'Dragon Fighting Arena', description: 'Dodge mythical spears and fireballs on dragonback.', type: 'FANTASY', thumbnail: 'https://picsum.photos/seed/dragon/400/250', author: 'Official', rating: 5.0, onlinePlayers: 12000 },
];

const OnboardingOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const steps = [
        { title: "Welcome to the Zone", text: "Fast & Furious is a hybrid gaming platform where you can race, bet, and build.", target: "center" },
        { title: "Reward Program", text: "Play 75+ games and keep $200 in your wallet to earn automatic $25 bonuses every 65 days!", target: "center" },
        { title: "The Hub", text: "Browse active games including new Galaxy and Dragon modes.", target: "top-left" },
    ];

    const current = steps[step];

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-red-500 rounded-2xl p-8 max-w-md w-full relative">
                <button onClick={onComplete} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
                <div className="mb-4">
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest">TUTORIAL {step + 1}/{steps.length}</span>
                    <h2 className="text-2xl font-bold text-white mt-1">{current.title}</h2>
                </div>
                <p className="text-gray-300 mb-8">{current.text}</p>
                <div className="flex justify-between">
                    <button onClick={onComplete} className="text-gray-500 text-sm hover:text-white">Skip</button>
                    <button 
                        onClick={() => {
                            if (step < steps.length - 1) setStep(step + 1);
                            else onComplete();
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                    >
                        {step === steps.length - 1 ? "Get Started" : "Next"} <ArrowRight className="w-4 h-4" />
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

  // Stats & Rewards
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [lastRewardDate, setLastRewardDate] = useState<number>(Date.now());

  // Wallet State
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [totalDeposited, setTotalDeposited] = useState(0.00);
  const [depositDate, setDepositDate] = useState<number | null>(null);
  const [adminBalance, setAdminBalance] = useState(0.00); 
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  
  // Admin Config State
  const [adminDepositAddress, setAdminDepositAddress] = useState(
      "Global Gaming Bank\nAcct: 8829-192-334\n\nOr Crypto:\nBTC: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
  );

  const allGames = [...INITIAL_GAMES, ...userGames];

  // REWARD PROGRAM CHECK
  useEffect(() => {
    const checkRewards = () => {
        const now = Date.now();
        const sixtyFiveDays = 65 * 24 * 60 * 60 * 1000;
        
        // Simulating the 65-day check logic
        // For demo purposes, we log the status
        console.log(`Checking Rewards: Balance ${walletBalance}, Games ${gamesPlayed}, Days since last: ${Math.floor((now - lastRewardDate)/ (1000*60*60*24))}`);

        // In a real app, strict date checking applies. Here we just ensure logic is sound.
        // If user meets criteria (Balance >= 200, Games >= 75)
        if (walletBalance >= 200 && gamesPlayed >= 75) {
             if (now - lastRewardDate > sixtyFiveDays) {
                 setWalletBalance(prev => prev + 25);
                 setLastRewardDate(now);
                 alert("CONGRATULATIONS! You've received your $25 Loyalty Reward!");
             }
        }
    };
    const interval = setInterval(checkRewards, 60000);
    return () => clearInterval(interval);
  }, [walletBalance, gamesPlayed, lastRewardDate]);

  const handleLogin = (user: string, adminStatus: boolean) => {
      setUsername(user);
      setIsAdmin(adminStatus);
      setIsLoggedIn(true);
      if(adminStatus) setWalletBalance(999999);
      if (!adminStatus) setShowTutorial(true);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleOpenLobby = (game: Game) => {
    setLobbyGame(game);
  };

  const handleStartRace = (team: 'RED' | 'BLUE' | 'SOLO', wager: number, pot: number) => {
    if (walletBalance < wager) {
      alert("Insufficient funds! Please deposit money.");
      return;
    }
    if (wager > 0) {
        setWalletBalance(prev => prev - wager);
        setDepositDate(Date.now()); 
    }
    setActiveWager(wager);
    setActivePot(pot);
    if (lobbyGame) {
      setSelectedTeam(team);
      setActiveGame(lobbyGame);
      setLobbyGame(null);
    }
  };

  const handleExitLobby = () => {
    setLobbyGame(null);
  };

  const handleGameResult = (result: GameResult) => {
    setGamesPlayed(prev => prev + 1); // Increment games played
    if (result.isWin) {
       setWalletBalance(prev => prev + result.pot);
    } 
    if (!result.isWin && result.wager > 0) {
        setAdminBalance(prev => prev + result.wager);
    }
    setActiveGame(null);
  };

  const handleExitGame = () => {
    if (activeWager > 0) setAdminBalance(prev => prev + activeWager);
    setActiveGame(null);
  };

  const handleSaveGame = (game: Game) => {
    setUserGames([game, ...userGames]);
    setCurrentPage('home');
  };

  const handleDeposit = (amount: number) => {
    const fee = amount * 0.20;
    const credit = amount - fee;
    setAdminBalance(prev => prev + fee);
    setWalletBalance(prev => prev + credit);
    setTotalDeposited(prev => prev + credit);
    setDepositDate(Date.now());
  };

  const handleWithdraw = (amount: number, details: PaymentDetails) => {
      setPaymentDetails(details);
      setWalletBalance(prev => prev - amount);
  };

  if (!isLoggedIn) {
      return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500 selection:text-white">
      {showTutorial && <OnboardingOverlay onComplete={() => setShowTutorial(false)} />}

      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-red-900/10 to-transparent opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-900/10 rounded-full blur-[100px] opacity-30"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        <Navbar 
          currentPage={currentPage} 
          onNavigate={handleNavigate} 
          walletBalance={walletBalance}
          onOpenWallet={() => setIsWalletOpen(true)}
        />

        <main className="flex-1 md:ml-20 pb-20 md:pb-0">
          {currentPage === 'home' && (
            <>
              <header className="px-6 py-8 md:px-12 md:py-12 flex justify-between items-end border-b border-gray-800 bg-gradient-to-r from-black via-gray-900 to-black">
                <div>
                  <h2 className="text-red-500 font-bold tracking-widest text-sm mb-2">WELCOME TO THE</h2>
                  <h1 className="text-5xl md:text-7xl font-black brand-font text-white italic tracking-tighter neon-text-red">
                    FAST <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">&</span> FURIOUS
                  </h1>
                  <p className="text-gray-400 mt-4 max-w-xl text-lg">
                    The ultimate hybrid gaming platform. Bet real stakes, race the world, and create your own rules.
                  </p>
                  
                  {/* Reward Progress Mini-view */}
                  <div className="mt-6 bg-gray-800/50 p-3 rounded-lg border border-gray-700 inline-block">
                      <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold mb-1">
                          <Gift className="w-4 h-4" /> LOYALTY REWARD TRACKER ($25)
                      </div>
                      <div className="flex gap-4 text-xs text-gray-400">
                          <span className={walletBalance >= 200 ? 'text-green-400' : ''}>Balance: ${walletBalance.toFixed(0)} / $200</span>
                          <span className={gamesPlayed >= 75 ? 'text-green-400' : ''}>Games: {gamesPlayed} / 75</span>
                      </div>
                  </div>
                </div>
                
                <div className="hidden lg:block text-right">
                   <div className="flex flex-col items-end mb-4">
                       <span className="text-xs text-gray-500">LOGGED IN AS</span>
                       <span className="text-xl font-bold text-white">{username}</span>
                   </div>
                </div>
              </header>

              <div className="px-6 py-8 md:px-12">
                <div className="flex items-center space-x-2 mb-6">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-2xl font-bold text-white">GAME MODES</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allGames.map((game) => (
                    <GameCard key={game.id} game={game} onPlay={handleOpenLobby} />
                  ))}
                </div>
              </div>
            </>
          )}

          {currentPage === 'play' && (
             <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                 <h2 className="text-4xl brand-font mb-4">READY TO RACE?</h2>
                 <p className="text-gray-400 mb-8">Select a game from the Hub to start your engine.</p>
                 <button onClick={() => setCurrentPage('home')} className="px-8 py-3 bg-red-600 rounded-lg font-bold">GO TO HUB</button>
             </div>
          )}

          {currentPage === 'rankings' && <Leaderboard />}
          {currentPage === 'analysis' && <GameAnalysis />}
          {currentPage === 'build' && <GameBuilder onSave={handleSaveGame} />}
          {currentPage === 'profile' && (
              <div className="p-12">
                  <h1 className="text-4xl brand-font mb-8">DRIVER PROFILE</h1>
                  <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 max-w-2xl">
                      <div className="flex items-center gap-6 mb-8">
                          <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
                              {username.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                              <h2 className="text-2xl font-bold">{username}</h2>
                              <p className="text-gray-400">Games Played: {gamesPlayed}</p>
                              {isAdmin && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded mt-1 inline-block">ADMINISTRATOR</span>}
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black p-4 rounded-lg border border-gray-800">
                              <p className="text-gray-500 text-xs">TOTAL DEPOSITED</p>
                              <p className="text-2xl font-bold text-blue-400">${totalDeposited.toFixed(2)}</p>
                          </div>
                          <div className="bg-black p-4 rounded-lg border border-gray-800">
                              <p className="text-gray-500 text-xs">WALLET BALANCE</p>
                              <p className="text-2xl font-bold text-yellow-400">${walletBalance.toFixed(2)}</p>
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
        onWithdraw={handleWithdraw}
        isAdmin={isAdmin}
        adminDepositText={adminDepositAddress}
        onUpdateAdminDepositText={setAdminDepositAddress}
      />
      
      {lobbyGame && (
        <GameLobby 
          game={lobbyGame} 
          onStart={handleStartRace} 
          onBack={handleExitLobby} 
          walletBalance={walletBalance}
        />
      )}
      
      {activeGame && (
        <RacingGame 
          gameData={activeGame} 
          onExit={handleExitGame} 
          onGameComplete={handleGameResult}
          team={selectedTeam}
          playerAvatar="ME"
          wager={activeWager}
          pot={activePot}
        />
      )}
    </div>
  );
}

export default App;