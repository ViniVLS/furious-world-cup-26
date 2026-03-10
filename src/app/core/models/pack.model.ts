import { Sticker } from './sticker.model';

export type PackType = 'basic' | 'plus' | 'elite' | 'legendary' | 'copa';

export interface Pack {
  type:       PackType;
  name:       string;
  quantity:   number;
  guarantees: string;
  coinsCost:  number;
  imageUrl:   string;
}

export interface PackOpeningResult {
  stickers:       Sticker[];
  newCount:       number;
  duplicateCount: number;
}
