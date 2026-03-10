import { Player, WorldCupEdition, RarityTier } from './player.model';

export type StickerType =
  'player' | 'shield' | 'team_photo' | 'stadium' | 'mascot' | 'ball';

export interface Sticker {
  id:           string;
  code:         string;           // Ex: '2022-BRA-01'
  playerId?:    string;
  player?:      Player;
  type:         StickerType;
  edition:      WorldCupEdition;
  country?:     string;
  rarity:       RarityTier;
  imageUrl:     string;
  name:         string;
  description?: string;
  isPhysicalEdition?: boolean;
}

export interface UserSticker {
  stickerId:  string;
  sticker:    Sticker;
  quantity:   number;
  inAlbum:    0 | 1;
  duplicates: number;
  obtainedAt: string;
}
