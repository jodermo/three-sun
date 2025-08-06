import { TestBed } from '@angular/core/testing';

import { SunCoronaService } from './sun-corona.service';

describe('SunCoronaService', () => {
  let service: SunCoronaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SunCoronaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
