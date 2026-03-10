import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <footer class="footer bg-black border-t border-gray-800 py-16 px-6">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <!-- Logo & Brand -->
        <div class="col-span-1 md:col-span-2">
          <div class="logo mb-6">
            <span class="logo-text text-2xl font-bold font-display uppercase italic">
              FURIOUS WORLD CUP <span class="text-fury">26</span>
            </span>
          </div>
          <p class="text-muted max-w-sm mb-8 leading-relaxed">
            A maior plataforma de colecionismo digital do mundo. Transformando a paixão pelo futebol em ativos digitais únicos e eternos.
          </p>
          <div class="flex gap-4">
            <a href="#" class="social-link"><mat-icon>facebook</mat-icon></a>
            <a href="#" class="social-link"><mat-icon>alternate_email</mat-icon></a>
            <a href="#" class="social-link"><mat-icon>public</mat-icon></a>
          </div>
        </div>

        <!-- Links: Institucional -->
        <div>
          <h4 class="text-white font-bold mb-6 uppercase tracking-widest text-sm">Institucional</h4>
          <ul class="space-y-4">
            <li><a routerLink="/info/about" class="footer-link">Sobre Nós</a></li>
            <li><a routerLink="/info/contact" class="footer-link">Contato</a></li>
            <li><a routerLink="/info/faq" class="footer-link">FAQ</a></li>
          </ul>
        </div>

        <!-- Links: Legal -->
        <div>
          <h4 class="text-white font-bold mb-6 uppercase tracking-widest text-sm">Legal</h4>
          <ul class="space-y-4">
            <li><a routerLink="/info/terms" class="footer-link">Termos de Uso</a></li>
            <li><a routerLink="/info/privacy" class="footer-link">Privacidade</a></li>
            <li><a routerLink="/info/cookies" class="footer-link">Cookies</a></li>
            <li><a routerLink="/info/refund" class="footer-link">Reembolso</a></li>
          </ul>
        </div>
      </div>

      <div class="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex flex-col gap-1">
          <p class="text-muted text-sm">
            &copy; 2026 FURIOUS WORLD CUP 26. Todos os direitos reservados.
          </p>
          <p class="text-muted text-[10px] uppercase tracking-widest">
            Desenvolvido com <mat-icon class="text-[10px] align-middle text-fury">favorite</mat-icon> no Brasil para o Mundo.
          </p>
        </div>
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2 text-muted text-xs">
            <mat-icon class="text-xs">verified_user</mat-icon>
            <span>LGPD & GDPR Compliant</span>
          </div>
          <div class="flex items-center gap-2 text-muted text-xs">
            <mat-icon class="text-xs">lock</mat-icon>
            <span>SSL Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .logo-text {
      letter-spacing: -1px;
    }
    .text-muted {
      color: #6b7280;
    }
    .footer-link {
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.2s;
      font-size: 0.9rem;
    }
    .footer-link:hover {
      color: #ff2d20;
    }
    .social-link {
      color: #6b7280;
      transition: color 0.2s;
    }
    .social-link:hover {
      color: white;
    }
    .text-fury {
      color: #ff2d20;
    }
  `]
})
export class FooterComponent {}
