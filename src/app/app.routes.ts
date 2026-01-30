import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { authGuard } from './guards/auth-guard';
import { TaskPage } from './pages/task-page/task-page';
export const routes: Routes = [
      { path: '', component: Home },
      { path:'tasks',component:TaskPage, canActivate:[authGuard] }

];
