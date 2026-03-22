import { Component, OnInit, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { GamificationService } from '../../../core/services/gamification.service';
import { Badge, Mission } from '../../../core/models/gamification.model';
import { UserService } from '../../../core/services/user.service';
import { AudioService } from '../../../core/services/audio.service';
import { StickerService } from '../../../core/services/sticker.service';
import { TradeService } from '../../../core/services/trade.service';
import { DebugService } from '../../../../debug/debug.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ProgressBarComponent, MatIconModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent implements OnInit {
  private readonly debug = inject(DebugService);
  private gamificationService = inject(GamificationService);
  private userService = inject(UserService);
  private audioService = inject(AudioService);
  private stickerService = inject(StickerService);
  private tradeService = inject(TradeService);

  currentUser = this.userService.currentUser;
  isMuted = this.audioService.isMuted;

  badges = computed(() => this.gamificationService.userBadges());
  dailyMissions = computed(() => this.gamificationService.dailyMissions());

  totalProgress = computed(() => {
    const p = this.stickerService.albumProgress();
    return Math.round((p.edition2022 + p.edition2026) / 2);
  });

  totalDuplicates = computed(() => {
    return this.stickerService.userCollection()
      .filter(us => us.duplicates > 0)
      .length;
  });

  ngOnInit() {
    this.debug.logLifecycle('MyProfileComponent', 'ngOnInit');
    this.debug.info('STATE', 'MyProfileComponent', 'Perfil carregado', {
      userId: this.currentUser()?.id,
      username: this.currentUser()?.username,
      coins: this.currentUser()?.furyCoins,
      badges: this.badges().length,
      missions: this.dailyMissions().length
    });
    this.gamificationService.getUserBadges().subscribe();
    this.gamificationService.getDailyMissions().subscribe();
  }

  convertDuplicates() {
    this.debug.logMethodEntry('MyProfileComponent', 'convertDuplicates');
    const timer = this.debug.startTimer('convertDuplicates');
    const duplicates = this.stickerService.userCollection()
      .filter(us => us.duplicates > 0)
      .map(us => us.stickerId);

    if (duplicates.length === 0) {
      this.debug.warn('WARN', 'MyProfileComponent', 'Nenhuma figurinha repetida para converter');
      this.debug.logMethodExit('MyProfileComponent', 'convertDuplicates', { success: false, reason: 'no_duplicates' });
      return;
    }

    this.debug.info('METHOD', 'MyProfileComponent', `Convertendo ${duplicates.length} figurinhas repetidas`);

    this.tradeService.convertDuplicatesToCoins(duplicates).subscribe(result => {
      this.audioService.play('mission_complete');
      this.debug.info('AUDIT', 'MyProfileComponent', `Conversão concluída: ${result.converted} figurinhas → ${result.coinsEarned} coins`);
      this.gamificationService.checkMissionCompletion('trade');
      const ms = this.debug.endTimer('convertDuplicates');
      this.debug.logMethodExit('MyProfileComponent', 'convertDuplicates', { success: true, coinsEarned: result.coinsEarned, converted: result.converted }, ms);
    });
  }

  claimMission(mission: Mission) {
    this.debug.logMethodEntry('MyProfileComponent', 'claimMission', { missionId: mission.id, title: mission.title });
    const timer = this.debug.startTimer('claimMission');
    if (mission.isCompleted) {
      this.debug.warn('WARN', 'MyProfileComponent', `Missão já completa: ${mission.id}`);
      this.debug.logMethodExit('MyProfileComponent', 'claimMission', { success: false, reason: 'already_completed' });
      return;
    }
    this.gamificationService.claimMissionReward(mission.id);
    this.audioService.play('mission_complete');
    const ms = this.debug.endTimer('claimMission');
    this.debug.logMethodExit('MyProfileComponent', 'claimMission', { success: true, missionId: mission.id }, ms);
  }

  toggleMute() {
    this.debug.logMethodEntry('MyProfileComponent', 'toggleMute');
    this.audioService.toggleMute();
    this.debug.logMethodExit('MyProfileComponent', 'toggleMute', { muted: this.isMuted() });
  }

  logout() {
    this.debug.logMethodEntry('MyProfileComponent', 'logout');
    const userId = this.currentUser()?.id;
    this.userService.logout();
    this.debug.logNavigation('Profile', '/', { userId });
    this.debug.logMethodExit('MyProfileComponent', 'logout');
  }
}
