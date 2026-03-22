import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Pack } from '../../../core/models/pack.model';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AudioService } from '../../../core/services/audio.service';
import { DebugService } from '../../../../debug/debug.service';

@Component({
  selector: 'app-pack-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './pack-list.component.html',
  styleUrl: './pack-list.component.css'
})
export class PackListComponent implements OnInit {
  private readonly debug = inject(DebugService);
  private userService = inject(UserService);
  private router = inject(Router);
  private audioService = inject(AudioService);

  currentUser = this.userService.currentUser;
  showRedeemModal = false;

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

  ngOnInit() {
    this.debug.logLifecycle('PackListComponent', 'ngOnInit');
    this.debug.info('STATE', 'PackListComponent', 'Componente carregado', {
      userCoins: this.currentUser()?.furyCoins,
      packs: this.packs.map(p => ({ type: p.type, cost: p.coinsCost }))
    });
  }

  buyPack(pack: Pack) {
    this.debug.logMethodEntry('PackListComponent', 'buyPack', { packType: pack.type, cost: pack.coinsCost });
    const timer = this.debug.startTimer('buyPack');
    this.audioService.play('buy_pack');
    this.router.navigate(['/packs/open', pack.type]);
    const ms = this.debug.endTimer('buyPack');
    this.debug.logMethodExit('PackListComponent', 'buyPack', { navigation: `/packs/open/${pack.type}` }, ms);
  }

  isValidCode(): boolean {
    const val = this.phygitalCodeControl.value || '';
    const clean = val.replace(/[^a-zA-Z0-9]/g, '');
    return clean.length === 12;
  }

  redeemCode() {
    this.debug.logMethodEntry('PackListComponent', 'redeemCode');
    const timer = this.debug.startTimer('redeemCode');
    if (this.isValidCode()) {
      this.debug.logAudit('PackListComponent', `Código phygital resgatado: código válido`);
      this.showRedeemModal = false;
      this.phygitalCodeControl.reset();
      this.router.navigate(['/packs/open', 'elite'], { queryParams: { phygital: 'true' } });
      const ms = this.debug.endTimer('redeemCode');
      this.debug.logMethodExit('PackListComponent', 'redeemCode', { success: true, phygital: true }, ms);
    } else {
      this.debug.warn('WARN', 'PackListComponent', 'Código phygital inválido', { valid: false });
      const ms = this.debug.endTimer('redeemCode');
      this.debug.logMethodExit('PackListComponent', 'redeemCode', { success: false, reason: 'invalid_code' }, ms);
    }
  }
}
