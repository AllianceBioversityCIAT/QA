import { ElementRef, Renderer2 } from '@angular/core';
import { GlobalTextDirective } from './global-text.directive';

describe('GlobalTextDirective', () => {
  it('should create an instance', () => {
    const mockElementRef = {} as ElementRef;
    const mockRenderer2 = {} as Renderer2;
    const directive = new GlobalTextDirective(mockElementRef, mockRenderer2);
    expect(directive).toBeTruthy();
  });
});
