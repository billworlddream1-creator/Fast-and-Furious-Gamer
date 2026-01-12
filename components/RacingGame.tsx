import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Game, GameStatus, GameResult } from '../types';
import { Play, Pause, RotateCcw, Zap, Mic, MicOff, Shield, AlertTriangle, Skull, Gauge, Activity, Coins, Trophy, TrendingUp, Maximize, Minimize, Timer, Hammer, Heart, Video, Camera, StopCircle, Film, Flag, ChevronUp, ChevronDown, Gamepad2, Eye, Plane } from 'lucide-react';
import { generateAICommentary, consultGameMaster, GameMasterDecision } from '../services/geminiService';

interface RacingGameProps {
  gameData: Game;
  onExit: () => void;
  onGameComplete?: (result: GameResult) => void;
  team?: 'RED' | 'BLUE' | 'SOLO';
  playerAvatar?: string;
  wager?: number;
  pot?: number;
}

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 44;
const PLAYER_HEIGHT = 76;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 40;
const LANE_CENTERS = [GAME_WIDTH / 6, GAME_WIDTH / 2, (GAME_WIDTH / 6) * 5];
const TRACK_LENGTH = 3000;

// Type-based Visuals Configuration
const getTheme = (type: Game['type']) => {
    switch (type) {
        case 'SPACE': return { bg: '#000000', road: 'transparent', line: '#6366f1', playerShape: 'SHIP', obstacleShape: 'ASTEROID', particle: 'STAR', engine: 'blue' };
        case 'WATER': return { bg: '#0284c7', road: '#0ea5e9', line: '#bae6fd', playerShape: 'BOAT', obstacleShape: 'ROCK', particle: 'BUBBLE', engine: 'white' };
        case 'HORSE': return { bg: '#365314', road: '#a16207', line: '#fef3c7', playerShape: 'HORSE', obstacleShape: 'FENCE', particle: 'DIRT', engine: 'none' };
        case 'FLIGHT': return { bg: '#1e3a8a', road: 'transparent', line: 'rgba(255,255,255,0.1)', playerShape: 'JET', obstacleShape: 'BALLOON', particle: 'CLOUD', engine: 'orange' };
        case 'FANTASY': return { bg: '#2e1065', road: '#4c1d95', line: '#f0abfc', playerShape: 'DRAGON', obstacleShape: 'SPEAR', particle: 'MAGIC', engine: 'fire' };
        default: return { bg: '#111827', road: '#1f2937', line: '#4b5563', playerShape: 'CAR', obstacleShape: 'CAR', particle: 'SMOKE', engine: 'orange' };
    }
};

interface Opponent {
  id: number;
  name: string;
  x: number;
  y: number;
  speed: number;
  color: string;
  lane: number;
  targetX: number;
  avatar: string;
  health: number;
  behavior: 'PASSIVE' | 'AGGRESSIVE' | 'DEFENSIVE';
  isDead: boolean;
  rotation: number;
}

interface PowerUp {
    id: number;
    x: number;
    y: number;
    type: 'SHIELD' | 'NITRO' | 'REPAIR';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  type: 'SMOKE' | 'SPARK' | 'FIRE' | 'DEBRIS' | 'DEFAULT' | 'SHIELD' | 'HEAL' | 'BOOST' | 'STAR' | 'BUBBLE' | 'DIRT' | 'CLOUD' | 'MAGIC';
}

interface FloatingText {
    x: number;
    y: number;
    text: string;
    color: string;
    life: number;
    vy: number;
}

interface ReplayFrame {
    playerX: number;
    playerY: number;
    playerRotation: number;
    health: number;
    score: number;
    speed: number;
    obstacles: {x: number, y: number, type: 'car' | 'rock', rotation?: number}[];
    opponents: Opponent[];
    particles: Particle[];
    powerUps: PowerUp[];
    floatingTexts: FloatingText[];
    activePowerUp: string | null;
    timestamp: number;
    activeEvent: GameMasterDecision | null;
    lap: number;
    leaderboard: any[];
    shake: number;
}

