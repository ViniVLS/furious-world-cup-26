import { Injectable, signal, effect, inject } from '@angular/core';
import { Observable, of, throwError, delay, tap } from 'rxjs';
import { TradeOffer, TradeGroup } from '../models/trade.model';
import { UserProfile } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { StickerService } from './sticker.service';
import { UserService } from './user.service';
import { StickerType } from '../models/sticker.model';
import { AudioService } from './audio.service';
import { GamificationService } from './gamification.service';
import { DebugService } from '../../../debug/debug.service';

const STORAGE_KEY_OFFERS = 'furia-trade-offers';
const STORAGE_KEY_GROUPS = 'furia-trade-groups';

export const DUPLICATE_CONVERSION_RATES: Record<number, number> = {
  1: 5, 2: 15, 3: 40, 4: 100, 5: 200,
};

function getConversionRate(baseRate: number, duplicateNumber: number): number {
  if (duplicateNumber >= 5) return 1;
  if (duplicateNumber === 4) return Math.max(1, Math.floor(baseRate * 0.25));
  if (duplicateNumber === 3) return Math.max(1, Math.floor(baseRate * 0.5));
  return baseRate;
}

const MOCK_OFFERS: TradeOffer[] = [
  {
    id: 't1', offeredBy: 'u2',
    offererProfile: { id: 'u2', username: 'TraderPro', country: 'BRA', isMinor: false, furyCoins: 100, coinsVault: 0, reputation: 4.8, tradeCount: 50, loginStreak: 10, badges: [], privacyLevel: 'public', role: 'user' as const, isActive: true, hofCollector: 0, hofLegendary: 0, hofChallenges: 0, hofTrades: 0, createdAt: new Date().toISOString() },
    offering: ['2022-ARG-10'], wantingAny: ['2022-BRA-10', '2026-USA-01'],
    status: 'OPEN', expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), views: 12, createdAt: new Date().toISOString()
  },
  {
    id: 't2', offeredBy: 'u3',
    offererProfile: { id: 'u3', username: 'NewbieCollector', country: 'ARG', isMinor: false, furyCoins: 50, coinsVault: 0, reputation: 2.1, tradeCount: 2, loginStreak: 2, badges: [], privacyLevel: 'public', role: 'user' as const, isActive: true, hofCollector: 0, hofLegendary: 0, hofChallenges: 0, hofTrades: 0, createdAt: new Date().toISOString() },
    offering: ['2026-MEX-05'], wantingAny: ['2022-FRA-10'],
    status: 'OPEN', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), views: 5, createdAt: new Date().toISOString()
  }
];

const MOCK_GROUPS: TradeGroup[] = [
  { id: 'g1', name: 'Colecionadores BR', description: 'Grupo para trocas no Brasil', type: 'open', memberCount: 15, maxMembers: 20, wishlist: ['2022-ARG-10', '2022-BRA-10', '2022-FRA-10'] },
  { id: 'g2', name: 'Lendárias Only', description: 'Apenas trocas de figurinhas lendárias', type: 'invite', memberCount: 8, maxMembers: 20, wishlist: ['2022-LEG-01', '2022-LEG-07'] },
  { id: 'g3', name: 'Fúria 2026', description: 'Foco total nas figurinhas de 2026', type: 'open', memberCount: 19, maxMembers: 20, wishlist: ['2026-USA-01', '2026-MEX-01', '2026-CAN-01'] },
];

@Injectable({ providedIn: 'root' })
export class TradeService {
  private readonly debug = inject(DebugService);
  private stickerService = inject(StickerService);
  private userService = inject(UserService);
  private audioService = inject(AudioService);
  private gamificationService = inject(GamificationService);

  readonly activeOffers = signal<TradeOffer[]>(this.loadOffers());
  readonly tradeGroups = signal<TradeGroup[]>(this.loadGroups());

  constructor() {
    this.debug.logLifecycle('TradeService', 'constructor');
    effect(() => {
      const offers = this.activeOffers();
      this.saveOffers(offers);
    });
    effect(() => {
      const groups = this.tradeGroups();
      this.saveGroups(groups);
    });
  }

