import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TradeService } from '../../../core/services/trade.service';
import { TradeOffer } from '../../../core/models/trade.model';
import { UserProfile } from '../../../core/models/user.model';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css'
})
export class MarketplaceComponent implements OnInit {
  offers: TradeOffer[] = [];
  
  private tradeService = inject(TradeService);

  ngOnInit() {
    const mockUser: UserProfile = {
      id: 'u1', username: 'Me', country: 'BRA', isMinor: false,
      furyCoins: 0, coinsVault: 0, reputation: 5.0, tradeCount: 0,
      loginStreak: 0, badges: [], privacyLevel: 'public',
      hofCollector: 0, hofLegendary: 0, hofChallenges: 0, hofTrades: 0,
      createdAt: new Date().toISOString()
    };
    const userDuplicates = ['2022-BRA-10']; // I have what TraderPro wants

    this.tradeService.getMarketplaceOffers(mockUser, userDuplicates).subscribe(o => {
      this.offers = o;
    });
  }

  isMatch(offer: TradeOffer): boolean {
    const userDuplicates = ['2022-BRA-10']; // Mock
    return offer.wantingAny.some(code => userDuplicates.includes(code));
  }
}
