import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TradeService } from '../../../core/services/trade.service';
import { TradeGroup } from '../../../core/models/trade.model';

@Component({
  selector: 'app-trade-groups',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './trade-groups.component.html',
  styleUrl: './trade-groups.component.css'
})
export class TradeGroupsComponent implements OnInit {
  groups: TradeGroup[] = [];
  private tradeService = inject(TradeService);

  ngOnInit() {
    this.tradeService.getTradeGroups().subscribe(g => this.groups = g);
  }
}
