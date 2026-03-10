import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  
  loginForm: FormGroup = this.fb.group({
    email: ['viniedoug@gmail.com', [Validators.required, Validators.email]],
    password: ['12345678', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.router.navigate(['/onboarding']);
    }
  }
}
