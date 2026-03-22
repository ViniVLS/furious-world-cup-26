import { Injectable, signal, effect, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Mission, Badge, HallOfFameEntry } from '../models/gamification.model';
import { Challenge } from '../models/challenge.model';
import { environment } from '../../../environments/environment';
import { StickerService } from './sticker.service';
import { UserService } from './user.service';
import { DebugService } from '../../../debug/debug.service';

const STORAGE_KEY_MISSIONS = 'furia-missions';
const STORAGE_KEY_BADGES = 'furia-badges';
const STORAGE_KEY_DAILY_RESET = 'furia-missions-reset-date';
const STORAGE_KEY_PACKS_TODAY = 'furia-packs-today';

const MISSION_TEMPLATES: Mission[] = [
  { id: 'm1', title: 'Abra 2 pacotes hoje', description: 'Abra qualquer tipo de pacote.', rewardCoins: 50, type: 'pack', isCompleted: false },
  { id: 'm2', title: 'Faça 1 troca na Praça', description: 'Complete uma troca com outro jogador.', rewardCoins: 30, type: 'trade', isCompleted: false },
  { id: 'm3', title: 'Visite o álbum de um amigo', description: 'Visite a coleção de um amigo.', rewardCoins: 20, type: 'social', isCompleted: false },
  { id: 'm4', title: 'Responda 1 quiz', description: 'Participe do Quiz Fúria.', rewardCoins: 40, type: 'challenge', isCompleted: false },
];

const ALL_BADGES: Badge[] = [
  { id: 'b1', name: 'Primeiro Pacote', description: 'Abrir o 1º pacote', rarity: 'Comum', imageUrl: '/assets/badges/first-pack.png', isSeasonal: false },
  { id: 'b2', name: 'Colecionador Global', description: 'Ter figurinha de 10+ seleções', rarity: 'Especial', imageUrl: '/assets/badges/global-collector.png', isSeasonal: false },
  { id: 'b3', name: 'Álbum Completo 2022', description: '100% de conclusão da edição 2022', rarity: 'Lendária', imageUrl: '/assets/badges/complete-2022.png', isSeasonal: false },
  { id: 'b4', name: 'Álbum Completo 2026', description: '100% de conclusão da edição 2026', rarity: 'Lendária', imageUrl: '/assets/badges/complete-2026.png', isSeasonal: false },
  { id: 'b5', name: 'Caçador de Lendárias', description: 'Colete 5 figurinhas lendárias', rarity: 'Épica', imageUrl: '/assets/badges/legendary-hunter.png', isSeasonal: false },
  { id: 'b6', name: 'Rei da Troca', description: 'Complete 10 trocas', rarity: 'Especial', imageUrl: '/assets/badges/trade-king.png', isSeasonal: false },
  { id: 'b7', name: 'Quiz Master', description: 'Acertar 100% em um quiz', rarity: 'Épica', imageUrl: '/assets/badges/quiz-master.png', isSeasonal: false },
  { id: 'b8', name: 'Mestre FURIOUS', description: 'Colete todas as FURIOUS', rarity: 'FURIOUS', imageUrl: '/assets/badges/furious-master.png', isSeasonal: false },
];

const MOCK_CHALLENGES: Challenge[] = [
  { id: 'c1', title: 'Monte o time ideal da Copa 2022', description: 'Coloque seus melhores jogadores de 2022.', type: 'weekly', startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), rewardCoins: 200, rewardHofPoints: 50, isActive: true },
  { id: 'c2', title: 'Quiz Fúria', description: 'Responda 5 perguntas sobre a Copa.', type: 'quiz', startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), rewardCoins: 100, rewardHofPoints: 20, isActive: true },
];

@Injectable({ providedIn: 'root' })
export class GamificationService {
  private readonly debug = inject(DebugService);
  private stickerService = inject(StickerService);
  private userService = inject(UserService);

  readonly dailyMissions = signal<Mission[]>(this.loadMissions());
  readonly userBadges = signal<Badge[]>(this.loadBadges());
  readonly activeChallenges = signal<Challenge[]>([...MOCK_CHALLENGES]);
  readonly packsOpenedToday = signal<number>(this.loadPacksToday());

