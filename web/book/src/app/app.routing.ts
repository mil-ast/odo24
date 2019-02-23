import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/components/home/home.component';

import { AuthGuard } from './auth.guard';
import { ServicesComponent } from './services/services.component';
import { RemindingComponent } from './reminding/reminding.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'service', component: ServicesComponent, canActivate: [AuthGuard] },
  { path: 'reminding', component: RemindingComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
