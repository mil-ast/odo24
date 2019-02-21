import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrifileDialogComponent } from './prifile-dialog.component';

describe('PrifileDialogComponent', () => {
  let component: PrifileDialogComponent;
  let fixture: ComponentFixture<PrifileDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrifileDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrifileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
