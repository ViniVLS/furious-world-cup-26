import { Injectable, inject, signal } from '@angular/core';
import { StickerService } from './sticker.service';
import { DebugService } from '../../../debug/debug.service';

export type AlbumPagePhase = 'empty' | 'partial' | 'most' | 'complete';

export interface TeamProgress {
  countryCode: string;
  edition: string;
  collected: number;
  total: number;
  pct: number;
  phase: AlbumPagePhase;
  isNewlyCompleted: boolean;
}

const PHASE_THRESHOLDS = {
  partial: 1,
  most: 50,
  complete: 100,
};

@Injectable({ providedIn: 'root' })
export class AlbumProgressService {
  private readonly debug = inject(DebugService);
  private stickerService = inject(StickerService);

  private completedNotified = signal<Set<string>>(new Set());
  readonly completionQueue = signal<{ countryCode: string; edition: string }[]>([]);

  constructor() {
    this.debug.logLifecycle('AlbumProgressService', 'constructor');
  }

  getTeamProgress(countryCode: string, edition: string, totalStickers: number): TeamProgress {
    this.debug.logMethodEntry('AlbumProgressService', 'getTeamProgress', { countryCode, edition, totalStickers });
    const timer = this.debug.startTimer('getTeamProgress');
    const collection = this.stickerService.userCollection();

    const collected = collection.filter(
      us => us.sticker.country === countryCode && us.sticker.edition === edition && us.inAlbum === 1
    ).length;

    const pct = totalStickers > 0 ? Math.round((collected / totalStickers) * 100) : 0;
    const phase = this.calculatePhase(pct);
    const key = `${countryCode}-${edition}`;
    const alreadyNotified = this.completedNotified().has(key);
    const isNewlyCompleted = phase === 'complete' && !alreadyNotified;

    if (isNewlyCompleted) {
      this.completedNotified.update(s => new Set([...s, key]));
      this.completionQueue.update(q => [...q, { countryCode, edition }]);
      this.debug.info('AUDIT', 'AlbumProgressService', `Seleção ${countryCode} (${edition}) COMPLETA! 🎉`, { countryCode, edition, collected, total: totalStickers, pct });
    }

    this.debug.info('STATE', 'AlbumProgressService', `Progresso de ${countryCode} (${edition}): ${pct}%`, { countryCode, edition, collected, total: totalStickers, pct, phase, isNewlyCompleted });
    const ms = this.debug.endTimer('getTeamProgress');
    this.debug.logMethodExit('AlbumProgressService', 'getTeamProgress', { countryCode, edition, pct, phase, collected, total: totalStickers }, ms);

    return { countryCode, edition, collected, total: totalStickers, pct, phase, isNewlyCompleted };
  }

  calculatePhase(pct: number): AlbumPagePhase {
    if (pct >= PHASE_THRESHOLDS.complete) return 'complete';
    if (pct >= PHASE_THRESHOLDS.most) return 'most';
    if (pct >= PHASE_THRESHOLDS.partial) return 'partial';
    return 'empty';
  }

  dismissCompletion() {
    this.debug.logMethodEntry('AlbumProgressService', 'dismissCompletion');
    const before = this.completionQueue().length;
    this.completionQueue.update(q => q.slice(1));
    this.debug.info('METHOD', 'AlbumProgressService', `Celebração dispensada. Fila: ${before} → ${before - 1}`);
    this.debug.logMethodExit('AlbumProgressService', 'dismissCompletion');
  }
}
