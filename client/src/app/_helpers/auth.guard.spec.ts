import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AuthGuard } from './auth.guard';
import { AuthenticationService } from '../services/authentication.service';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthGuard,
        {
          provide: Router,
          useValue: { navigate: jest.fn() }
        },
        {
          provide: AuthenticationService,
          useValue: {
            currentUserValue: null
          }
        }
      ]
    });
  });

  it('should ...', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
