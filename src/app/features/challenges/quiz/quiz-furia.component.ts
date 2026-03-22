import { Component, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';
import { AudioService } from '../../../core/services/audio.service';
import { DebugService } from '../../../../debug/debug.service';

export interface QuizQuestion {
    id: number; question: string; options: string[]; correctIndex: number;
    category: 'historia' | 'jogador' | 'estadio' | 'selecao';
    difficulty: 'easy' | 'medium' | 'hard'; basePoints: number;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
    { id: 1, question: 'Quem foi o artilheiro da Copa do Mundo 2022?', options: ['Messi', 'Mbappé', 'Benzema', 'Giroud'], correctIndex: 1, category: 'jogador', difficulty: 'easy', basePoints: 100 },
    { id: 2, question: 'Qual país venceu a Copa do Mundo 2022?', options: ['Brasil', 'França', 'Argentina', 'Marrocos'], correctIndex: 2, category: 'selecao', difficulty: 'easy', basePoints: 100 },
    { id: 3, question: 'Em qual estádio foi a final da Copa 2022?', options: ['Al Bayt', 'Lusail Stadium', 'Khalifa', 'Education City'], correctIndex: 1, category: 'estadio', difficulty: 'medium', basePoints: 150 },
    { id: 4, question: 'Quantos gols Mbappé marcou na Copa 2022?', options: ['6', '7', '8', '9'], correctIndex: 2, category: 'jogador', difficulty: 'hard', basePoints: 200 },
    { id: 5, question: 'Qual seleção surpreendeu ao eliminar a Argentina na fase de grupos em 2022?', options: ['Arábia Saudita', 'Polônia', 'México', 'Austrália'], correctIndex: 0, category: 'historia', difficulty: 'medium', basePoints: 150 },
    { id: 6, question: 'Quem venceu o Prêmio de Melhor Jogador (Bola de Ouro) na Copa 2022?', options: ['Mbappé', 'Modric', 'Messi', 'Benzema'], correctIndex: 2, category: 'jogador', difficulty: 'easy', basePoints: 100 },
    { id: 7, question: 'Qual foi o placar da final da Copa 2022 no tempo regulamentar?', options: ['2x2', '3x3', '2x0', '1x0'], correctIndex: 0, category: 'historia', difficulty: 'hard', basePoints: 200 },
    { id: 8, question: 'Em quantos países a Copa do Mundo 2026 será sediada?', options: ['1', '2', '3', '4'], correctIndex: 2, category: 'historia', difficulty: 'easy', basePoints: 100 },
    { id: 9, question: 'Qual estádio mexicano receberá jogos na Copa 2026?', options: ['Estadio Akron', 'Estadio Azteca', 'Estadio BBVA', 'Ambos A e B'], correctIndex: 3, category: 'estadio', difficulty: 'medium', basePoints: 150 },
    { id: 10, question: 'Qual a capacidade do MetLife Stadium (final da Copa 2026)?', options: ['70.000', '75.000', '82.500', '90.000'], correctIndex: 2, category: 'estadio', difficulty: 'hard', basePoints: 200 },
    { id: 11, question: 'Marrocos foi a primeira seleção africana a chegar à:', options: ['Semifinal', 'Final', 'Quartas', 'Oitavas'], correctIndex: 0, category: 'historia', difficulty: 'medium', basePoints: 150 },
    { id: 12, question: 'Quantas seleções vão disputar a Copa do Mundo 2026?', options: ['32', '36', '48', '64'], correctIndex: 2, category: 'historia', difficulty: 'easy', basePoints: 100 },
    { id: 13, question: 'Qual jogador marcou hat-trick na final da Copa 2022?', options: ['Messi', 'Di Maria', 'Mbappé', 'Griezmann'], correctIndex: 2, category: 'jogador', difficulty: 'medium', basePoints: 150 },
    { id: 14, question: 'Qual foi o Goleiro do Torneio da Copa 2022?', options: ['Lloris', 'Martínez', 'Bono', 'De Gea'], correctIndex: 1, category: 'jogador', difficulty: 'medium', basePoints: 150 },
    { id: 15, question: 'Em qual cidade dos EUA será disputada a final da Copa 2026?', options: ['Los Angeles', 'Nova York (NJ)', 'Dallas', 'Miami'], correctIndex: 1, category: 'estadio', difficulty: 'hard', basePoints: 200 },
    { id: 16, question: 'Lamine Yamal é considerado grande promessa para a Copa 2026. Qual é sua seleção?', options: ['Portugal', 'França', 'Espanha', 'Brasil'], correctIndex: 2, category: 'jogador', difficulty: 'easy', basePoints: 100 },
    { id: 17, question: 'Estêvão Willian, promessa do Brasil, atua em qual clube europeu a partir de 2025?', options: ['PSG', 'Chelsea', 'Real Madrid', 'Manchester City'], correctIndex: 1, category: 'jogador', difficulty: 'medium', basePoints: 150 },
    { id: 18, question: 'Quantos gols a Argentina marcou ao total na Copa 2022?', options: ['14', '15', '16', '17'], correctIndex: 0, category: 'selecao', difficulty: 'hard', basePoints: 200 },
    { id: 19, question: 'Qual seleção africana eliminou a Espanha nos pênaltis em 2022?', options: ['Senegal', 'Gana', 'Marrocos', 'Camarões'], correctIndex: 2, category: 'selecao', difficulty: 'medium', basePoints: 150 },
    { id: 20, question: 'Quantos estádios o Qatar construiu/reformou para a Copa 2022?', options: ['6', '7', '8', '9'], correctIndex: 2, category: 'estadio', difficulty: 'hard', basePoints: 200 },
];

type QuizPhase = 'idle' | 'active' | 'result' | 'finished';

@Component({
    selector: 'app-quiz-furia',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './quiz-furia.component.html',
    styleUrl: './quiz-furia.component.css',
})
export class QuizFuriaComponent implements OnDestroy {
    private readonly debug = inject(DebugService);
    private userService = inject(UserService);
    private audioService = inject(AudioService);

    phase = signal<QuizPhase>('idle');
    currentQuestionIndex = signal(0);
    questions: QuizQuestion[] = [];
    selectedAnswer = signal<number | null>(null);
    isAnswerRevealed = signal(false);
    timeLeft = signal(30);
    private timerInterval?: ReturnType<typeof setInterval>;
    streak = signal(0);
    maxStreak = signal(0);
    streakMultiplierActive = signal(false);
    totalScore = signal(0);
    correctAnswers = signal(0);
    wrongAnswers = signal(0);
    roundScores: { question: string; points: number; correct: boolean }[] = [];

    currentQuestion = computed(() => this.questions[this.currentQuestionIndex()]);
    isLastQuestion = computed(() => this.currentQuestionIndex() >= this.questions.length - 1);
    timerPct = computed(() => (this.timeLeft() / 30) * 100);
    timerColor = computed(() => {
        const t = this.timeLeft();
        if (t > 20) return 'var(--color-fury)';
        if (t > 10) return '#FFA500';
        return '#FF4444';
    });

    ngOnDestroy() {
        this.debug.logLifecycle('QuizFuriaComponent', 'ngOnDestroy');
        clearInterval(this.timerInterval);
    }

    startQuiz() {
        this.debug.logMethodEntry('QuizFuriaComponent', 'startQuiz');
        const timer = this.debug.startTimer('startQuiz');
        const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
        this.questions = shuffled.slice(0, 10);
        this.currentQuestionIndex.set(0);
        this.totalScore.set(0);
        this.correctAnswers.set(0);
        this.wrongAnswers.set(0);
        this.streak.set(0);
        this.maxStreak.set(0);
        this.roundScores = [];
        this.phase.set('active');
        this.debug.info('METHOD', 'QuizFuriaComponent', `Quiz iniciado com ${this.questions.length} perguntas`, { totalQuestions: this.questions.length });
        this.startTimer();
        const ms = this.debug.endTimer('startQuiz');
        this.debug.logMethodExit('QuizFuriaComponent', 'startQuiz', { questions: this.questions.length }, ms);
    }

    private startTimer() {
        this.timeLeft.set(30);
        this.selectedAnswer.set(null);
        this.isAnswerRevealed.set(false);
        this.streakMultiplierActive.set(this.streak() >= 2);
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            const current = this.timeLeft();
            if (current <= 1) {
                this.timeExpired();
            } else {
                this.timeLeft.set(current - 1);
            }
        }, 1000);
    }

    private timeExpired() {
        this.debug.logMethodEntry('QuizFuriaComponent', 'timeExpired', { questionIndex: this.currentQuestionIndex() });
        const timer = this.debug.startTimer('timeExpired');
        clearInterval(this.timerInterval);
        this.streak.set(0);
        this.streakMultiplierActive.set(false);
        this.isAnswerRevealed.set(true);
        this.selectedAnswer.set(-1);
        this.wrongAnswers.update(n => n + 1);
        const q = this.currentQuestion();
        this.roundScores.push({ question: q.question, points: 0, correct: false });
        this.debug.info('METHOD', 'QuizFuriaComponent', `Tempo expirado na questão ${q.id}: ${q.question}`, { questionId: q.id, correctAnswer: q.correctIndex });
        setTimeout(() => this.advanceQuestion(), 2000);
        const ms = this.debug.endTimer('timeExpired');
        this.debug.logMethodExit('QuizFuriaComponent', 'timeExpired', { questionId: q.id }, ms);
    }

    selectAnswer(index: number) {
        this.debug.logMethodEntry('QuizFuriaComponent', 'selectAnswer', { index, questionId: this.currentQuestion()?.id });
        const timer = this.debug.startTimer('selectAnswer');
        if (this.isAnswerRevealed()) {
            this.debug.warn('WARN', 'QuizFuriaComponent', 'Resposta já revelada, ignorando');
            this.debug.logMethodExit('QuizFuriaComponent', 'selectAnswer', { ignored: true });
            return;
        }
        clearInterval(this.timerInterval);

        const q = this.currentQuestion();
        const isCorrect = index === q.correctIndex;
        const timeBonus = Math.floor(this.timeLeft() * 3);

        this.selectedAnswer.set(index);
        this.isAnswerRevealed.set(true);

        if (isCorrect) {
            this.debug.info('METHOD', 'QuizFuriaComponent', `✅ Correta! Questão ${q.id}`, { questionId: q.id, correct: true, timeBonus, selected: index, correctIndex: q.correctIndex });
            this.audioService.play('quiz_correct');
            const newStreak = this.streak() + 1;
            this.streak.set(newStreak);
            if (newStreak > this.maxStreak()) this.maxStreak.set(newStreak);
            const multiplier = newStreak >= 2 ? 2 : 1;
            const points = (q.basePoints + timeBonus) * multiplier;
            this.totalScore.update(s => s + points);
            this.correctAnswers.update(n => n + 1);
            this.roundScores.push({ question: q.question, points, correct: true });
            this.debug.info('METHOD', 'QuizFuriaComponent', `Pontos ganhos: ${points} (base: ${q.basePoints} + tempo: ${timeBonus}) x${multiplier}`, { points, multiplier, streak: newStreak });
        } else {
            this.debug.info('METHOD', 'QuizFuriaComponent', `❌ Incorreta. Questão ${q.id}`, { questionId: q.id, correct: false, selected: index, correctIndex: q.correctIndex });
            this.audioService.play('quiz_wrong');
            this.streak.set(0);
            this.streakMultiplierActive.set(false);
            this.wrongAnswers.update(n => n + 1);
            this.roundScores.push({ question: q.question, points: 0, correct: false });
        }

        setTimeout(() => this.advanceQuestion(), 1800);
        const ms = this.debug.endTimer('selectAnswer');
        this.debug.logMethodExit('QuizFuriaComponent', 'selectAnswer', { correct: isCorrect, points: isCorrect ? (this.currentQuestion()?.basePoints || 0) + timeBonus : 0 }, ms);
    }

    private advanceQuestion() {
        this.debug.logMethodEntry('QuizFuriaComponent', 'advanceQuestion', { currentIndex: this.currentQuestionIndex(), total: this.questions.length });
        if (this.isLastQuestion()) {
            this.finishQuiz();
        } else {
            this.currentQuestionIndex.update(i => i + 1);
            this.debug.info('METHOD', 'QuizFuriaComponent', `Avançando para questão ${this.currentQuestionIndex() + 1}`, { nextIndex: this.currentQuestionIndex() });
            this.startTimer();
        }
        this.debug.logMethodExit('QuizFuriaComponent', 'advanceQuestion');
    }

    private finishQuiz() {
        this.debug.logMethodEntry('QuizFuriaComponent', 'finishQuiz');
        const timer = this.debug.startTimer('finishQuiz');
        clearInterval(this.timerInterval);
        this.phase.set('finished');

        const coinsEarned = Math.floor(this.totalScore() / 10);
        if (coinsEarned > 0) {
            this.userService.addCoins(coinsEarned);
            this.debug.logAudit('GamificationService', `Quiz Fúria concluído. Pontos: ${this.totalScore()}. Coins ganhos: ${coinsEarned}`, {
                totalScore: this.totalScore(), correct: this.correctAnswers(), wrong: this.wrongAnswers(),
                maxStreak: this.maxStreak(), coinsEarned
            });
        } else {
            this.debug.info('AUDIT', 'QuizFuriaComponent', `Quiz Fúria concluído sem coins (pontuação: ${this.totalScore()})`);
        }
        const ms = this.debug.endTimer('finishQuiz');
        this.debug.logMethodExit('QuizFuriaComponent', 'finishQuiz', { totalScore: this.totalScore(), correct: this.correctAnswers(), coinsEarned }, ms);
    }

    getAnswerClass(index: number): string {
        if (!this.isAnswerRevealed()) return '';
        const q = this.currentQuestion();
        if (index === q.correctIndex) return 'answer--correct';
        if (index === this.selectedAnswer() && index !== q.correctIndex) return 'answer--wrong';
        return 'answer--dimmed';
    }

    get rank(): string {
        const pct = this.correctAnswers() / this.questions.length;
        if (pct === 1) return '🏆 FURIOUS MASTER';
        if (pct >= 0.8) return '⭐ Lendário';
        if (pct >= 0.6) return '🔥 Épico';
        if (pct >= 0.4) return '📚 Em Evolução';
        return '🎽 Novato';
    }

    get coinsEarned(): number {
        return Math.floor(this.totalScore() / 10);
    }
}
