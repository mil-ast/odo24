import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesComponent } from './services.component';
import { MatSnackBarModule, MatProgressSpinnerModule, MatDialogModule, MatButtonModule, MatInputModule, MatIconModule, MatMenuModule } from '@angular/material';
import { AvtoService } from '../_services/avto.service';
import { SelectedAvtoModule } from '../shared/selected-avto/selected-avto.module';
import { ItemAvtoModule } from '../shared/item-avto/item-avto.module';
import { GroupService } from '../_services/groups.service';
import { ItemGroupComponent } from './item-group/item-group.component';
import { ItemServiceComponent } from './item-service/item-service.component';
import { ServiceService } from '../_services/service.service';
import { DialogCreateAvtoComponent } from './dialogs/dialog-create-avto/dialog-create-avto.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ServicesComponent,
    ItemGroupComponent,
    ItemServiceComponent,
    DialogCreateAvtoComponent,
    DialogCreateAvtoComponent,
  ],
  imports: [
    CommonModule,
    SelectedAvtoModule,
    ItemAvtoModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    AvtoService,
    GroupService,
    ServiceService,
  ],
  entryComponents: [
    DialogCreateAvtoComponent,
  ]
})
export class ServiceModule {}
