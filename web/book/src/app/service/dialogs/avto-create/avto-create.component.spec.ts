import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAvtoCreateComponent } from './avto-create.component';

describe('DialogAvtoCreateComponent', () => {
  let component: DialogAvtoCreateComponent;
  let fixture: ComponentFixture<DialogAvtoCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogAvtoCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAvtoCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
