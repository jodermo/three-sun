import { TestBed } from '@angular/core/testing';

import { ThreeSunService } from './three-sun.service';

describe('ThreeSunService', () => {
  let service: ThreeSunService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThreeSunService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
