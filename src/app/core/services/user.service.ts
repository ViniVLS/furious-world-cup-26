import { Injectable, signal, effect, inject } from '@angular/core';
import { UserProfile } from '../models/user.model';
import { Router } from '@angular/router';
import { DebugService } from '../../../debug/debug.service';

export type ReputationEvent = 'trade_completed' | 'trade_cancelled' | 'reported' | 'fast_responder';

const STORAGE_KEY_USER = 'furia-user-data';

const DEFAULT_USER: UserProfile = {
  id: 'u1',
  username: 'ColecionadorFuria',
  country: 'BRA',
  isMinor: false,
  furyCoins: 1000,
  coinsVault: 0,
  reputation: 5.0,
  tradeCount: 0,
  loginStreak: 1,
  badges: [],
  privacyLevel: 'public',
  role: 'user',
  isActive: true,
  hofCollector: 0,
  hofLegendary: 0,
  hofChallenges: 0,
  hofTrades: 0,
  createdAt: new Date().toISOString()
};

const REPUTATION_DELTA: Record<ReputationEvent, number> = {
  trade_completed: +0.1,
  fast_responder: +0.05,
  trade_cancelled: -0.3,
  reported: -1.0,
};

const COINS_WALLET_CAP = 10_000;

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly debug = inject(DebugService);
  private router = inject(Router);

  private loadUser(): UserProfile {
    if (typeof window === 'undefined') return DEFAULT_USER;
    this.debug.logMethodEntry('UserService', 'loadUser');
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.debug.info('STATE', 'UserService', `Dados do usuário carregados do localStorage. Coins: ${parsed.furyCoins}`);
        this.debug.logMethodExit('UserService', 'loadUser', { userId: parsed.id, coins: parsed.furyCoins });
        return parsed;
      }
    } catch (e) {
      this.debug.error('ERROR', 'UserService', 'Erro ao carregar usuário do localStorage', e, 'loadUser');
    }
    this.debug.info('STATE', 'UserService', 'Nenhum usuário encontrado, usando DEFAULT');
    this.debug.logMethodExit('UserService', 'loadUser', { source: 'default' });
    return DEFAULT_USER;
  }

  private saveUser(user: UserProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch (e) {
      this.debug.error('ERROR', 'UserService', 'Erro ao salvar usuário no localStorage', e, 'saveUser');
    }
  }

  readonly currentUser = signal<UserProfile | null>(this.loadUser());

  constructor() {
    this.debug.logLifecycle('UserService', 'constructor');
    effect(() => {
      const user = this.currentUser();
      if (user) this.saveUser(user);
    });
  }

  deductCoins(amount: number): boolean {
    this.debug.logMethodEntry('UserService', 'deductCoins', { amount });
    const timer = this.debug.startTimer('deductCoins');
    const user = this.currentUser();
    if (!user) {
      this.debug.error('ERROR', 'UserService', 'Tentativa de deductCoins sem usuário logado', null, 'deductCoins');
      const ms = this.debug.endTimer('deductCoins');
      this.debug.logMethodExit('UserService', 'deductCoins', { success: false, reason: 'no_user' }, ms);
      return false;
    }

    const before = user.furyCoins;
    if (before >= amount) {
      this.currentUser.update(u => {
        if (!u) return u;
        return { ...u, furyCoins: u.furyCoins - amount };
      });
      const after = before - amount;
      this.debug.logEconomy('UserService', 'DEDUCT', amount, before, after);
      const ms = this.debug.endTimer('deductCoins');
      this.debug.logMethodExit('UserService', 'deductCoins', { success: true, amount, before, after }, ms);
      return true;
    }

    this.debug.warn('WARN', 'UserService', `Coins insuficientes para deduct: required=${amount}, available=${before}`, null, 'deductCoins');
    const ms = this.debug.endTimer('deductCoins');
    this.debug.logMethodExit('UserService', 'deductCoins', { success: false, reason: 'insufficient_funds' }, ms);
    return false;
  }

  addCoins(amount: number): void {
    this.debug.logMethodEntry('UserService', 'addCoins', { amount });
    const timer = this.debug.startTimer('addCoins');
    this.currentUser.update(u => {
      if (!u) return u;
      const before = u.furyCoins;
      const newTotal = before + amount;
      if (newTotal <= COINS_WALLET_CAP) {
        this.debug.logEconomy('UserService', 'ADD', amount, before, newTotal);
        return { ...u, furyCoins: newTotal };
      }
      const overflow = newTotal - COINS_WALLET_CAP;
      this.debug.logEconomy('UserService', 'ADD', amount, before, COINS_WALLET_CAP);
      this.debug.info('ECONOMY', 'UserService', `Coins cap atingido. ${overflow} coins enviados para o cofre.`, { overflow, vaultBefore: u.coinsVault, vaultAfter: u.coinsVault + overflow });
      return { ...u, furyCoins: COINS_WALLET_CAP, coinsVault: u.coinsVault + overflow };
    });
    const ms = this.debug.endTimer('addCoins');
    this.debug.logMethodExit('UserService', 'addCoins', null, ms);
  }

  updateReputation(event: ReputationEvent): void {
    this.debug.logMethodEntry('UserService', 'updateReputation', { event });
    const timer = this.debug.startTimer('updateReputation');
    const delta = REPUTATION_DELTA[event] ?? 0;
    const user = this.currentUser();
    if (!user) {
      this.debug.warn('WARN', 'UserService', 'updateReputation chamado sem usuário', null, 'updateReputation');
      this.debug.logMethodExit('UserService', 'updateReputation', { success: false });
      return;
    }
    const before = user.reputation;
    this.currentUser.update(u => {
      if (!u) return u;
      const newRep = Math.max(0, Math.min(5.0, parseFloat((u.reputation + delta).toFixed(2))));
      return { ...u, reputation: newRep };
    });
    const after = parseFloat((before + delta).toFixed(2));
    this.debug.info('STATE', 'UserService', `Reputação alterada: ${event}. Delta: ${delta > 0 ? '+' : ''}${delta}. De ${before} para ${after}`,
      { event, delta, before, after: Math.max(0, Math.min(5, after)) }, 'updateReputation');
    const ms = this.debug.endTimer('updateReputation');
    this.debug.logMethodExit('UserService', 'updateReputation', { event, delta, before, after }, ms);
  }

  recordTradeCompleted(): void {
    this.debug.logMethodEntry('UserService', 'recordTradeCompleted');
    const timer = this.debug.startTimer('recordTradeCompleted');
    const user = this.currentUser();
    if (!user) {
      this.debug.error('ERROR', 'UserService', 'recordTradeCompleted sem usuário', null, 'recordTradeCompleted');
      this.debug.logMethodExit('UserService', 'recordTradeCompleted', { success: false });
      return;
    }
    const beforeTradeCount = user.tradeCount;
    const beforeHofTrades = user.hofTrades || 0;
    this.currentUser.update(u => {
      if (!u) return u;
      return { ...u, tradeCount: u.tradeCount + 1, hofTrades: (u.hofTrades || 0) + 1 };
    });
    this.debug.logAudit('UserService', `Troca registrada. TradeCount: ${beforeTradeCount} → ${beforeTradeCount + 1}. HOF Trades: ${beforeHofTrades} → ${beforeHofTrades + 1}`);
    this.updateReputation('trade_completed');
    const ms = this.debug.endTimer('recordTradeCompleted');
    this.debug.logMethodExit('UserService', 'recordTradeCompleted', { tradeCount: beforeTradeCount + 1, hofTrades: beforeHofTrades + 1 }, ms);
  }

  logout(): void {
    this.debug.logMethodEntry('UserService', 'logout');
    const user = this.currentUser();
    this.debug.logAudit('UserService', `Logout realizado`, { userId: user?.id, username: user?.username });
    this.currentUser.set(null);
    this.debug.logNavigation('AuthenticatedArea', '/', { userId: user?.id });
    this.router.navigate(['/']);
    this.debug.logMethodExit('UserService', 'logout');
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
}
