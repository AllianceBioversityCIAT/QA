import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { FooterComponent } from './footer.component';
import { FooterService } from './footer.service';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let mockRouter: { url: string };

  beforeEach(async () => {
    mockRouter = { url: '/dashboard' };

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        FooterService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with routes', () => {
    expect(component.routes).toBeDefined();
    expect(component.routes.length).toBe(3);
  });

  it('should have license and terms URLs from environment', () => {
    expect(component.license).toBeDefined();
    expect(component.termsAndCondition).toBeDefined();
  });

  describe('showIfRouteIsInList', () => {
    it('should return true when route matches admin dashboard', () => {
      mockRouter.url = '/dashboard/admin';
      const result = component.showIfRouteIsInList();
      expect(result).toBe(true);
      expect(component.currentRoute.mode).toBe('floating');
      expect(component.currentRoute.marginTop).toBe(700);
    });

    it('should return true when route matches indicator', () => {
      mockRouter.url = '/indicator/detail/123';
      const result = component.showIfRouteIsInList();
      expect(result).toBe(true);
      expect(component.currentRoute.mode).toBe('');
      expect(component.currentRoute.marginTop).toBe(100);
    });

    it('should return true when route matches login', () => {
      mockRouter.url = '/login';
      const result = component.showIfRouteIsInList();
      expect(result).toBe(true);
      expect(component.currentRoute.mode).toBe('floatingAbsolute');
    });

    it('should return false when route does not match any in list', () => {
      mockRouter.url = '/other-page';
      const result = component.showIfRouteIsInList();
      expect(result).toBe(false);
    });

    it('should reset currentRoute when no match found', () => {
      mockRouter.url = '/dashboard/admin';
      component.showIfRouteIsInList();
      expect(component.currentRoute.mode).toBe('floating');

      mockRouter.url = '/unknown';
      component.showIfRouteIsInList();
      expect(component.currentRoute.mode).toBe('');
      expect(component.currentRoute.marginTop).toBe(0);
    });

    it('should match partial routes', () => {
      mockRouter.url = '/dashboard/admin/users/123';
      const result = component.showIfRouteIsInList();
      expect(result).toBe(true);
    });

    it('should handle empty router url', () => {
      mockRouter.url = '';
      const result = component.showIfRouteIsInList();
      expect(result).toBe(false);
    });
  });

  it('should have isHover initialized to false', () => {
    expect(component.isHover).toBe(false);
  });
});
