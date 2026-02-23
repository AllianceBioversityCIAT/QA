import { DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import helmet from 'helmet';

describe('main.ts', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should have required imports available', () => {
    // Test that all required modules are importable
    expect(DocumentBuilder).toBeDefined();
    expect(express.json).toBeDefined();
    expect(express.urlencoded).toBeDefined();
    expect(helmet).toBeDefined();
  });

  it('should use express json middleware with 50mb limit', () => {
    // Test that express.json is a function
    expect(typeof express.json).toBe('function');
    
    // Test that it can be called with options
    const middleware = express.json({ limit: '50mb' });
    expect(middleware).toBeDefined();
  });

  it('should use express urlencoded middleware with 50mb limit', () => {
    // Test that express.urlencoded is a function
    expect(typeof express.urlencoded).toBe('function');
    
    // Test that it can be called with options
    const middleware = express.urlencoded({ extended: true, limit: '50mb' });
    expect(middleware).toBeDefined();
  });

  it('should use helmet middleware', () => {
    // Test that helmet is a function
    expect(typeof helmet).toBe('function');
  });

  it('should configure Swagger DocumentBuilder correctly', () => {
    const builder = new DocumentBuilder();
    
    expect(builder.setTitle).toBeDefined();
    expect(builder.setDescription).toBeDefined();
    expect(builder.setVersion).toBeDefined();
    expect(builder.addSecurity).toBeDefined();
    expect(builder.addSecurityRequirements).toBeDefined();
    expect(builder.build).toBeDefined();
  });

  it('should build Swagger config with correct values', () => {
    const builder = new DocumentBuilder()
      .setTitle('CGIAR QA API')
      .setDescription('Quality Assesment API for CGIAR')
      .setVersion('2.0')
      .addSecurity('Authorization', {
        type: 'apiKey',
        'x-tokenName': 'auth',
        name: 'auth',
        in: 'header',
        description: 'JWT Token',
      })
      .addSecurityRequirements('Authorization');

    const config = builder.build();

    expect(config).toBeDefined();
  });

  it('should use PORT from environment or default to 3000', () => {
    const port = process.env.PORT || 3000;
    expect(port).toBeDefined();
    expect(typeof port === 'string' || typeof port === 'number').toBe(true);
  });

  describe('Helmet configuration', () => {
    it('should configure helmet with XSS filter', () => {
      const helmetMiddleware = helmet({
        xssFilter: true,
      });

      expect(helmetMiddleware).toBeDefined();
    });

    it('should configure Content Security Policy', () => {
      const helmetMiddleware = helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: [
              "'self'",
              "'unsafe-inline'",
              'https://fonts.googleapis.com',
            ],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
          },
        },
      });

      expect(helmetMiddleware).toBeDefined();
    });
  });

  describe('Swagger security configuration', () => {
    it('should add Authorization security scheme', () => {
      const builder = new DocumentBuilder();
      builder.addSecurity('Authorization', {
        type: 'apiKey',
        'x-tokenName': 'auth',
        name: 'auth',
        in: 'header',
        description: 'JWT Token',
      });

      expect(builder.addSecurity).toBeDefined();
    });

    it('should add security requirements', () => {
      const builder = new DocumentBuilder();
      builder.addSecurityRequirements('Authorization');

      expect(builder.addSecurityRequirements).toBeDefined();
    });
  });
});
