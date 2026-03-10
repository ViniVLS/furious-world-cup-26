import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { StickerCardComponent } from '../../../shared/components/sticker-card/sticker-card.component';
import { Sticker } from '../../../core/models/sticker.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sticker-detail',
  standalone: true,
  imports: [CommonModule, StickerCardComponent, MatIconModule],
  templateUrl: './sticker-detail.component.html',
  styleUrl: './sticker-detail.component.css'
})
export class StickerDetailComponent implements OnInit {
  stickerId = '';
  nftMode = signal(false);

  sticker: Sticker = {
    id: '3', code: '2022-BRA-10', type: 'player', edition: '2022', country: 'BRA', rarity: 5,
    imageUrl: 'https://picsum.photos/seed/bra10/240/336', name: 'Neymar Jr',
    player: {
      id: 'p1', fullName: 'Neymar da Silva Santos Júnior', displayName: 'Neymar Jr',
      country: 'BRA', position: 'FWD', worldCups: ['2022'], rarity: 5,
      imageUrl: '', verified: true, createdAt: '', source: 'FIFA.com', lastUpdated: new Date().toISOString(),
      stats2022: { gamesPlayed: 3, goals: 2, assists: 1, yellowCards: 0, redCards: 0, furthestRound: 'QF' }
    }
  };

  private route = inject(ActivatedRoute);
  private location = inject(Location);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.stickerId = params.get('stickerId') || '';
    });
  }

  goBack() {
    this.location.back();
  }
}
