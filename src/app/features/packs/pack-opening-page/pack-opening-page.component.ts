import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PackOpeningComponent } from '../../../shared/components/pack-opening/pack-opening.component';
import { PackType } from '../../../core/models/pack.model';

@Component({
  selector: 'app-pack-opening-page',
  standalone: true,
  imports: [CommonModule, PackOpeningComponent],
  templateUrl: './pack-opening-page.component.html',
  styleUrl: './pack-opening-page.component.css'
})
export class PackOpeningPageComponent implements OnInit {
  packType: PackType = 'basic';
  isPhygital = false;
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.packType = (params.get('packType') as PackType) || 'basic';
    });
    this.route.queryParamMap.subscribe(params => {
      this.isPhygital = params.get('phygital') === 'true';
    });
  }

  onComplete() {
    this.router.navigate(['/packs']);
  }
}
