import { GameRoll } from "./game-rolls/game-rolls.model";

export interface ILeaderboards {
  user_id: string;
  username: string;
  profit: number;
  profit_ath: number;
  max_wager: number;
  wagared: number;
  bets: number;
  number: number;
}

export interface IStats {
  bets: number;
  wagered: number;
  netProfit: number;
  profitLow: number;
  profitHigh: number;
}

export interface IPaginateStats {
  pages: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  firstPage: number;
  lastPage: number;
  data: GameRoll[];
  items: number;
  last_profit?: number;
}

export interface IRollResult {
  hash: string;
  result: number;
}

export interface IMinMax {
  min: number;
  max: number;
}

export interface IMainBetResults {
  multiplier: number;
  profit: number;
}

export interface ISaveUserRoll {
  currentRoll: GameRoll;
  maxWinReached: boolean;
}

export interface IVerifyProbablyFair {
  user_id: string;
  server_seed_public: string;
  server_seed_private: string;
  client_seed: string;
  betNumber: number;
}

export interface IChangeProbablyFairSeed {
  user_id: string;
  server_seed_public: string;
  clientSeed: string;
}
