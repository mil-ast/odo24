import { NgModule } from '@angular/core';
import { ScrollContainerComponent } from './scroll-container/scroll-container.component';
import { AsideDirective } from './directives/aside.directive';

@NgModule({
  imports: [],
  declarations: [
    ScrollContainerComponent,
    AsideDirective,
  ],
  exports: [
    ScrollContainerComponent,
    AsideDirective,
  ],
})
export class SharedUtilsModule { }
