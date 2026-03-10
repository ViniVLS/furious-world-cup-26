import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-relics-2022',
    standalone: true,
    imports: [CommonModule, MatIconModule, RouterLink],
    template: `
    <div class="relics-page p-6 max-w-4xl mx-auto">
      <header class="mb-12 text-center">
        <h1 class="text-6xl font-black font-display gradient-text mb-4">RELÍQUIAS 2022</h1>
        <p class="text-2xl text-muted text-gold">Relembrando a glória eterna no Qatar</p>
      </header>

      <div class="relics-grid grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div class="relic-item">
          <div class="relic-image bg-gradient-to-br from-gold/20 to-black rounded-2xl p-8 border border-gold/30">
            <span class="text-6xl mb-4 block">🇦🇷</span>
            <h2 class="text-2xl font-bold text-gold">A TERCEIRA ESTRELA</h2>
            <p class="text-sm text-muted mt-2">A coroação de Lionel Messi no Lusail Stadium, um momento que definiu uma geração.</p>
          </div>
        </div>
        <div class="relic-item">
          <div class="relic-image bg-gradient-to-br from-fury/20 to-black rounded-2xl p-8 border border-fury/30">
            <span class="text-6xl mb-4 block">🇲🇦</span>
            <h2 class="text-2xl font-bold">O RUGIDO DE MARROCOS</h2>
            <p class="text-sm text-muted mt-2">A primeira seleção africana a atingir as semifinais, quebrando barreiras com raça e técnica.</p>
          </div>
        </div>
      </div>

      <section class="legendary-stickers mb-16">
        <h2 class="text-3xl font-bold mb-8 text-center text-gold">FIGURINHAS HISTÓRICAS</h2>
        <div class="flex flex-wrap justify-center gap-6">
          <div class="mini-relic-card">L. Messi (LEG)</div>
          <div class="mini-relic-card">K. Mbappé (LEG)</div>
          <div class="mini-relic-card">L. Modric (LEG)</div>
          <div class="mini-relic-card">Neymar Jr (LEG)</div>
        </div>
      </section>

      <footer class="text-center">
        <button class="btn-primary" routerLink="/album">VOLTAR AO ÁLBUM</button>
      </footer>
    </div>
  `,
    styles: [`
    .relics-page { min-height: 90vh; }
    .text-gold { color: #FFD700; }
    .relic-item { transition: transform 0.3s ease; }
    .relic-item:hover { transform: scale(1.02); }
    .mini-relic-card {
      background: rgba(255, 215, 0, 0.1);
      border: 1px solid rgba(255, 215, 0, 0.3);
      padding: 12px 24px;
      border-radius: 99px;
      font-weight: bold;
      color: #FFD700;
    }
  `]
})
export class Relics2022Component { }
