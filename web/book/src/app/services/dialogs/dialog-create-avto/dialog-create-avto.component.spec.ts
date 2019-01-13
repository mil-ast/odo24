import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateAvtoComponent } from './dialog-create-avto.component';

describe('DialogCreateAvtoComponent', () => {
  let component: DialogCreateAvtoComponent;
  let fixture: ComponentFixture<DialogCreateAvtoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogCreateAvtoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogCreateAvtoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
