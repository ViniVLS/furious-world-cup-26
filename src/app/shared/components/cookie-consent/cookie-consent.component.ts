import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    @if (showBanner()) {
      <div class="cookie-banner fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-sm bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-2xl z-50 flex flex-col gap-4">
        <div class="flex items-start gap-4">
          <mat-icon class="text-fury">policy</mat-icon>
          <div>
            <h4 class="text-white font-bold text-xs uppercase tracking-widest">Sua Privacidade</h4>
            <p class="text-muted text-[10px] mt-1 leading-relaxed">
              Respeitamos sua privacidade. Escolha como deseja que seus dados sejam tratados conforme a LGPD.
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <button (click)="acceptAll()" class="w-full bg-white text-black text-[10px] font-black py-3 rounded-xl hover:bg-gray-200 transition-colors uppercase">
            ACEITAR TUDO
          </button>
          <div class="flex gap-2">
            <button (click)="togglePreferences()" class="flex-1 bg-gray-800 text-white text-[10px] font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors uppercase">
              PREFERÊNCIAS
            </button>
            <button (click)="declineAll()" class="flex-1 border border-gray-800 text-white text-[10px] font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors uppercase text-muted">
              RECUSAR
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal de Preferências -->
    @if (showPreferences()) {
      <div class="pref-overlay fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center p-4">
        <div class="pref-modal w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col gap-6">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-bold text-white uppercase tracking-tighter">Gestão de Privacidade</h3>
            <button (click)="showPreferences.set(false)" class="text-muted hover:text-white">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="flex flex-col gap-4">
            <!-- Essencial -->
            <div class="cookie-opt p-4 rounded-2xl bg-gray-800/50 border border-gray-700">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-bold text-white">Essenciais</span>
                <span class="text-[10px] bg-fury text-white px-2 py-0.5 rounded font-black">OBRIGATÓRIO</span>
              </div>
              <p class="text-[10px] text-muted">Necessários para o álbum funcionar (login, segurança, compras).</p>
            </div>

            <!-- Analytics -->
            <div class="cookie-opt p-4 rounded-2xl border border-gray-700 transition-colors" [class.border-fury]="analytics()">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-bold text-white">Analíticos</span>
                <button (click)="analytics.set(!analytics())" class="toggle-track w-10 h-5 rounded-full relative" [class.bg-fury]="analytics()" [class.bg-gray-600]="!analytics()">
                   <div class="toggle-thumb w-3 h-3 bg-white rounded-full absolute top-1 transition-all" [style.left.px]="analytics() ? 24 : 4"></div>
                </button>
              </div>
              <p class="text-[10px] text-muted">Nos ajudam a entender como você coleciona para melhorarmos o app.</p>
            </div>

            <!-- Marketing -->
            <div class="cookie-opt p-4 rounded-2xl border border-gray-700 transition-colors" [class.border-fury]="marketing()">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-bold text-white">Marketing & Promoções</span>
                <button (click)="marketing.set(!marketing())" class="toggle-track w-10 h-5 rounded-full relative" [class.bg-fury]="marketing()" [class.bg-gray-600]="!marketing()">
                   <div class="toggle-thumb w-3 h-3 bg-white rounded-full absolute top-1 transition-all" [style.left.px]="marketing() ? 24 : 4"></div>
                </button>
              </div>
              <p class="text-[10px] text-muted">Alertas sobre novos pacotes e ofertas exclusivas de figurinhas.</p>
            </div>
          </div>

          <button (click)="savePreferences()" class="w-full bg-fury text-white font-bold py-4 rounded-2xl shadow-xl shadow-fury/20 hover:scale-[1.02] transition-transform uppercase tracking-widest text-xs">
            SALVAR MINHAS ESCOLHAS
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .cookie-banner, .pref-modal {
      animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp {
      from { transform: translateY(100%) scale(0.95); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
    .text-fury { color: #ff2d20; }
    .bg-fury { background-color: #ff2d20; }
    .border-fury { border-color: #ff2d20 !important; }
    .pref-overlay { backdrop-filter: blur(8px); }
    .toggle-track { cursor: pointer; transition: background 0.3s ease; }
    .text-muted { color: #9ca3af; }
  `]
})
export class CookieConsentComponent implements OnInit {
  showBanner = signal(false);
  showPreferences = signal(false);

  // Categorias de Cookies
  essential = true; // Sempre true
  analytics = signal(true);
  marketing = signal(false);

  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const consent = localStorage.getItem('cookie-furious-consent');
      if (!consent) {
        setTimeout(() => this.showBanner.set(true), 2000);
      } else {
        const parsed = JSON.parse(consent);
        this.analytics.set(parsed.analytics);
        this.marketing.set(parsed.marketing);
      }
    }
  }

  togglePreferences() {
    this.showPreferences.set(!this.showPreferences());
    if (this.showPreferences()) this.showBanner.set(false);
  }

  acceptAll() {
    this.saveConsent(true, true);
    this.showBanner.set(false);
    this.showPreferences.set(false);
  }

  savePreferences() {
    this.saveConsent(this.analytics(), this.marketing());
    this.showPreferences.set(false);
    this.showBanner.set(false);
  }

  private saveConsent(analytics: boolean, marketing: boolean) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookie-furious-consent', JSON.stringify({
        essential: true,
        analytics,
        marketing,
        timestamp: new Date().toISOString()
      }));
      console.log(`[LGPD LOG] Consent saved: A:${analytics}, M:${marketing}`);
    }
  }

  declineAll() {
    this.saveConsent(false, false);
    this.showBanner.set(false);
    this.showPreferences.set(false);
  }
}
