import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { AvailableGuard } from './available.guard';

describe('AvailableGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AvailableGuard,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({})
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            events: of({})
          }
        }
      ]
    });
  });

  it('should ...', inject([AvailableGuard], (guard: AvailableGuard) => {
    expect(guard).toBeTruthy();
  }));
});
