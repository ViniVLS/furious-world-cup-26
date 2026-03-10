import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-team.component.html',
  styleUrl: './step-team.component.css'
})
export class StepTeamComponent {
  @Output() next = new EventEmitter<void>();
  selectedTeam: string | null = null;

  teams = [
    { code: 'BRA', name: 'Brasil' },
    { code: 'ARG', name: 'Argentina' },
    { code: 'FRA', name: 'França' },
    { code: 'ENG', name: 'Inglaterra' }
  ];

  selectTeam(code: string) {
    this.selectedTeam = code;
  }
}
