import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToPromiseService } from './to-promise.service';
import { environment } from '../../environments/environment';

describe('ToPromiseService', () => {
  let service: ToPromiseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ToPromiseService]
    });
    service = TestBed.inject(ToPromiseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('post', () => {
    it('should make POST request and return successful response', async () => {
      const testUrl = '/test';
      const testBody = { data: 'test' };
      const mockResponse = { data: { result: 'success' }, status: 200 };

      const promise = service.post(testUrl, testBody);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}${testUrl}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(testBody);
      req.flush(mockResponse);

      const result = await promise;
      expect(result.successfulRequest).toBe(true);
      expect((result as any).data).toBeDefined();
    });

    it('should include Authorization header when token is provided', async () => {
      const testUrl = '/test';
      const testBody = { data: 'test' };
      const token = 'test-token';

      const promise = service.post(testUrl, testBody, token);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}${testUrl}`);
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush({});

      await promise;
    });

    it('should handle POST error', async () => {
      const testUrl = '/test';
      const testBody = { data: 'test' };
      const mockError = { description: 'Test error' };

      const promise = service.post(testUrl, testBody);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}${testUrl}`);
      req.flush(mockError, { status: 400, statusText: 'Bad Request' });

      const result = await promise;
      expect(result.successfulRequest).toBe(false);
      expect((result as any).errorDetail).toBe('Test error');
    });
  });

  describe('put', () => {
    it('should make PUT request and return successful response', async () => {
      const testUrl = '/test';
      const testBody = { data: 'test' };
      const mockResponse = { data: { result: 'updated' }, status: 200 };

      const promise = service.put(testUrl, testBody);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}${testUrl}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(testBody);
      req.flush(mockResponse);

      const result = await promise;
      expect(result.successfulRequest).toBe(true);
      expect((result as any).data).toBeDefined();
    });

    it('should handle PUT error', async () => {
      const testUrl = '/test';
      const testBody = { data: 'test' };
      const mockError = { description: 'Update failed' };

      const promise = service.put(testUrl, testBody);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}${testUrl}`);
      req.flush(mockError, { status: 500, statusText: 'Internal Server Error' });

      const result = await promise;
      expect(result.successfulRequest).toBe(false);
      expect((result as any).errorDetail).toBe('Update failed');
    });
  });

  describe('get', () => {
    it('should make GET request and return successful response', async () => {
      const testUrl = '/test';
      const mockResponse = { data: { result: 'data' }, status: 200 };

      const promise = service.get(testUrl);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}${testUrl}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.successfulRequest).toBe(true);
      expect((result as any).data).toBeDefined();
    });

    it('should handle GET error', async () => {
      const testUrl = '/test';
      const mockError = { description: 'Not found' };

      const promise = service.get(testUrl);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}${testUrl}`);
      req.flush(mockError, { status: 404, statusText: 'Not Found' });

      const result = await promise;
      expect(result.successfulRequest).toBe(false);
      expect((result as any).errorDetail).toBe('Not found');
    });
  });

  describe('patch', () => {
    it('should make PATCH request and return successful response', async () => {
      const testUrl = '/test';
      const testBody = { data: 'patch' };
      const mockResponse = { data: { result: 'patched' }, status: 200 };

      const promise = service.patch(testUrl, testBody);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}${testUrl}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(testBody);
      req.flush(mockResponse);

      const result = await promise;
      expect(result.successfulRequest).toBe(true);
      expect((result as any).data).toBeDefined();
    });

    it('should handle PATCH error', async () => {
      const testUrl = '/test';
      const testBody = { data: 'patch' };
      const mockError = { description: 'Patch failed' };

      const promise = service.patch(testUrl, testBody);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}${testUrl}`);
      req.flush(mockError, { status: 400, statusText: 'Bad Request' });

      const result = await promise;
      expect(result.successfulRequest).toBe(false);
      expect((result as any).errorDetail).toBe('Patch failed');
    });
  });
});
