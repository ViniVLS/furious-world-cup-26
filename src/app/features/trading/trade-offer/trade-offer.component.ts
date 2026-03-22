import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TradeService } from '../../../core/services/trade.service';
import { StickerService } from '../../../core/services/sticker.service';
import { UserService } from '../../../core/services/user.service';
import { Sticker, UserSticker } from '../../../core/models/sticker.model';
import { DebugService } from '../../../../debug/debug.service';

type RarityName = 'Comum' | 'Especial' | 'Epica' | 'Lendaria' | 'FURIOUS';

const RARITY_LABELS: Record<number, RarityName> = {
  1: 'Comum', 2: 'Especial', 3: 'Epica', 4: 'Lendaria', 5: 'FURIOUS'
};
const TYPE_LABELS: Record<string, string> = {
  'player': 'Jogador', 'shield': 'Escudo', 'team_photo': 'Foto', 'stadium': 'Estadio',
  'mascot': 'Mascote', 'ball': 'Bola'
};

@Component({
  selector: 'app-trade-offer',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './trade-offer.component.html',
  styleUrl: './trade-offer.component.css'
})
export class TradeOfferComponent implements OnInit, OnDestroy {
  private readonly debug = inject(DebugService);
  readonly RARITY_COLORS: Record<number, string> = {
    1: '#9CA3AF', 2: '#3B82F6', 3: '#8B5CF6', 4: '#F59E0B', 5: '#FF2D20'
  };

  private tradeService = inject(TradeService);
  private stickerService = inject(StickerService);
  private userService = inject(UserService);
  private router = inject(Router);

  userCollection = computed(() => this.stickerService.userCollection());

  offeredStickers = signal<UserSticker[]>([]);
  wantedCodes = signal<string[]>([]);
  wantedCodeInput = signal('');
  isSubmitting = signal(false);
  submitError = signal('');

  groupedOffered = computed(() => {
    const items = this.offeredStickers();
    const byRarity: Record<number, UserSticker[]> = {};
    for (const item of items) {
      const r = item.sticker.rarity;
      if (!byRarity[r]) byRarity[r] = [];
      byRarity[r].push(item);
    }
    return Object.keys(byRarity)
      .map(Number)
      .sort((a, b) => b - a)
      .map(rarity => ({ rarity, label: RARITY_LABELS[rarity], color: this.RARITY_COLORS[rarity], items: byRarity[rarity] }));
  });

  availableToOffer = computed(() => {
    const offered = new Set(this.offeredStickers().map(s => s.stickerId));
    return this.userCollection().filter(s => !offered.has(s.stickerId));
  });

  availableByRarity = computed(() => {
    const available = this.availableToOffer();
    const byRarity: Record<number, UserSticker[]> = {};
    for (const item of available) {
      const r = item.sticker.rarity;
      if (!byRarity[r]) byRarity[r] = [];
      byRarity[r].push(item);
    }
    return Object.keys(byRarity)
      .map(Number)
      .sort((a, b) => b - a)
      .map(rarity => ({ rarity, label: RARITY_LABELS[rarity], color: this.RARITY_COLORS[rarity], items: byRarity[rarity] }));
  });

  canSubmit = computed(() => this.offeredStickers().length > 0 && this.wantedCodes().length > 0);

  ngOnInit() {
    this.debug.logLifecycle('TradeOfferComponent', 'ngOnInit');
    this.debug.info('STATE', 'TradeOfferComponent', `TradeOffer carregado`, { collectionSize: this.userCollection().length });
  }

  ngOnDestroy() {
    this.debug.logLifecycle('TradeOfferComponent', 'ngOnDestroy');
  }

  toggleOffer(sticker: UserSticker): void {
    this.debug.debug('METHOD', 'TradeOfferComponent', `toggleOffer: ${sticker.sticker.code}`, { stickerId: sticker.stickerId, code: sticker.sticker.code });
    this.offeredStickers.update(list => {
      const idx = list.findIndex(s => s.stickerId === sticker.stickerId);
      if (idx > -1) {
        this.debug.debug('METHOD', 'TradeOfferComponent', `Removido da oferta: ${sticker.sticker.code}`);
        return list.filter(s => s.stickerId !== sticker.stickerId);
      }
      this.debug.debug('METHOD', 'TradeOfferComponent', `Adicionado à oferta: ${sticker.sticker.code}`);
      return [...list, sticker];
    });
  }

  addWanted(): void {
    const code = this.wantedCodeInput().trim().toUpperCase();
    this.debug.debug('METHOD', 'TradeOfferComponent', `addWanted: "${code}"`, { input: code });
    if (!code) return;
    if (this.wantedCodes().includes(code)) {
      this.debug.warn('WARN', 'TradeOfferComponent', `Código já adicionado: ${code}`);
      this.wantedCodeInput.set('');
      return;
    }
    this.wantedCodes.update(codes => [...codes, code]);
    this.wantedCodeInput.set('');
  }

  removeWanted(code: string): void {
    this.debug.debug('METHOD', 'TradeOfferComponent', `removeWanted: ${code}`);
    this.wantedCodes.update(codes => codes.filter(c => c !== code));
  }

  removeOffer(stickerId: string): void {
    this.debug.debug('METHOD', 'TradeOfferComponent', `removeOffer: ${stickerId}`);
    this.offeredStickers.update(list => list.filter(s => s.stickerId !== stickerId));
  }

  submitOffer(): void {
    this.debug.logMethodEntry('TradeOfferComponent', 'submitOffer');
    const timer = this.debug.startTimer('submitOffer');
    if (!this.canSubmit()) {
      this.debug.warn('WARN', 'TradeOfferComponent', 'submitOffer ignorado: condições não atendidas');
      this.debug.logMethodExit('TradeOfferComponent', 'submitOffer', { success: false, reason: 'conditions_not_met' });
      return;
    }
    this.isSubmitting.set(true);
    this.submitError.set('');

    const offering = this.offeredStickers().map(s => s.sticker.code);
    const wantingAny = this.wantedCodes();
    this.debug.info('METHOD', 'TradeOfferComponent', `Criando oferta`, { offering, wantingAny });

    this.tradeService.createOffer({ offering, wantingAny }).subscribe({
      next: (offer) => {
        this.debug.info('AUDIT', 'TradeOfferComponent', `Oferta criada com sucesso! ID: ${offer.id}`, { offerId: offer.id });
        this.isSubmitting.set(false);
        this.router.navigate(['/trading']);
        const ms = this.debug.endTimer('submitOffer');
        this.debug.logMethodExit('TradeOfferComponent', 'submitOffer', { success: true }, ms);
      },
      error: (err) => {
        this.debug.error('ERROR', 'TradeOfferComponent', `Erro ao criar oferta: ${err.message}`, err, 'submitOffer');
        this.isSubmitting.set(false);
        this.submitError.set(err.message || 'Erro ao criar oferta.');
        const ms = this.debug.endTimer('submitOffer');
        this.debug.logMethodExit('TradeOfferComponent', 'submitOffer', { success: false, error: err.message }, ms);
      }
    });
  }
}