export const RacingGame: React.FC<RacingGameProps> = ({ 
    gameData, 
    onExit, 
    onGameComplete, 
    team = 'SOLO', 
    playerAvatar = 'ME',
    wager = 0,
    pot = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [lap, setLap] = useState(1);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [commentary, setCommentary] = useState("Waiting for drivers...");
  const [activeEvent, setActiveEvent] = useState<GameMasterDecision | null>(null);
  const [gameResult, setGameResult] = useState<{isWin: boolean} | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Theme
  const theme = getTheme(gameData.type);

  // Countdown State
  const [countDown, setCountDown] = useState<number | null>(null);
  const isRacingRef = useRef(false);

  // Audio Context & Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const engineOscRef = useRef<OscillatorNode | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);
  const engineLfoRef = useRef<OscillatorNode | null>(null);

  // Replay State
  const [isReplaying, setIsReplaying] = useState(false);
  const [cameraMode, setCameraMode] = useState<'CHASE' | 'CINEMATIC' | 'DRIVER' | 'DRONE' | 'HELI'>('CHASE');
  const replayDataRef = useRef<ReplayFrame[]>([]);
  const replayFrameIndex = useRef(0);

  // Game State
  // REFACTOR: Use useState for playerX as requested
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  // Ref to bridge state to animation loop
  const playerXRef = useRef(playerX);
  
  // Sync state to ref for game loop
  useEffect(() => {
      playerXRef.current = playerX;
  }, [playerX]);

  const playerRotation = useRef(0);
  const playerHealthRef = useRef(100);
  const shakeRef = useRef(0);
  const lastCommentaryTime = useRef(0);
  const startTimeRef = useRef(0);
  const activeShieldRef = useRef(false);
  const distanceTraveledRef = useRef(0);
  const lapRef = useRef(1);
  const nitroActiveRef = useRef(false);
  
  const obstacles = useRef<{x: number, y: number, type: 'car' | 'rock', rotation?: number}[]>([]);
  const opponents = useRef<Opponent[]>([]);
  const particles = useRef<Particle[]>([]);
  const powerUps = useRef<PowerUp[]>([]);
  const floatingTexts = useRef<FloatingText[]>([]);
  
  const frameId = useRef<number>(0);
  const scoreRef = useRef(0);
  const speedRef = useRef(5); 
  const speedModRef = useRef(0);
  const obstacleModRef = useRef(1);
  const lastObstacleTime = useRef(0);
  const lastOpponentTime = useRef(0);
  const lastPowerUpTime = useRef(0);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(e => console.error(e));
    } else {
        document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const initAudio = useCallback(() => {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
      }
  }, []);

  const playSound = useCallback((type: string) => {
      if (!audioCtxRef.current || isMuted) return;
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.value = 0.5; // Master volume

      if (type === 'COUNTDOWN') {
          const osc = ctx.createOscillator();
          osc.connect(masterGain);
          osc.frequency.setValueAtTime(440, t); // A4
          osc.frequency.exponentialRampToValueAtTime(880, t+0.1);
          masterGain.gain.setValueAtTime(0.2, t);
          masterGain.gain.exponentialRampToValueAtTime(0.001, t+0.4);
          osc.start(t); osc.stop(t+0.4);
      } else if (type === 'GO') {
          const osc = ctx.createOscillator();
          osc.connect(masterGain);
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, t);
          osc.frequency.linearRampToValueAtTime(1760, t+0.1);
          masterGain.gain.setValueAtTime(0.2, t);
          masterGain.gain.exponentialRampToValueAtTime(0.001, t+1.0);
          osc.start(t); osc.stop(t+1.0);
      } else if (type === 'COLLISION') {
          // Noise burst for impact
          const bufferSize = ctx.sampleRate * 0.5;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
          
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const noiseFilter = ctx.createBiquadFilter();
          noiseFilter.type = 'lowpass';
          noiseFilter.frequency.value = 800;
          
          noise.connect(noiseFilter);
          noiseFilter.connect(masterGain);
          
          masterGain.gain.setValueAtTime(0.6, t);
          masterGain.gain.exponentialRampToValueAtTime(0.01, t+0.3);
          noise.start(t);
      } else if (type === 'NITRO') {
           // Sci-fi sweep
           const osc = ctx.createOscillator();
           osc.type = 'sawtooth';
           const filter = ctx.createBiquadFilter();
           filter.type = 'lowpass';
           
           osc.connect(filter);
           filter.connect(masterGain);
           
           osc.frequency.setValueAtTime(150, t);
           osc.frequency.exponentialRampToValueAtTime(600, t+1);
           
           filter.frequency.setValueAtTime(400, t);
           filter.frequency.linearRampToValueAtTime(4000, t+1);
           filter.Q.value = 10;
           
           masterGain.gain.setValueAtTime(0.2, t);
           masterGain.gain.linearRampToValueAtTime(0, t+1.2);
           osc.start(t); osc.stop(t+1.2);
      } else if (type === 'VICTORY') {
          // Major Arpeggio
          [440, 554, 659, 880, 1108, 1318].forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const noteGain = ctx.createGain();
              osc.type = 'triangle';
              osc.connect(noteGain);
              noteGain.connect(ctx.destination);
              osc.frequency.value = freq;
              const start = t + i * 0.1;
              noteGain.gain.setValueAtTime(0, start);
              noteGain.gain.linearRampToValueAtTime(0.1, start+0.05);
              noteGain.gain.exponentialRampToValueAtTime(0.001, start+0.6);
              osc.start(start);
              osc.stop(start+0.6);
          });
      } else if (type === 'DEFEAT') {
          // Minor Descent
          [440, 392, 349, 330].forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const noteGain = ctx.createGain();
              osc.type = 'sawtooth';
              osc.connect(noteGain);
              noteGain.connect(ctx.destination);
              osc.frequency.value = freq;
              const start = t + i * 0.3;
              noteGain.gain.setValueAtTime(0.05, start);
              noteGain.gain.exponentialRampToValueAtTime(0.001, start+0.5);
              osc.start(start);
              osc.stop(start+0.5);
          });
      }
  }, [isMuted]);

  const startEngineSound = useCallback(() => {
    if (!audioCtxRef.current) initAudio();
    if (isMuted || !audioCtxRef.current) return;
    
    const ctx = audioCtxRef.current;
    
    // Stop previous if exists
    if(engineOscRef.current) { try { engineOscRef.current.stop(); engineOscRef.current.disconnect(); } catch(e){} }
    if(engineLfoRef.current) { try { engineLfoRef.current.stop(); engineLfoRef.current.disconnect(); } catch(e){} }
    
    // Create nodes
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const mainGain = ctx.createGain();
    
    // Settings
    osc.type = 'sawtooth';
    osc.frequency.value = 60; // Idle
    
    lfo.type = 'square';
    lfo.frequency.value = 30; // Rumble rate
    lfoGain.gain.value = 20; // Modulation depth
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    osc.connect(mainGain);
    mainGain.connect(ctx.destination);
    mainGain.gain.value = 0.05; // Idle volume
    
    osc.start();
    lfo.start();
    
    engineOscRef.current = osc;
    engineLfoRef.current = lfo;
    engineGainRef.current = mainGain;
  }, [initAudio, isMuted]);

  const stopEngineSound = useCallback(() => {
      if (engineOscRef.current) {
          try { engineOscRef.current.stop(); } catch(e){}
          engineOscRef.current.disconnect();
          engineOscRef.current = null;
      }
      if (engineLfoRef.current) {
          try { engineLfoRef.current.stop(); } catch(e){}
          engineLfoRef.current.disconnect();
          engineLfoRef.current = null;
      }
      engineGainRef.current = null;
  }, []);

  const updateEngineSound = useCallback((speed: number) => {
      if (engineOscRef.current && audioCtxRef.current && !isMuted) {
          const ctx = audioCtxRef.current;
          // Pitch scales with speed
          const targetFreq = 60 + (speed * 12);
          const targetRumble = 20 + (speed * 2);
          // Volume scales slightly with speed
          const targetVol = 0.05 + (speed * 0.001);

          engineOscRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);
          if(engineLfoRef.current) engineLfoRef.current.frequency.setTargetAtTime(targetRumble, ctx.currentTime, 0.1);
          if(engineGainRef.current) engineGainRef.current.gain.setTargetAtTime(targetVol, ctx.currentTime, 0.1);
      }
  }, [isMuted]);

  const triggerAICommentary = useCallback(async (situation: string, force = false) => {
    const now = Date.now();
    if (!force && now - lastCommentaryTime.current < 6000) return;
    lastCommentaryTime.current = now;
    try {
      const line = await generateAICommentary(situation);
      if (line) setCommentary(line);
    } catch (e) {
      console.error("Commentary failed", e);
    }
  }, []);

  const finishGame = (isWin: boolean) => {
     setStatus(GameStatus.GAME_OVER);
     setGameResult({ isWin });
     triggerAICommentary(isWin ? "A spectacular victory!" : "Defeat!", true);
     stopEngineSound();
     playSound(isWin ? 'VICTORY' : 'DEFEAT');
  };

  const handleCollectWinnings = () => {
    stopEngineSound();
    if (onGameComplete) {
        onGameComplete({ score: scoreRef.current, isWin: true, wager: wager, pot: pot });
    }
  };

  const handleReturnToHub = () => {
    stopEngineSound();
    if (onGameComplete) {
        onGameComplete({ score: scoreRef.current, isWin: false, wager: wager, pot: pot });
    } else {
        onExit();
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
      return () => {
          stopEngineSound();
          if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
              audioCtxRef.current.close();
          }
      };
  }, [stopEngineSound]);

  const startReplay = () => {
      setIsReplaying(true);
      replayFrameIndex.current = 0;
      setStatus(GameStatus.IDLE);
      frameId.current = requestAnimationFrame(replayLoop);
  };

  const stopReplay = () => {
      setIsReplaying(false);
      setStatus(GameStatus.GAME_OVER);
      cancelAnimationFrame(frameId.current);
  };

  const spawnParticles = (x: number, y: number, type: Particle['type'], count: number) => {
    for(let i=0; i<count; i++) {
        let color = '#fff';
        let size = 2;
        let speed = 1;
        let life = 1.0;
        let vx = (Math.random() - 0.5);
        let vy = (Math.random() - 0.5);

        switch (type) {
            case 'SPARK': color = '#fbbf24'; size = 3; break;
            case 'FIRE': color = '#dc2626'; size = 4; break;
            case 'STAR': color = '#ffffff'; size = 1; speed = 10; vy = 5; life = 2.0; break;
            case 'BUBBLE': color = '#bae6fd'; size = 3; vy = -2; break;
            case 'MAGIC': color = '#d8b4fe'; size = 3; break;
            case 'DIRT': color = '#78350f'; size = 3; break;
            default: color = '#fff';
        }
        
        // Theme overrides
        if (theme.particle === 'STAR' && type === 'SMOKE') type = 'STAR';
        
        particles.current.push({ x, y, vx: vx*speed, vy: vy*speed, life, color, size, type });
    }
  };

  const spawnFloatingText = (x: number, y: number, text: string, color: string) => {
      floatingTexts.current.push({ x, y, text, color, life: 1.0, vy: -2 });
  };

  const triggerNitro = useCallback(() => {
    if (status !== GameStatus.PLAYING || !isRacingRef.current) return;
    if (nitroActiveRef.current) return;
    nitroActiveRef.current = true;
    speedRef.current = Math.min(speedRef.current + 10, 40);
    setActivePowerUp("BOOST ACTIVE");
    playSound('NITRO');
    spawnParticles(playerXRef.current + PLAYER_WIDTH/2, GAME_HEIGHT - 90, theme.engine === 'blue' ? 'MAGIC' : 'FIRE', 20);
    shakeRef.current = 5;
    setTimeout(() => { 
        speedRef.current = Math.max(5, speedRef.current - 10); 
        setActivePowerUp(null);
        nitroActiveRef.current = false;
    }, 2000);
  }, [status, theme, playSound]);

  // AI Game Master Loop
  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;
    const interval = setInterval(async () => {
        if (scoreRef.current > 150) {
            const decision = await consultGameMaster(scoreRef.current, speedRef.current);
            if (decision && decision.event !== "NORMAL TRAFFIC") {
                setActiveEvent(decision);
                speedModRef.current = decision.speedMod;
                obstacleModRef.current = decision.obstacleMod;
                triggerAICommentary(`ALERT: ${decision.event}`, true);
                setTimeout(() => {
                    setActiveEvent(null);
                    speedModRef.current = 0;
                    obstacleModRef.current = 1;
                }, 8000);
            }
        }
    }, 15000);
    return () => clearInterval(interval);
  }, [status, triggerAICommentary]);

  // Controls - WASD Added
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (status !== GameStatus.PLAYING || !isRacingRef.current) return;
        const handling = 25;
        
        const k = e.key.toLowerCase();
        
        // Left
        if (e.key === 'ArrowLeft' || k === 'a') {
            setPlayerX(prev => Math.max(0, prev - handling));
        }
        // Right
        if (e.key === 'ArrowRight' || k === 'd') {
            setPlayerX(prev => Math.min(GAME_WIDTH - PLAYER_WIDTH, prev + handling));
        }
        // Nitro
        if (e.key === ' ' || e.key === 'ArrowUp' || k === 'w') {
            triggerNitro();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, triggerNitro]);

  const startGame = () => {
    initAudio();
    setStatus(GameStatus.PLAYING);
    scoreRef.current = 0;
    setScore(0);
    setHealth(100);
    setLap(1);
    playerHealthRef.current = 100;
    speedRef.current = 8;
    isRacingRef.current = false;
    setCountDown(3);
    playSound('COUNTDOWN');
    startEngineSound();
    
    // Reset arrays
    obstacles.current = [];
    opponents.current = [];
    particles.current = [];
    
    let count = 3;
    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            setCountDown(count);
            playSound('COUNTDOWN');
        } else if (count === 0) {
            setCountDown(0);
            playSound('GO');
            isRacingRef.current = true;
            startTimeRef.current = Date.now();
            lastObstacleTime.current = Date.now();
            triggerAICommentary("GO! GO! GO!", true);
        } else {
            setCountDown(null);
            clearInterval(timer);
        }
    }, 1000);
  };

  const drawVehicle = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, carHealth: number, label: string, isOpponent: boolean, rotation: number, shape: string) => {
      ctx.save();
      const centerX = x + PLAYER_WIDTH/2;
      const centerY = y + PLAYER_HEIGHT/2;
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.translate(-centerX, -centerY);

      // Effect based on theme
      if (theme.engine !== 'none') {
         ctx.fillStyle = theme.engine === 'blue' ? '#60a5fa' : '#f59e0b';
         ctx.globalAlpha = 0.6;
         ctx.beginPath();
         ctx.arc(centerX, y + PLAYER_HEIGHT, 10 + Math.random()*5, 0, Math.PI*2);
         ctx.fill();
         ctx.globalAlpha = 1.0;
      }

      ctx.fillStyle = color;
      
      if (shape === 'SHIP') {
          // Triangle
          ctx.beginPath();
          ctx.moveTo(centerX, y);
          ctx.lineTo(x + PLAYER_WIDTH, y + PLAYER_HEIGHT);
          ctx.lineTo(x, y + PLAYER_HEIGHT);
          ctx.fill();
      } else if (shape === 'BOAT') {
          // Oval pointed
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, PLAYER_WIDTH/2, PLAYER_HEIGHT/2, 0, 0, Math.PI*2);
          ctx.fill();
      } else if (shape === 'HORSE') {
           // Rectangle with head
           ctx.fillStyle = isOpponent ? '#78350f' : '#b45309';
           ctx.fillRect(x + 10, y + 10, 24, 50);
           ctx.beginPath(); ctx.arc(centerX, y + 10, 12, 0, Math.PI*2); ctx.fill();
      } else if (shape === 'DRAGON') {
          ctx.beginPath();
          ctx.moveTo(centerX, y);
          ctx.quadraticCurveTo(x + PLAYER_WIDTH + 20, centerY, centerX, y + PLAYER_HEIGHT);
          ctx.quadraticCurveTo(x - 20, centerY, centerX, y);
          ctx.fill();
      } else {
          // Default Car
          ctx.fillRect(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
      }
      
      // Name
      if (isOpponent) {
          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.fillText(label, centerX, y - 5);
      }
      ctx.restore();
  };

  const replayLoop = useCallback(() => {
     // Replay rendering omitted for brevity - reuse drawVehicle
     if(isReplaying) frameId.current = requestAnimationFrame(replayLoop);
  }, [isReplaying]);

  const update = useCallback(() => {
    if (status !== GameStatus.PLAYING) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.save();
    
    // Shake
    if (shakeRef.current > 0) {
        ctx.translate((Math.random() - 0.5) * shakeRef.current, (Math.random() - 0.5) * shakeRef.current);
        shakeRef.current *= 0.9;
    }

    const playerSpeed = Math.max(2, speedRef.current + speedModRef.current);
    const playerY = GAME_HEIGHT - 100;
    
    // Update Engine Sound
    if (isRacingRef.current) {
        updateEngineSound(playerSpeed);
    }

    // BG
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Road/Space Effects
    if (theme.road !== 'transparent') {
        ctx.fillStyle = theme.road;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT); // Simplified for brevity
        // Grid lines
        const bgOffset = isRacingRef.current ? (scoreRef.current * 10) : 0;
        ctx.fillStyle = theme.line;
        for(let i=0; i<GAME_HEIGHT; i+=40) ctx.fillRect(0, (i + bgOffset) % GAME_HEIGHT, GAME_WIDTH, 2);
    } else {
        // Starfield logic for space
        if (Math.random() > 0.8) spawnParticles(Math.random() * GAME_WIDTH, 0, 'STAR', 1);
    }

    if (isRacingRef.current) {
        distanceTraveledRef.current += playerSpeed;
        
        // Spawn Obstacles
        if (Date.now() - lastObstacleTime.current > 1500 / (playerSpeed/5)) {
            const laneIdx = Math.floor(Math.random() * 3);
            obstacles.current.push({
                x: LANE_CENTERS[laneIdx] - OBSTACLE_WIDTH / 2,
                y: -100,
                type: 'rock',
                rotation: 0
            });
            lastObstacleTime.current = Date.now();
        }
    }

    // Draw Player - Use Ref for loop
    const pColor = team === 'BLUE' ? '#2563eb' : team === 'RED' ? '#dc2626' : '#d946ef';
    drawVehicle(ctx, playerXRef.current, playerY, pColor, playerHealthRef.current, playerAvatar, false, playerRotation.current, theme.playerShape);

    // Draw Obstacles
    obstacles.current.forEach((obs, index) => {
        if (isRacingRef.current) obs.y += playerSpeed;
        ctx.save();
        ctx.translate(obs.x + OBSTACLE_WIDTH/2, obs.y + OBSTACLE_HEIGHT/2);
        ctx.fillStyle = theme.obstacleShape === 'ASTEROID' ? '#6b7280' : '#4b5563';
        ctx.beginPath(); ctx.arc(0, 0, OBSTACLE_WIDTH/2, 0, Math.PI*2); ctx.fill();
        ctx.restore();

        // Collision
        if (isRacingRef.current &&
            playerXRef.current < obs.x + OBSTACLE_WIDTH &&
            playerXRef.current + PLAYER_WIDTH > obs.x &&
            playerY < obs.y + OBSTACLE_HEIGHT &&
            playerY + PLAYER_HEIGHT > obs.y
        ) {
            playSound('COLLISION');
            playerHealthRef.current -= 25;
            setHealth(Math.floor(playerHealthRef.current));
            shakeRef.current = 20;
            obstacles.current.splice(index, 1);
            if (playerHealthRef.current <= 0) finishGame(false);
        }
        if (obs.y > GAME_HEIGHT) obstacles.current.splice(index, 1);
    });

    // Particles
    particles.current.forEach((p, i) => {
        p.y += p.vy; p.x += p.vx; p.life -= 0.05;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1.0;
        if(p.life <= 0) particles.current.splice(i, 1);
    });

    // Score
    if (isRacingRef.current) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
    }

    ctx.restore();
    frameId.current = requestAnimationFrame(update);
  }, [status, team, playerAvatar, activeEvent, theme, playSound, updateEngineSound]); 

  useEffect(() => {
    if (status === GameStatus.PLAYING) frameId.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId.current);
  }, [status, update]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-4">
      {/* HUD */}
      <div className="w-full max-w-lg mb-4 bg-gray-900/90 p-4 rounded-xl border border-gray-700 backdrop-blur relative shadow-2xl flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold brand-font text-white flex items-center gap-2">{gameData.title}</h2>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="font-mono text-lg font-bold text-gray-300">{elapsedTime}</span>
                        {activePowerUp && <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded animate-pulse">{activePowerUp}</span>}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-4xl font-bold font-mono text-yellow-400 tracking-tighter">{score.toString().padStart(5, '0')}</p>
                    {wager > 0 && <div className="text-xs text-green-400 font-bold">POT: ${pot}</div>}
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${health < 30 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${health}%` }} />
                </div>
            </div>
      </div>

      {/* Game Area */}
      <div className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="bg-gray-800 rounded-lg border-4 border-gray-700" />
        
        {/* Overlays */}
        {countDown !== null && (
            <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-sm pointer-events-none">
                <div className="text-9xl font-black italic text-white">{countDown === 0 ? "GO!" : countDown}</div>
            </div>
        )}

        {status === GameStatus.IDLE && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm px-8 text-center z-10">
            <Shield className="w-16 h-16 text-gray-600 mb-4" />
            <h1 className="text-4xl font-bold text-white mb-6 brand-font tracking-tighter">MISSION BRIEF</h1>
            <button onClick={startGame} className="group px-8 py-4 bg-red-600 rounded-full font-bold text-xl hover:scale-105 transition-all flex items-center gap-2">
                <Play className="fill-current w-5 h-5" /> LAUNCH
            </button>
          </div>
        )}

        {status === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg backdrop-blur-md bg-black/90 z-10">
             <h1 className="text-5xl font-bold text-white mb-2 brand-font">{gameResult?.isWin ? "VICTORY" : "GAME OVER"}</h1>
             {gameResult?.isWin ? (
                 <button onClick={handleCollectWinnings} className="bg-green-600 px-8 py-3 rounded-full font-bold mt-4">COLLECT WINNINGS</button>
             ) : (
                 <button onClick={handleReturnToHub} className="bg-white text-black px-8 py-3 rounded-full font-bold mt-4">RETURN TO HUB</button>
             )}
          </div>
        )}
      </div>

      <button onClick={onExit} className="absolute top-6 right-6 text-white/30 hover:text-white font-bold text-xs">ABORT</button>
      <div className="absolute top-6 right-20 flex gap-2">
        <button onClick={() => setIsMuted(!isMuted)} className="text-white/30 hover:text-white">
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button onClick={toggleFullscreen} className="text-white/30 hover:text-white font-bold text-xs">FULL</button>
      </div>
    </div>
  );
};