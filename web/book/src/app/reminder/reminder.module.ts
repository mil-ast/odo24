import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule }    from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MainComponent } from './components/main/main.component';
import { AvtoComponent } from './components/avto/avto.component';

// сервисы
import { ReminderService } from './services/reminders.service';
// пайпы
import { PipesModule } from '../_pipes/order.pipe';
// модули
import { ComponentsModule } from '../components/components.module';

import {
  MatInputModule,
  MatButtonModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatMenuModule,
  MatSelectModule,
  MatDialogModule,
  MatProgressSpinnerModule,
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { ItemComponent } from './components/item/item.component';
// диалоги
import { DialogReminderCreateComponent } from './dialogs/reminder-create/reminder-create.component';
import { DialogReminderUpdateComponent } from './dialogs/reminder-update/reminder-update.component';

@NgModule({
  imports: [
    ComponentsModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    
    PipesModule,
 	  BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  declarations: [
    MainComponent,
    //InsuranceComponent,
    AvtoComponent,
    //DriversLicenseComponent,
    ItemComponent,
    DialogReminderCreateComponent,
    DialogReminderUpdateComponent,
  ],
  providers : [
    ReminderService,
  ],
  entryComponents : [
    DialogReminderCreateComponent,
    DialogReminderUpdateComponent,
  ],
})
export class ReminderModule { }
