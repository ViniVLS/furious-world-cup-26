import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, delay, tap, switchMap } from 'rxjs';
import { PackOpeningResult, PackType } from '../models/pack.model';
import { Sticker } from '../models/sticker.model';
import { Player } from '../models/player.model';
import { MOCK_PLAYERS } from '../data/mock-players';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';
import { StickerService } from './sticker.service';
import { GamificationService } from './gamification.service';
import { DebugService } from '../../../debug/debug.service';

const STORAGE_KEY_PACK_STATE = 'furia-pack-state';

interface PackState {
  packsWithoutLegendary: number;
  lastOpenings: number[];
}

function loadPackState(debug: DebugService): PackState {
  if (typeof window === 'undefined') return { packsWithoutLegendary: 0, lastOpenings: [] };
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PACK_STATE);
    if (stored) {
      const parsed = JSON.parse(stored);
      debug.info('STATE', 'PackService', `Estado de pacotes carregado. Packs sem Lendária: ${parsed.packsWithoutLegendary}`);
      return parsed;
    }
  } catch (e) {
    debug.error('ERROR', 'PackService', 'Erro ao carregar estado do localStorage', e, 'loadPackState');
  }
  return { packsWithoutLegendary: 0, lastOpenings: [] };
}

function savePackState(state: PackState, debug: DebugService): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PACK_STATE, JSON.stringify(state));
  } catch (e) {
    debug.error('ERROR', 'PackService', 'Erro ao salvar estado no localStorage', e, 'savePackState');
  }
}

let state: PackState;

const PACK_COSTS: Record<PackType, number> = {
  basic: 100, plus: 180, elite: 300, legendary: 500, copa: 250
};

function getBaseProbabilities(albumCompletionPercentage: number, packsWithoutLegendary: number) {
  let pComum = 60, pEspecial = 25, pEpica = 10, pLendaria = 4;
  const pFurious = 1;

  if (albumCompletionPercentage < 50) {
    pComum += 10; pEspecial -= 10;
  } else if (albumCompletionPercentage >= 50 && albumCompletionPercentage < 80) {
    pEspecial += 8; pComum -= 5; pEpica -= 3;
  } else if (albumCompletionPercentage >= 80) {
    pEpica += 5; pLendaria += 2; pComum -= 15; pEspecial += 8;
  }

  const antiPityBonus = Math.floor(packsWithoutLegendary / 50) * 0.5;
  pLendaria += antiPityBonus;
  pComum -= antiPityBonus;

  return { pComum, pEspecial, pEpica, pLendaria, pFurious };
}

function rollRarity(probs: { pComum: number; pEspecial: number; pEpica: number; pLendaria: number; pFurious: number }): number {
  const roll = Math.random() * 100;
  let cumulative = 0;
  cumulative += probs.pFurious;
  if (roll <= cumulative) return 5;
  cumulative += probs.pLendaria;
  if (roll <= cumulative) return 4;
  cumulative += probs.pEpica;
  if (roll <= cumulative) return 3;
  cumulative += probs.pEspecial;
  if (roll <= cumulative) return 2;
  return 1;
}

function validatePlayer(player: Player): boolean {
  if (!player.worldCups || player.worldCups.length === 0) return false;
  if (!player.country || player.country.length !== 3) return false;
  if (!player.imageUrl || player.imageUrl.startsWith('http')) return false;
  if (!player.verified) return false;
  if (![1, 2, 3, 4, 5].includes(player.rarity)) return false;
  return true;
}

function getValidPlayersByRarity(rarity: number): Player[] {
  return MOCK_PLAYERS.filter(p => p.rarity === rarity && validatePlayer(p));
}

