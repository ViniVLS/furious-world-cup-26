import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Sticker } from '../../../core/models/sticker.model';

@Component({
  selector: 'app-sticker-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './sticker-card.component.html',
  styleUrl: './sticker-card.component.css'
})
export class StickerCardComponent {
  @Input() sticker!: Sticker;
  @Input() isCollected = false;
  @Input() isRevealed = false;
  @Input() showDetails = true;
}
