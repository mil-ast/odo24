import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvtoComponent } from './avto.component';

describe('AvtoComponent', () => {
  let component: AvtoComponent;
  let fixture: ComponentFixture<AvtoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvtoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvtoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
