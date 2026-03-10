import { OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-album-home',
  standalone: true,
  imports: [RouterLink, ProgressBarComponent],
  templateUrl: './album-home.component.html',
  styleUrl: './album-home.component.css'
})
export class AlbumHomeComponent implements OnInit {
  progress2022 = 45;
  progress2026 = 12;

  private notificationService = inject(NotificationService);

  ngOnInit() {
    // SK08 — Proatividade: Solicitar permissão de notificações para engajamento
    this.notificationService.requestPermission();
  }
}
