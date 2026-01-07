import { TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { CookiesService } from './cookie-service.service';

describe('CookiesService', () => {
  let service: CookiesService;
  let cookieServiceMock: jest.Mocked<CookieService>;

  beforeEach(() => {
    cookieServiceMock = {
      set: jest.fn(),
      get: jest.fn(),
      check: jest.fn(),
      getAll: jest.fn(),
      delete: jest.fn(),
      deleteAll: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        CookiesService,
        { provide: CookieService, useValue: cookieServiceMock }
      ]
    });
    service = TestBed.inject(CookiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setData', () => {
    it('should set cookie with stringified data', () => {
      const testData = { name: 'test', value: 123 };
      cookieServiceMock.check.mockReturnValue(true);

      const result = service.setData('testCookie', testData);

      expect(cookieServiceMock.set).toHaveBeenCalledWith(
        'testCookie',
        JSON.stringify(testData),
        null,
        '/',
        '',
        false,
        'Strict'
      );
      expect(result).toBe(true);
    });

    it('should return the result of cookie check', () => {
      cookieServiceMock.check.mockReturnValue(false);

      const result = service.setData('testCookie', {});

      expect(result).toBe(false);
    });
  });

  describe('getData', () => {
    it('should return parsed JSON data when cookie exists', () => {
      const testData = { name: 'test', value: 123 };
      cookieServiceMock.get.mockReturnValue(JSON.stringify(testData));

      const result = service.getData('testCookie');

      expect(result).toEqual(testData);
    });

    it('should return the cookie value when cookie is empty string', () => {
      cookieServiceMock.get.mockReturnValue('');

      const result = service.getData('testCookie');

      expect(result).toBe('');
    });
  });

  describe('getAllData', () => {
    it('should return all cookies', () => {
      const allCookies = { cookie1: 'value1', cookie2: 'value2' };
      cookieServiceMock.getAll.mockReturnValue(allCookies);

      const result = service.getAllData();

      expect(result).toEqual(allCookies);
    });
  });

  describe('delete', () => {
    it('should delete specific cookie', () => {
      service.delete('testCookie');

      expect(cookieServiceMock.delete).toHaveBeenCalledWith('testCookie', '/');
    });
  });

  describe('deleteAll', () => {
    it('should delete all cookies', () => {
      service.deleteAll();

      expect(cookieServiceMock.deleteAll).toHaveBeenCalled();
    });
  });
});
