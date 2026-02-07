import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { authGuard } from './guards/auth-guard';
import { TaskPage } from './pages/task-page/task-page';
import { VerifyEmail } from './pages/verify-email/verify-email';
import { verifiedGuard } from './guards/verified-guard';
export const routes: Routes = [
      { path: '', component: Home, canActivate:[verifiedGuard]},
      { path:'tasks',component:TaskPage, canActivate:[authGuard, verifiedGuard] },
            { path:'verify-email',component:VerifyEmail,  }


];
