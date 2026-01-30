import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/auth-service';

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
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  constructor(
    private auth: AuthService,
    private dialogRef: MatDialogRef<LoginModal>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'login' | 'register' }
  ) {
    this.mode = data.mode;
  }

  login() {
    this.auth.login(this.form.value.email!, this.form.value.password!)
      .then(() => this.dialogRef.close()).catch(error => {
        alert('Login failed: ' + error.message);
      });
  }

  register() {
    this.auth.register(this.form.value.email!, this.form.value.password!)
      .then(() => this.dialogRef.close()).catch(error => {
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
