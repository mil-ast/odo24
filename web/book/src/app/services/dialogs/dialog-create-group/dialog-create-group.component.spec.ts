import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateGroupComponent } from './dialog-create-group.component';

describe('DialogCreateAvtoComponent', () => {
  let component: DialogCreateGroupComponent;
  let fixture: ComponentFixture<DialogCreateGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogCreateGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogCreateGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
