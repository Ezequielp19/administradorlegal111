import { Routes } from '@angular/router';

export const routes: Routes = [

   {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'home/:id',
    loadComponent: () => import('./user-detail/user-detail.page').then((m) => m.UserDetailPage),
  },
   {
    path: 'ver-usuario/:id',
    loadComponent: () => import('./ver-usuario/ver-usuario.component').then(m => m.VerUsuarioComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
