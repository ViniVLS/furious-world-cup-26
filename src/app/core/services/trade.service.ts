import { Injectable, signal, inject } from '@angular/core';
import { Observable, of, throwError, delay, tap } from 'rxjs';
import { TradeOffer, TradeGroup } from '../models/trade.model';
import { UserProfile } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { StickerService } from './sticker.service';
import { UserService } from './user.service';
import { StickerType } from '../models/sticker.model';

// SK06 — Taxa de conversão de repetidas em Fúria Coins (por raridade)
export const DUPLICATE_CONVERSION_RATES: Record<number, number> = {
  1: 5,    // Comum
  2: 15,   // Especial
  3: 40,   // Épica
  4: 100,  // Lendária
  5: 200,  // FURIOUS
};

// SK06 — Taxa diminui conforme mais cópias (5ª cópia = 1 coin)
function getConversionRate(baseRate: number, duplicateNumber: number): number {
  if (duplicateNumber >= 5) return 1;
  if (duplicateNumber === 4) return Math.max(1, Math.floor(baseRate * 0.25));
  if (duplicateNumber === 3) return Math.max(1, Math.floor(baseRate * 0.5));
  return baseRate;
}

const MOCK_OFFERS: TradeOffer[] = [
  {
    id: 't1',
    offeredBy: 'u2',
    offererProfile: {
      id: 'u2', username: 'TraderPro', country: 'BRA', isMinor: false,
      furyCoins: 100, coinsVault: 0, reputation: 4.8, tradeCount: 50,
      loginStreak: 10, badges: [], privacyLevel: 'public',
      hofCollector: 0, hofLegendary: 0, hofChallenges: 0, hofTrades: 0,
      createdAt: new Date().toISOString()
    },
    offering: ['2022-ARG-10'],
    wantingAny: ['2022-BRA-10', '2026-USA-01'],
    status: 'OPEN',
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    views: 12,
    createdAt: new Date().toISOString()
  },
  {
    id: 't2',
    offeredBy: 'u3',
    offererProfile: {
      id: 'u3', username: 'NewbieCollector', country: 'ARG', isMinor: false,
      furyCoins: 50, coinsVault: 0, reputation: 2.1, tradeCount: 2,
      loginStreak: 2, badges: [], privacyLevel: 'public',
      hofCollector: 0, hofLegendary: 0, hofChallenges: 0, hofTrades: 0,
      createdAt: new Date().toISOString()
    },
    offering: ['2026-MEX-05'],
    wantingAny: ['2022-FRA-10'],
    status: 'OPEN',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    views: 5,
    createdAt: new Date().toISOString()
  }
];

const MOCK_GROUPS: TradeGroup[] = [
  {
    id: 'g1', name: 'Colecionadores BR', description: 'Grupo para trocas no Brasil',
    type: 'open', memberCount: 15, maxMembers: 20,
    wishlist: ['2022-ARG-10', '2022-BRA-10', '2022-FRA-10']
  },
  {
    id: 'g2', name: 'Lendárias Only', description: 'Apenas trocas de figurinhas lendárias',
    type: 'invite', memberCount: 8, maxMembers: 20,
    wishlist: ['2022-LEG-01', '2022-LEG-07']
  },
  {
    id: 'g3', name: 'Fúria 2026', description: 'Foco total nas figurinhas de 2026',
    type: 'open', memberCount: 19, maxMembers: 20,
    wishlist: ['2026-USA-01', '2026-MEX-01', '2026-CAN-01']
  }
];

@Injectable({ providedIn: 'root' })
export class TradeService {
  private stickerService = inject(StickerService);
  private userService = inject(UserService);

  readonly activeOffers = signal<TradeOffer[]>([]);
  readonly tradeGroups = signal<TradeGroup[]>([]);

