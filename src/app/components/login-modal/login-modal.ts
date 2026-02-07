import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/auth-service';
import { sendEmailVerification } from 'firebase/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css',
})
export class LoginModal {
  mode: 'login' | 'register';
form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('') 
  });

  constructor(
    private auth: AuthService,
    private router: Router,
    private dialogRef: MatDialogRef<LoginModal>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'login' | 'register' }
  ) {
    this.mode = data.mode;
    // Set validation for confirmPassword ONLY in register mode
    if (this.mode === 'register') {
      this.form.get('confirmPassword')?.setValidators([Validators.required]);
      this.form.addValidators(this.passwordMatchValidator);
    }
  }
  // Custom validator for matching passwords
  passwordMatchValidator(control: any) {
    const pass = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  login() {
    this.auth.login(this.form.value.email!, this.form.value.password!)
      .then(() => this.dialogRef.close()).catch(error => {
        alert('Login failed: ' + error.message);
      });
  }

  register() {
    if (this.form.invalid) return; // Guard clause
    this.auth.register(this.form.value.email!, this.form.value.password!)
      .then((usercredentials) => {
        const user = usercredentials.user;
          sendEmailVerification(user).then(() => {
            this.router.navigate(['/verify-email']); // Boot them to the verification page
        }).catch(emailError => {
          console.error('Email verification failed:', emailError);
          alert('Registration successful, but failed to send verification email. Please try logging in and requesting a new verification email.');
        });
        this.dialogRef.close()}).catch(error => {
      
        alert('register failed: ' + error.message);
      });
      
  }

  loginWithGoogle() {
    this.auth.loginWithGoogle()
      .then(() => this.dialogRef.close());
  }
  close() {
    this.dialogRef.close();
  }
}
