import { Component, OnInit, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { VERSION } from '../../../../environments/version';
import { AudioService } from '../../../core/services/audio.service';
import { DebugService } from '../../../../debug/debug.service';

const CREATOR_EMAIL = 'viniedoug@gmail.com';
const CREATOR_KEY = 'furia-creator-email';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.css'
})
export class BottomNavComponent implements OnInit {
  private readonly debug = inject(DebugService);
  version = VERSION;
  audioService = inject(AudioService);
  isMuted = this.audioService.isMuted;
  isCreator = computed(() => typeof localStorage !== 'undefined' && localStorage.getItem(CREATOR_KEY) === CREATOR_EMAIL);

  ngOnInit() {
    this.debug.logLifecycle('BottomNavComponent', 'ngOnInit');
  }

  toggleMute() {
    this.debug.logMethodEntry('BottomNavComponent', 'toggleMute', { mutedBefore: this.isMuted() });
    const timer = this.debug.startTimer('toggleMute');
    this.audioService.toggleMute();
    this.debug.info('AUDIO', 'BottomNavComponent', `Botão de áudio clicado. Mute: ${this.isMuted()}`);
    const ms = this.debug.endTimer('toggleMute');
    this.debug.logMethodExit('BottomNavComponent', 'toggleMute', { mutedAfter: this.isMuted() }, ms);
  }

  testAudio() {
    this.debug.logMethodEntry('BottomNavComponent', 'testAudio');
    this.debug.info('AUDIO', 'BottomNavComponent', 'Teste manual de áudio disparado pelo usuário');
    this.audioService.play('login');
    this.debug.logMethodExit('BottomNavComponent', 'testAudio');
  }

  navItems = [
    { path: '/album', icon: 'book', label: 'Álbum' },
    { path: '/packs', icon: 'style', label: 'Pacotes' },
    { path: '/trading', icon: 'swap_horiz', label: 'Trocas' },
    { path: '/challenges', icon: 'track_changes', label: 'Desafios' },
    { path: '/ranking', icon: 'emoji_events', label: 'Ranking' },
    { path: '/profile', icon: 'person', label: 'Perfil' }
  ];
}
