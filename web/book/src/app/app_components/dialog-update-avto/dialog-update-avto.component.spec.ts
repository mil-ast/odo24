import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUpdateAvtoComponent } from './dialog-update-avto.component';

describe('DialogCreateAvtoComponent', () => {
  let component: DialogUpdateAvtoComponent;
  let fixture: ComponentFixture<DialogUpdateAvtoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogUpdateAvtoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogUpdateAvtoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
