import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-edition-view',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './edition-view.component.html',
  styleUrl: './edition-view.component.css'
})
export class EditionViewComponent implements OnInit {
  edition = '';
  teams = [
    { code: 'BRA', name: 'Brasil', progress: 80 },
    { code: 'ARG', name: 'Argentina', progress: 40 },
    { code: 'FRA', name: 'França', progress: 10 },
    { code: 'ENG', name: 'Inglaterra', progress: 0 }
  ];

  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.edition = params.get('edition') || '';
    });
  }
}
