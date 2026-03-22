import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PackOpeningComponent } from '../../../shared/components/pack-opening/pack-opening.component';
import { PackType } from '../../../core/models/pack.model';
import { DebugService } from '../../../../debug/debug.service';

@Component({
  selector: 'app-pack-opening-page',
  standalone: true,
  imports: [CommonModule, PackOpeningComponent],
  templateUrl: './pack-opening-page.component.html',
  styleUrl: './pack-opening-page.component.css'
})
export class PackOpeningPageComponent implements OnInit, OnDestroy {
  packType: PackType = 'basic';
  isPhygital = false;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly debug = inject(DebugService);

  ngOnInit() {
    this.debug.logLifecycle('PackOpeningPageComponent', 'ngOnInit');
    this.route.paramMap.subscribe(params => {
      this.packType = (params.get('packType') as PackType) || 'basic';
      this.debug.info('METHOD', 'PackOpeningPageComponent', `Pack type resolved: ${this.packType}`, { packType: this.packType });
    });
    this.route.queryParamMap.subscribe(params => {
      this.isPhygital = params.get('phygital') === 'true';
      if (this.isPhygital) {
        this.debug.info('METHOD', 'PackOpeningPageComponent', 'Modo Phygital ativado');
      }
    });
  }

  onComplete() {
    this.debug.logMethodEntry('PackOpeningPageComponent', 'onComplete');
    this.router.navigate(['/packs']);
    this.debug.logNavigation('/packs/open', '/packs');
    this.debug.logMethodExit('PackOpeningPageComponent', 'onComplete');
  }

  ngOnDestroy() {
    this.debug.logLifecycle('PackOpeningPageComponent', 'ngOnDestroy');
  }
}