  constructor() {
    this.debug.logLifecycle('GamificationService', 'constructor');
    effect(() => {
      const missions = this.dailyMissions();
      this.saveMissions(missions);
    });
    effect(() => {
      const badges = this.userBadges();
      this.saveBadges(badges);
    });
  }

  private loadMissions(): Mission[] {
    if (typeof window === 'undefined') return this.generateMissions(50);
    const storedDate = localStorage.getItem(STORAGE_KEY_DAILY_RESET);
    const today = new Date().toDateString();
    if (storedDate !== today) {
      localStorage.setItem(STORAGE_KEY_DAILY_RESET, today);
      localStorage.removeItem(STORAGE_KEY_PACKS_TODAY);
      this.debug.info('STATE', 'GamificationService', `Reset diário de missões detectado. Data: ${today}`);
      return this.generateMissions(50);
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MISSIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) { this.debug.error('ERROR', 'GamificationService', 'Erro ao carregar missões', e, 'loadMissions'); }
    return this.generateMissions(50);
  }

  private saveMissions(missions: Mission[]): void {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_KEY_MISSIONS, JSON.stringify(missions)); } catch {}
  }

  private generateMissions(albumCompletion: number): Mission[] {
    const missions: Mission[] = MISSION_TEMPLATES.map(m => ({ ...m, isCompleted: false }));
    if (albumCompletion < 30) {
    } else if (albumCompletion >= 30 && albumCompletion <= 70) {
    } else {
    }
    return missions;
  }

  private loadMissionsCompleted(): number {
    if (typeof window === 'undefined') return 0;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PACKS_TODAY);
      return stored ? parseInt(stored, 10) : 0;
    } catch { return 0; }
  }

  private savePacksToday(count: number): void {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_KEY_PACKS_TODAY, String(count)); } catch {}
  }

  private loadPacksToday(): number { return this.loadMissionsCompleted(); }

  private loadBadges(): Badge[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BADGES);
      if (stored) {
        this.debug.info('STATE', 'GamificationService', `${JSON.parse(stored).length} badges carregados do localStorage`);
        return JSON.parse(stored);
      }
    } catch (e) { this.debug.error('ERROR', 'GamificationService', 'Erro ao carregar badges', e, 'loadBadges'); }
    return [];
  }

  private saveBadges(badges: Badge[]): void {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(badges)); } catch {}
  }

  getDailyMissions(): Observable<Mission[]> {
    this.debug.logMethodEntry('GamificationService', 'getDailyMissions');
    const albumProgress = this.stickerService.albumProgress();
    const albumPct = (albumProgress.edition2022 + albumProgress.edition2026) / 2;
    const missions = this.generateMissions(albumPct);
    const saved = this.dailyMissions();
    const merged = missions.map(m => {
      const savedM = saved.find(s => s.id === m.id);
      if (savedM) return { ...m, isCompleted: savedM.isCompleted };
      return m;
    });
    this.dailyMissions.set(merged);
    this.debug.logMethodExit('GamificationService', 'getDailyMissions', { count: merged.length, completed: merged.filter(m => m.isCompleted).length });
    return of([...merged]).pipe(delay(100));
  }

  checkMissionCompletion(event: 'pack' | 'trade' | 'quiz' | 'social'): void {
    this.debug.logMethodEntry('GamificationService', 'checkMissionCompletion', { event });
    const timer = this.debug.startTimer('checkMissionCompletion');
    const missions = this.dailyMissions().map(m => {
      if (m.isCompleted) return m;
      if (m.type === event) {
        let shouldComplete = false;
        if (event === 'pack') {
          const count = this.packsOpenedToday() + 1;
          this.packsOpenedToday.set(count);
          this.savePacksToday(count);
          shouldComplete = count >= 2;
          this.debug.info('METHOD', 'GamificationService', `Missão de pacote: ${count}/2`, { count, required: 2 });
        } else {
          shouldComplete = true;
        }
        if (shouldComplete) {
          this.userService.addCoins(m.rewardCoins);
          this.debug.logAudit('GamificationService', `Missão "${m.title}" completada! +${m.rewardCoins} coins`, { missionId: m.id, reward: m.rewardCoins, event });
          return { ...m, isCompleted: true };
        }
      }
      return m;
    });
    this.dailyMissions.set(missions);
    const ms = this.debug.endTimer('checkMissionCompletion');
    this.debug.logMethodExit('GamificationService', 'checkMissionCompletion', null, ms);
  }

  claimMissionReward(missionId: string): void {
    this.debug.logMethodEntry('GamificationService', 'claimMissionReward', { missionId });
    const timer = this.debug.startTimer('claimMissionReward');
    const missions = this.dailyMissions();
    const mission = missions.find(m => m.id === missionId);
    if (mission && !mission.isCompleted) {
      this.userService.addCoins(mission.rewardCoins);
      this.dailyMissions.set(missions.map(m => m.id === missionId ? { ...m, isCompleted: true } : m));
      this.debug.logAudit('GamificationService', `Recompensa de missão "${mission.title}" reivindicada`, { missionId, reward: mission.rewardCoins });
      const ms = this.debug.endTimer('claimMissionReward');
      this.debug.logMethodExit('GamificationService', 'claimMissionReward', { success: true }, ms);
    } else {
      this.debug.warn('WARN', 'GamificationService', `Tentativa de reivindicar missão já completa ou inexistente`, { missionId }, 'claimMissionReward');
      const ms = this.debug.endTimer('claimMissionReward');
      this.debug.logMethodExit('GamificationService', 'claimMissionReward', { success: false });
    }
  }

  getUserBadges(): Observable<Badge[]> {
    this.debug.logMethodEntry('GamificationService', 'getUserBadges');
    this.userBadges.set(this.loadBadges());
    this.debug.logMethodExit('GamificationService', 'getUserBadges', { count: this.userBadges().length });
    return of([...this.userBadges()]).pipe(delay(100));
  }

  awardBadge(badgeId: string): boolean {
    this.debug.logMethodEntry('GamificationService', 'awardBadge', { badgeId });
    const timer = this.debug.startTimer('awardBadge');
    const current = this.userBadges();
    if (current.some(b => b.id === badgeId)) {
      this.debug.info('METHOD', 'GamificationService', `Badge ${badgeId} já conquistado`, null, 'awardBadge');
      const ms = this.debug.endTimer('awardBadge');
      this.debug.logMethodExit('GamificationService', 'awardBadge', { awarded: false, reason: 'already_owned' }, ms);
      return false;
    }
    const badgeDef = ALL_BADGES.find(b => b.id === badgeId);
    if (!badgeDef) {
      this.debug.error('ERROR', 'GamificationService', `Badge ${badgeId} não encontrado na definição`, null, 'awardBadge');
      const ms = this.debug.endTimer('awardBadge');
      this.debug.logMethodExit('GamificationService', 'awardBadge', { awarded: false, reason: 'not_found' }, ms);
      return false;
    }
    const newBadge: Badge = { ...badgeDef, unlockedAt: new Date().toISOString() };
    this.userBadges.set([...current, newBadge]);
    this.debug.logAudit('GamificationService', `Badge conquistado: ${badgeDef.name}!`, { badgeId, badgeName: badgeDef.name, rarity: badgeDef.rarity });
    const ms = this.debug.endTimer('awardBadge');
    this.debug.logMethodExit('GamificationService', 'awardBadge', { awarded: true, badgeName: badgeDef.name }, ms);
    return true;
  }

  hasBadge(badgeId: string): boolean {
    return this.userBadges().some(b => b.id === badgeId);
  }

  checkBadgeConditions(): void {
    this.debug.logMethodEntry('GamificationService', 'checkBadgeConditions');
    const timer = this.debug.startTimer('checkBadgeConditions');
    const collection = this.stickerService.userCollection();
    const uniqueCountries = new Set(collection.map(us => us.sticker.country)).size;
    const legendaryCount = collection.filter(us => us.sticker.rarity === 4).length;
    const furiousCount = collection.filter(us => us.sticker.rarity === 5).length;
    const tradeCount = this.userService.currentUser()?.tradeCount || 0;
    const progress2022 = this.stickerService.albumProgress().edition2022;
    const progress2026 = this.stickerService.albumProgress().edition2026;

    this.debug.info('METHOD', 'GamificationService', `Verificando condições de badges`, { uniqueCountries, legendaryCount, furiousCount, tradeCount, progress2022, progress2026 });

    if (uniqueCountries >= 10) this.awardBadge('b2');
    if (progress2022 === 100) this.awardBadge('b3');
    if (progress2026 === 100) this.awardBadge('b4');
    if (legendaryCount >= 5) this.awardBadge('b5');
    if (tradeCount >= 10) this.awardBadge('b6');
    if (furiousCount >= 1) this.awardBadge('b8');

    const ms = this.debug.endTimer('checkBadgeConditions');
    this.debug.logMethodExit('GamificationService', 'checkBadgeConditions', { totalBadges: this.userBadges().length }, ms);
  }

  getActiveChallenges(): Observable<Challenge[]> {
    this.debug.logMethodEntry('GamificationService', 'getActiveChallenges');
    this.activeChallenges.set([...MOCK_CHALLENGES]);
    this.debug.logMethodExit('GamificationService', 'getActiveChallenges', { count: MOCK_CHALLENGES.length });
    return of([...MOCK_CHALLENGES]).pipe(delay(100));
  }

  getHallOfFame(category: string): Observable<HallOfFameEntry[]> {
    this.debug.logMethodEntry('GamificationService', 'getHallOfFame', { category });
    const timer = this.debug.startTimer('getHallOfFame');
    const collection = this.stickerService.userCollection();
    const user = this.userService.currentUser();
    const uniqueCountries = new Set(collection.map(us => us.sticker.country)).size;
    const legendaryCount = collection.filter(us => us.sticker.rarity === 4).length;
    const progress2022 = this.stickerService.albumProgress().edition2022;
    const progress2026 = this.stickerService.albumProgress().edition2026;

    let userScore = 0;
    const userName = user?.username || 'ColecionadorFuria';

    switch (category) {
      case 'collector': userScore = progress2022 + progress2026; break;
      case 'speed': userScore = progress2022 * 10 + progress2026 * 10; break;
      case 'legendary': userScore = legendaryCount * 100; break;
      case 'challenge': userScore = (user?.hofChallenges || 0) * 50; break;
      case 'trade': userScore = (user?.hofTrades || 0) * 30; break;
      default: userScore = uniqueCountries * 20;
    }

    const mockRivals: HallOfFameEntry[] = [
      { userId: 'r1', username: 'FuriousMaster', score: userScore + Math.floor(Math.random() * 500), rank: 1 },
      { userId: 'r2', username: 'CopaChampion', score: Math.max(0, userScore - Math.floor(Math.random() * 300)), rank: 2 },
      { userId: 'r3', username: 'StickerKing', score: Math.max(0, userScore - Math.floor(Math.random() * 400)), rank: 3 },
      { userId: 'r4', username: 'CollectionPro', score: Math.max(0, userScore - Math.floor(Math.random() * 500)), rank: 4 },
      { userId: 'r5', username: 'WorldCupFan', score: Math.max(0, userScore - Math.floor(Math.random() * 600)), rank: 5 },
    ];

    const allEntries = [...mockRivals];
    if (user) {
      const existingIdx = allEntries.findIndex(e => e.userId === user.id);
      if (existingIdx > -1) allEntries.splice(existingIdx, 1);
      allEntries.push({ userId: user.id, username: userName, score: userScore, rank: 0 });
    }

    allEntries.sort((a, b) => b.score - a.score);
    const ranked = allEntries.map((e, i) => ({ ...e, rank: i + 1 }));

    this.debug.info('METHOD', 'GamificationService', `HallOfFame carregado para categoria ${category}`, { category, userScore, userRank: ranked.find(e => e.userId === user?.id)?.rank, totalEntries: ranked.length });
    const ms = this.debug.endTimer('getHallOfFame');
    this.debug.logMethodExit('GamificationService', 'getHallOfFame', { category, entries: ranked.length }, ms);
    return of(ranked).pipe(delay(100));
  }

  awardFirstPackBadge(): void {
    this.debug.logMethodEntry('GamificationService', 'awardFirstPackBadge');
    if (!this.hasBadge('b1')) {
      this.awardBadge('b1');
    }
    this.debug.logMethodExit('GamificationService', 'awardFirstPackBadge');
  }
}
