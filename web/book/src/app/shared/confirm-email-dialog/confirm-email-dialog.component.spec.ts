import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmEmailDialogComponent } from './confirm-email-dialog.component';

describe('ConfirmEmailDialogComponent', () => {
  let component: ConfirmEmailDialogComponent;
  let fixture: ComponentFixture<ConfirmEmailDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmEmailDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmEmailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
