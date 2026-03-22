import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { StickerCardComponent } from '../../../shared/components/sticker-card/sticker-card.component';
import { Sticker } from '../../../core/models/sticker.model';
import { MatIconModule } from '@angular/material/icon';
import { StickerService } from '../../../core/services/sticker.service';
import { DebugService } from '../../../../debug/debug.service';

@Component({
  selector: 'app-sticker-detail',
  standalone: true,
  imports: [CommonModule, StickerCardComponent, MatIconModule],
  templateUrl: './sticker-detail.component.html',
  styleUrl: './sticker-detail.component.css'
})
export class StickerDetailComponent implements OnInit, OnDestroy {
  private readonly debug = inject(DebugService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private stickerService = inject(StickerService);

  stickerId = signal('');
  nftMode = signal(false);

  sticker = computed<Sticker | null>(() => {
    const id = this.stickerId();
    if (!id) return null;
    return this.stickerService.getStickerById(id);
  });

  isCollected = computed(() => {
    const id = this.stickerId();
    const collection = this.stickerService.userCollection();
    return collection.some(us => us.stickerId === id);
  });

  ngOnInit() {
    this.debug.logLifecycle('StickerDetailComponent', 'ngOnInit');
    this.route.paramMap.subscribe(params => {
      this.stickerId.set(params.get('stickerId') || '');
      this.debug.info('STATE', 'StickerDetailComponent', `Sticker ID resolved: ${this.stickerId()}`, { stickerId: this.stickerId() });
    });
  }

  goBack() {
    this.debug.logMethodEntry('StickerDetailComponent', 'goBack');
    this.location.back();
    this.debug.logMethodExit('StickerDetailComponent', 'goBack');
  }

  ngOnDestroy() {
    this.debug.logLifecycle('StickerDetailComponent', 'ngOnDestroy');
  }
}
