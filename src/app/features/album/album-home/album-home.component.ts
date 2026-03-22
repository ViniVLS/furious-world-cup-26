import { Component, OnInit, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { NotificationService } from '../../../core/services/notification.service';
import { AudioService } from '../../../core/services/audio.service';
import { StickerService } from '../../../core/services/sticker.service';
import { DebugService } from '../../../../debug/debug.service';

@Component({
  selector: 'app-album-home',
  standalone: true,
  imports: [RouterLink, ProgressBarComponent],
  templateUrl: './album-home.component.html',
  styleUrl: './album-home.component.css'
})
export class AlbumHomeComponent implements OnInit {
  private readonly debug = inject(DebugService);
  private notificationService = inject(NotificationService);
  private audioService = inject(AudioService);
  private stickerService = inject(StickerService);

  progress2022 = computed(() => this.stickerService.albumProgress().edition2022);
  progress2026 = computed(() => this.stickerService.albumProgress().edition2026);

  ngOnInit() {
    this.debug.logLifecycle('AlbumHomeComponent', 'ngOnInit');
    this.debug.info('STATE', 'AlbumHomeComponent', 'Album carregado', {
      progress2022: this.progress2022(), progress2026: this.progress2026()
    });
    this.audioService.play('album_enter');
    this.notificationService.requestPermission();
  }
}
