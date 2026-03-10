import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepWelcomeComponent } from './step-welcome/step-welcome.component';
import { StepTeamComponent } from './step-team/step-team.component';
import { StepFirstPackComponent } from './step-first-pack/step-first-pack.component';
import { StepAlbumPreviewComponent } from './step-album-preview/step-album-preview.component';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, StepWelcomeComponent, StepTeamComponent, StepFirstPackComponent, StepAlbumPreviewComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css'
})
export class OnboardingComponent {
  currentStep = 1;

  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }
}
