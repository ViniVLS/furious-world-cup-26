export type Position         = 'GK' | 'DEF' | 'MID' | 'FWD';
export type WorldCupEdition  = '2022' | '2026';
export type RarityTier       = 1 | 2 | 3 | 4 | 5;
export type FurthestRound    = 'GROUP' | 'R16' | 'QF' | 'SF' | 'FINAL' | 'CHAMPION';

export interface PlayerStats {
  gamesPlayed:   number;
  goals:         number;
  assists:       number;
  yellowCards:   number;
  redCards:      number;
  furthestRound: FurthestRound;
}

export interface Player {
  id:           string;
  fullName:     string;
  displayName:  string;
  country:      string;           // ISO 3166-1 alpha-3
  position:     Position;
  dateOfBirth?: string;
  worldCups:    WorldCupEdition[];
  stats2022?:   PlayerStats;
  stats2026?:   PlayerStats;
  rarity:       RarityTier;
  imageUrl:     string;
  funFact?:     string;
  verified:     boolean;
  source:       string;
  lastUpdated:  string;
  createdAt:    string;
}
