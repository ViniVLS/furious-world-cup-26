import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TradeService } from '../../../core/services/trade.service';
import { TradeGroup } from '../../../core/models/trade.model';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-trade-groups',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './trade-groups.component.html',
  styleUrl: './trade-groups.component.css'
})
export class TradeGroupsComponent {
  private tradeService = inject(TradeService);
  private toastService = inject(ToastService);

  groups = computed(() => this.tradeService.tradeGroups());

  joinGroup(group: TradeGroup): void {
    if (group.memberCount >= group.maxMembers) {
      this.toastService.warning('Este grupo está lotado!');
      return;
    }
    this.tradeService.joinGroup(group.id).subscribe({
      next: () => this.toastService.success(`Você entrou no grupo "${group.name}" com sucesso!`),
      error: (err) => this.toastService.error(err.message)
    });
  }
}
