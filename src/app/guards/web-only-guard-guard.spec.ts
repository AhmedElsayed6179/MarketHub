import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { webOnlyGuardGuard } from './web-only-guard-guard';

describe('webOnlyGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => webOnlyGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
