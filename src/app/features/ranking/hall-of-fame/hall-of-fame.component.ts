import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { GamificationService } from '../../../core/services/gamification.service';
import { HallOfFameEntry } from '../../../core/models/gamification.model';

@Component({
  selector: 'app-hall-of-fame',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './hall-of-fame.component.html',
  styleUrl: './hall-of-fame.component.css'
})
export class HallOfFameComponent implements OnInit {
  activeTab = 'collector';
  
  tabs = [
    { id: 'collector', name: 'Grandes Colecionadores', icon: 'emoji_events' },
    { id: 'speed', name: 'Primeiros a Completar', icon: 'bolt' },
    { id: 'legendary', name: 'Caçadores de Lendárias', icon: 'star' },
    { id: 'challenge', name: 'Mestres dos Desafios', icon: 'track_changes' },
    { id: 'trade', name: 'Reis da Troca', icon: 'handshake' }
  ];

  topUsers: HallOfFameEntry[] = [];
  
  private gamificationService = inject(GamificationService);

  ngOnInit() {
    this.loadRanking();
  }

  setTab(tabId: string) {
    this.activeTab = tabId;
    this.loadRanking();
  }

  private loadRanking() {
    this.gamificationService.getHallOfFame().subscribe(entries => {
      this.topUsers = entries;
    });
  }
}
