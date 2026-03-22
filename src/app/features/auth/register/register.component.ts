import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DebugService } from '../../../../debug/debug.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="auth-page min-h-screen bg-black flex items-center justify-center p-6">
      <div class="auth-card bg-gray-900 p-8 rounded-3xl border border-gray-800 w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold font-display uppercase italic">FURIOUS <span class="text-fury">26</span></h1>
          <p class="text-muted mt-2">Crie sua conta e comece sua coleção</p>
        </div>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="form-group">
            <label for="username" class="block text-xs text-muted uppercase mb-2">Nome de Usuário</label>
            <input type="text" id="username" formControlName="username" class="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-fury focus:outline-none transition-colors">
          </div>
          <div class="form-group">
            <label for="email" class="block text-xs text-muted uppercase mb-2">E-mail</label>
            <input type="email" id="email" formControlName="email" class="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-fury focus:outline-none transition-colors">
          </div>
          <div class="form-group">
            <label for="password" class="block text-xs text-muted uppercase mb-2">Senha</label>
            <input type="password" id="password" formControlName="password" class="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-fury focus:outline-none transition-colors">
          </div>
          <div class="flex items-center gap-2 mb-6">
            <input type="checkbox" id="terms" class="accent-fury">
            <label for="terms" class="text-xs text-muted">
              Eu aceito os <a routerLink="/info/terms" class="text-white hover:underline">Termos de Uso</a> e a <a routerLink="/info/privacy" class="text-white hover:underline">Política de Privacidade</a>.
            </label>
          </div>
          <button type="submit" [disabled]="registerForm.invalid" class="btn-primary w-full py-4 rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100">
            CRIAR MINHA CONTA
          </button>
        </form>
        <div class="mt-8 text-center">
          <p class="text-muted text-sm">Já tem uma conta? <a routerLink="/auth/login" class="text-white font-bold hover:underline">Entrar</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`.text-fury { color: #ff2d20; } .btn-primary { background: linear-gradient(135deg, #ff2d20, #b91c1c); color: white; } .text-muted { color: #6b7280; }`]
})
export class RegisterComponent implements OnInit {
  private readonly debug = inject(DebugService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit() {
    this.debug.logLifecycle('RegisterComponent', 'ngOnInit');
  }

  onSubmit() {
    this.debug.logMethodEntry('RegisterComponent', 'onSubmit', { username: this.registerForm.value.username, email: this.registerForm.value.email });
    const timer = this.debug.startTimer('onSubmit');
    if (this.registerForm.valid) {
      this.debug.logAudit('RegisterComponent', `Registro realizado com sucesso`, { username: this.registerForm.value.username, email: this.registerForm.value.email });
      this.router.navigate(['/onboarding']);
      this.debug.logNavigation('/auth/register', '/onboarding');
      const ms = this.debug.endTimer('onSubmit');
      this.debug.logMethodExit('RegisterComponent', 'onSubmit', { success: true }, ms);
    } else {
      this.debug.warn('WARN', 'RegisterComponent', 'Formulário de registro inválido', { errors: this.registerForm.errors });
      const ms = this.debug.endTimer('onSubmit');
      this.debug.logMethodExit('RegisterComponent', 'onSubmit', { success: false, reason: 'invalid_form' }, ms);
    }
  }
}
