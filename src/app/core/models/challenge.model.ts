export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'thematic' | 'quiz';
  startsAt: string;
  endsAt: string;
  rewardCoins: number;
  rewardPackType?: string;
  rewardBadgeId?: string;
  rewardHofPoints: number;
  isActive: boolean;
}
