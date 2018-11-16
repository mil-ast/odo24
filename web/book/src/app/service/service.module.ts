import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule }    from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// сервисы
import { AvtoService } from '../_services/avto.service';
import { GroupsService } from './services/groups.service';
import { ServicesService } from './services/services.service';

// компоненты
import { MainComponent } from './components/main/main.component';
import { GroupComponent } from './components/group/group.component';
import { AvtoComponent } from './components/avto/avto.component';
import { ServiceComponent } from './components/service/service.component';
// pipes
import { PipesModule } from '../_pipes/order.pipe';
// модули
import { ComponentsModule } from '../components/components.module';

import {
  MatInputModule,
  MatButtonModule,
  MatDatepickerModule,
  MatMenuModule,
  MatSnackBarModule,
  MatDialogModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { DialogAvtoCreateComponent } from './dialogs/avto-create/avto-create.component';
import { DialogAvtoUpdateComponent } from './dialogs/avto-update/avto-update.component';
import { DialogGroupCreateComponent } from './dialogs/group-create/group-create.component';
import { DialogGroupUpdateComponent } from './dialogs/group-update/group-update.component';
import { DialogServiceCreateComponent } from './dialogs/service-create/service-create.component';
import { DialogServiceUpdateComponent } from './dialogs/service-update/service-update.component';

@NgModule({
    imports: [
        PipesModule,
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ComponentsModule,

        MatInputModule,
        MatButtonModule,
        MatDatepickerModule,
        MatMenuModule,
        MatSnackBarModule,
        MatDialogModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        BrowserAnimationsModule,
    ],
    declarations: [
        MainComponent,
        GroupComponent,
        AvtoComponent,
        ServiceComponent,
        DialogAvtoCreateComponent,
        DialogAvtoUpdateComponent,
        DialogGroupCreateComponent,
        DialogGroupUpdateComponent,
        DialogServiceCreateComponent,
        DialogServiceUpdateComponent,
    ],
    providers : [
        AvtoService,
        GroupsService,
        ServicesService,
    ],
    entryComponents: [
        DialogAvtoCreateComponent,
        DialogAvtoUpdateComponent,
        DialogGroupCreateComponent,
        DialogGroupUpdateComponent,
        DialogServiceCreateComponent,
        DialogServiceUpdateComponent,
    ]
})
export class ServiceModule { }
