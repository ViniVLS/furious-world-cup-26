import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { DebugService } from '../../../../../debug/debug.service';

@Component({
  selector: 'app-step-first-pack',
  standalone: true,
  templateUrl: './step-first-pack.component.html',
  styleUrl: './step-first-pack.component.css'
})
export class StepFirstPackComponent implements OnInit {
  private readonly debug = inject(DebugService);
  @Output() next = new EventEmitter<void>();
  opened = false;

  ngOnInit() {
    this.debug.logLifecycle('StepFirstPackComponent', 'ngOnInit');
  }

  openPack() {
    this.debug.logMethodEntry('StepFirstPackComponent', 'openPack');
    this.opened = true;
    this.debug.info('AUDIT', 'StepFirstPackComponent', 'Primeiro pacote sendo aberto no onboarding');
    setTimeout(() => {
      this.debug.logMethodExit('StepFirstPackComponent', 'openPack', { opened: true });
      this.next.emit();
    }, 2000);
  }
}
