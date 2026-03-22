import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PackType } from '../../../core/models/pack.model';
import { PackService } from '../../../core/services/pack.service';
import { StickerCardComponent } from '../sticker-card/sticker-card.component';
import { Sticker } from '../../../core/models/sticker.model';
import { AudioService } from '../../../core/services/audio.service';
import { MatIconModule } from '@angular/material/icon';
import { DebugService } from '../../../../debug/debug.service';

@Component({
  selector: 'app-pack-opening',
  standalone: true,
  imports: [CommonModule, StickerCardComponent, MatIconModule],
  templateUrl: './pack-opening.component.html',
  styleUrl: './pack-opening.component.css'
})
export class PackOpeningComponent implements OnInit, OnChanges {
  @Input() packType: PackType = 'basic';
  @Input() isPhygital = false;
  @Output() complete = new EventEmitter<void>();

  step = 1;
  stickers: Sticker[] = [];
  newCount = 0;
  duplicateCount = 0;

  showSkeleton = false;
  private loadingTimeout: ReturnType<typeof setTimeout> | undefined;

  currentRevealIndex = 0;
  revealedStickers: boolean[] = [];

  isFirstTime = true;
  isDramaticPause = false;
  showConfetti = false;
  showFlash = false;

  private packService = inject(PackService);
  private platformId = inject(PLATFORM_ID);
  private audioService = inject(AudioService);
  private readonly debug = inject(DebugService);

