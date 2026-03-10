import { Injectable, inject, signal } from '@angular/core';
import { StickerService } from './sticker.service';

/**
 * SK06/SK07 — Progressão visual das páginas do álbum por seleção.
 *
 * Fase 0 — EMPTY    (0%)      : Cards cinza, silhueta do jogador
 * Fase 1 — PARTIAL  (1–49%)   : Cores, imagens reais, sem brilho
 * Fase 2 — MOST     (50–99%)  : Bordas neon pulsantes, efeito de brilho
 * Fase 3 — COMPLETE (100%)    : Animação de confete, selo dourado "COMPLETO"
 *
 * Cálculo: baseado nas figurinhas efetivamente coladas no álbum
 * (placedInAlbum === true), não apenas coletadas.
 */
export type AlbumPagePhase = 'empty' | 'partial' | 'most' | 'complete';

export interface TeamProgress {
    countryCode: string;
    edition: string;
    collected: number;
    total: number;
    pct: number;
    phase: AlbumPagePhase;
    isNewlyCompleted: boolean;  // true na primeira vez que chega a 100%
}

const PHASE_THRESHOLDS = {
    partial: 1,    // ≥1% → partial
    most: 50,      // ≥50% → most
    complete: 100, // 100% → complete
};

@Injectable({ providedIn: 'root' })
export class AlbumProgressService {
    private stickerService = inject(StickerService);

    /** Signal: set de chaves "{countryCode}-{edition}" que já foram notificadas como completas */
    private completedNotified = signal<Set<string>>(new Set());

    /** Signal global: fila de celebrações pendentes (nome do país que acabou de completar) */
    readonly completionQueue = signal<{ countryCode: string; edition: string }[]>([]);

    /**
     * Calcula o progresso e fase de uma página de seleção no álbum.
     * @param countryCode código da seleção (ex: "BRA")
     * @param edition edição (ex: "2022")
     * @param totalStickers total de figurinhas daquela seleção/edição no álbum
     */
    getTeamProgress(countryCode: string, edition: string, totalStickers: number): TeamProgress {
        const collection = this.stickerService.userCollection();

        const collected = collection.filter(
            us =>
                us.sticker.country === countryCode &&
                us.sticker.edition === edition &&
                us.inAlbum === 1
        ).length;

        const pct = totalStickers > 0 ? Math.round((collected / totalStickers) * 100) : 0;
        const phase = this.calculatePhase(pct);

        const key = `${countryCode}-${edition}`;
        const alreadyNotified = this.completedNotified().has(key);
        const isNewlyCompleted = phase === 'complete' && !alreadyNotified;

        if (isNewlyCompleted) {
            this.completedNotified.update(s => new Set([...s, key]));
            this.completionQueue.update(q => [...q, { countryCode, edition }]);
        }

        return { countryCode, edition, collected, total: totalStickers, pct, phase, isNewlyCompleted };
    }

    /** Calcula fase a partir da porcentagem */
    calculatePhase(pct: number): AlbumPagePhase {
        if (pct >= PHASE_THRESHOLDS.complete) return 'complete';
        if (pct >= PHASE_THRESHOLDS.most) return 'most';
        if (pct >= PHASE_THRESHOLDS.partial) return 'partial';
        return 'empty';
    }

    /** Remove a celebração mais antiga da fila (chamado após exibir o confete) */
    dismissCompletion() {
        this.completionQueue.update(q => q.slice(1));
    }
}
