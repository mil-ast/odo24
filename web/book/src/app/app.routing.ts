import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth.guard';
import { ServicesComponent } from './services/services.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'service', component: ServicesComponent, canActivate: [AuthGuard] },
  { path: 'reminding', loadChildren: './reminding/reminding.module#RemindingModule', canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
