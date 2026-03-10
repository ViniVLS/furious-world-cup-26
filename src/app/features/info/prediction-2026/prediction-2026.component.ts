import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-prediction-2026',
    standalone: true,
    imports: [CommonModule, MatIconModule, RouterLink],
    template: `
    <div class="prediction-page p-6 max-w-4xl mx-auto">
      <header class="mb-12 text-center">
        <h1 class="text-6xl font-black font-display gradient-text mb-4">MÉXICO • CANADÁ • EUA</h1>
        <p class="text-2xl text-muted">Explorando o futuro da maior Copa de todos os tempos</p>
      </header>

      <section class="grid md:grid-cols-2 gap-8 mb-16">
        <div class="info-card">
          <mat-icon class="text-fury text-4xl mb-4">groups</mat-icon>
          <h2 class="text-2xl font-bold mb-2">48 SELEÇÕES</h2>
          <p class="text-muted">Pela primeira vez na história, teremos 48 equipes disputando o troféu. Mais chances para heróis improváveis.</p>
        </div>
        <div class="info-card">
          <mat-icon class="text-fury text-4xl mb-4">stadium</mat-icon>
          <h2 class="text-2xl font-bold mb-2">16 CIDADES SEDE</h2>
          <p class="text-muted">Jogos espalhados por todo o continente norte-americano, do Estádio Azteca ao MetLife Stadium.</p>
        </div>
      </section>

      <section class="stadiums-grid mb-16">
        <h2 class="text-3xl font-bold mb-8 text-center">ESTÁDIOS DE ELITE</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="stadium-mini-card">
            <div class="stadium-label">FINAL</div>
            <h3 class="font-bold">MetLife Stadium</h3>
            <span class="text-xs text-muted">Nova York/Jersey</span>
          </div>
          <div class="stadium-mini-card">
            <div class="stadium-label label-hist">HISTÓRICO</div>
            <h3 class="font-bold">Estádio Azteca</h3>
            <span class="text-xs text-muted">Cidade do México</span>
          </div>
          <div class="stadium-mini-card">
            <h3 class="font-bold">BC Place</h3>
            <span class="text-xs text-muted">Vancouver</span>
          </div>
        </div>
      </section>

      <footer class="text-center bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
        <h3 class="text-2xl font-bold mb-4">Prepare seu álbum!</h3>
        <p class="mb-8 text-muted">Figurinhas exclusivas da Copa 2026 já estão disponíveis na aba de pacotes.</p>
        <button class="btn-primary" routerLink="/packs">ABRIR PACOTES 2026</button>
      </footer>
    </div>
  `,
    styles: [`
    .prediction-page { min-height: 90vh; }
    .info-card {
      background: rgba(255,255,255,0.03);
      padding: 32px;
      border-radius: 24px;
      border: 1px solid rgba(255,255,255,0.08);
      transition: all 0.3s ease;
    }
    .info-card:hover { border-color: var(--color-fury); transform: translateY(-5px); }
    .stadium-mini-card {
      background: var(--color-graphite);
      padding: 20px;
      border-radius: 16px;
      position: relative;
      overflow: hidden;
    }
    .stadium-label {
      position: absolute; top: 0; right: 0;
      background: var(--color-fury); color: white;
      font-size: 8px; font-weight: 900;
      padding: 4px 8px; border-bottom-left-radius: 8px;
    }
    .label-hist { background: #22c55e; }
  `]
})
export class Prediction2026Component { }
