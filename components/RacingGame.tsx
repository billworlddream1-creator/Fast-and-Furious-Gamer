import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Game, GameStatus, GameResult, Vehicle } from '../types';
import { Play, RotateCcw, Zap, Camera, Film, Gamepad2, Eye, Monitor, Gauge, ShieldAlert, Cpu, Activity } from 'lucide-react';
import { generateAICommentary, consultGameMaster, GameMasterDecision } from '../services/geminiService';

interface RacingGameProps {
  gameData: Game;
  onExit: () => void;
  onGameComplete?: (result: GameResult) => void;
  team?: 'RED' | 'BLUE' | 'SOLO';
  playerAvatar?: string;
  wager?: number;
  pot?: number;
  vehicle: Vehicle;
}

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 44;
const PLAYER_HEIGHT = 76;

// Physics Config
const BASE_SPEED = 5;
const MAX_SPEED = 35;
const ACCEL_RATE = 0.18;
const BRAKE_RATE = 0.4;
const NATURAL_DECEL = 0.06;
const STEER_BASE_SENS = 1.0; 
const STEER_FRICTION = 0.82;
const LATERAL_GRIP_LOSS_THRESHOLD = 0.75; // Above 75% speed, grip starts failing
const SPEED_SCRUB_FACTOR = 0.25; // Speed lost during hard turns

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  subType: 'CAR' | 'CONE' | 'BARRIER' | 'HAZARD';
  rotation: number;
  damage: number;
}

const getTheme = (type: Game['type']) => {
    switch (type) {
        case 'WARFARE': return { bg: '#1c1917', road: '#292524', line: '#44403c', playerShape: 'TANK', hazardLabel: 'MINE', particle: 'SMOKE', engine: 'orange', hazardColor: '#dc2626' };
        case 'SPACE': return { bg: '#000000', road: 'transparent', line: '#6366f1', playerShape: 'SHIP', hazardLabel: 'ASTEROID', particle: 'STAR', engine: 'blue', hazardColor: '#6b7280' };
        case 'WATER': return { bg: '#0284c7', road: '#0ea5e9', line: '#bae6fd', playerShape: 'BOAT', hazardLabel: 'ROCK', particle: 'BUBBLE', engine: 'white', hazardColor: '#334155' };
        default: return { bg: '#111827', road: '#1f2937', line: '#4b5563', playerShape: 'CAR', hazardLabel: 'TRUCK', particle: 'SMOKE', engine: 'orange', hazardColor: '#ef4444' };
    }
};

interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; color: string; size: number;
}

