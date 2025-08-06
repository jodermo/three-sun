import { TestBed } from '@angular/core/testing';

import { SunShaderService } from './sun-shader.service';

describe('SunShaderService', () => {
  let service: SunShaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SunShaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
