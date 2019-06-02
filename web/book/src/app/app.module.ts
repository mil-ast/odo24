import { NgModule, LOCALE_ID } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AuthGuard } from './auth.guard';
import { httpInterceptorProviders } from './http-interceptors';
// модули
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppRoutingModule } from './app.routing';
import { ServiceModule } from './services/service.module';
import { HomeModule } from './home/home.module';

// сервисы
import { ProfileService } from './_services/profile.service';
import { MomentDateAdapter} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';

export const DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

import { registerLocaleData, CommonModule } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { SelectedAvtoModule } from './shared/selected-avto/selected-avto.module';
import { ConfirmEmailDialogComponent } from './shared/confirm-email-dialog/confirm-email-dialog.component';
import { OrderPipeModule } from './_pipes/order.pipe.module';
import { ItemGroupComponent } from './shared/item-group/item-group.component';
import { DialogUpdateGroupComponent } from './shared/dialog-update-group/dialog-update-group.component';
import { DialogCreateGroupComponent } from './shared/dialog-create-group/dialog-create-group.component';
import { ItemAvtoComponent } from './shared/item-avto/item-avto.component';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { DialogUpdateAvtoComponent } from './shared/dialog-update-avto/dialog-update-avto.component';
import { environment } from '../environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProfileDialogComponent } from './shared/profile-dialog/profile-dialog.component';

registerLocaleData(localeRu, 'ru');

@NgModule({
  declarations: [
    AppComponent,
    ConfirmEmailDialogComponent,
    ConfirmationDialogComponent,
    ProfileDialogComponent,
    ItemGroupComponent,
    ItemAvtoComponent,
    DialogUpdateGroupComponent,
    DialogCreateGroupComponent,
    DialogUpdateAvtoComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatDialogModule,
    MatStepperModule,
    MatMenuModule,
    MatBadgeModule,
    MatIconModule,
    MatFormFieldModule,
    MatSidenavModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    OrderPipeModule,
    SelectedAvtoModule,
    ServiceModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [
    ProfileService,
    AuthGuard,
    httpInterceptorProviders,
    {provide: LOCALE_ID, useValue: 'ru-RU'},
    {provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 5000}}
  ],
  exports : [
    SelectedAvtoModule,
  ],
  entryComponents: [
    ConfirmEmailDialogComponent,
    ConfirmationDialogComponent,
    ProfileDialogComponent,
    DialogUpdateGroupComponent,
    DialogCreateGroupComponent,
    DialogUpdateAvtoComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
