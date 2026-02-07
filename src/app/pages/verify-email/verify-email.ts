import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { sendEmailVerification } from 'firebase/auth';

@Component({
  selector: 'app-verify-email',
  imports: [],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit, OnDestroy {
canResend = true;
  countdown = 0;
  timerInterval: any;

  constructor(private auth: AuthService, public router: Router) {}

  ngOnInit() {
    this.checkCooldown();
    if(this.auth.getCurrentUser()?.emailVerified) {
      this.router.navigate(['/']); // If they somehow got here while already verified, boot them to the app
    }
    this.timerInterval = setInterval(() => {
    this.checkAgain();
  }, 3000);
  }

  async resendEmail() {
    const user = this.auth.getCurrentUser();
    if(user && user.emailVerified){
      alert("Your email is already verified. Redirecting to home page.");
      this.router.navigate(['/']);
      return;
    }
     else if (user && this.canResend) {
      try {
        await sendEmailVerification(user);
        this.startCooldown();
        alert('New verification email sent!');
      } catch (error: any) {
        alert(error.message);
      }
    }
  }

  startCooldown() {
    this.canResend = false;
    this.countdown = 60;
    
    // Save timestamp to LocalStorage to persist through refresh
    localStorage.setItem('emailCooldown', Date.now().toString());

    this.timerInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.stopTimer();
      }
    }, 1000);
  }
  logout(){
    this.auth.logout().then(() => {
      this.router.navigate(['/']);
    }).catch(error => {
      alert('Logout failed: ' + error.message);
    });
  }

  checkCooldown() {
    const lastSent = localStorage.getItem('emailCooldown');
    if (lastSent) {
      const secondsPassed = Math.floor((Date.now() - parseInt(lastSent)) / 1000);
      if (secondsPassed < 60) {
        this.countdown = 60 - secondsPassed;
        this.canResend = false;
        this.startTimerFromRemaining();
      }
    }
  }

  startTimerFromRemaining() {
    this.timerInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer() {
    this.canResend = true;
    clearInterval(this.timerInterval);
    localStorage.removeItem('emailCooldown');
  }
 async checkAgain() {
  const authUser = this.auth.getCurrentUser(); // Get current instance
  
  if (authUser) {
    try {
      // 1. Force Firebase to talk to the server and update the token
      await authUser.reload(); 
      
      // 2. IMPORTANT: Re-fetch the user object or check the property 
      // directly from the auth service to get the updated 'emailVerified' value
      const updatedUser = this.auth.getCurrentUser(); 

      if (updatedUser?.emailVerified) {
        console.log("Verified! Redirecting...");
        this.router.navigate(['/']); 
      } else {
        alert("Email not verified yet. Please click the link in your email and try again.");
      }
    } catch (error) {
      console.error("Error reloading user:", error);
      alert("Something went wrong. Please try logging in again.");
    }
  }
}

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}
