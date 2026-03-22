import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugService } from '../../../../../debug/debug.service';

@Component({
  selector: 'app-step-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-team.component.html',
  styleUrl: './step-team.component.css'
})
export class StepTeamComponent implements OnInit {
  private readonly debug = inject(DebugService);
  @Output() next = new EventEmitter<void>();
  selectedTeam: string | null = null;

  teams = [
    { code: 'BRA', name: 'Brasil' },
    { code: 'ARG', name: 'Argentina' },
    { code: 'FRA', name: 'França' },
    { code: 'ENG', name: 'Inglaterra' }
  ];

  ngOnInit() {
    this.debug.logLifecycle('StepTeamComponent', 'ngOnInit');
  }

  selectTeam(code: string) {
    this.debug.logMethodEntry('StepTeamComponent', 'selectTeam', { code, previousSelection: this.selectedTeam });
    const timer = this.debug.startTimer('selectTeam');
    this.selectedTeam = code;
    this.debug.info('AUDIT', 'StepTeamComponent', `Seleção favorita escolhida: ${code}`, { teamCode: code, teamName: this.teams.find(t => t.code === code)?.name });
    const ms = this.debug.endTimer('selectTeam');
    this.debug.logMethodExit('StepTeamComponent', 'selectTeam', { selected: code }, ms);
  }
}
