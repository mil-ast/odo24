import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogReminderUpdateComponent } from './reminder-update.component';

describe('DialogAvtoCreateComponent', () => {
  let component: DialogReminderUpdateComponent;
  let fixture: ComponentFixture<DialogReminderUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogReminderUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogReminderUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
