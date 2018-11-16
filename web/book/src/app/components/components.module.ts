import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { SelectedAvtoComponent } from './selected-avto/selected-avto.component';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        SelectedAvtoComponent,
    ],
    providers : [

    ],
    exports : [
        SelectedAvtoComponent,
    ]
})
export class ComponentsModule { }
