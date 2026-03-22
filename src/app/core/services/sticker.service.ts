import { Injectable, signal, effect, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Sticker, UserSticker } from '../models/sticker.model';
import { MOCK_PLAYERS } from '../data/mock-players';
import { environment } from '../../../environments/environment';
import { DebugService } from '../../../debug/debug.service';

export const MOCK_STICKERS: Sticker[] = MOCK_PLAYERS.map((player, index) => {
  const edition = player.worldCups[0];
  const seq = index + 1;
  const code = `${edition}-${player.country}-${seq.toString().padStart(2, '0')}`;
  return {
    id: `sticker-${player.id}`,
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
});

const STORAGE_KEY_COLLECTION = 'furia-sticker-collection';
const STORAGE_KEY_ALBUM_PROGRESS = 'furia-album-progress';

@Injectable({ providedIn: 'root' })
export class StickerService {
  private readonly debug = inject(DebugService);

  readonly userCollection = signal<UserSticker[]>(this.loadCollection());
  readonly albumProgress = signal<{ edition2022: number; edition2026: number }>(this.loadAlbumProgress());

  constructor() {
    this.debug.logLifecycle('StickerService', 'constructor');

    effect(() => {
      const collection = this.userCollection();
      this.saveCollection(collection);
      this.debug.logStateChange('StickerService', 'userCollection', null, `length=${collection.length}`);
    });

    effect(() => {
      const progress = this.albumProgress();
      this.saveAlbumProgress(progress);
    });
  }

  private loadCollection(): UserSticker[] {
    if (typeof window === 'undefined') return [];
    this.debug.logMethodEntry('StickerService', 'loadCollection');
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COLLECTION);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.debug.info('STATE', 'StickerService', `Coleção carregada do localStorage: ${parsed.length} figurinhas`);
        this.debug.logMethodExit('StickerService', 'loadCollection', { count: parsed.length });
        return parsed;
      }
    } catch (e) {
      this.debug.error('ERROR', 'StickerService', 'Erro ao carregar coleção do localStorage', e, 'loadCollection');
    }
    this.debug.info('STATE', 'StickerService', 'Nenhuma coleção encontrada no localStorage, iniciando vazia');
    this.debug.logMethodExit('StickerService', 'loadCollection', { count: 0 });
    return [];
  }

  private saveCollection(collection: UserSticker[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));
    } catch (e) {
      this.debug.error('ERROR', 'StickerService', 'Erro ao salvar coleção no localStorage', e, 'saveCollection');
    }
  }

  private loadAlbumProgress(): { edition2022: number; edition2026: number } {
    if (typeof window === 'undefined') return { edition2022: 0, edition2026: 0 };
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALBUM_PROGRESS);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.debug.logMethodExit('StickerService', 'loadAlbumProgress', parsed);
        return parsed;
      }
    } catch (e) {
      this.debug.error('ERROR', 'StickerService', 'Erro ao carregar progresso do localStorage', e, 'loadAlbumProgress');
    }
    return { edition2022: 0, edition2026: 0 };
  }

  private saveAlbumProgress(progress: { edition2022: number; edition2026: number }): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_ALBUM_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      this.debug.error('ERROR', 'StickerService', 'Erro ao salvar progresso no localStorage', e, 'saveAlbumProgress');
    }
  }

  getAllStickers(): Observable<Sticker[]> {
    this.debug.logMethodEntry('StickerService', 'getAllStickers');
    if (environment.useMockData) {
      this.debug.logMethodExit('StickerService', 'getAllStickers', { count: MOCK_STICKERS.length, source: 'mock' });
      return of(MOCK_STICKERS).pipe(delay(300));
    }
    this.debug.info('METHOD', 'StickerService', 'Supabase backend não implementado, usando mock');
    return of(MOCK_STICKERS).pipe(delay(300));
  }

  getUserCollection(): Observable<UserSticker[]> {
    this.debug.logMethodEntry('StickerService', 'getUserCollection');
    if (environment.useMockData) {
      const result = this.userCollection();
      this.debug.logMethodExit('StickerService', 'getUserCollection', { count: result.length });
      return of(result).pipe(delay(300));
    }
    return of([]).pipe(delay(300));
  }

  addStickersToCollection(stickers: Sticker[]): Observable<void> {
    this.debug.logMethodEntry('StickerService', 'addStickersToCollection', { count: stickers.length });
    if (environment.useMockData) {
      const timer = this.debug.startTimer('addStickersToCollection');
      const current = this.userCollection();
      const updated = [...current];

      const added: string[] = [];
      const duplicates: string[] = [];

      stickers.forEach(sticker => {
        const existingIndex = updated.findIndex(us => us.stickerId === sticker.id);
        if (existingIndex > -1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
            duplicates: updated[existingIndex].duplicates + 1
          };
          duplicates.push(sticker.code);
        } else {
          updated.push({
            stickerId: sticker.id,
            sticker: sticker,
            quantity: 1,
            inAlbum: 0,
            duplicates: 0,
            obtainedAt: new Date().toISOString()
          });
          added.push(sticker.code);
        }
      });

      this.debug.logAudit('StickerService', `Adicionadas: ${added.length} | Duplicadas: ${duplicates.length}`, {
        added, duplicates, totalBefore: current.length, totalAfter: updated.length
      });

      this.userCollection.set(updated);
      this.updateAlbumProgress();
      const ms = this.debug.endTimer('addStickersToCollection');
      this.debug.logMethodExit('StickerService', 'addStickersToCollection', { added: added.length, duplicates: duplicates.length }, ms);
      return of(undefined).pipe(delay(200));
    }
    return of(undefined);
  }

  private updateAlbumProgress(): void {
    this.debug.logMethodEntry('StickerService', 'updateAlbumProgress');
    const collection = this.userCollection();
    const count2022 = collection.filter(us => us.sticker.edition === '2022' && us.inAlbum === 1).length;
    const count2026 = collection.filter(us => us.sticker.edition === '2026' && us.inAlbum === 1).length;
    const total2022 = 600;
    const total2026 = 800;

    this.albumProgress.set({
      edition2022: Math.floor((count2022 / total2022) * 100),
      edition2026: Math.floor((count2026 / total2026) * 100)
    });

    this.debug.logStateChange('StickerService', 'albumProgress',
      { edition2022: 0, edition2026: 0 },
      { edition2022: Math.floor((count2022 / total2022) * 100), edition2026: Math.floor((count2026 / total2026) * 100) }
    );
    this.debug.logMethodExit('StickerService', 'updateAlbumProgress');
  }

  placeInAlbum(stickerId: string): Observable<void> {
    this.debug.logMethodEntry('StickerService', 'placeInAlbum', { stickerId });
    if (environment.useMockData) {
      this.userCollection.update(collection => {
        return collection.map(us => {
          if (us.stickerId === stickerId && us.inAlbum === 0) {
            this.debug.info('AUDIT', 'StickerService', `Figurinha ${stickerId} colada no álbum`, { stickerId, code: us.sticker.code });
            return { ...us, inAlbum: 1 };
          }
          return us;
        });
      });
      this.updateAlbumProgress();
      this.debug.logMethodExit('StickerService', 'placeInAlbum', { stickerId });
      return of(undefined).pipe(delay(200));
    }
    return of(undefined);
  }

  getStickerById(stickerId: string): Sticker | null {
    this.debug.logMethodEntry('StickerService', 'getStickerById', { stickerId });
    const collection = this.userCollection();
    const fromCollection = collection.find(us => us.stickerId === stickerId);
    if (fromCollection) {
      this.debug.logMethodExit('StickerService', 'getStickerById', { found: 'collection', code: fromCollection.sticker.code });
      return fromCollection.sticker;
    }
    const fromAll = MOCK_STICKERS.find(s => s.id === stickerId);
    this.debug.logMethodExit('StickerService', 'getStickerById', { found: fromAll ? 'mock' : null, stickerId });
    return fromAll || null;
  }
}
