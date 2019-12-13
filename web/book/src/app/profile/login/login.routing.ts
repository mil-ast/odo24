import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { NgModule } from '@angular/core';
import { OauthComponent } from './oauth/oauth.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'oauth', component: OauthComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule {}
