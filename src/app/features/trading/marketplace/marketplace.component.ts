import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TradeService } from '../../../core/services/trade.service';
import { TradeOffer } from '../../../core/models/trade.model';
import { UserService } from '../../../core/services/user.service';
import { StickerService } from '../../../core/services/sticker.service';
import { DebugService } from '../../../../debug/debug.service';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css'
})
export class MarketplaceComponent implements OnInit, OnDestroy {
  private readonly debug = inject(DebugService);
  private tradeService = inject(TradeService);
  private userService = inject(UserService);
  private stickerService = inject(StickerService);

  currentUser = this.userService.currentUser;
  userDuplicates = computed(() => this.tradeService.getUserDuplicates());
  offers = computed(() => this.tradeService.activeOffers());

  ngOnInit() {
    this.debug.logLifecycle('MarketplaceComponent', 'ngOnInit');
    this.debug.info('STATE', 'MarketplaceComponent', 'Marketplace carregado', {
      userId: this.currentUser()?.id,
      totalOffers: this.offers().length
    });
  }

  isMatch(offer: TradeOffer): boolean {
    const dupes = this.userDuplicates();
    const match = offer.wantingAny.some(code => dupes.includes(code));
    this.debug.debug('METHOD', 'MarketplaceComponent', `isMatch para oferta ${offer.id}: ${match}`, { offerId: offer.id, userDuplicates: dupes, wantingAny: offer.wantingAny, match });
    return match;
  }

  acceptOffer(offerId: string): void {
    this.debug.logMethodEntry('MarketplaceComponent', 'acceptOffer', { offerId });
    const timer = this.debug.startTimer('acceptOffer');
    this.tradeService.acceptOffer(offerId).subscribe({
      next: () => {
        this.debug.info('AUDIT', 'MarketplaceComponent', `Oferta aceita! ID: ${offerId}`);
        const ms = this.debug.endTimer('acceptOffer');
        this.debug.logMethodExit('MarketplaceComponent', 'acceptOffer', { success: true }, ms);
      },
      error: (err) => {
        this.debug.error('ERROR', 'MarketplaceComponent', `Erro ao aceitar oferta: ${err.message}`, err, 'acceptOffer');
        const ms = this.debug.endTimer('acceptOffer');
        this.debug.logMethodExit('MarketplaceComponent', 'acceptOffer', { success: false, error: err.message }, ms);
      }
    });
  }

  ngOnDestroy() {
    this.debug.logLifecycle('MarketplaceComponent', 'ngOnDestroy');
  }
}
