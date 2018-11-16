import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAvtoUpdateComponent } from './avto-update.component';

describe('DialogAvtoUpdateComponent', () => {
  let component: DialogAvtoUpdateComponent;
  let fixture: ComponentFixture<DialogAvtoUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogAvtoUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAvtoUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
