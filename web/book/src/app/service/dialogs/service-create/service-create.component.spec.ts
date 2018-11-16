import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogServiceCreateComponent } from './service-create.component';

describe('DialogServiceCreateComponent', () => {
  let component: DialogServiceCreateComponent;
  let fixture: ComponentFixture<DialogServiceCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogServiceCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogServiceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
