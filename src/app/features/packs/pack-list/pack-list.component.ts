import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Pack } from '../../../core/models/pack.model';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-pack-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './pack-list.component.html',
  styleUrl: './pack-list.component.css'
})
export class PackListComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  currentUser = this.userService.currentUser;
  showRedeemModal = false;
  
  // Phygital code: 12 digits (can include hyphens)
  phygitalCodeControl = new FormControl('', [
    Validators.required,
    Validators.minLength(12)
  ]);

  packs: Pack[] = [
    { type: 'basic', name: 'Básico', quantity: 5, guarantees: 'Nenhuma', coinsCost: 100, imageUrl: '' },
    { type: 'plus', name: 'Plus', quantity: 10, guarantees: '1 Especial mínimo', coinsCost: 180, imageUrl: '' },
    { type: 'elite', name: 'Elite', quantity: 20, guarantees: '1 Épica mínimo', coinsCost: 300, imageUrl: '' },
    { type: 'legendary', name: 'Lendário', quantity: 5, guarantees: '1 Lendária garantida', coinsCost: 500, imageUrl: '' },
    { type: 'copa', name: 'Copa', quantity: 15, guarantees: '3 Especiais + chance FURIOUS', coinsCost: 250, imageUrl: '' }
  ];

  buyPack(pack: Pack) {
    if (this.userService.deductCoins(pack.coinsCost)) {
      this.router.navigate(['/packs/open', pack.type]);
    } else {
      alert('Fúria Coins insuficientes!');
    }
  }

  isValidCode(): boolean {
    const val = this.phygitalCodeControl.value || '';
    const clean = val.replace(/[^a-zA-Z0-9]/g, '');
    return clean.length === 12;
  }

  redeemCode() {
    if (this.isValidCode()) {
      // Logic for redeeming code: 1 Elite Pack + 1 Physical Edition sticker
      this.showRedeemModal = false;
      this.phygitalCodeControl.reset();
      // Navigate to open pack with special phygital flag or just open elite
      this.router.navigate(['/packs/open', 'elite'], { queryParams: { phygital: 'true' } });
    }
  }
}
