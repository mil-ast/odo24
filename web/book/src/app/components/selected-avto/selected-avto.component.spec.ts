import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedAvtoComponent } from './selected-avto.component';

describe('SelectedAvtoComponent', () => {
  let component: SelectedAvtoComponent;
  let fixture: ComponentFixture<SelectedAvtoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedAvtoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedAvtoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
