import { TestBed } from '@angular/core/testing';

import { SolarFlareService } from './solar-flare.service';

describe('SolarFlareService', () => {
  let service: SolarFlareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolarFlareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
