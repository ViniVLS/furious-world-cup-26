import { Injectable, signal, computed, inject } from '@angular/core';
import { UserProfile, UserRole } from '../models/user.model';
import { UserService } from './user.service';
import { PackType } from '../models/pack.model';

const STORAGE_KEY_ACTIVITY = 'furia-admin-activity';
const STORAGE_KEY_CONFIG = 'furia-admin-config';
const STORAGE_KEY_MOCK_USERS = 'furia-admin-mock-users';

export interface ActivityEntry {
  id: string;
  adminId: string;
  adminUsername: string;
  action: string;
  targetUserId?: string;
  targetUsername?: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface SystemConfig {
  maxOffersPerUser: number;
  maxPackOpeningsPerMinute: number;
  coinWalletCap: number;
  duplicateRates: Record<number, number>;
  packCosts: Record<PackType, number>;
  features: {
    phygital: boolean;
    quiz: boolean;
  };
  bannerMessage: string;
  maintenanceMode: boolean;
  socialLinks: {
    instagram: string;
    twitter: string;
    discord: string;
  };
}

const DEFAULT_CONFIG: SystemConfig = {
  maxOffersPerUser: 10,
  maxPackOpeningsPerMinute: 10,
  coinWalletCap: 10000,
  duplicateRates: { 1: 5, 2: 15, 3: 40, 4: 100, 5: 200 },
  packCosts: { basic: 100, plus: 180, elite: 300, legendary: 500, copa: 250 },
  features: { phygital: true, quiz: true },
  bannerMessage: '',
  maintenanceMode: false,
  socialLinks: { instagram: '', twitter: '', discord: '' }
};

const MOCK_USERS: UserProfile[] = [
  {
    id: 'u1', username: 'ColecionadorFuria', email: 'colecionador@furia.gg', country: 'BRA', isMinor: false,
    furyCoins: 1000, coinsVault: 0, reputation: 5.0, tradeCount: 5, loginStreak: 7,
    badges: ['b1', 'b2'], privacyLevel: 'public', role: 'user' as UserRole, isActive: true,
    hofCollector: 120, hofLegendary: 50, hofChallenges: 30, hofTrades: 5,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'u2', username: 'MessiFan2026', email: 'messi.fan@gmail.com', country: 'ARG', isMinor: false,
    furyCoins: 2500, coinsVault: 100, reputation: 4.8, tradeCount: 12, loginStreak: 15,
    badges: ['b1', 'b5'], privacyLevel: 'public', role: 'user' as UserRole, isActive: true,
    hofCollector: 200, hofLegendary: 80, hofChallenges: 50, hofTrades: 12,
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'u3', username: 'CopaChampion', email: 'copa.champ@outlook.com', country: 'FRA', isMinor: true,
    furyCoins: 500, coinsVault: 0, reputation: 3.5, tradeCount: 3, loginStreak: 2,
    badges: ['b1'], privacyLevel: 'public', role: 'user' as UserRole, isActive: true,
    hofCollector: 50, hofLegendary: 10, hofChallenges: 0, hofTrades: 3,
    createdAt: '2026-02-01T00:00:00.000Z'
  },
  {
    id: 'u4', username: 'BlockedUser', email: 'blocked@email.com', country: 'BRA', isMinor: false,
    furyCoins: 0, coinsVault: 0, reputation: 1.0, tradeCount: 0, loginStreak: 0,
    badges: [], privacyLevel: 'private', role: 'user' as UserRole, isActive: false,
    hofCollector: 0, hofLegendary: 0, hofChallenges: 0, hofTrades: 0,
    createdAt: '2026-02-10T00:00:00.000Z'
  },
  {
    id: 'u5', username: 'StickerHunter', email: 'hunter.mx@yahoo.com', country: 'MEX', isMinor: false,
    furyCoins: 3000, coinsVault: 500, reputation: 4.2, tradeCount: 8, loginStreak: 10,
    badges: ['b1', 'b2', 'b5'], privacyLevel: 'public', role: 'user' as UserRole, isActive: true,
    hofCollector: 180, hofLegendary: 60, hofChallenges: 40, hofTrades: 8,
    createdAt: '2026-01-20T00:00:00.000Z'
  }
];

@Injectable({ providedIn: 'root' })
export class AdminStateService {
  private readonly userService = inject(UserService);
  private readonly _mockUsers = signal<UserProfile[]>(this.loadMockUsers());

