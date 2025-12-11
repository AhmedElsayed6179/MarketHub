import { TestBed } from '@angular/core/testing';

import { ApiUser } from './api-user';

describe('ApiUser', () => {
  let service: ApiUser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiUser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
