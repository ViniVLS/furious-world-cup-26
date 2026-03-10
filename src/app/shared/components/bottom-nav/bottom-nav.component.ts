import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { VERSION } from '../../../../environments/version';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.css'
})
export class BottomNavComponent {
  version = VERSION;
  navItems = [
    { path: '/album', icon: 'book', label: 'Álbum' },
    { path: '/packs', icon: 'style', label: 'Pacotes' },
    { path: '/trading', icon: 'swap_horiz', label: 'Trocas' },
    { path: '/challenges', icon: 'track_changes', label: 'Desafios' },
    { path: '/ranking', icon: 'emoji_events', label: 'Ranking' },
    { path: '/profile', icon: 'person', label: 'Perfil' }
  ];
}