export const RacingGame: React.FC<RacingGameProps> = ({ 
    gameData, onExit, onGameComplete, team = 'SOLO', wager = 0, pot = 0, vehicle
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [grip, setGrip] = useState(1.0);
  const [cameraMode, setCameraMode] = useState<'CHASE' | 'CINEMATIC' | 'DRIVER' | 'DRONE' | 'OVERHEAD'>('CHASE');
  const [displaySpeed, setDisplaySpeed] = useState(0);
  const [autoBoostActive, setAutoBoostActive] = useState(false);
  
  const theme = getTheme(gameData.type);
  const isRacingRef = useRef(false);

  // Physics Refs
  const speedRef = useRef(BASE_SPEED); 
  const vxRef = useRef(0); 
  const playerXRef = useRef(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const keysPressed = useRef<Set<string>>(new Set());
  const playerRotation = useRef(0);
  const playerHealthRef = useRef(100);
  const shakeRef = useRef(0);
  const obstacles = useRef<Obstacle[]>([]);
  const particles = useRef<Particle[]>([]);
  const frameId = useRef<number>(0);
  const lastObstacleTime = useRef(0);
  const lastBoostTime = useRef(0);
  const nitroActiveRef = useRef(false);

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    for(let i=0; i<count; i++) {
        particles.current.push({
            x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
            life: 1.0, color, size: Math.random() * 4 + 1
        });
    }
  };

  const spawnObstacle = () => {
    const laneWidth = GAME_WIDTH / 3;
    const laneIdx = Math.floor(Math.random() * 3);
    const centerX = laneIdx * laneWidth + laneWidth / 2;
    const rand = Math.random();
    let subType: Obstacle['subType'] = 'CAR';
    let width = 40, height = 70, damage = 25;
    
    if (rand < 0.2) { subType = 'CONE'; width = 24; height = 24; damage = 10; }
    else if (rand < 0.4) { subType = 'BARRIER'; width = 85; height = 35; damage = 45; }
    else if (rand < 0.7) { subType = 'HAZARD'; width = 55; height = 55; damage = 40; }

    obstacles.current.push({ x: centerX - width / 2, y: -150, width, height, subType, rotation: 0, damage });
  };

  const update = useCallback(() => {
    if (status !== GameStatus.PLAYING) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (isRacingRef.current) {
        const now = Date.now();
        
        // AUTO-BOOST
        if (vehicle.autoBoost && now - lastBoostTime.current > 8000) {
            lastBoostTime.current = now;
            nitroActiveRef.current = true;
            setAutoBoostActive(true);
            spawnParticles(playerXRef.current + PLAYER_WIDTH/2, GAME_HEIGHT - 120, '#3b82f6', 20);
            setTimeout(() => {
                nitroActiveRef.current = false;
                setAutoBoostActive(false);
            }, 1500);
        }

        // --- REFINED PHYSICS ENGINE ---
        
        const speedRatio = speedRef.current / MAX_SPEED;
        const currentMax = nitroActiveRef.current ? MAX_SPEED + (15 * vehicle.nitroPower) : MAX_SPEED;
        const currentAccel = nitroActiveRef.current ? ACCEL_RATE * 3 : ACCEL_RATE;

        // 1. Throttle / Brake
        if (keysPressed.current.has('w') || keysPressed.current.has('arrowup') || nitroActiveRef.current) {
            speedRef.current = Math.min(speedRef.current + currentAccel, currentMax);
        } else if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
            speedRef.current = Math.max(speedRef.current - BRAKE_RATE, 0);
        } else {
            if (speedRef.current > BASE_SPEED) speedRef.current -= NATURAL_DECEL;
            else if (speedRef.current < BASE_SPEED) speedRef.current += NATURAL_DECEL;
        }

        // 2. Non-Linear Steering Sensitivity
        // Formula: sens = base * (1 - speedRatio^2). Low speed = High Sens. High speed = Low Sens.
        const dynamicSens = STEER_BASE_SENS * (1.0 - Math.pow(speedRatio, 1.8) * 0.9);
        
        // 3. Grip Loss Simulation
        // Turning at high speed reduces grip
        const isTurning = keysPressed.current.has('a') || keysPressed.current.has('arrowleft') || 
                         keysPressed.current.has('d') || keysPressed.current.has('arrowright');
        
        let currentGrip = 1.0;
        if (isTurning && speedRatio > LATERAL_GRIP_LOSS_THRESHOLD) {
            // Grip decays as speed increases past threshold
            currentGrip = Math.max(0.3, 1.0 - (speedRatio - LATERAL_GRIP_LOSS_THRESHOLD) * 4);
            // Speed scrub: high speed turns are inefficient
            speedRef.current -= speedRatio * SPEED_SCRUB_FACTOR;
            // Visual friction
            if (Math.random() > 0.7) spawnParticles(playerXRef.current + (Math.random() * PLAYER_WIDTH), GAME_HEIGHT - 100, '#ef4444', 1);
        }
        setGrip(currentGrip);

        const effectiveSens = dynamicSens * currentGrip;

        if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
            vxRef.current -= effectiveSens;
            playerRotation.current = Math.max(-0.4, playerRotation.current - 0.06);
        } else if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
            vxRef.current += effectiveSens;
            playerRotation.current = Math.min(0.4, playerRotation.current + 0.06);
        } else {
            playerRotation.current *= 0.85;
        }

        // 4. Lateral Momentum
        vxRef.current *= STEER_FRICTION;
        playerXRef.current += vxRef.current;

        // Bounds
        if (playerXRef.current < 0) { playerXRef.current = 0; vxRef.current *= -0.3; speedRef.current *= 0.95; shakeRef.current = 8; }
        if (playerXRef.current > GAME_WIDTH - PLAYER_WIDTH) { playerXRef.current = GAME_WIDTH - PLAYER_WIDTH; vxRef.current *= -0.3; speedRef.current *= 0.95; shakeRef.current = 8; }
    }

    setDisplaySpeed(Math.floor(speedRef.current * 9));

    ctx.save();
    const speedZoom = (speedRef.current / MAX_SPEED) * 0.12;
    const cam = { x: 0, y: 0, scale: 1 - speedZoom };

    if (cameraMode === 'DRIVER') { cam.scale = 1.35; cam.y = 110; }
    else if (cameraMode === 'DRONE') { cam.scale = 0.65; cam.y = -60; }
    else if (cameraMode === 'OVERHEAD') { cam.scale = 0.5; cam.y = -200; }
    else if (cameraMode === 'CINEMATIC') {
        cam.x = Math.sin(Date.now()*0.001) * 20;
        cam.scale = 1.1 + Math.cos(Date.now()*0.0006) * 0.1;
    }

    if (shakeRef.current > 0) {
        ctx.translate((Math.random() - 0.5) * shakeRef.current, (Math.random() - 0.5) * shakeRef.current);
        shakeRef.current *= 0.88;
    }

    ctx.translate(GAME_WIDTH/2, GAME_HEIGHT/2);
    ctx.scale(cam.scale, cam.scale);
    ctx.translate(-GAME_WIDTH/2 + cam.x, -GAME_HEIGHT/2 + cam.y);

    const worldSpeed = speedRef.current;
    const playerY = GAME_HEIGHT - 120;
    
    // BG
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    if (theme.road !== 'transparent') {
        ctx.fillStyle = theme.road; ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        const bgOffset = isRacingRef.current ? (score * 12) % (GAME_HEIGHT*2) : 0;
        ctx.fillStyle = theme.line;
        for(let i=-GAME_HEIGHT; i<GAME_HEIGHT*2; i+=60) {
            ctx.fillRect(GAME_WIDTH/3 - 1, (i + bgOffset) % (GAME_HEIGHT*2) - GAME_HEIGHT, 2, 24);
            ctx.fillRect((GAME_WIDTH/3)*2 - 1, (i + bgOffset) % (GAME_HEIGHT*2) - GAME_HEIGHT, 2, 24);
        }
    }

    // Obstacles
    if (isRacingRef.current && Date.now() - lastObstacleTime.current > 1400 / (worldSpeed/5)) {
        spawnObstacle(); lastObstacleTime.current = Date.now();
    }

    obstacles.current.forEach((obs, idx) => {
        if (isRacingRef.current) obs.y += worldSpeed;
        
        ctx.save();
        ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
        ctx.rotate(obs.rotation);
        
        ctx.fillStyle = theme.hazardColor;
        if (obs.subType === 'HAZARD') {
            ctx.beginPath(); ctx.arc(0, 0, obs.width/2, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        } else if (obs.subType === 'BARRIER') {
            ctx.fillStyle = '#111'; ctx.fillRect(-obs.width/2, -obs.height/2, obs.width, obs.height);
            ctx.strokeStyle = '#eab308'; ctx.lineWidth = 4; ctx.strokeRect(-obs.width/2+3, -obs.height/2+3, obs.width-6, obs.height-6);
        } else {
            ctx.fillRect(-obs.width/2, -obs.height/2, obs.width, obs.height);
        }
        ctx.restore();

        if (isRacingRef.current &&
            playerXRef.current < obs.x + obs.width &&
            playerXRef.current + PLAYER_WIDTH > obs.x &&
            playerY < obs.y + obs.height &&
            playerY + PLAYER_HEIGHT > obs.y
        ) {
            playerHealthRef.current -= obs.damage;
            setHealth(Math.max(0, Math.floor(playerHealthRef.current)));
            shakeRef.current = 35;
            spawnParticles(obs.x + obs.width/2, obs.y + obs.height/2, '#ffcc00', 15);
            obstacles.current.splice(idx, 1);
            speedRef.current *= 0.45; 
            if (playerHealthRef.current <= 0) {
                 setStatus(GameStatus.GAME_OVER);
                 isRacingRef.current = false;
                 if (onGameComplete) onGameComplete({ score, isWin: false, wager, pot });
            }
        }
        if (obs.y > GAME_HEIGHT + 200) obstacles.current.splice(idx, 1);
    });

    // Player with Lean
    ctx.save();
    const cX = playerXRef.current + PLAYER_WIDTH/2, cY = playerY + PLAYER_HEIGHT/2;
    ctx.translate(cX, cY); 
    const leanAngle = vxRef.current * 0.05;
    ctx.rotate(playerRotation.current + leanAngle); 
    ctx.translate(-cX, -cY);
    
    ctx.fillStyle = vehicle.color;
    ctx.fillRect(playerXRef.current, playerY, PLAYER_WIDTH, PLAYER_HEIGHT);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(playerXRef.current + 8, playerY + 12, PLAYER_WIDTH - 16, 20);
    
    if (nitroActiveRef.current) {
        ctx.fillStyle = '#3b82f6';
        const flicker = Math.random() * 5;
        ctx.fillRect(playerXRef.current + 10, playerY + PLAYER_HEIGHT, 6, 12 + flicker);
        ctx.fillRect(playerXRef.current + PLAYER_WIDTH - 16, playerY + PLAYER_HEIGHT, 6, 12 + flicker);
    }
    ctx.restore();

    particles.current.forEach((p, i) => {
        p.y += p.vy; p.x += p.vx; p.life -= 0.04;
        ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1; if(p.life <= 0) particles.current.splice(i, 1);
    });

    if (isRacingRef.current) setScore(s => s + 1);
    ctx.restore();
    frameId.current = requestAnimationFrame(update);
  }, [status, team, theme, cameraMode, score, wager, pot, onGameComplete, vehicle]); 

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        keysPressed.current.add(key);
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    if (status === GameStatus.PLAYING) frameId.current = requestAnimationFrame(update);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        cancelAnimationFrame(frameId.current);
    };
  }, [status, update]);

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mb-4 bg-gray-900/95 p-5 rounded-2xl border border-gray-800 backdrop-blur-md shadow-2xl flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-black brand-font text-white uppercase italic tracking-tighter leading-none mb-2">{gameData.title}</h2>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                             <Gauge className={`w-4 h-4 ${speedRef.current > MAX_SPEED * 0.8 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
                             <span className="text-2xl font-black font-mono text-white italic tracking-tighter">{displaySpeed} <span className="text-[10px] text-gray-500 not-italic">KM/H</span></span>
                        </div>
                        {autoBoostActive && <div className="flex items-center gap-1 bg-blue-600/20 text-blue-500 px-2 py-0.5 rounded text-[10px] font-black border border-blue-600/30 animate-pulse uppercase"><Cpu className="w-3 h-3"/> AUTO-BOOST</div>}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Grid Score</p>
                    <p className="text-4xl font-black font-mono text-yellow-400 italic tracking-tighter leading-none">{score.toString().padStart(6, '0')}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase"><span>Hull Integrity</span> <span>{health}%</span></div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${health < 40 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${health}%` }} />
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase"><span>Tire Grip</span> <span className={grip < 0.6 ? 'text-red-500' : 'text-blue-500'}>{Math.floor(grip * 100)}%</span></div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${grip < 0.6 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} style={{ width: `${grip * 100}%` }} />
                    </div>
                </div>
            </div>
      </div>

      <div className="relative shadow-[0_0_100px_rgba(220,38,38,0.15)] overflow-hidden rounded-3xl border border-gray-800">
        <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="bg-[#0a0a0a]" />
        
        <div className="absolute bottom-8 right-8 flex flex-col gap-4">
             <button onClick={() => setCameraMode(p => {
                 const m: any[] = ['CHASE', 'DRIVER', 'DRONE', 'OVERHEAD', 'CINEMATIC'];
                 return m[(m.indexOf(p)+1)%m.length];
             })} className="p-4 bg-black/60 border border-white/10 rounded-2xl text-white/50 hover:text-white hover:bg-red-600/80 transition-all backdrop-blur-xl group">
                <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
             </button>
        </div>

        {status === GameStatus.IDLE && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center rounded-3xl backdrop-blur-md px-10 text-center z-10">
            <ShieldAlert className="w-16 h-16 text-red-600 mb-6 animate-pulse" />
            <h1 className="text-5xl font-black text-white mb-4 brand-font tracking-tighter italic uppercase leading-none">Sortie Ready</h1>
            <div className="flex items-center gap-6 mb-10 bg-gray-900/50 p-4 rounded-2xl border border-gray-800 text-left">
                <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase">Operational Intel</p>
                    <ul className="text-[10px] text-gray-400 font-bold uppercase mt-2 space-y-1">
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Variable Steering Sensitivity</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Dynamic Grip Mechanics</li>
                    </ul>
                </div>
            </div>
            <button onClick={() => { setStatus(GameStatus.PLAYING); isRacingRef.current = true; }} className="group px-12 py-5 bg-red-600 rounded-2xl font-black text-2xl hover:bg-red-500 hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_40px_rgba(220,38,38,0.4)] uppercase italic tracking-tighter">
                <Zap className="fill-current w-6 h-6" /> Deploy Sortie
            </button>
          </div>
        )}

        {status === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl backdrop-blur-2xl bg-black/95 z-10 px-8 text-center">
             <h1 className="text-7xl font-black mb-4 brand-font italic uppercase tracking-tighter text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)] leading-none">
                TERMINATED
             </h1>
             <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] mb-12">Critical Systems Failure</p>
             <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                 <button onClick={() => { setStatus(GameStatus.IDLE); setScore(0); setHealth(100); setGrip(1.0); playerHealthRef.current = 100; obstacles.current=[]; }} className="flex-1 bg-white text-black py-4 rounded-2xl font-black hover:scale-105 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter italic shadow-xl">
                     <RotateCcw className="w-5 h-5" /> RE-DEPLOY
                 </button>
                 <button onClick={onExit} className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-gray-800 transition-all uppercase tracking-tighter italic border border-gray-800">ABORT</button>
             </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-8 text-white/20 text-[11px] font-black tracking-widest uppercase items-center opacity-60">
          <div className="flex items-center gap-2 border-r border-white/10 pr-8"><Activity className="w-4 h-4" /> Non-Linear Handling</div>
          <div className="flex items-center gap-2 border-r border-white/10 pr-8"><Eye className="w-4 h-4" /> {cameraMode} POV</div>
          <div className="flex items-center gap-2"><Monitor className="w-4 h-4" /> Neural Link: High</div>
      </div>
    </div>
  );
};