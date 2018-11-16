import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogServiceUpdateComponent } from './service-update.component';

describe('DialogServiceCreateComponent', () => {
  let component: DialogServiceUpdateComponent;
  let fixture: ComponentFixture<DialogServiceUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogServiceUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogServiceUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
