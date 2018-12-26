import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent as Service } from './service/components/main/main.component';
import { MainComponent as Reminder } from './reminder/components/main/main.component';
import { HomeComponent } from './home/components/home/home.component';

import { AuthGuard } from './auth.guard';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'service', component: Service, canActivate: [AuthGuard] },
  { path: 'remind', component: Reminder, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
