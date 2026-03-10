import { Injectable, signal, inject } from '@angular/core';
import { UserProfile } from '../models/user.model';
import { Router } from '@angular/router';

export type ReputationEvent = 'trade_completed' | 'trade_cancelled' | 'reported' | 'fast_responder';

/** SK05 — Delta de reputação por evento */
const REPUTATION_DELTA: Record<ReputationEvent, number> = {
  trade_completed: +0.1,
  fast_responder: +0.05,
  trade_cancelled: -0.3,
  reported: -1.0,
};

/** SK06 — Teto de coins na carteira antes de transferir para o cofre */
const COINS_WALLET_CAP = 10_000;

@Injectable({ providedIn: 'root' })
export class UserService {
  private router = inject(Router);

  readonly currentUser = signal<UserProfile | null>({
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
    hofCollector: 0,
    hofLegendary: 0,
    hofChallenges: 0,
    hofTrades: 0,
    createdAt: new Date().toISOString()
  });

  deductCoins(amount: number): boolean {
    const user = this.currentUser();
    if (!user) return false;

    if (user.furyCoins >= amount) {
      this.currentUser.update(u => {
        if (!u) return u;
        return { ...u, furyCoins: u.furyCoins - amount };
      });
      return true;
    }
    return false;
  }

  /**
   * SK06 — Adiciona coins à carteira com teto de 10.000.
   * Excedente vai automaticamente para o cofre (coinsVault).
   */
  addCoins(amount: number): void {
    this.currentUser.update(u => {
      if (!u) return u;
      const newTotal = u.furyCoins + amount;
      if (newTotal <= COINS_WALLET_CAP) {
        return { ...u, furyCoins: newTotal };
      }
      // Excedente → cofre
      const overflow = newTotal - COINS_WALLET_CAP;
      console.log(`[ECONOMY LOG] Coins cap reached. ${overflow} coins sent to vault.`);
      return {
        ...u,
        furyCoins: COINS_WALLET_CAP,
        coinsVault: u.coinsVault + overflow,
      };
    });
  }

  /**
   * SK05 — Atualiza reputação do trader por evento.
   * Sempre clampada entre 0.0 e 5.0.
   */
  updateReputation(event: ReputationEvent): void {
    const delta = REPUTATION_DELTA[event] ?? 0;
    this.currentUser.update(u => {
      if (!u) return u;
      const newRep = Math.max(0, Math.min(5.0, parseFloat((u.reputation + delta).toFixed(2))));
      console.log(`[REPUTATION LOG] Event: ${event}. Delta: ${delta > 0 ? '+' : ''}${delta}. New rep: ${newRep}`);
      return { ...u, reputation: newRep };
    });
  }

  /**
   * SK05 — Registra conclusão de uma troca (incrementa tradeCount e reputação).
   */
  recordTradeCompleted(): void {
    this.currentUser.update(u => {
      if (!u) return u;
      return { ...u, tradeCount: u.tradeCount + 1 };
    });
    this.updateReputation('trade_completed');
  }

  logout(): void {
    // Basic mock implementation of a logout
    this.currentUser.set(null);
    this.router.navigate(['/']); 
  }
}

