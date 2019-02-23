import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemindingComponent } from './reminding.component';

describe('RemindingComponent', () => {
  let component: RemindingComponent;
  let fixture: ComponentFixture<RemindingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemindingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemindingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
