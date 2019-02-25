import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RemindingComponent } from './reminding.component';

const routes: Routes = [
  {
    path: '',
    component: RemindingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RemindingRoutingModule {}
