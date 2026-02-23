import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalTextDirective } from './global-text.directive';

@Component({
  template: `<span [globalText]="textId"></span>`,
  standalone: true,
  imports: [GlobalTextDirective],
})
class TestHostComponent {
  textId: any = null;
}

describe('GlobalTextDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
  });

  it('should create the directive', () => {
    fixture.detectChanges();
    const spanEl = fixture.nativeElement.querySelector('span');
    expect(spanEl).toBeTruthy();
  });

  it('should set text and classes when valid id is provided', () => {
    component.textId = 1;
    fixture.detectChanges();

    const spanEl = fixture.nativeElement.querySelector('span');
    expect(spanEl.innerText).toBe('Enter your username to reset your password.');
    expect(spanEl.classList.contains('error')).toBe(true);
  });

  it('should not modify element when id does not match any config', () => {
    component.textId = 9999;
    fixture.detectChanges();

    const spanEl = fixture.nativeElement.querySelector('span');
    expect(spanEl.innerText).toBeFalsy();
  });

  it('should not modify element when id is null', () => {
    component.textId = null;
    fixture.detectChanges();

    const spanEl = fixture.nativeElement.querySelector('span');
    expect(spanEl.innerText).toBeFalsy();
  });
});
