import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogGroupCreateComponent } from './group-create.component';

describe('AvtoCreateComponent', () => {
  let component: DialogGroupCreateComponent;
  let fixture: ComponentFixture<DialogGroupCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogGroupCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogGroupCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
