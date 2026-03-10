import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { GamificationService } from '../../../core/services/gamification.service';
import { Badge, Mission } from '../../../core/models/gamification.model';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ProgressBarComponent, MatIconModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent implements OnInit {
  user = {
    username: 'ColecionadorFuria',
    country: 'BRA',
    progress: 45,
    reputation: 4.8,
  };

  badges: Badge[] = [];
  dailyMissions: Mission[] = [];

  private gamificationService = inject(GamificationService);
  private userService = inject(UserService);

  currentUser = this.userService.currentUser;

  ngOnInit() {
    this.gamificationService.getUserBadges().subscribe(b => this.badges = b);
    this.gamificationService.getDailyMissions(this.user.progress).subscribe(m => this.dailyMissions = m);
  }

  convertDuplicates() {
    // Mock logic: convert 5 duplicates for 25 coins
    const coinsEarned = 25;
    this.userService.addCoins(coinsEarned);
    alert(`Você converteu figurinhas repetidas e ganhou ${coinsEarned} Fúria Coins!`);
  }

  logout() {
    this.userService.logout();
  }
}
