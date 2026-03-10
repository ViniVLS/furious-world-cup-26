import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-step-first-pack',
  standalone: true,
  templateUrl: './step-first-pack.component.html',
  styleUrl: './step-first-pack.component.css'
})
export class StepFirstPackComponent {
  @Output() next = new EventEmitter<void>();
  opened = false;

  openPack() {
    this.opened = true;
    setTimeout(() => {
      this.next.emit();
    }, 2000);
  }
}
