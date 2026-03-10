import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Mission, Badge, HallOfFameEntry } from '../models/gamification.model';
import { Challenge } from '../models/challenge.model';
import { environment } from '../../../environments/environment';

const MOCK_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Abra 2 pacotes hoje',
    description: 'Abra qualquer tipo de pacote para ganhar Fúria Coins.',
    rewardCoins: 50,
    isCompleted: false,
    type: 'pack'
  },
  {
    id: 'm2',
    title: 'Faça 1 troca na Praça',
    description: 'Complete uma troca com outro jogador.',
    rewardCoins: 30,
    rewardPackType: 'basic',
    isCompleted: false,
    type: 'trade'
  },
  {
    id: 'm3',
    title: 'Visite o álbum de um amigo',
    description: 'Veja a coleção de um amigo seu.',
    rewardCoins: 20,
    isCompleted: false,
    type: 'social'
  }
];

const MOCK_BADGES: Badge[] = [
  {
    id: 'b1',
    name: 'Primeiro Pacote',
    description: 'Abrir o 1º pacote',
    rarity: 'Comum',
    imageUrl: '/assets/badges/first-pack.png',
    isSeasonal: false,
    unlockedAt: new Date().toISOString()
  },
  {
    id: 'b2',
    name: 'Colecionador Global',
    description: 'Ter figurinha de 10+ seleções',
    rarity: 'Especial',
    imageUrl: '/assets/badges/global-collector.png',
    isSeasonal: false
  },
  {
    id: 'b3',
    name: 'Álbum Completo 2022',
    description: '100% de conclusão da edição 2022',
    rarity: 'Lendária',
    imageUrl: '/assets/badges/complete-2022.png',
    isSeasonal: false
  }
];

const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: 'Monte o time ideal da Copa 2022',
    description: 'Coloque seus melhores jogadores de 2022.',
    type: 'weekly',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    rewardCoins: 200,
    rewardHofPoints: 50,
    isActive: true
  },
  {
    id: 'c2',
    title: 'Quiz Fúria',
    description: 'Responda 5 perguntas sobre a Copa.',
    type: 'quiz',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    rewardCoins: 100,
    rewardHofPoints: 20,
    isActive: true
  }
];

@Injectable({ providedIn: 'root' })
export class GamificationService {
  
  readonly dailyMissions = signal<Mission[]>([]);
  readonly userBadges = signal<Badge[]>([]);
  readonly activeChallenges = signal<Challenge[]>([]);

  getDailyMissions(albumCompletionPercent: number): Observable<Mission[]> {
    if (environment.useMockData) {
      // Logic from SKILL 04
      const missions = [...MOCK_MISSIONS];
      if (albumCompletionPercent < 30) {
        // Focus on packs
        missions[0].isCompleted = false;
      } else if (albumCompletionPercent >= 30 && albumCompletionPercent <= 70) {
        // Focus on trades
        missions[1].isCompleted = false;
      } else {
        // Focus on challenges and legendaries
        missions.push({
          id: 'm4',
          title: 'Responda 1 quiz',
          description: 'Participe do Quiz Fúria.',
          rewardCoins: 40,
          isCompleted: false,
          type: 'challenge'
        });
      }
      this.dailyMissions.set(missions);
      return of(missions).pipe(delay(300));
    }
    return of([]);
  }

  getUserBadges(): Observable<Badge[]> {
    if (environment.useMockData) {
      this.userBadges.set(MOCK_BADGES);
      return of(MOCK_BADGES).pipe(delay(300));
    }
    return of([]);
  }

  getActiveChallenges(): Observable<Challenge[]> {
    if (environment.useMockData) {
      this.activeChallenges.set(MOCK_CHALLENGES);
      return of(MOCK_CHALLENGES).pipe(delay(300));
    }
    return of([]);
  }

  getHallOfFame(): Observable<HallOfFameEntry[]> {
    if (environment.useMockData) {
      const mockHof: HallOfFameEntry[] = [
        { userId: 'u1', username: 'FuriousMaster', score: 9500, rank: 1 },
        { userId: 'u2', username: 'SoccerFan99', score: 8200, rank: 2 },
        { userId: 'u3', username: 'Pele10', score: 7800, rank: 3 },
      ];
      return of(mockHof).pipe(delay(300));
    }
    return of([]);
  }
}
