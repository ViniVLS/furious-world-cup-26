import { Component, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    category: 'historia' | 'jogador' | 'estadio' | 'selecao';
    difficulty: 'easy' | 'medium' | 'hard';
    basePoints: number;
}

// SK04 — Banco de 20 perguntas reais sobre as Copas 2022 e 2026
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
    private userService = inject(UserService);

    // SK04 — Estado do quiz
    phase = signal<QuizPhase>('idle');
    currentQuestionIndex = signal(0);
    questions: QuizQuestion[] = [];
    selectedAnswer = signal<number | null>(null);
    isAnswerRevealed = signal(false);

    // SK04 — Timer 30s com intervalo
    timeLeft = signal(30);
    private timerInterval?: ReturnType<typeof setInterval>;

    // SK04 — Streak x2 (respostas corretas consecutivas)
    streak = signal(0);
    maxStreak = signal(0);
    streakMultiplierActive = signal(false);

    // Pontuação
    totalScore = signal(0);
    correctAnswers = signal(0);
    wrongAnswers = signal(0);
    roundScores: { question: string; points: number; correct: boolean }[] = [];

    // Computed
    currentQuestion = computed(() => this.questions[this.currentQuestionIndex()]);
    isLastQuestion = computed(() => this.currentQuestionIndex() >= this.questions.length - 1);
    timerPct = computed(() => (this.timeLeft() / 30) * 100);
    timerColor = computed(() => {
        const t = this.timeLeft();
        if (t > 20) return 'var(--color-fury)';
        if (t > 10) return '#FFA500';
        return '#FF4444';
    });

    startQuiz() {
        // Sortear 10 perguntas aleatórias do banco de 20
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
        this.startTimer();
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
        clearInterval(this.timerInterval);
        // Resposta errada por tempo
        this.streak.set(0);
        this.streakMultiplierActive.set(false);
        this.isAnswerRevealed.set(true);
        this.selectedAnswer.set(-1); // sinaliza timeout
        this.wrongAnswers.update(n => n + 1);
        const q = this.currentQuestion();
        this.roundScores.push({ question: q.question, points: 0, correct: false });

        setTimeout(() => this.advanceQuestion(), 2000);
    }

    selectAnswer(index: number) {
        if (this.isAnswerRevealed()) return;
        clearInterval(this.timerInterval);

        const q = this.currentQuestion();
        const isCorrect = index === q.correctIndex;
        const timeBonus = Math.floor(this.timeLeft() * 3); // até +90 pontos por velocidade

        this.selectedAnswer.set(index);
        this.isAnswerRevealed.set(true);

        if (isCorrect) {
            const newStreak = this.streak() + 1;
            this.streak.set(newStreak);
            if (newStreak > this.maxStreak()) this.maxStreak.set(newStreak);

            // SK04 — Multiplicador x2 se streak >= 2
            const multiplier = newStreak >= 2 ? 2 : 1;
            const points = (q.basePoints + timeBonus) * multiplier;

            this.totalScore.update(s => s + points);
            this.correctAnswers.update(n => n + 1);
            this.roundScores.push({ question: q.question, points, correct: true });
        } else {
            this.streak.set(0);
            this.streakMultiplierActive.set(false);
            this.wrongAnswers.update(n => n + 1);
            this.roundScores.push({ question: q.question, points: 0, correct: false });
        }

        setTimeout(() => this.advanceQuestion(), 1800);
    }

    private advanceQuestion() {
        if (this.isLastQuestion()) {
            this.finishQuiz();
        } else {
            this.currentQuestionIndex.update(i => i + 1);
            this.startTimer();
        }
    }

    private finishQuiz() {
        clearInterval(this.timerInterval);
        this.phase.set('finished');

        // SK04 — Converter pontuação em Fúria Coins (1 coin a cada 10 pontos)
        const coinsEarned = Math.floor(this.totalScore() / 10);
        if (coinsEarned > 0) {
            this.userService.addCoins(coinsEarned);
            console.log(`[GAMIFICATION LOG] Quiz Fúria concluído. Pontos: ${this.totalScore()}. Coins ganhos: ${coinsEarned}`);
        }
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

    ngOnDestroy() {
        clearInterval(this.timerInterval);
    }
}
