import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return HTML string', () => {
      const result = service.getHello();

      expect(typeof result).toBe('string');
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html');
    });

    it('should contain QA API title', () => {
      const result = service.getHello();

      expect(result).toContain('QA API');
      expect(result).toContain('<title>QA API</title>');
    });

    it('should contain Quality Assessment API description', () => {
      const result = service.getHello();

      expect(result).toContain('Quality Assessment API for CGIAR');
    });

    it('should contain version 2.0', () => {
      const result = service.getHello();

      expect(result).toContain('Version: 2.0');
    });

    it('should contain CGIAR logo image', () => {
      const result = service.getHello();

      expect(result).toContain('cgspace.cgiar.org');
      expect(result).toContain('alt="CGIAR Logo"');
      expect(result).toContain('<img');
    });

    it('should contain copyright footer', () => {
      const result = service.getHello();

      expect(result).toContain('&copy; 2024 CGIAR');
      expect(result).toContain('All rights reserved');
    });

    it('should contain proper HTML structure', () => {
      const result = service.getHello();

      expect(result).toContain('<head>');
      expect(result).toContain('</head>');
      expect(result).toContain('<body>');
      expect(result).toContain('</body>');
      expect(result).toContain('</html>');
    });

    it('should contain CSS styles', () => {
      const result = service.getHello();

      expect(result).toContain('<style>');
      expect(result).toContain('font-family');
      expect(result).toContain('background-color');
    });

    it('should contain container div with proper classes', () => {
      const result = service.getHello();

      expect(result).toContain('<div class="container">');
      expect(result).toContain('</div>');
    });

    it('should return the same result on multiple calls', () => {
      const result1 = service.getHello();
      const result2 = service.getHello();

      expect(result1).toBe(result2);
    });
  });
});
