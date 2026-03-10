import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

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
          <h1 class="text-4xl md:text-6xl font-bold font-display uppercase tracking-tight">
            {{ pageTitle }}
          </h1>
          <p class="text-muted mt-4">Última atualização: 09 de Março de 2026</p>
        </header>

        <div class="prose prose-invert max-w-none">
          @switch (pageType) {
            @case ('terms') {
              <section>
                <h2 class="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
                <p>Ao acessar o FURIOUS WORLD CUP 26, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este site.</p>
                
                <h2 class="text-2xl font-bold mt-8 mb-4">2. Licença de Uso</h2>
                <p>É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site FURIOUS WORLD CUP 26, apenas para visualização transitória pessoal e não comercial.</p>
                
                <h2 class="text-2xl font-bold mt-8 mb-4">3. Isenção de Responsabilidade</h2>
                <p>Os materiais no site da FURIOUS WORLD CUP 26 são fornecidos 'como estão'. FURIOUS WORLD CUP 26 não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias.</p>
                
                <h2 class="text-2xl font-bold mt-8 mb-4">4. Limitações</h2>
                <p>Em nenhum caso o FURIOUS WORLD CUP 26 ou seus fornecedores serão responsáveis por quaisquer danos decorrentes do uso ou da incapacidade de usar os materiais.</p>
              </section>
            }
            @case ('privacy') {
              <section>
                <h2 class="text-2xl font-bold mb-4">1. Coleta de Informações</h2>
                <p>A sua privacidade é importante para nós. É política do FURIOUS WORLD CUP 26 respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site FURIOUS WORLD CUP 26.</p>
                
                <h2 class="text-2xl font-bold mt-8 mb-4">2. Uso de Dados (LGPD/GDPR)</h2>
                <p>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.</p>
                
                <h2 class="text-2xl font-bold mt-8 mb-4">3. Retenção de Dados</h2>
                <p>Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, os protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos.</p>
                
                <h2 class="text-2xl font-bold mt-8 mb-4">4. Cookies</h2>
                <p>Usamos cookies para ajudar a personalizar sua experiência online. Você pode optar por aceitar ou recusar cookies através das configurações do seu navegador.</p>
              </section>
            }
            @case ('cookies') {
              <section>
                <h2 class="text-2xl font-bold mb-4">O que são cookies?</h2>
                <p>Como é prática comum em quase todos os sites profissionais, este site usa cookies, que são pequenos arquivos baixados no seu computador, para melhorar sua experiência.</p>
                
                <h2 class="text-2xl font-bold mt-8 mb-4">Como usamos os cookies?</h2>
                <p>Utilizamos cookies por vários motivos detalhados abaixo. Infelizmente, na maioria dos casos, não existem opções padrão do setor para desativar os cookies sem desativar completamente a funcionalidade e os recursos que eles adicionam a este site.</p>
                
                <h2 class="text-2xl font-bold mt-8 mb-4">Desativar cookies</h2>
                <p>Você pode impedir a configuração de cookies ajustando as configurações do seu navegador. Esteja ciente de que a desativação de cookies afetará a funcionalidade deste e de muitos outros sites que você visita.</p>
              </section>
            }
            @case ('refund') {
              <section>
                <h2 class="text-2xl font-bold mb-4">Política de Reembolso</h2>
                <p>Como nossos produtos são bens digitais entregues imediatamente após a compra, geralmente não oferecemos reembolsos, exceto em casos de falha técnica comprovada ou conforme exigido pelo Código de Defesa do Consumidor (Brasil).</p>
                
                <h2 class="text-2xl font-bold mt-8 mb-4">Direito de Arrependimento</h2>
                <p>No Brasil, o consumidor tem o direito de desistir da compra em até 7 dias, desde que o conteúdo digital não tenha sido consumido ou utilizado.</p>
              </section>
            }
            @case ('about') {
              <section>
                <h2 class="text-2xl font-bold mb-4">Nossa Missão</h2>
                <p>O FURIOUS WORLD CUP 26 nasceu da paixão pelo futebol e pela tecnologia. Nossa missão é criar a experiência de colecionismo digital mais imersiva e emocionante do mundo.</p>
                
                <h2 class="text-2xl font-bold mt-8 mb-4">A Tecnologia</h2>
                <p>Utilizamos as tecnologias mais modernas de nuvem e design para garantir que cada figurinha seja uma obra de arte única e eterna.</p>
              </section>
            }
            @case ('contact') {
              <section>
                <h2 class="text-2xl font-bold mb-4">Fale Conosco</h2>
                <p>Tem alguma dúvida, sugestão ou problema técnico? Nossa equipe está pronta para ajudar.</p>
                
                <div class="bg-gray-900 p-8 rounded-2xl border border-gray-800 mt-8">
                  <div class="flex items-center gap-4 mb-4">
                    <mat-icon class="text-fury">email</mat-icon>
                    <span>suporte&#64;furiouswc26.com</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <mat-icon class="text-fury">location_on</mat-icon>
                    <span>São Paulo, SP - Brasil</span>
                  </div>
                </div>
              </section>
            }
            @case ('faq') {
              <section>
                <div class="space-y-8">
                  <div>
                    <h3 class="text-xl font-bold text-fury mb-2">Como ganho novas figurinhas?</h3>
                    <p>Você pode ganhar figurinhas abrindo pacotes diários, completando desafios ou trocando com outros colecionadores.</p>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-fury mb-2">As figurinhas são NFTs?</h3>
                    <p>Não, nossas figurinhas são ativos digitais centralizados em nossa plataforma para garantir a melhor performance e acessibilidade para todos.</p>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-fury mb-2">Posso vender minhas figurinhas?</h3>
                    <p>Atualmente, você pode trocar figurinhas com outros usuários. O sistema de mercado interno será lançado em breve.</p>
                  </div>
                </div>
              </section>
            }
          }
        </div>

        <footer class="mt-24 pt-12 border-t border-gray-800 text-center text-muted text-sm">
          &copy; 2026 FURIOUS WORLD CUP 26. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .legal-page {
      font-family: 'Inter', sans-serif;
    }
    .prose p {
      color: #9ca3af;
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }
    .text-muted {
      color: #6b7280;
    }
  `]
})
export class LegalPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  pageType = 'terms';
  pageTitle = 'Termos de Uso';

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.pageType = data['type'] || 'terms';
      this.updateTitle();
    });
  }

  private updateTitle() {
    const titles: Record<string, string> = {
      'terms': 'Termos de Uso',
      'privacy': 'Política de Privacidade',
      'cookies': 'Política de Cookies',
      'refund': 'Política de Reembolso',
      'about': 'Sobre Nós',
      'contact': 'Contato',
      'faq': 'Perguntas Frequentes'
    };
    this.pageTitle = titles[this.pageType] || 'Informação';
  }
}