  private loadOffers(): TradeOffer[] {
    if (typeof window === 'undefined') return [];
    this.debug.logMethodEntry('TradeService', 'loadOffers');
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OFFERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter((o: TradeOffer) => o.status === 'OPEN');
        this.debug.info('STATE', 'TradeService', `${filtered.length} ofertas carregadas do localStorage`);
        this.debug.logMethodExit('TradeService', 'loadOffers', { count: filtered.length, source: 'localStorage' });
        return filtered;
      }
    } catch (e) {
      this.debug.error('ERROR', 'TradeService', 'Erro ao carregar ofertas', e, 'loadOffers');
    }
    this.debug.info('STATE', 'TradeService', 'Nenhuma oferta no localStorage, usando mock');
    this.debug.logMethodExit('TradeService', 'loadOffers', { count: MOCK_OFFERS.length, source: 'mock' });
    return [...MOCK_OFFERS];
  }

  private saveOffers(offers: TradeOffer[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_OFFERS, JSON.stringify(offers));
    } catch (e) {
      this.debug.error('ERROR', 'TradeService', 'Erro ao salvar ofertas', e, 'saveOffers');
    }
  }

  private loadGroups(): TradeGroup[] {
    if (typeof window === 'undefined') return [];
    this.debug.logMethodEntry('TradeService', 'loadGroups');
    try {
      const stored = localStorage.getItem(STORAGE_KEY_GROUPS);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.debug.info('STATE', 'TradeService', `${parsed.length} grupos carregados do localStorage`);
        this.debug.logMethodExit('TradeService', 'loadGroups', { count: parsed.length, source: 'localStorage' });
        return parsed;
      }
    } catch (e) {
      this.debug.error('ERROR', 'TradeService', 'Erro ao carregar grupos', e, 'loadGroups');
    }
    this.debug.info('STATE', 'TradeService', 'Nenhum grupo no localStorage, usando mock');
    this.debug.logMethodExit('TradeService', 'loadGroups', { count: MOCK_GROUPS.length, source: 'mock' });
    return [...MOCK_GROUPS];
  }

  private saveGroups(groups: TradeGroup[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups));
    } catch (e) {
      this.debug.error('ERROR', 'TradeService', 'Erro ao salvar grupos', e, 'saveGroups');
    }
  }

  getMarketplaceOffers(currentUser: UserProfile, userDuplicates: string[]): Observable<TradeOffer[]> {
    this.debug.logMethodEntry('TradeService', 'getMarketplaceOffers', { userId: currentUser?.id, duplicatesCount: userDuplicates.length });
    const timer = this.debug.startTimer('getMarketplaceOffers');
    if (environment.useMockData) {
      const storedOffers = this.activeOffers();
      const sortedOffers = [...storedOffers];

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
      const ms = this.debug.endTimer('getMarketplaceOffers');
      this.debug.info('METHOD', 'TradeService', `Marketplace: ${sortedOffers.length} ofertas ordenadas`, { count: sortedOffers.length }, 'getMarketplaceOffers');
      this.debug.logMethodExit('TradeService', 'getMarketplaceOffers', { count: sortedOffers.length }, ms);
      return of(sortedOffers).pipe(delay(300));
    }
    this.debug.logMethodExit('TradeService', 'getMarketplaceOffers', { source: 'empty' });
    return of([]);
  }

  getTradeGroups(): Observable<TradeGroup[]> {
    this.debug.logMethodEntry('TradeService', 'getTradeGroups');
    if (environment.useMockData) {
      this.tradeGroups.set(MOCK_GROUPS);
      this.debug.logMethodExit('TradeService', 'getTradeGroups', { count: MOCK_GROUPS.length });
      return of(MOCK_GROUPS).pipe(delay(300));
    }
    return of([]);
  }

  createOffer(offer: Partial<TradeOffer>): Observable<TradeOffer> {
    this.debug.logMethodEntry('TradeService', 'createOffer', { offering: offer.offering, wantingAny: offer.wantingAny });
    const timer = this.debug.startTimer('createOffer');
    if (environment.useMockData) {
      const user = this.userService.currentUser();
      const userId = user?.id || 'u1';

      const currentActive = this.activeOffers().filter(o => o.offeredBy === userId && o.status === 'OPEN');
      if (currentActive.length >= 10) {
        const err = 'Limite atingido: max 10 trocas ativas.';
        this.debug.error('ERROR', 'TradeService', err, { activeCount: currentActive.length }, 'createOffer');
        const ms = this.debug.endTimer('createOffer');
        this.debug.logMethodExit('TradeService', 'createOffer', { error: err }, ms);
        return throwError(() => new Error(err));
      }

      const userStickers = this.stickerService.userCollection();
      const offeringCodes = offer.offering || [];
      const wantingCodes = offer.wantingAny || [];

      let offeringType: StickerType | null = null;

      for (const code of offeringCodes) {
        const userSticker = userStickers.find(us => us.sticker.code === code && us.quantity > 0);
        if (!userSticker) {
          const err = `Você não possui a figurinha ${code} para oferecer.`;
          this.debug.error('ERROR', 'TradeService', err, { code, userId }, 'createOffer');
          const ms = this.debug.endTimer('createOffer');
          this.debug.logMethodExit('TradeService', 'createOffer', { error: err }, ms);
          return throwError(() => new Error(err));
        }
        if (!offeringType) {
          offeringType = userSticker.sticker.type;
        }
        if (userSticker.obtainedAt) {
          const obtainedTime = new Date(userSticker.obtainedAt).getTime();
          if (Date.now() - obtainedTime < 24 * 60 * 60 * 1000) {
            const err = `A figurinha ${code} está em cooldown de 24h para trocas.`;
            this.debug.error('ERROR', 'TradeService', err, { code, cooldownRemaining: 24 * 60 * 60 * 1000 - (Date.now() - obtainedTime) }, 'createOffer');
            const ms = this.debug.endTimer('createOffer');
            this.debug.logMethodExit('TradeService', 'createOffer', { error: err }, ms);
            return throwError(() => new Error(err));
          }
        }
      }

      for (const wantedCode of wantingCodes) {
        const allStickers = this.stickerService.userCollection();
        const wantedSticker = allStickers.find(us => us.sticker.code === wantedCode);
        if (wantedSticker && offeringType && wantedSticker.sticker.type !== offeringType) {
          const err = `Trocas somente entre figurinhas do mesmo tipo. Você oferece "${offeringType}" mas pede "${wantedSticker.sticker.type}".`;
          this.debug.error('ERROR', 'TradeService', err, { offeringType, wantedType: wantedSticker.sticker.type }, 'createOffer');
          const ms = this.debug.endTimer('createOffer');
          this.debug.logMethodExit('TradeService', 'createOffer', { error: err }, ms);
          return throwError(() => new Error(err));
        }
      }

      const newOffer: TradeOffer = {
        id: `t${Date.now()}`, offeredBy: userId, offererProfile: user || undefined,
        offering: offeringCodes, wantingAny: wantingCodes,
        status: 'OPEN', expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), views: 0, createdAt: new Date().toISOString(),
      };

      this.debug.logAudit('TradeService', `Oferta criada por ${userId}`, { offerId: newOffer.id, offering: offeringCodes, wantingAny: wantingCodes });

      const current = this.activeOffers();
      this.activeOffers.set([newOffer, ...current]);
      const ms = this.debug.endTimer('createOffer');
      this.debug.logMethodExit('TradeService', 'createOffer', { offerId: newOffer.id, totalOffers: current.length + 1 }, ms);
      return of(newOffer).pipe(delay(500));
    }
    return of({} as TradeOffer);
  }

  acceptOffer(offerId: string): Observable<void> {
    this.debug.logMethodEntry('TradeService', 'acceptOffer', { offerId });
    const timer = this.debug.startTimer('acceptOffer');
    if (environment.useMockData) {
      const offer = this.activeOffers().find(o => o.id === offerId);
      if (!offer) {
        const err = 'Oferta não encontrada.';
        this.debug.error('ERROR', 'TradeService', err, { offerId }, 'acceptOffer');
        const ms = this.debug.endTimer('acceptOffer');
        this.debug.logMethodExit('TradeService', 'acceptOffer', { error: err }, ms);
        return throwError(() => new Error(err));
      }
      if (offer.status !== 'OPEN') {
        const err = 'Esta oferta não está mais disponível.';
        this.debug.error('ERROR', 'TradeService', err, { offerId, status: offer.status }, 'acceptOffer');
        const ms = this.debug.endTimer('acceptOffer');
        this.debug.logMethodExit('TradeService', 'acceptOffer', { error: err }, ms);
        return throwError(() => new Error(err));
      }

      this.debug.logAudit('TradeService', `Execução de troca iniciada`, { offerId, offeredBy: offer.offeredBy, offering: offer.offering, wantingAny: offer.wantingAny });

      return of(undefined).pipe(
        delay(1000),
        tap(() => {
          this.debug.logAudit('TradeService', `Troca concluída com sucesso`, { offerId });
          this.activeOffers.update(offers => offers.map(o => o.id === offerId ? { ...o, status: 'COMPLETED' } : o));
          this.audioService.play('trade_success');
          this.userService.recordTradeCompleted();
          this.gamificationService.checkMissionCompletion('trade');
          this.gamificationService.checkBadgeConditions();
          const ms = this.debug.endTimer('acceptOffer');
          this.debug.logMethodExit('TradeService', 'acceptOffer', { success: true, offerId }, ms);
        })
      );
    }
    return of(undefined);
  }

  convertDuplicatesToCoins(stickerIds: string[]): Observable<{ coinsEarned: number; converted: number }> {
    this.debug.logMethodEntry('TradeService', 'convertDuplicatesToCoins', { stickerIds });
    const timer = this.debug.startTimer('convertDuplicatesToCoins');
    if (environment.useMockData) {
      const collection = this.stickerService.userCollection();
      let totalCoins = 0;
      let converted = 0;
      const details: { code: string; rarity: number; coins: number }[] = [];

      for (const stickerId of stickerIds) {
        const userSticker = collection.find(us => us.stickerId === stickerId);
        if (!userSticker || userSticker.duplicates <= 0) continue;
        const rarity = userSticker.sticker.rarity;
        const baseRate = DUPLICATE_CONVERSION_RATES[rarity] ?? 5;
        const duplicateNumber = userSticker.duplicates;
        const coinsForThis = getConversionRate(baseRate, duplicateNumber);
        totalCoins += coinsForThis;
        converted++;
        details.push({ code: userSticker.sticker.code, rarity, coins: coinsForThis });
      }

      if (totalCoins > 0) {
        this.userService.addCoins(totalCoins);
        this.debug.logAudit('TradeService', `Conversão de duplicatas: ${converted} stickers → ${totalCoins} Fúria Coins`, { details, totalCoins, converted });
      } else {
        this.debug.info('METHOD', 'TradeService', `Nenhuma figurinha para converter`, { stickerIds });
      }

      const ms = this.debug.endTimer('convertDuplicatesToCoins');
      this.debug.logMethodExit('TradeService', 'convertDuplicatesToCoins', { coinsEarned: totalCoins, converted }, ms);
      return of({ coinsEarned: totalCoins, converted }).pipe(delay(500));
    }
    return of({ coinsEarned: 0, converted: 0 });
  }

  cancelOffer(offerId: string): Observable<void> {
    this.debug.logMethodEntry('TradeService', 'cancelOffer', { offerId });
    const timer = this.debug.startTimer('cancelOffer');
    if (environment.useMockData) {
      const user = this.userService.currentUser();
      const userId = user?.id || 'u1';
      const offer = this.activeOffers().find(o => o.id === offerId);
      if (!offer) {
        const err = 'Oferta não encontrada.';
        this.debug.error('ERROR', 'TradeService', err, { offerId }, 'cancelOffer');
        const ms = this.debug.endTimer('cancelOffer');
        this.debug.logMethodExit('TradeService', 'cancelOffer', { error: err }, ms);
        return throwError(() => new Error(err));
      }
      if (offer.offeredBy !== userId) {
        const err = 'Esta oferta não é sua.';
        this.debug.error('ERROR', 'TradeService', err, { offerId, owner: offer.offeredBy, requester: userId }, 'cancelOffer');
        const ms = this.debug.endTimer('cancelOffer');
        this.debug.logMethodExit('TradeService', 'cancelOffer', { error: err }, ms);
        return throwError(() => new Error(err));
      }
      this.debug.logAudit('TradeService', `Oferta cancelada`, { offerId });
      this.activeOffers.update(offers => offers.filter(o => o.id !== offerId));
      const ms = this.debug.endTimer('cancelOffer');
      this.debug.logMethodExit('TradeService', 'cancelOffer', { success: true }, ms);
      return of(undefined).pipe(delay(300));
    }
    return of(undefined);
  }

  rejectOffer(offerId: string): Observable<void> {
    this.debug.logMethodEntry('TradeService', 'rejectOffer', { offerId });
    const timer = this.debug.startTimer('rejectOffer');
    if (environment.useMockData) {
      const offer = this.activeOffers().find(o => o.id === offerId);
      if (!offer) {
        const err = 'Oferta não encontrada.';
        this.debug.error('ERROR', 'TradeService', err, { offerId }, 'rejectOffer');
        const ms = this.debug.endTimer('rejectOffer');
        this.debug.logMethodExit('TradeService', 'rejectOffer', { error: err }, ms);
        return throwError(() => new Error(err));
      }
      this.debug.logAudit('TradeService', `Oferta rejeitada`, { offerId });
      this.activeOffers.update(offers => offers.map(o => o.id === offerId ? { ...o, status: 'EXPIRED' } : o));
      const ms = this.debug.endTimer('rejectOffer');
      this.debug.logMethodExit('TradeService', 'rejectOffer', { success: true }, ms);
      return of(undefined).pipe(delay(300));
    }
    return of(undefined);
  }

  joinGroup(groupId: string): Observable<void> {
    this.debug.logMethodEntry('TradeService', 'joinGroup', { groupId });
    const timer = this.debug.startTimer('joinGroup');
    if (environment.useMockData) {
      const group = this.tradeGroups().find(g => g.id === groupId);
      if (!group) {
        const err = 'Grupo não encontrado.';
        this.debug.error('ERROR', 'TradeService', err, { groupId }, 'joinGroup');
        const ms = this.debug.endTimer('joinGroup');
        this.debug.logMethodExit('TradeService', 'joinGroup', { error: err }, ms);
        return throwError(() => new Error(err));
      }
      if (group.memberCount >= group.maxMembers) {
        const err = 'Este grupo está lotado.';
        this.debug.error('ERROR', 'TradeService', err, { groupId, memberCount: group.memberCount, maxMembers: group.maxMembers }, 'joinGroup');
        const ms = this.debug.endTimer('joinGroup');
        this.debug.logMethodExit('TradeService', 'joinGroup', { error: err }, ms);
        return throwError(() => new Error(err));
      }
      this.debug.logAudit('TradeService', `Usuário entrou no grupo`, { groupId, groupName: group.name, memberCountBefore: group.memberCount });
      this.tradeGroups.update(groups => groups.map(g =>
        g.id === groupId ? { ...g, memberCount: g.memberCount + 1 } : g
      ));
      const ms = this.debug.endTimer('joinGroup');
      this.debug.logMethodExit('TradeService', 'joinGroup', { success: true, memberCountAfter: group.memberCount + 1 }, ms);
      return of(undefined).pipe(delay(300));
    }
    return of(undefined);
  }

  getUserDuplicates(): string[] {
    this.debug.logMethodEntry('TradeService', 'getUserDuplicates');
    const collection = this.stickerService.userCollection();
    const duplicates = collection.filter(us => us.duplicates > 0).map(us => us.sticker.code);
    this.debug.logMethodExit('TradeService', 'getUserDuplicates', { count: duplicates.length });
    return duplicates;
  }
}
