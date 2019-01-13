import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUpdateGroupComponent } from './dialog-update-group.component';

describe('DialogUpdateGroupComponent', () => {
  let component: DialogUpdateGroupComponent;
  let fixture: ComponentFixture<DialogUpdateGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogUpdateGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogUpdateGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
