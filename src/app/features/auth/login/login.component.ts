import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AudioService } from '../../../core/services/audio.service';
import { DebugService } from '../../../../debug/debug.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private readonly debug = inject(DebugService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private audioService = inject(AudioService);
  private userService = inject(UserService);

  loginForm: FormGroup = this.fb.group({
    email: ['viniedoug@gmail.com', [Validators.required, Validators.email]],
    password: ['12345678', Validators.required]
  });

  showPassword = signal(false);

  ngOnInit() {
    this.debug.logLifecycle('LoginComponent', 'ngOnInit');
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    this.debug.logMethodEntry('LoginComponent', 'onSubmit', { email: this.loginForm.value.email });
    const timer = this.debug.startTimer('onSubmit');
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email as string;
      if (email === 'viniedoug@gmail.com') {
        localStorage.setItem('furia-creator-email', email);
      } else {
        localStorage.removeItem('furia-creator-email');
      }

      this.userService.currentUser.update(u => {
        if (!u) return u;
        return { 
          ...u, 
          email: email,
          username: email === 'viniedoug@gmail.com' ? 'FuriaAdmin' : email.split('@')[0],
          role: email === 'viniedoug@gmail.com' ? 'admin' : 'user'
        };
      });

      this.debug.logAudit('LoginComponent', `Login realizado com sucesso`, { email });
      this.audioService.play('login');
      this.router.navigate(['/onboarding']);
      this.debug.logNavigation('/auth/login', '/onboarding');
      const ms = this.debug.endTimer('onSubmit');
      this.debug.logMethodExit('LoginComponent', 'onSubmit', { success: true }, ms);
    } else {
      this.debug.warn('WARN', 'LoginComponent', 'Formulário de login inválido', { valid: this.loginForm.valid, errors: this.loginForm.errors });
      const ms = this.debug.endTimer('onSubmit');
      this.debug.logMethodExit('LoginComponent', 'onSubmit', { success: false, reason: 'invalid_form' }, ms);
    }
  }
}
