import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { ClarityService } from './services/clarity.service';

function initializeClarityService(clarityService: ClarityService) {
  return () => clarityService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    importProvidersFrom(BrowserModule, BrowserAnimationsModule),
    ClarityService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeClarityService,
      deps: [ClarityService],
      multi: true
    }
  ]
};
