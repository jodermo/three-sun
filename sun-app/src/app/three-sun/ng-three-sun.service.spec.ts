import { TestBed } from '@angular/core/testing';

import { NgThreeSunService } from './ng-three-sun.service';

describe('NgThreeSunService', () => {
  let service: NgThreeSunService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgThreeSunService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
