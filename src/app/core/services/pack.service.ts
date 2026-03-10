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

// Simulates server-side state for anti-pity
let packsWithoutLegendary = 0;
// Simulates server-side rate limiting
const lastOpenings: number[] = [];

const PACK_COSTS: Record<PackType, number> = {
  basic: 100,
  plus: 180,
  elite: 300,
  legendary: 500,
  copa: 250
};

function getBaseProbabilities(albumCompletionPercentage: number, packsWithoutLegendary: number) {
  let pComum = 60;
  let pEspecial = 25;
  let pEpica = 10;
  let pLendaria = 4;
  const pFurious = 1;

  if (albumCompletionPercentage < 50) {
    pComum += 10;
    pEspecial -= 10; 
  } else if (albumCompletionPercentage >= 50 && albumCompletionPercentage < 80) {
    pEspecial += 8;
    pComum -= 5;
    pEpica -= 3; 
  } else if (albumCompletionPercentage >= 80) {
    pEpica += 5;
    pLendaria += 2;
    pComum -= 15;
    pEspecial += 8; 
  }

  // Anti-pity: A cada 50 pacotes sem Lendária -> +0.5% acumulativo até sair uma
  const antiPityBonus = Math.floor(packsWithoutLegendary / 50) * 0.5;
  pLendaria += antiPityBonus;
  pComum -= antiPityBonus;

  return { pComum, pEspecial, pEpica, pLendaria, pFurious };
}

function rollRarity(probs: { pComum: number, pEspecial: number, pEpica: number, pLendaria: number, pFurious: number }): number {
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
    code,
    playerId: player.id,
    player: player,
    type: 'player',
    edition: edition,
    country: player.country,
    rarity: player.rarity,
    imageUrl: player.imageUrl,
    name: player.displayName,
    description: player.funFact
  };
}

function generateMockPackResult(packType: PackType, albumCompletionPercentage = 30, isPhygital = false): PackOpeningResult {
  const probs = getBaseProbabilities(albumCompletionPercentage, packsWithoutLegendary);
  
  let quantity = 5;
  let minEspecial = 0;
  let minEpica = 0;
  let minLendaria = 0;
  let furiousChance = false;

  switch (packType) {
    case 'basic':
      quantity = 5;
      break;
    case 'plus':
      quantity = 10;
      minEspecial = 1;
      break;
    case 'elite':
      quantity = 20;
      minEpica = 1;
      break;
    case 'legendary':
      quantity = 5;
      minLendaria = 1;
      break;
    case 'copa':
      quantity = 15;
      minEspecial = 3;
      furiousChance = true;
      break;
  }

  const stickers: Sticker[] = [];
  let hasLegendary = false;

  for (let i = 0; i < quantity; i++) {
    let rarity = rollRarity(probs);
    
    if (i === 0 && minLendaria > 0) rarity = Math.max(rarity, 4);
    if (i === 0 && minEpica > 0) rarity = Math.max(rarity, 3);
    if (i < minEspecial) rarity = Math.max(rarity, 2);
    
    if (furiousChance && i === quantity - 1 && Math.random() < 0.05) {
      rarity = 5;
    }

    if (rarity >= 4) hasLegendary = true;

    stickers.push(generateMockSticker(rarity));
  }

  if (isPhygital) {
    const physicalSticker = generateMockSticker(3); 
    physicalSticker.isPhysicalEdition = true;
    stickers.push(physicalSticker);
  }

  if (hasLegendary) {
    packsWithoutLegendary = 0;
  } else {
    packsWithoutLegendary++;
  }

  return {
    stickers,
    newCount: 0, // Calculated after saving
    duplicateCount: 0
  };
}

@Injectable({ providedIn: 'root' })
export class PackService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private stickerService = inject(StickerService);

  openPack(packType: PackType, isPhygital = false): Observable<PackOpeningResult> {
    if (environment.useMockData) {
      // 1. Rate limiting (máx. 10 aberturas/min)
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      while (lastOpenings.length > 0 && lastOpenings[0] < oneMinuteAgo) {
        lastOpenings.shift();
      }
      if (lastOpenings.length >= 10) {
        return throwError(() => new Error('🚨 Rate limit: máx. 10 aberturas/min. Tente novamente em breve.'));
      }
      lastOpenings.push(now);

      // 2. Verificar saldo e debitar ANTES de gerar (atômico)
      const cost = PACK_COSTS[packType];
      const success = this.userService.deductCoins(cost);
      if (!success) {
        return throwError(() => new Error('Saldo insuficiente em Fúria Coins.'));
      }

      // 3. Gerar figurinhas com seed no servidor (simulado)
      // 4. Registrar em log imutável ANTES de retornar ao cliente (simulado)
      console.log(`[AUDIT LOG] User u1 opened ${packType} pack. Cost: ${cost}. Timestamp: ${new Date().toISOString()}`);

      const albumProgress = this.stickerService.albumProgress();
      const avgProgress = (albumProgress.edition2022 + albumProgress.edition2026) / 2;
      
      const result = generateMockPackResult(packType, avgProgress, isPhygital);

      // 5. Salvar figurinhas e calcular novos/repetidos
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

          return of(result).pipe(delay(1000));
        }),
        tap(res => {
          console.log(`[AUDIT LOG] Pack result generated. Stickers: ${res.stickers.length}. New: ${res.newCount}.`);
        })
      );
    }

    return this.http.post<PackOpeningResult>(
      `${environment.supabaseUrl}/functions/v1/open-pack`,
      { packType, isPhygital }
    );
  }
}