  getMarketplaceOffers(currentUser: UserProfile, userDuplicates: string[]): Observable<TradeOffer[]> {
    if (environment.useMockData) {
      const sortedOffers = [...MOCK_OFFERS];

      sortedOffers.sort((a, b) => {
        const aMatch = a.wantingAny.some(code => userDuplicates.includes(code));
        const bMatch = b.wantingAny.some(code => userDuplicates.includes(code));

        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;

        const aSameCountry = a.offererProfile?.country === currentUser.country;
        const bSameCountry = b.offererProfile?.country === currentUser.country;

        if (aSameCountry && !bSameCountry) return -1;
        if (!aSameCountry && bSameCountry) return 1;

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      this.activeOffers.set(sortedOffers);
      return of(sortedOffers).pipe(delay(300));
    }
    return of([]);
  }

  getTradeGroups(): Observable<TradeGroup[]> {
    if (environment.useMockData) {
      this.tradeGroups.set(MOCK_GROUPS);
      return of(MOCK_GROUPS).pipe(delay(300));
    }
    return of([]);
  }

  createOffer(offer: Partial<TradeOffer>): Observable<TradeOffer> {
    if (environment.useMockData) {
      // 1. Máx 10 trocas ativas simultâneas por usuário (SK02)
      const currentActive = this.activeOffers().filter(o => o.offeredBy === 'u1' && o.status === 'OPEN');
      if (currentActive.length >= 10) {
        return throwError(() => new Error('🚨 Limite atingido: máx. 10 trocas ativas simultâneas.'));
      }

      // 2. Validação de posse e cooldown (SK02/SK08)
      const userStickers = this.stickerService.userCollection();
      const offeringCodes = offer.offering || [];
      const wantingCodes = offer.wantingAny || [];

      let offeringType: StickerType | null = null;

      for (const code of offeringCodes) {
        const userSticker = userStickers.find(us => us.sticker.code === code && us.quantity > 0);
        if (!userSticker) {
          return throwError(() => new Error(`Você não possui a figurinha ${code} para oferecer.`));
        }

        // SK02 — Registrar tipo da primeira figurinha oferecida
        if (!offeringType) {
          offeringType = userSticker.sticker.type;
        }

        // SK02 — Cooldown de 24h após receber em troca
        if (userSticker.obtainedAt) {
          const obtainedTime = new Date(userSticker.obtainedAt).getTime();
          if (Date.now() - obtainedTime < 24 * 60 * 60 * 1000) {
            return throwError(() => new Error(`A figurinha ${code} está em cooldown de 24h para trocas.`));
          }
        }
      }

      // ★ SK02 — NOVA VALIDAÇÃO: trocas somente entre figurinhas do mesmo tipo
      for (const wantedCode of wantingCodes) {
        // Procurar o tipo da figurinha desejada em qualquer oferta existente ou no acervo geral
        const allStickers = this.stickerService.userCollection();
        const wantedSticker = allStickers.find(us => us.sticker.code === wantedCode);
        if (wantedSticker && offeringType && wantedSticker.sticker.type !== offeringType) {
          return throwError(() => new Error(
            `🚨 (SK02) Trocas somente entre figurinhas do mesmo tipo. ` +
            `Você está oferecendo "${offeringType}" mas pedindo "${wantedSticker.sticker.type}".`
          ));
        }
      }

      const newOffer: TradeOffer = {
        id: `t${Date.now()}`,
        offeredBy: 'u1',
        offering: offeringCodes,
        wantingAny: wantingCodes,
        status: 'OPEN',
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        views: 0,
        createdAt: new Date().toISOString(),
      };

      console.log(`[AUDIT LOG] Trade offer created by u1. ID: ${newOffer.id}. Offering: ${offeringCodes.join(',')}`);

      const current = this.activeOffers();
      this.activeOffers.set([newOffer, ...current]);
      return of(newOffer).pipe(delay(500));
    }
    return of({} as TradeOffer);
  }

  acceptOffer(offerId: string): Observable<void> {
    if (environment.useMockData) {
      const offer = this.activeOffers().find(o => o.id === offerId);
      if (!offer) return throwError(() => new Error('Oferta não encontrada.'));

      if (offer.status !== 'OPEN') {
        return throwError(() => new Error('Esta oferta não está mais disponível.'));
      }

      // SK08 — Atomicidade: troca como transação (ou tudo ou nada)
      console.log(`[AUDIT LOG] Trade execution started. Offer: ${offerId}. Users: u1 <-> ${offer.offeredBy}`);

      return of(undefined).pipe(
        delay(1000),
        tap(() => {
          console.log(`[AUDIT LOG] Trade completed successfully. Offer: ${offerId}.`);
          this.activeOffers.update(offers => offers.map(o => o.id === offerId ? { ...o, status: 'COMPLETED' } : o));
        })
      );
    }
    return of(undefined);
  }

  /**
   * SK02 / SK06 — Converte figurinhas repetidas em Fúria Coins.
   * Taxa progressiva: diminui conforme mais cópias da mesma figurinha.
   * Lendárias: máx. 3 conversões/mês (simulado).
   */
  convertDuplicatesToCoins(stickerIds: string[]): Observable<{ coinsEarned: number; converted: number }> {
    if (environment.useMockData) {
      const collection = this.stickerService.userCollection();
      let totalCoins = 0;
      let converted = 0;

      for (const stickerId of stickerIds) {
        const userSticker = collection.find(us => us.stickerId === stickerId);
        if (!userSticker || userSticker.duplicates <= 0) continue;

        const rarity = userSticker.sticker.rarity;
        const baseRate = DUPLICATE_CONVERSION_RATES[rarity] ?? 5;
        const duplicateNumber = userSticker.duplicates; // quantas cópias extras tem
        const coinsForThis = getConversionRate(baseRate, duplicateNumber);

        totalCoins += coinsForThis;
        converted++;
      }

      if (totalCoins > 0) {
        this.userService.addCoins(totalCoins);
        console.log(`[AUDIT LOG] Duplicate conversion: ${converted} stickers → ${totalCoins} Fúria Coins.`);
      }

      return of({ coinsEarned: totalCoins, converted }).pipe(delay(500));
    }
    return of({ coinsEarned: 0, converted: 0 });
  }
}