  readonly users = computed(() => {
    const list = this._mockUsers();
    const currentUser = this.userService.currentUser();
    if (!currentUser) return list;
    
    const index = list.findIndex(u => u.id === currentUser.id);
    if (index >= 0) {
      const newList = [...list];
      newList[index] = currentUser;
      return newList;
    }
    return [currentUser, ...list];
  });
  readonly activityLog = signal<ActivityEntry[]>(this.loadActivity());
  readonly systemConfig = signal<SystemConfig>(this.loadConfig());

  private adminUser: UserProfile | null = null;

  setAdminUser(user: UserProfile | null): void {
    this.adminUser = user;
  }

  private logActivity(action: string, targetUserId?: string, targetUsername?: string, details?: Record<string, unknown>): void {
    const entry: ActivityEntry = {
      id: `act-${Date.now()}`,
      adminId: this.adminUser?.id || 'system',
      adminUsername: this.adminUser?.username || 'System',
      action,
      targetUserId,
      targetUsername,
      details: details || {},
      timestamp: new Date().toISOString()
    };
    this.activityLog.update(log => [entry, ...log].slice(0, 100));
    this.saveActivity();
  }

  private loadMockUsers(): UserProfile[] {
    if (typeof window === 'undefined') return MOCK_USERS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MOCK_USERS);
      return stored ? JSON.parse(stored) : MOCK_USERS;
    } catch { return MOCK_USERS; }
  }

  private saveMockUsers(users: UserProfile[]): void {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_KEY_MOCK_USERS, JSON.stringify(users)); } catch {}
  }

  private loadActivity(): ActivityEntry[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVITY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  }

  private saveActivity(): void {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(this.activityLog())); } catch {}
  }

  private loadConfig(): SystemConfig {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
    } catch { return DEFAULT_CONFIG; }
  }

  private saveConfig(config: SystemConfig): void {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config)); } catch {}
  }

  toggleUserRole(userId: string): void {
    const users = this._mockUsers().map(u => {
      if (u.id !== userId) return u;
      const newRole: UserRole = u.role === 'admin' ? 'user' : 'admin';
      this.logActivity(`Role alterado para ${newRole}`, userId, u.username, { newRole, oldRole: u.role });
      return { ...u, role: newRole };
    });
    this._mockUsers.set(users);
    this.saveMockUsers(users);
  }

  toggleUserActive(userId: string): void {
    const users = this._mockUsers().map(u => {
      if (u.id !== userId) return u;
      const newActive = !u.isActive;
      this.logActivity(`Usuário ${newActive ? 'bloqueado' : 'desbloqueado'}`, userId, u.username);
      return { ...u, isActive: newActive };
    });
    this._mockUsers.set(users);
    this.saveMockUsers(users);
  }

  resetUserCoins(userId: string): void {
    const users = this._mockUsers().map(u => {
      if (u.id !== userId) return u;
      this.logActivity('Coins resetados para 0', userId, u.username, { oldCoins: u.furyCoins, newCoins: 0 });
      return { ...u, furyCoins: 0, coinsVault: 0 };
    });
    this._mockUsers.set(users);
    this.saveMockUsers(users);
  }

  addCoinsToUser(userId: string, amount: number): void {
    const users = this._mockUsers().map(u => {
      if (u.id !== userId) return u;
      this.logActivity(`+${amount} coins concedidos`, userId, u.username, { amount, oldCoins: u.furyCoins, newCoins: u.furyCoins + amount });
      return { ...u, furyCoins: u.furyCoins + amount };
    });
    this._mockUsers.set(users);
    this.saveMockUsers(users);
  }

  updateSystemConfig(config: Partial<SystemConfig>): void {
    const updated = { ...this.systemConfig(), ...config };
    this.systemConfig.set(updated);
    this.saveConfig(updated);
    this.logActivity('Configuração do sistema atualizada', undefined, undefined, config);
  }

  clearActivityLog(): void {
    this.activityLog.set([]);
    this.saveActivity();
  }

  getStats(): { totalUsers: number; activeUsers: number; totalCoins: number; totalTrades: number } {
    const users = this.users();
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      totalCoins: users.reduce((sum, u) => sum + u.furyCoins + u.coinsVault, 0),
      totalTrades: users.reduce((sum, u) => sum + u.tradeCount, 0)
    };
  }
}
