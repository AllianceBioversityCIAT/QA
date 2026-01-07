import { UrlTransformPipe } from './url-transform.pipe';

describe('UrlTransformPipe', () => {
  let pipe: UrlTransformPipe;

  beforeEach(() => {
    pipe = new UrlTransformPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should transform a valid http URL to an anchor tag', () => {
      const url = 'http://example.com';
      const result = pipe.transform(url);
      expect(result).toBe(`<a target="_blank" href="${url}">${url}</a>`);
    });

    it('should transform a valid https URL to an anchor tag', () => {
      const url = 'https://example.com';
      const result = pipe.transform(url);
      expect(result).toBe(`<a target="_blank" href="${url}">${url}</a>`);
    });

    it('should not transform an invalid URL', () => {
      const invalidUrl = 'not a url';
      const result = pipe.transform(invalidUrl);
      expect(result).toBe(invalidUrl);
    });

    it('should return non-string values unchanged', () => {
      expect(pipe.transform(null)).toBe(null);
      expect(pipe.transform(undefined)).toBe(undefined);
      expect(pipe.transform(123)).toBe(123);
    });

    it('should not transform URLs that do not start with http:// or https://', () => {
      const url = 'example.com';
      const result = pipe.transform(url);
      expect(result).toBe(url);
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(pipe.validateUrl('https://example.com')).toBe(true);
      expect(pipe.validateUrl('http://example.com')).toBe(true);
      expect(pipe.validateUrl('https://example.com/path')).toBe(true);
      expect(pipe.validateUrl('https://example.com:8080')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(pipe.validateUrl('not a url')).toBe(false);
      expect(pipe.validateUrl('http://')).toBe(false);
    });
  });

  describe('urlToAnchor', () => {
    it('should convert URLs in text to anchor tags', () => {
      const text = 'Check out https://example.com for more info';
      const result = pipe.urlToAnchor(text);
      expect(result).toContain('<a target="_blank"');
      expect(result).toContain('https://example.com');
    });

    it('should not modify text that already contains anchor tags', () => {
      const text = '<a href="https://example.com">link</a>';
      const result = pipe.urlToAnchor(text);
      expect(result).toBe(text);
    });

    it('should handle multiple URLs in text', () => {
      const text = 'Visit https://example.com and http://test.com';
      const result = pipe.urlToAnchor(text);
      expect(result).toContain('https://example.com');
      expect(result).toContain('http://test.com');
    });
  });
});
