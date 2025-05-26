import { TestBed } from '@angular/core/testing';

import { IdiService } from './idi.service';

describe('IdiService', () => {
  let service: IdiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IdiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
