import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsersService } from './users.service';
import { environment } from '../../environments/environment';
import { User } from './../_models/user.model';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsersService]
    });

    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize currentUserSubject from localStorage', () => {
    const mockUser: Partial<User> = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    };
    localStorage.setItem('currentUser', JSON.stringify(mockUser));

    const newService = new UsersService(TestBed.inject(HttpClientTestingModule) as any);
    expect(newService.currentUserSubject.value).toEqual(mockUser);
  });

  it('should initialize currentUserSubject as null when localStorage is empty', () => {
    expect(service.currentUserSubject.value).toBeNull();
  });

  describe('getAllUsers', () => {
    it('should fetch all users', () => {
      const mockUsers = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ];

      service.getAllUsers().subscribe(users => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/all`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
  });

  describe('createUser', () => {
    it('should create a new user', () => {
      const newUser = {
        name: 'New User',
        email: 'new@example.com'
      };
      const mockResponse = { id: 3, ...newUser };

      service.createUser(newUser).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);
      req.flush(mockResponse);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by id', () => {
      const userId = 1;
      const mockResponse = { message: 'User deleted' };

      service.deleteUser(userId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getUserById', () => {
    it('should fetch a user by id', () => {
      const userId = 1;
      const mockUser = { id: 1, name: 'Test User' };

      service.getUserById(userId).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}user/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('currentUser observable', () => {
    it('should emit current user from subject', (done) => {
      const mockUser: Partial<User> = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      };

      service.currentUser.subscribe(user => {
        if (user) {
          expect(user).toEqual(mockUser);
          done();
        }
      });

      service.currentUserSubject.next(mockUser as User);
    });
  });
});
