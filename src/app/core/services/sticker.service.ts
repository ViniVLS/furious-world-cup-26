import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Sticker, UserSticker } from '../models/sticker.model';
import { MOCK_PLAYERS } from '../data/mock-players';
import { environment } from '../../../environments/environment';

const MOCK_STICKERS: Sticker[] = MOCK_PLAYERS.map((player, index) => {
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

@Injectable({ providedIn: 'root' })
export class StickerService {

  // Signals reativos para estado do álbum
  readonly userCollection   = signal<UserSticker[]>([]);
  readonly albumProgress    = signal<{ edition2022: number; edition2026: number }>({
    edition2022: 0, edition2026: 0
  });

  getAllStickers(): Observable<Sticker[]> {
    if (environment.useMockData) {
      return of(MOCK_STICKERS).pipe(delay(300));
    }
    // TODO Fase 3: return this.http.get<Sticker[]>(`${environment.supabaseUrl}/rest/v1/stickers`);
    return of([]);
  }

  getUserCollection(): Observable<UserSticker[]> {
    if (environment.useMockData) {
      return of(this.userCollection()).pipe(delay(300));
    }
    // TODO Fase 3: Supabase query
    return of([]);
  }

  addStickersToCollection(stickers: Sticker[]): Observable<void> {
    if (environment.useMockData) {
      const current = this.userCollection();
      const updated = [...current];

      stickers.forEach(sticker => {
        const existingIndex = updated.findIndex(us => us.stickerId === sticker.id);
        if (existingIndex > -1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
            duplicates: updated[existingIndex].duplicates + 1
          };
        } else {
          updated.push({
            stickerId: sticker.id,
            sticker: sticker,
            quantity: 1,
            inAlbum: 0,
            duplicates: 0,
            obtainedAt: new Date().toISOString()
          });
        }
      });

      this.userCollection.set(updated);
      this.updateAlbumProgress();
      return of(undefined).pipe(delay(200));
    }
    return of(undefined);
  }

  private updateAlbumProgress(): void {
    const collection = this.userCollection();
    const count2022 = collection.filter(us => us.sticker.edition === '2022' && us.inAlbum === 1).length;
    const count2026 = collection.filter(us => us.sticker.edition === '2026' && us.inAlbum === 1).length;
    
    // Mock total counts for progress calculation
    const total2022 = 600; 
    const total2026 = 800;

    this.albumProgress.set({
      edition2022: Math.floor((count2022 / total2022) * 100),
      edition2026: Math.floor((count2026 / total2026) * 100)
    });
  }

  placeInAlbum(stickerId: string): Observable<void> {
    if (environment.useMockData) {
      this.userCollection.update(collection => {
        return collection.map(us => {
          if (us.stickerId === stickerId && us.inAlbum === 0) {
            return { ...us, inAlbum: 1 };
          }
          return us;
        });
      });
      this.updateAlbumProgress();
      return of(undefined).pipe(delay(200));
    }
    return of(undefined);
  }
}
