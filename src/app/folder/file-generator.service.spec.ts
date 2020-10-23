import { TestBed } from '@angular/core/testing';

import { FileGeneratorService } from './file-generator.service';

describe('FileGeneratorService', () => {
  let service: FileGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
