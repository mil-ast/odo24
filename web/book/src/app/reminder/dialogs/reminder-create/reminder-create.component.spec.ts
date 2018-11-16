import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogReminderCreateComponent } from './reminder-create.component';

describe('DialogAvtoCreateComponent', () => {
  let component: DialogReminderCreateComponent;
  let fixture: ComponentFixture<DialogReminderCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogReminderCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogReminderCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
