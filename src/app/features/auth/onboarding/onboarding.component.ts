import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepWelcomeComponent } from './step-welcome/step-welcome.component';
import { StepTeamComponent } from './step-team/step-team.component';
import { StepFirstPackComponent } from './step-first-pack/step-first-pack.component';
import { StepAlbumPreviewComponent } from './step-album-preview/step-album-preview.component';
import { DebugService } from '../../../../debug/debug.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, StepWelcomeComponent, StepTeamComponent, StepFirstPackComponent, StepAlbumPreviewComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css'
})
export class OnboardingComponent implements OnInit {
  private readonly debug = inject(DebugService);
  currentStep = 1;

  ngOnInit() {
    this.debug.logLifecycle('OnboardingComponent', 'ngOnInit');
    this.debug.info('STATE', 'OnboardingComponent', `Onboarding iniciado no step ${this.currentStep}`);
  }

  nextStep() {
    this.debug.logMethodEntry('OnboardingComponent', 'nextStep', { currentStep: this.currentStep, nextStep: this.currentStep + 1 });
    const timer = this.debug.startTimer('nextStep');
    if (this.currentStep < 4) {
      const prev = this.currentStep;
      this.currentStep++;
      this.debug.logNavigation(`/onboarding?step=${prev}`, `/onboarding?step=${this.currentStep}`, { from: prev, to: this.currentStep });
    }
    const ms = this.debug.endTimer('nextStep');
    this.debug.logMethodExit('OnboardingComponent', 'nextStep', { newStep: this.currentStep }, ms);
  }
}
