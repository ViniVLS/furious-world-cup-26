import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { GamificationService } from '../../../core/services/gamification.service';
import { HallOfFameEntry } from '../../../core/models/gamification.model';
import { AudioService } from '../../../core/services/audio.service';
import { DebugService } from '../../../../debug/debug.service';

@Component({
  selector: 'app-hall-of-fame',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './hall-of-fame.component.html',
  styleUrl: './hall-of-fame.component.css'
})
export class HallOfFameComponent implements OnInit, OnDestroy {
  private readonly debug = inject(DebugService);
  activeTab = signal('collector');

  tabs = [
    { id: 'collector', name: 'Grandes Colecionadores', icon: 'emoji_events' },
    { id: 'speed', name: 'Primeiros a Completar', icon: 'bolt' },
    { id: 'legendary', name: 'Caçadores de Lendárias', icon: 'star' },
    { id: 'challenge', name: 'Mestres dos Desafios', icon: 'track_changes' },
    { id: 'trade', name: 'Reis da Troca', icon: 'handshake' }
  ];

  topUsers = signal<HallOfFameEntry[]>([]);
  isLoading = signal(true);

  private gamificationService = inject(GamificationService);
  private audioService = inject(AudioService);

  ngOnInit() {
    this.debug.logLifecycle('HallOfFameComponent', 'ngOnInit');
    this.audioService.play('ranking_enter');
    this.debug.logAudio('AudioService', 'ranking_enter triggered on HallOfFame entry');
    this.loadRanking();
  }

  setTab(tabId: string) {
    this.debug.logMethodEntry('HallOfFameComponent', 'setTab', { tabId, previousTab: this.activeTab() });
    const timer = this.debug.startTimer('setTab');
    this.activeTab.set(tabId);
    this.debug.logNavigation(`/ranking?tab=${this.activeTab()}`, `/ranking?tab=${tabId}`, { tabId });
    this.loadRanking();
    const ms = this.debug.endTimer('setTab');
    this.debug.logMethodExit('HallOfFameComponent', 'setTab', { tabId }, ms);
  }

  private loadRanking() {
    this.debug.logMethodEntry('HallOfFameComponent', 'loadRanking', { category: this.activeTab() });
    const timer = this.debug.startTimer('loadRanking');
    this.isLoading.set(true);
    this.gamificationService.getHallOfFame(this.activeTab()).subscribe(entries => {
      this.topUsers.set(entries);
      this.isLoading.set(false);
      this.debug.info('STATE', 'HallOfFameComponent', `HallOfFame carregado para ${this.activeTab()}`, { category: this.activeTab(), entries: entries.length });
      const ms = this.debug.endTimer('loadRanking');
      this.debug.logMethodExit('HallOfFameComponent', 'loadRanking', { entries: entries.length }, ms);
    });
  }

  ngOnDestroy() {
    this.debug.logLifecycle('HallOfFameComponent', 'ngOnDestroy');
  }
}
