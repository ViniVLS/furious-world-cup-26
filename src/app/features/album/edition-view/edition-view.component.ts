import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StickerService } from '../../../core/services/sticker.service';
import { AlbumProgressService } from '../../../core/services/album-progress.service';
import { DebugService } from '../../../../debug/debug.service';

const COUNTRY_NAMES: Record<string, string> = {
  'ARG': 'Argentina', 'BRA': 'Brasil', 'FRA': 'França', 'CRO': 'Croácia',
  'ENG': 'Inglaterra', 'GER': 'Alemanha', 'ESP': 'Espanha', 'MAR': 'Marrocos',
  'BEL': 'Bélgica', 'POL': 'Polônia', 'KOR': 'Coreia do Sul', 'CAN': 'Canadá',
  'USA': 'Estados Unidos', 'MEX': 'México', 'QAT': 'Catar', 'NED': 'Holanda',
  'POR': 'Portugal', 'URU': 'Uruguai', 'SEN': 'Senegal', 'JPN': 'Japão',
  'SUI': 'Suíça', 'AUS': 'Austrália', 'WAL': 'Gales',
  'GHA': 'Gana', 'CMR': 'Camarões', 'ECU': 'Equador', 'IRN': 'Irã',
  'KSA': 'Arábia Saudita', 'SRB': 'Sérvia', 'CRC': 'Costa Rica'
};

@Component({
  selector: 'app-edition-view',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './edition-view.component.html',
  styleUrl: './edition-view.component.css'
})
export class EditionViewComponent implements OnInit, OnDestroy {
  private readonly debug = inject(DebugService);
  edition = '';

  private route = inject(ActivatedRoute);
  private stickerService = inject(StickerService);
  private albumProgress = inject(AlbumProgressService);

  teams = computed(() => {
    const allStickers = this.stickerService.userCollection();
    const countryCodes = [...new Set(allStickers.map(s => s.sticker.country).filter(Boolean))] as string[];

    return countryCodes
      .filter(code => {
        const hasStickers = allStickers.some(s =>
          s.sticker.country === code && s.sticker.edition === this.edition
        );
        return hasStickers;
      })
      .map(code => {
        const stickersForCountry = allStickers.filter(s =>
          s.sticker.country === code && s.sticker.edition === this.edition
        );
        const total = stickersForCountry.length;
        const collected = stickersForCountry.filter(s => s.inAlbum === 1).length;
        const progress = total > 0 ? Math.round((collected / total) * 100) : 0;
        return { code, name: COUNTRY_NAMES[code] || code, progress };
      })
      .sort((a, b) => b.progress - a.progress);
  });

  ngOnInit() {
    this.debug.logLifecycle('EditionViewComponent', 'ngOnInit');
    this.route.paramMap.subscribe(params => {
      this.edition = params.get('edition') || '';
      this.debug.info('STATE', 'EditionViewComponent', `Edição resolved: ${this.edition}`, { edition: this.edition });
      this.debug.debug('METHOD', 'EditionViewComponent', `Teams computed: ${this.teams().length} países`, { count: this.teams().length });
    });
  }

  ngOnDestroy() {
    this.debug.logLifecycle('EditionViewComponent', 'ngOnDestroy');
  }
}
