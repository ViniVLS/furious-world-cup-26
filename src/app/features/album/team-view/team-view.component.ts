import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StickerCardComponent } from '../../../shared/components/sticker-card/sticker-card.component';
import { Sticker } from '../../../core/models/sticker.model';
import { MatIconModule } from '@angular/material/icon';
import { AlbumProgressService, AlbumPagePhase } from '../../../core/services/album-progress.service';
import { StickerService } from '../../../core/services/sticker.service';

// Total de figurinhas por seleção por edição (SK02 — dados mock por enquanto)
const TOTAL_STICKERS_PER_TEAM: Record<string, number> = {
  '2022': 9,
  '2026': 12,
};

@Component({
  selector: 'app-team-view',
  standalone: true,
  imports: [CommonModule, RouterLink, StickerCardComponent, MatIconModule],
  templateUrl: './team-view.component.html',
  styleUrl: './team-view.component.css'
})
export class TeamViewComponent implements OnInit, OnDestroy {
  edition = '';
  countryCode = '';

  private route = inject(ActivatedRoute);
  private albumProgress = inject(AlbumProgressService);
  private stickerService = inject(StickerService);

  // SK07 — Estado de confete e overlay de conclusão
  showConfetti = signal(false);
  showCompletionOverlay = signal(false);
  private confettiTimeout?: ReturnType<typeof setTimeout>;

  stickers: { sticker: Sticker; collected: boolean }[] = [
    {
      sticker: { id: '1', code: '2022-BRA-01', type: 'shield', edition: '2022', country: 'BRA', rarity: 2, imageUrl: 'https://picsum.photos/seed/brashield/120/168', name: 'Escudo Brasil' },
      collected: true
    },
    {
      sticker: { id: '2', code: '2022-BRA-02', type: 'player', edition: '2022', country: 'BRA', rarity: 1, imageUrl: 'https://picsum.photos/seed/bra2/120/168', name: 'Alisson' },
      collected: false
    },
    {
      sticker: { id: '3', code: '2022-BRA-10', type: 'player', edition: '2022', country: 'BRA', rarity: 5, imageUrl: 'https://picsum.photos/seed/bra10/120/168', name: 'Neymar Jr' },
      collected: true
    }
  ];

  /** Progressão calculada para esta seleção/edição */
  progress = computed(() => {
    const total = TOTAL_STICKERS_PER_TEAM[this.edition] ?? 10;
    return this.albumProgress.getTeamProgress(this.countryCode, this.edition, total);
  });

  /** Fase visual computada */
  phase = computed<AlbumPagePhase>(() => this.progress().phase);

  /** % de progresso (0–100) */
  progressPct = computed(() => this.progress().pct);

  /** Label de status para a barra de progresso */
  progressLabel = computed(() => {
    const p = this.progress();
    if (p.phase === 'complete') return '✅ COMPLETO!';
    if (p.phase === 'most') return `Quase lá! ${p.collected}/${p.total}`;
    if (p.phase === 'partial') return `${p.collected}/${p.total} figurinhas`;
    return 'Comece a colecionar!';
  });

  /** Retorna a classe CSS de fase para cada card de figurinha */
  getStickerPhaseClass(collected: boolean): string {
    if (!collected) return 'sticker-phase--missing';
    switch (this.phase()) {
      case 'complete': return 'sticker-phase--complete';
      case 'most': return 'sticker-phase--most';
      case 'partial': return 'sticker-phase--partial';
      default: return 'sticker-phase--missing';
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.edition = params.get('edition') || '';
      this.countryCode = params.get('countryCode') || '';
      this.checkCompletion();
    });
  }

  private checkCompletion() {
    const prog = this.progress();
    if (prog.isNewlyCompleted) {
      this.triggerCompletion();
    }
  }

  /** SK07 — Dispara animação de confete e overlay ao completar 100% */
  triggerCompletion() {
    this.showConfetti.set(true);
    this.showCompletionOverlay.set(true);

    this.confettiTimeout = setTimeout(() => {
      this.showConfetti.set(false);
    }, 5000); // confete dura 5s
  }

  dismissOverlay() {
    this.showCompletionOverlay.set(false);
    this.albumProgress.dismissCompletion();
  }

  ngOnDestroy() {
    if (this.confettiTimeout) clearTimeout(this.confettiTimeout);
  }
}


