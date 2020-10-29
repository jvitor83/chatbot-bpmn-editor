import { TestBed } from '@angular/core/testing';

import { RasaDialogGeneratorService } from './rasa-dialog-generator.service';

describe('RasaDialogGeneratorService', () => {
  let service: RasaDialogGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RasaDialogGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
