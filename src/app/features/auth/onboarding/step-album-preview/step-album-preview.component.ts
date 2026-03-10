import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-step-album-preview',
  standalone: true,
  templateUrl: './step-album-preview.component.html',
  styleUrl: './step-album-preview.component.css'
})
export class StepAlbumPreviewComponent {
  private router = inject(Router);

  finish() {
    this.router.navigate(['/album']);
  }
}
