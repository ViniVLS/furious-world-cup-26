import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-step-welcome',
  standalone: true,
  templateUrl: './step-welcome.component.html',
  styleUrl: './step-welcome.component.css'
})
export class StepWelcomeComponent {
  @Output() next = new EventEmitter<void>();
}
