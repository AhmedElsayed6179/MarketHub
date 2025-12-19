import { TestBed } from '@angular/core/testing';

import { ApiContact } from './api-contact';

describe('ApiContact', () => {
  let service: ApiContact;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiContact);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
