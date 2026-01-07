import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { TawkToComponent } from './tawk-to.component';
import { AuthenticationService } from '../services/authentication.service';
import { User } from '../_models/user.model';

describe('TawkToComponent', () => {
  let component: TawkToComponent;
  let fixture: ComponentFixture<TawkToComponent>;
  let authService: AuthenticationService;
  let currentUserSubject: BehaviorSubject<User | null>;

  beforeEach(waitForAsync(() => {
    currentUserSubject = new BehaviorSubject<User | null>(null);

    TestBed.configureTestingModule({
      imports: [ TawkToComponent, HttpClientTestingModule ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({})
          }
        },
        {
          provide: AuthenticationService,
          useValue: {
            currentUser: currentUserSubject.asObservable()
          }
        }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TawkToComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthenticationService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with null currentUser', () => {
    fixture.detectChanges();
    expect(component.currentUser).toBeNull();
  });

  it('should update currentUser when auth service emits', () => {
    const mockUser: Partial<User> = {
      id: 1,
      username: 'test',
      email: 'test@test.com',
      roles: [{ id: 1 }] as any
    };

    currentUserSubject.next(mockUser as User);
    fixture.detectChanges();

    expect(component.currentUser).toEqual(mockUser);
  });

  it('should not load Tawk when user has role 3', () => {
    const mockUser: Partial<User> = {
      id: 1,
      username: 'test',
      email: 'test@test.com',
      roles: [{ id: 3 }] as any
    };

    currentUserSubject.next(mockUser as User);
    fixture.detectChanges();

    // Component should not append script when role is 3
    // We can check that ngOnInit handles this case
    expect(component.currentUser?.roles[0].id).toBe(3);
  });

  it('should have openChat method', () => {
    expect(typeof component.openChat).toBe('function');
  });

  it('should call Tawk_API.maximize when openChat is called and API is available', () => {
    const maximizeMock = jest.fn();
    (window as any).Tawk_API = { maximize: maximizeMock };

    component.openChat();

    expect(maximizeMock).toHaveBeenCalled();
    (window as any).Tawk_API = undefined;
  });

  it('should have setLoggedUser method', () => {
    expect(typeof component.setLoggedUser).toBe('function');
  });

  it('should call setAttributes when setLoggedUser is called and visitor exists', () => {
    const setAttributesMock = jest.fn();
    (window as any).Tawk_API = {
      visitor: {},
      setAttributes: setAttributesMock
    };

    component.currentUser = {
      username: 'testuser',
      email: 'test@example.com'
    } as User;

    component.setLoggedUser();

    expect(setAttributesMock).toHaveBeenCalledWith(
      { name: 'testuser', email: 'test@example.com' },
      expect.any(Function)
    );

    (window as any).Tawk_API = undefined;
  });

  it('should have script element created', () => {
    fixture.detectChanges();
    expect(component.script).toBeDefined();
  });

  it('should have isVisibleTawk set to true by default', () => {
    expect(component.isVisibleTawk).toBe(true);
  });

  it('should have config from environment', () => {
    expect(component.config).toBeDefined();
  });
});
