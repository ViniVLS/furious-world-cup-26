import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DebugService } from '../../../../../debug/debug.service';

@Component({
  selector: 'app-step-album-preview',
  standalone: true,
  templateUrl: './step-album-preview.component.html',
  styleUrl: './step-album-preview.component.css'
})
export class StepAlbumPreviewComponent implements OnInit {
  private readonly debug = inject(DebugService);
  private router = inject(Router);

  ngOnInit() {
    this.debug.logLifecycle('StepAlbumPreviewComponent', 'ngOnInit');
  }

  finish() {
    this.debug.logMethodEntry('StepAlbumPreviewComponent', 'finish');
    this.debug.logAudit('OnboardingComponent', 'Onboarding COMPLETO - usuário finalizado');
    this.router.navigate(['/album']);
    this.debug.logNavigation('/onboarding', '/album');
    this.debug.logMethodExit('StepAlbumPreviewComponent', 'finish');
  }
}
