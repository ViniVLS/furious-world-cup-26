import { Routes } from '@angular/router';

export const CHALLENGE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/challenge-list.component').then(m => m.ChallengeListComponent)
  },
  {
    path: 'quiz',
    loadComponent: () => import('./quiz/quiz-furia.component').then(m => m.QuizFuriaComponent)
  }
];
