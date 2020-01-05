import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { ServicesComponent } from './services/services.component';
import { ProfileComponent } from './profile/profile.component';

const appRoutes: Routes = [
  { path: 'profile', component: ProfileComponent, loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule) },
  { path: 'service', component: ServicesComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/profile/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
