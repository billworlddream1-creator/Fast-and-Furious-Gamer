export interface Game {
  id: string;
  title: string;
  description: string;
  type: 'RACING' | 'DRIFT' | 'ACTION' | 'STRATEGY' | 'SPORTS' | 'SHOOTER' | 'FLIGHT' | 'SIMULATION' | 'WATER' | 'RETRO' | 'SPACE' | 'HORSE' | 'FANTASY';
  thumbnail: string;
  author: string;
  rating: number;
  onlinePlayers: number;
  isCustom?: boolean;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface PaymentDetails {
  method: 'BANK' | 'MOBILE';
  accountName: string;
  accountNumber: string;
  provider: string; // Bank Name or Mobile Network
}

export interface PlayerProfile {
  username: string;
  level: number;
  xp: number;
  credits: number; // In-game currency
  walletBalance: number; // Real money balance ($)
  paymentDetails?: PaymentDetails;
  gamesPlayed: number;
  lastRewardDate?: number;
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

export interface LobbyPlayer {
  id: string;
  name: string;
  isReady: boolean;
  team: 'RED' | 'BLUE' | 'SOLO';
  avatar: string;
  level: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  vehicle: string;
  change: 'up' | 'down' | 'same';
}

export interface GameResult {
  score: number;
  isWin: boolean;
  wager: number;
  pot: number;
}

export interface PlayerStat {
  username: string;
  category: 'BEST_PLAYER' | 'BEST_GAMER' | 'BEST_LOSER';
  value: string;
  detail: string;
  avatarColor: string;
}