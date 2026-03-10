export interface UserProfile {
  id:            string;
  username:      string;
  country?:      string;
  favoriteTeam?: string;
  birthDate?:    string;
  isMinor:       boolean;
  furyCoins:     number;
  coinsVault:    number;
  reputation:    number;
  tradeCount:    number;
  loginStreak:   number;
  lastLogin?:    string;
  badges:        string[];
  privacyLevel:  'public' | 'friends' | 'private';
  hofCollector:  number;
  hofLegendary:  number;
  hofChallenges: number;
  hofTrades:     number;
  createdAt:     string;
}
