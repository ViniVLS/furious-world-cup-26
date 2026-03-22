import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DebugService } from '../../../debug/debug.service';

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="legal-page min-h-screen bg-black text-white p-6 md:p-12">
      <div class="max-w-4xl mx-auto">
        <header class="mb-12">
          <button routerLink="/" class="flex items-center gap-2 text-muted hover:text-white transition-colors mb-8">
            <mat-icon>arrow_back</mat-icon> Voltar para o Início
          </button>
          <h1 class="text-4xl md:text-6xl font-bold font-display uppercase tracking-tight">{{ pageTitle }}</h1>
          <p class="text-muted mt-4">Última atualização: 09 de Março de 2026</p>
        </header>
        <div class="prose prose-invert max-w-none">
          @switch (pageType) {
            @case ('terms') {
              <section>
                <h2 class="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
                <p>Ao acessar o FURIOUS WORLD CUP 26, você concorda em cumprir estes termos de serviço...</p>
              </section>
            }
            @case ('privacy') {
              <section>
                <h2 class="text-2xl font-bold mb-4">1. Coleta de Informações</h2>
                <p>A sua privacidade é importante para nós...</p>
              </section>
            }
            @default {
              <section>
                <h2 class="text-2xl font-bold mb-4">{{ pageTitle }}</h2>
                <p>Conteúdo da página.</p>
              </section>
            }
          }
        </div>
        <footer class="mt-24 pt-12 border-t border-gray-800 text-center text-muted text-sm">
          © 2026 FURIOUS WORLD CUP 26. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  `,
  styles: [`.legal-page { font-family: 'Inter', sans-serif; } .prose p { color: #9ca3af; line-height: 1.7; margin-bottom: 1.5rem; } .text-muted { color: #6b7280; }`]
})
export class LegalPageComponent implements OnInit, OnDestroy {
  private readonly debug = inject(DebugService);
  private route = inject(ActivatedRoute);
  pageType = 'terms';
  pageTitle = 'Termos de Uso';

  ngOnInit() {
    this.debug.logLifecycle('LegalPageComponent', 'ngOnInit');
    this.route.data.subscribe(data => {
      this.pageType = data['type'] || 'terms';
      this.updateTitle();
      this.debug.info('STATE', 'LegalPageComponent', `Página legal: ${this.pageType}`);
    });
  }

  ngOnDestroy() {
    this.debug.logLifecycle('LegalPageComponent', 'ngOnDestroy');
  }

  private updateTitle() {
    const titles: Record<string, string> = {
      'terms': 'Termos de Uso', 'privacy': 'Política de Privacidade',
      'cookies': 'Política de Cookies', 'refund': 'Política de Reembolso',
      'about': 'Sobre Nós', 'contact': 'Contato', 'faq': 'Perguntas Frequentes'
    };
    this.pageTitle = titles[this.pageType] || 'Informação';
  }
}
