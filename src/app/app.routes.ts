import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { authGuard } from './guards/auth-guard';
export const routes: Routes = [
      { path: '', component: Home, canActivate: [authGuard] }

];
