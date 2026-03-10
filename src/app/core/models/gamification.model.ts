export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  rewardPackType?: string;
  isCompleted: boolean;
  type: 'pack' | 'trade' | 'challenge' | 'social';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  rarity: 'Comum' | 'Especial' | 'Épica' | 'Lendária' | 'FURIOUS';
  imageUrl: string;
  isSeasonal: boolean;
  unlockedAt?: string;
}

export interface HallOfFameEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
  avatarUrl?: string;
}
