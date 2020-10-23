import { TestBed } from '@angular/core/testing';

import { DialogConverterService } from './dialog-converter.service';

describe('DialogConverterService', () => {
  let service: DialogConverterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogConverterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
