import { Component, Input, Output, EventEmitter, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PackType } from '../../../core/models/pack.model';
import { PackService } from '../../../core/services/pack.service';
import { StickerCardComponent } from '../sticker-card/sticker-card.component';
import { Sticker } from '../../../core/models/sticker.model';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pack-opening',
  standalone: true,
  imports: [CommonModule, StickerCardComponent, MatIconModule],
  templateUrl: './pack-opening.component.html',
  styleUrl: './pack-opening.component.css'
})
export class PackOpeningComponent implements OnInit {
  @Input() packType: PackType = 'basic';
  @Input() isPhygital = false;
  @Output() complete = new EventEmitter<void>();

  // Steps: 
  // 1: Loading (Skeleton)
  // 2: Ready (Pack appears, centered, tremor)
  // 3: Tearing (Animation of tearing)
  // 4: Cards Out (Cascade)
  // 5: Revealing (One by one, 3D flip)
  // 6: Celebration (Legendary/Furious only)
  // 7: Summary (Stats)
  // 8: Saving (Loading)
  // 9: Done
  step = 1;
  stickers: Sticker[] = [];
  newCount = 0;
  duplicateCount = 0;

  showSkeleton = false;
  private loadingTimeout: ReturnType<typeof setTimeout> | undefined;

  currentRevealIndex = 0;
  revealedStickers: boolean[] = [];

  isFirstTime = true; // Should be fetched from a service in a real app
  isDramaticPause = false;
  showConfetti = false;
  showFlash = false;

  private packService = inject(PackService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkFirstTime();
    }
    this.loadPack();
  }

  private checkFirstTime() {
    if (isPlatformBrowser(this.platformId)) {
      const hasOpened = localStorage.getItem('has_opened_pack');
      this.isFirstTime = !hasOpened;
    }
  }

  loadPack() {
    this.step = 1;
    this.loadingTimeout = setTimeout(() => {
      this.showSkeleton = true;
    }, 200);

    this.packService.openPack(this.packType, this.isPhygital).subscribe(result => {
      clearTimeout(this.loadingTimeout);
      this.showSkeleton = false;

      // Sort stickers: Commons first, then Specials, then Epics, then Legendary/Furious last
      this.stickers = result.stickers.sort((a, b) => a.rarity - b.rarity);
      this.revealedStickers = new Array(this.stickers.length).fill(false);

      this.newCount = result.newCount;
      this.duplicateCount = result.duplicateCount;

      this.step = 2; // Ready to open
    });
  }

  openPack() {
    if (this.step === 2) {
      this.step = 3; // Tearing
      setTimeout(() => {
        this.step = 4; // Cards Out
        setTimeout(() => {
          this.step = 5; // Start Revealing
        }, 1000);
      }, 800);
    }
  }

  revealNext() {
    if (this.step !== 5 || this.isDramaticPause) return;

    if (this.currentRevealIndex < this.stickers.length) {
      const sticker = this.stickers[this.currentRevealIndex];

      // Special+ Pause (Rarity >= 2)
      if (sticker.rarity >= 2) {
        this.isDramaticPause = true;
        setTimeout(() => {
          this.doReveal(sticker);
        }, 600);
      } else {
        this.doReveal(sticker);
      }
    }
  }

  private doReveal(sticker: Sticker) {
    this.revealedStickers[this.currentRevealIndex] = true;
    this.isDramaticPause = false;

    // Legendary+ Effects (Rarity >= 4)
    if (sticker.rarity >= 4) {
      this.triggerHighRarityEffects();
    }

    this.currentRevealIndex++;

    if (this.currentRevealIndex === this.stickers.length) {
      setTimeout(() => {
        this.checkCelebration();
      }, 1500);
    }
  }

  private triggerHighRarityEffects() {
    this.showFlash = true;
    this.showConfetti = true;
    setTimeout(() => this.showFlash = false, 500);
    // Confetti stays until summary
  }

  checkCelebration() {
    const hasHighRarity = this.stickers.some(s => s.rarity >= 4);
    if (hasHighRarity) {
      this.step = 6; // Celebration
      setTimeout(() => {
        this.step = 7; // Summary
      }, 4000);
    } else {
      this.step = 7; // Summary
    }
  }

  skipAnimation() {
    if (this.isFirstTime) return; // Bloqueio na primeira vez

    this.stickers.forEach((_, i) => this.revealedStickers[i] = true);
    this.currentRevealIndex = this.stickers.length;
    this.step = 7; // Summary
    this.isDramaticPause = false;
    console.log('[UX LOG] Pack opening animation skipped.');
  }

  finish() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('has_opened_pack', 'true');
    }
    this.step = 8; // Saving
    setTimeout(() => {
      this.step = 9; // Done
      this.complete.emit();
    }, 800);
  }
}