function generateMockSticker(rarity: number): Sticker {
  const validPlayers = getValidPlayersByRarity(rarity);
  let player: Player;
  if (validPlayers.length > 0) {
    player = validPlayers[Math.floor(Math.random() * validPlayers.length)];
  } else {
    const anyValid = MOCK_PLAYERS.filter(p => validatePlayer(p));
    player = anyValid[Math.floor(Math.random() * anyValid.length)];
  }
  const edition = player.worldCups[0];
  const seq = Math.floor(Math.random() * 20) + 1;
  const code = `${edition}-${player.country}-${seq.toString().padStart(2, '0')}`;
  return {
    id: `sticker-${player.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    code, playerId: player.id, player, type: 'player',
    edition, country: player.country, rarity: player.rarity,
    imageUrl: player.imageUrl, name: player.displayName, description: player.funFact
  };
}

function generateMockPackResult(packType: PackType, albumCompletionPercentage: number, isPhygital: boolean, ps: PackState) {
  const probs = getBaseProbabilities(albumCompletionPercentage, ps.packsWithoutLegendary);
  let quantity = 5, minEspecial = 0, minEpica = 0, minLendaria = 0, furiousChance = false;

  switch (packType) {
    case 'basic': quantity = 5; break;
    case 'plus': quantity = 10; minEspecial = 1; break;
    case 'elite': quantity = 20; minEpica = 1; break;
    case 'legendary': quantity = 5; minLendaria = 1; break;
    case 'copa': quantity = 15; minEspecial = 3; furiousChance = true; break;
  }

  const stickers: Sticker[] = [];
  let hasLegendary = false;

  for (let i = 0; i < quantity; i++) {
    let rarity = rollRarity(probs);
    if (i === 0 && minLendaria > 0) rarity = Math.max(rarity, 4);
    if (i === 0 && minEpica > 0) rarity = Math.max(rarity, 3);
    if (i < minEspecial) rarity = Math.max(rarity, 2);
    if (furiousChance && i === quantity - 1 && Math.random() < 0.05) rarity = 5;
    if (rarity >= 4) hasLegendary = true;
    stickers.push(generateMockSticker(rarity));
  }

  if (isPhygital) {
    const physicalSticker = generateMockSticker(3);
    physicalSticker.isPhysicalEdition = true;
    stickers.push(physicalSticker);
  }

  if (hasLegendary) ps.packsWithoutLegendary = 0; else ps.packsWithoutLegendary++;

  return { stickers, newCount: 0, duplicateCount: 0 } as PackOpeningResult;
}

@Injectable({ providedIn: 'root' })
export class PackService {
  private readonly debug = inject(DebugService);
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private stickerService = inject(StickerService);
  private gamificationService = inject(GamificationService);

  constructor() {
    this.debug.logLifecycle('PackService', 'constructor');
    state = loadPackState(this.debug);
  }

  openPack(packType: PackType, isPhygital = false): Observable<PackOpeningResult> {
    this.debug.logMethodEntry('PackService', 'openPack', { packType, isPhygital });
    const timer = this.debug.startTimer('openPack');
    if (environment.useMockData) {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      while (state.lastOpenings.length > 0 && state.lastOpenings[0] < oneMinuteAgo) {
        state.lastOpenings.shift();
      }
      if (state.lastOpenings.length >= 10) {
        const err = 'Rate limit: max 10 openings/min. Try again soon.';
        this.debug.error('ERROR', 'PackService', err, { openingsInLastMinute: state.lastOpenings.length }, 'openPack');
        const ms = this.debug.endTimer('openPack');
        this.debug.logMethodExit('PackService', 'openPack', { error: err }, ms);
        return throwError(() => new Error(err));
      }
      state.lastOpenings.push(now);
      savePackState(state, this.debug);

      const cost = PACK_COSTS[packType];
      this.debug.info('ECONOMY', 'PackService', `Tentando comprar pacote ${packType}`, { cost, userCoins: this.userService.currentUser()?.furyCoins });
      const success = this.userService.deductCoins(cost);
      if (!success) {
        state.lastOpenings.pop();
        savePackState(state, this.debug);
        const err = 'Insufficient Fúria Coins.';
        this.debug.error('ERROR', 'PackService', err, { cost, available: this.userService.currentUser()?.furyCoins }, 'openPack');
        const ms = this.debug.endTimer('openPack');
        this.debug.logMethodExit('PackService', 'openPack', { error: err }, ms);
        return throwError(() => new Error(err));
      }

      this.debug.logAudit('PackService', `Usuário abriu pacote ${packType}`, { packType, cost, timestamp: new Date().toISOString(), isPhygital });

      const albumProgress = this.stickerService.albumProgress();
      const avgProgress = (albumProgress.edition2022 + albumProgress.edition2026) / 2;
      this.debug.info('METHOD', 'PackService', `Gerando resultado do pacote. Album progress: ${avgProgress}%`, { avgProgress, antiPityCounter: state.packsWithoutLegendary });

      const result = generateMockPackResult(packType, avgProgress, isPhygital, state);
      savePackState(state, this.debug);

      return this.stickerService.addStickersToCollection(result.stickers).pipe(
        switchMap(() => {
          const collection = this.stickerService.userCollection();
          let newCount = 0;
          let duplicateCount = 0;
          result.stickers.forEach(s => {
            const userSticker = collection.find(us => us.stickerId === s.id);
            if (userSticker && userSticker.quantity === 1) {
              newCount++;
            } else {
              duplicateCount++;
            }
          });
          result.newCount = newCount;
          result.duplicateCount = duplicateCount;
          this.debug.info('METHOD', 'PackService', `Resultado do pacote processado`, { total: result.stickers.length, new: newCount, duplicates: duplicateCount });
          return of(result).pipe(delay(1000));
        }),
        tap(res => {
          this.debug.logAudit('PackService', `Resultado do pacote: ${res.stickers.length} stickers`, { newCount: res.newCount, duplicateCount: res.duplicateCount, packType, cost });
          this.gamificationService.awardFirstPackBadge();
          this.gamificationService.checkBadgeConditions();
          this.gamificationService.checkMissionCompletion('pack');
          const ms = this.debug.endTimer('openPack');
          this.debug.logMethodExit('PackService', 'openPack', { success: true, stickers: res.stickers.length, new: res.newCount, dup: res.duplicateCount }, ms);
        })
      );
    }

    return this.http.post<PackOpeningResult>(
      `${environment.supabaseUrl}/functions/v1/open-pack`,
      { packType, isPhygital }
    );
  }
}
