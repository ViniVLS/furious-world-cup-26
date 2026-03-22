import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StickerCardComponent } from '../../../shared/components/sticker-card/sticker-card.component';
import { Sticker } from '../../../core/models/sticker.model';
import { MatIconModule } from '@angular/material/icon';
import { AlbumProgressService, AlbumPagePhase } from '../../../core/services/album-progress.service';
import { StickerService } from '../../../core/services/sticker.service';
import { DebugService } from '../../../../debug/debug.service';

@Component({
  selector: 'app-team-view',
  standalone: true,
  imports: [CommonModule, RouterLink, StickerCardComponent, MatIconModule],
  templateUrl: './team-view.component.html',
  styleUrl: './team-view.component.css'
})
export class TeamViewComponent implements OnInit, OnDestroy {
  private readonly debug = inject(DebugService);
  edition = signal('');
  countryCode = signal('');

  private route = inject(ActivatedRoute);
  private albumProgress = inject(AlbumProgressService);
  private stickerService = inject(StickerService);

  showConfetti = signal(false);
  showCompletionOverlay = signal(false);
  private confettiTimeout?: ReturnType<typeof setTimeout>;
  private previousPhase = signal<AlbumPagePhase>('empty');

  stickers = computed<{ sticker: Sticker; collected: boolean }[]>(() => {
    const edition = this.edition();
    const country = this.countryCode();
    if (!edition || !country) return [];
    const collection = this.stickerService.userCollection();
    return collection
      .filter(us => us.sticker.country === country && us.sticker.edition === edition)
      .map(us => ({ sticker: us.sticker, collected: us.inAlbum === 1 }))
      .sort((a, b) => a.sticker.rarity - b.sticker.rarity);
  });

  totalStickers = computed(() => this.stickers().length);

  progress = computed(() => {
    const total = this.totalStickers();
    const country = this.countryCode();
    const edition = this.edition();
    if (!country || !edition || total === 0) {
      return { countryCode: country, edition, collected: 0, total: 0, pct: 0, phase: 'empty' as AlbumPagePhase, isNewlyCompleted: false };
    }
    return this.albumProgress.getTeamProgress(country, edition, total);
  });

  phase = computed<AlbumPagePhase>(() => this.progress().phase);
  progressPct = computed(() => this.progress().pct);

  progressLabel = computed(() => {
    const p = this.progress();
    if (p.phase === 'complete') return 'COMPLETO!';
    if (p.phase === 'most') return `Quase lá! ${p.collected}/${p.total}`;
    if (p.phase === 'partial') return `${p.collected}/${p.total} figurinhas`;
    return 'Comece a colecionar!';
  });

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
    this.debug.logLifecycle('TeamViewComponent', 'ngOnInit');
    this.route.paramMap.subscribe(params => {
      this.edition.set(params.get('edition') || '');
      this.countryCode.set(params.get('countryCode') || '');
      this.debug.info('STATE', 'TeamViewComponent', `Parâmetros resolved: edition=${this.edition()}, country=${this.countryCode()}`, { edition: this.edition(), countryCode: this.countryCode() });
    });
  }

  private checkCompletion() {
    const prog = this.progress();
    const prev = this.previousPhase();
    if (prog.phase === 'complete' && prev !== 'complete') {
      this.previousPhase.set('complete');
      this.debug.info('AUDIT', 'TeamViewComponent', `Seleção ${this.countryCode()} (${this.edition()}) COMPLETA!`);
      this.triggerCompletion();
    } else if (prog.phase !== 'complete') {
      this.previousPhase.set(prog.phase);
    }
  }

  triggerCompletion() {
    this.debug.logMethodEntry('TeamViewComponent', 'triggerCompletion');
    this.showConfetti.set(true);
    this.showCompletionOverlay.set(true);
    this.confettiTimeout = setTimeout(() => {
      this.showConfetti.set(false);
    }, 5000);
    this.debug.logMethodExit('TeamViewComponent', 'triggerCompletion');
  }

  dismissOverlay() {
    this.debug.logMethodEntry('TeamViewComponent', 'dismissOverlay');
    this.showCompletionOverlay.set(false);
    this.albumProgress.dismissCompletion();
    this.debug.logMethodExit('TeamViewComponent', 'dismissOverlay');
  }

  ngOnDestroy() {
    this.debug.logLifecycle('TeamViewComponent', 'ngOnDestroy');
    if (this.confettiTimeout) clearTimeout(this.confettiTimeout);
  }
}
