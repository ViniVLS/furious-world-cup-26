import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { GamificationService } from '../../../core/services/gamification.service';
import { DebugService } from '../../../../debug/debug.service';

@Component({
  selector: 'app-challenge-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="challenges-page p-6">
      <h1 class="text-4xl font-bold mb-2">Desafios</h1>
      <p class="text-muted text-sm mb-8">Participe, acumule pontos e ganhe Fúria Coins 🏆</p>
      <div class="grid gap-6">
        @for (challenge of challenges(); track challenge.id) {
          <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-fury transition-colors">
            <div class="flex justify-between items-start mb-4">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="px-2 py-1 bg-gray-700 rounded text-xs font-bold uppercase" [ngClass]="{'text-fury': challenge.type === 'weekly', 'text-gold': challenge.type === 'quiz'}">
                    {{ challenge.type === 'weekly' ? 'Semanal' : challenge.type === 'quiz' ? '⚡ Quiz Fúria' : 'Temático' }}
                  </span>
                  @if (challenge.isActive) {
                    <span class="px-2 py-1 bg-green-900/50 text-green-400 rounded text-xs font-bold uppercase">Ativo</span>
                  }
                </div>
                <h2 class="text-2xl font-bold text-white">{{ challenge.title }}</h2>
                <p class="text-gray-400 mt-1">{{ challenge.description }}</p>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500 mb-1">Recompensas</div>
                <div class="flex flex-col items-end gap-1">
                  <span class="text-fury font-bold flex items-center gap-1">
                    <mat-icon class="text-sm">monetization_on</mat-icon> {{ challenge.rewardCoins }} Coins
                  </span>
                  <span class="text-gold font-bold flex items-center gap-1">
                    <mat-icon class="text-sm">emoji_events</mat-icon> {{ challenge.rewardHofPoints }} pts
                  </span>
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
              <div class="text-sm text-gray-400 flex items-center gap-1">
                <mat-icon class="text-sm">schedule</mat-icon>
                Termina em: {{ challenge.endsAt | date:'shortDate' }}
              </div>
              <button
                class="px-6 py-2 font-bold rounded transition-colors"
                [ngClass]="challenge.type === 'quiz' ? 'bg-fury hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'"
                (click)="participate(challenge.type)">
                {{ challenge.type === 'quiz' ? '⚡ JOGAR QUIZ' : 'PARTICIPAR' }}
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`.challenges-page { max-width: 800px; margin: 0 auto; } .text-gold { color: #FFD700; }`]
})
export class ChallengeListComponent implements OnInit, OnDestroy {
  challenges = inject(GamificationService).activeChallenges;
  private gamificationService = inject(GamificationService);
  private router = inject(Router);
  private readonly debug = inject(DebugService);

  ngOnInit() {
    this.debug.logLifecycle('ChallengeListComponent', 'ngOnInit');
    this.gamificationService.getActiveChallenges().subscribe();
    this.debug.info('STATE', 'ChallengeListComponent', 'Lista de desafios carregada', { count: this.challenges().length });
  }

  ngOnDestroy() {
    this.debug.logLifecycle('ChallengeListComponent', 'ngOnDestroy');
  }

  participate(type: string) {
    this.debug.logMethodEntry('ChallengeListComponent', 'participate', { type });
    const timer = this.debug.startTimer('participate');
    if (type === 'quiz') {
      this.debug.info('METHOD', 'ChallengeListComponent', 'Iniciando Quiz Fúria');
      this.router.navigate(['/challenges/quiz']);
      this.debug.logNavigation('/challenges', '/challenges/quiz');
    } else {
      this.debug.warn('WARN', 'ChallengeListComponent', `Desafio ${type} ainda não implementado`);
    }
    const ms = this.debug.endTimer('participate');
    this.debug.logMethodExit('ChallengeListComponent', 'participate', { type }, ms);
  }
}
