import { TestBed } from '@angular/core/testing';

import { ApiProducts } from './api-products';

describe('ApiProducts', () => {
  let service: ApiProducts;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiProducts);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
