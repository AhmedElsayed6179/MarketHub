import { TestBed } from '@angular/core/testing';

import { ApiCart } from './api-cart';

describe('ApiCart', () => {
  let service: ApiCart;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiCart);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