  ngOnInit() {
    this.debug.logLifecycle('PackOpeningComponent', 'ngOnInit');
    this.debug.info('METHOD', 'PackOpeningComponent', `ngOnInit - type: ${this.packType}, isPhygital: ${this.isPhygital}`, { packType: this.packType, isPhygital: this.isPhygital });
    if (isPlatformBrowser(this.platformId)) {
      this.checkFirstTime();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.debug.logLifecycle('PackOpeningComponent', 'ngOnChanges');
    if (changes['packType']) {
      const prev = changes['packType'].previousValue;
      const curr = changes['packType'].currentValue;
      this.debug.info('METHOD', 'PackOpeningComponent', `ngOnChanges - packType: ${prev} -> ${curr}`, { previous: prev, current: curr });
      this.loadPack();
    }
    if (changes['isPhygital']) {
      this.debug.info('METHOD', 'PackOpeningComponent', `ngOnChanges - isPhygital alterado`, { isPhygital: this.isPhygital });
    }
  }

  private checkFirstTime() {
    if (isPlatformBrowser(this.platformId)) {
      const hasOpened = localStorage.getItem('has_opened_pack');
      this.isFirstTime = !hasOpened;
      this.debug.info('STATE', 'PackOpeningComponent', `Primeira abertura: ${this.isFirstTime}`);
    }
  }

  loadPack() {
    this.debug.logMethodEntry('PackOpeningComponent', 'loadPack', { packType: this.packType, isPhygital: this.isPhygital });
    const timer = this.debug.startTimer('loadPack');
    this.step = 1;
    this.loadingTimeout = setTimeout(() => {
      this.showSkeleton = true;
      this.debug.debug('METHOD', 'PackOpeningComponent', 'Timeout skeleton atingido - skeleton visível');
    }, 200);

    this.packService.openPack(this.packType, this.isPhygital).subscribe({
      next: (result) => {
        this.debug.info('METHOD', 'PackOpeningComponent', `PackService retornou sucesso: ${result.stickers.length} figurinhas`, { total: result.stickers.length, new: result.newCount, dup: result.duplicateCount });
        clearTimeout(this.loadingTimeout);
        this.showSkeleton = false;

        this.stickers = result.stickers.sort((a, b) => a.rarity - b.rarity);
        this.revealedStickers = new Array(this.stickers.length).fill(false);
        this.newCount = result.newCount;
        this.duplicateCount = result.duplicateCount;

        this.step = 2;
        this.debug.info('METHOD', 'PackOpeningComponent', 'Transição para Step 2 (Pronto para abrir)');
        const ms = this.debug.endTimer('loadPack');
        this.debug.logMethodExit('PackOpeningComponent', 'loadPack', { success: true, stickers: result.stickers.length }, ms);
      },
      error: (err) => {
        this.debug.error('ERROR', 'PackOpeningComponent', `Erro no PackService: ${err.message || err}`, err, 'loadPack');
        this.step = 1;
        const ms = this.debug.endTimer('loadPack');
        this.debug.logMethodExit('PackOpeningComponent', 'loadPack', { success: false, error: err.message }, ms);
      }
    });
  }

  openPack() {
    this.debug.logMethodEntry('PackOpeningComponent', 'openPack', { step: this.step });
    const currentStep = this.step;

    if (currentStep === 2) {
      this.debug.info('METHOD', 'PackOpeningComponent', 'Iniciando sequência de abertura');
      this.audioService.play('pack_open');
      this.step = 3;

      setTimeout(() => {
        this.step = 4;
        this.debug.debug('METHOD', 'PackOpeningComponent', 'Cards liberados (Step 4)');

        setTimeout(() => {
          this.step = 5;
          this.debug.debug('METHOD', 'PackOpeningComponent', 'Pronto para revelar (Step 5)');
        }, 1000);
      }, 800);
    }
    this.debug.logMethodExit('PackOpeningComponent', 'openPack', { stepAfter: this.step });
  }

  revealNext() {
    this.debug.logMethodEntry('PackOpeningComponent', 'revealNext', { index: this.currentRevealIndex, step: this.step, isDramaticPause: this.isDramaticPause });
    if (this.step !== 5 || this.isDramaticPause) {
      this.debug.warn('WARN', 'PackOpeningComponent', `revealNext ignorado: step=${this.step}, isDramaticPause=${this.isDramaticPause}`);
      this.debug.logMethodExit('PackOpeningComponent', 'revealNext', { ignored: true });
      return;
    }

    if (this.stickers && this.currentRevealIndex < this.stickers.length) {
      const sticker = this.stickers[this.currentRevealIndex];
      if (!sticker) {
        this.debug.warn('WARN', 'PackOpeningComponent', `Sticker não encontrado no índice: ${this.currentRevealIndex}`);
        return;
      }

      this.debug.info('METHOD', 'PackOpeningComponent', `Revelando figurinha: ${sticker.name} (${sticker.code}, raridade: ${sticker.rarity})`, { sticker: sticker.name, rarity: sticker.rarity, code: sticker.code });

      if (sticker.rarity >= 2) {
        this.isDramaticPause = true;
        this.debug.debug('METHOD', 'PackOpeningComponent', `Pausa dramática para raridade ${sticker.rarity}`);
        setTimeout(() => {
          this.doReveal(sticker);
        }, 600);
      } else {
        this.doReveal(sticker);
      }
    } else {
      this.debug.warn('WARN', 'PackOpeningComponent', `Tentativa de revelar fora dos limites ou sem stickers`, { index: this.currentRevealIndex, length: this.stickers?.length });
    }
  }

  private doReveal(sticker: Sticker) {
    this.revealedStickers[this.currentRevealIndex] = true;
    this.isDramaticPause = false;

    if (sticker.rarity >= 4) {
      this.debug.info('AUDIT', 'PackOpeningComponent', `RARIDADE ALTA REVELADA! ${sticker.name} (${sticker.rarity})`, { name: sticker.name, rarity: sticker.rarity });
      this.triggerHighRarityEffects();
    }

    this.currentRevealIndex++;

    if (this.currentRevealIndex === this.stickers.length) {
      this.debug.debug('METHOD', 'PackOpeningComponent', 'Todos os stickers revelados, verificando celebração');
      setTimeout(() => {
        this.checkCelebration();
      }, 1500);
    }
    this.debug.logMethodExit('PackOpeningComponent', 'revealNext');
  }

  private triggerHighRarityEffects() {
    this.showFlash = true;
    this.showConfetti = true;
    this.debug.info('METHOD', 'PackOpeningComponent', 'Efeitos de alta raridade ativados (flash + confetti)');
    setTimeout(() => this.showFlash = false, 500);
  }

  checkCelebration() {
    const hasHighRarity = this.stickers.some(s => s.rarity >= 4);
    this.debug.debug('METHOD', 'PackOpeningComponent', `Verificando celebração: hasHighRarity=${hasHighRarity}`);
    if (hasHighRarity) {
      this.step = 6;
      this.debug.info('AUDIT', 'PackOpeningComponent', 'CELEBRAÇÃO DE ALTA RARIDADE ATIVADA!');
      setTimeout(() => {
        this.step = 7;
        this.debug.info('METHOD', 'PackOpeningComponent', 'Transição para Summary (Step 7)');
      }, 4000);
    } else {
      this.step = 7;
      this.debug.info('METHOD', 'PackOpeningComponent', 'Transição para Summary (Step 7) - sem celebração');
    }
  }

  skipAnimation() {
    this.debug.logMethodEntry('PackOpeningComponent', 'skipAnimation');
    if (this.isFirstTime) {
      this.debug.warn('WARN', 'PackOpeningComponent', 'Animação não pode ser pulada na primeira vez');
      this.debug.logMethodExit('PackOpeningComponent', 'skipAnimation', { skipped: false, reason: 'first_time' });
      return;
    }

    this.stickers.forEach((_, i) => this.revealedStickers[i] = true);
    this.currentRevealIndex = this.stickers.length;
    this.step = 7;
    this.isDramaticPause = false;
    this.debug.info('AUDIT', 'PackOpeningComponent', 'Pack opening animation SKIPPED pelo usuário');
    this.debug.logMethodExit('PackOpeningComponent', 'skipAnimation', { skipped: true });
  }

  finish() {
    this.debug.logMethodEntry('PackOpeningComponent', 'finish');
    const timer = this.debug.startTimer('finish');
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('has_opened_pack', 'true');
      this.debug.info('STATE', 'PackOpeningComponent', 'Flag has_opened_pack salva no localStorage');
    }
    this.step = 8;
    this.debug.debug('METHOD', 'PackOpeningComponent', 'Salvando (Step 8)');
    setTimeout(() => {
      this.step = 9;
      this.debug.info('AUDIT', 'PackOpeningComponent', `Abertura de pacote COMPLETA`, { total: this.stickers.length, new: this.newCount, dup: this.duplicateCount });
      this.complete.emit();
      const ms = this.debug.endTimer('finish');
      this.debug.logMethodExit('PackOpeningComponent', 'finish', null, ms);
    }, 800);
  }
}
