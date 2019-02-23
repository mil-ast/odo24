import { TestBed } from '@angular/core/testing';

import { RemindingService } from './reminding.service';

describe('RemindingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RemindingService = TestBed.get(RemindingService);
    expect(service).toBeTruthy();
  });
});
