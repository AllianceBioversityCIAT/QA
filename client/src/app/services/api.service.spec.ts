import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { ToPromiseService } from './to-promise.service';
import { environment } from '../../environments/environment';
import { signal } from '@angular/core';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let toPromiseService: ToPromiseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService, ToPromiseService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    toPromiseService = TestBed.inject(ToPromiseService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('cleanBody', () => {
    it('should clean string values to empty string', () => {
      const body = { name: 'test', age: 25 };
      service.cleanBody(body);
      expect(body.name).toBe('');
    });

    it('should clean number values to null', () => {
      const body = { age: 25 };
      service.cleanBody(body);
      expect(body.age).toBe(null);
    });

    it('should clean array values to empty array', () => {
      const body = { items: [1, 2, 3] };
      service.cleanBody(body);
      expect(body.items).toEqual([]);
    });

    it('should clean object values to null', () => {
      const body = { obj: { key: 'value' } };
      service.cleanBody(body);
      expect(body.obj).toBe(null);
    });

    it('should handle mixed types', () => {
      const body = {
        name: 'test',
        age: 30,
        items: [1, 2],
        obj: { x: 1 }
      };
      service.cleanBody(body);
      expect(body.name).toBe('');
      expect(body.age).toBe(null);
      expect(body.items).toEqual([]);
      expect(body.obj).toBe(null);
    });
  });

  describe('updateSignalBody', () => {
    it('should update signal with non-null values', () => {
      const bodySignal = signal({ name: '', age: 0 });
      service.updateSignalBody(bodySignal, { name: 'John', age: 25 });
      expect(bodySignal().name).toBe('John');
      expect(bodySignal().age).toBe(25);
    });

    it('should not update signal with null values', () => {
      const bodySignal = signal({ name: 'Initial', age: 10 });
      service.updateSignalBody(bodySignal, { name: null, age: null });
      expect(bodySignal().name).toBe('Initial');
      expect(bodySignal().age).toBe(10);
    });

    it('should partially update signal', () => {
      const bodySignal = signal({ name: 'Test', age: 20, city: 'NY' });
      service.updateSignalBody(bodySignal, { age: 30 });
      expect(bodySignal().name).toBe('Test');
      expect(bodySignal().age).toBe(30);
      expect(bodySignal().city).toBe('NY');
    });
  });

  describe('login', () => {
    it('should call TP.post with correct parameters', async () => {
      const credentials = { username: 'test', password: 'pass123' };
      const mockResponse = { data: { access_token: 'token' }, successfulRequest: true };

      const spy = jest.spyOn(toPromiseService, 'post').mockResolvedValue(mockResponse as any);

      const result = await service.login(credentials);

      expect(spy).toHaveBeenCalledWith('auth/login', credentials);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('GET_loginWithAzureAd', () => {
    it('should call TP.get with correct URL', async () => {
      const provider = 'azure';
      const mockResponse = { data: { authUrl: 'http://auth.url' }, successfulRequest: true };

      const spy = jest.spyOn(toPromiseService, 'get').mockResolvedValue(mockResponse as any);

      const result = await service.GET_loginWithAzureAd(provider);

      expect(spy).toHaveBeenCalledWith('auth/auth-url/azure');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('POST_validateCognitoCode', () => {
    it('should make POST request with code', () => {
      const code = 'abc123';
      const mockResponse = { valid: true };

      service.POST_validateCognitoCode(code).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}auth/validate-auth-code`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ code });
      req.flush(mockResponse);
    });
  });

  describe('POST_cognitoAuth', () => {
    it('should make POST request with credentials', () => {
      const body = {
        username: 'user',
        password: 'pass',
        confirmPassword: 'pass'
      };
      const mockResponse = { token: 'xyz' };

      service.POST_cognitoAuth(body).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush(mockResponse);
    });
  });

  describe('POST_cognitoChangePassword', () => {
    it('should call TP.post with correct parameters', async () => {
      const body = {
        session: 'session123',
        newPassword: 'newPass',
        username: 'user'
      };
      const mockResponse = { data: { success: true }, successfulRequest: true };

      const spy = jest.spyOn(toPromiseService, 'post').mockResolvedValue(mockResponse as any);

      const result = await service.POST_cognitoChangePassword(body);

      expect(spy).toHaveBeenCalledWith('auth/complete-password-challenge', body);
      expect(result).toEqual(mockResponse);
    });
  });
});
