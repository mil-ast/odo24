import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemAvtoComponent } from './item-avto.component';

describe('ItemAvtoComponent', () => {
  let component: ItemAvtoComponent;
  let fixture: ComponentFixture<ItemAvtoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemAvtoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemAvtoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
