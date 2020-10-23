import { TestBed } from '@angular/core/testing';

import { DialogGeneratorService } from './dialog-generator.service';

describe('DialogGeneratorService', () => {
  let service: DialogGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
