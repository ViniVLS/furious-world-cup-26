import { UserProfile } from './user.model';

export type TradeStatus = 'OPEN' | 'NEGOTIATING' | 'COMPLETED' | 'EXPIRED';

export interface TradeOffer {
  id: string;
  offeredBy: string;
  offererProfile?: UserProfile;
  offering: string[];
  wantingAny: string[];
  wantingAll?: string[];
  status: TradeStatus;
  expiresAt: string;
  views: number;
  createdAt: string;
}

export interface TradeGroup {
  id: string;
  name: string;
  description: string;
  type: 'open' | 'invite' | 'secret';
  memberCount: number;
  maxMembers: number;
  imageUrl?: string;
  wishlist?: string[];
}
