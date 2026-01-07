import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;
  let alertService: AlertService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AlertComponent ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    alertService = TestBed.inject(AlertService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to alertService on init', () => {
    expect(component.subscription).toBeDefined();
  });

  it('should set success CSS class for success messages', (done) => {
    alertService.success('Success message');

    setTimeout(() => {
      expect(component.message).toBeDefined();
      expect(component.message.cssClass).toBe('alert sticky alert-success');
      expect(component.message.text).toBe('Success message');
      done();
    }, 100);
  });

  it('should set error CSS class for error messages', (done) => {
    alertService.error('Error message');

    setTimeout(() => {
      expect(component.message).toBeDefined();
      expect(component.message.cssClass).toBe('alert sticky alert-danger');
      expect(component.message.text).toBe('Error message');
      done();
    }, 100);
  });

  it('should update message when new alert is emitted', (done) => {
    alertService.success('First message');

    setTimeout(() => {
      const firstMessage = component.message;
      expect(firstMessage.text).toBe('First message');

      alertService.error('Second message');

      setTimeout(() => {
        expect(component.message.text).toBe('Second message');
        done();
      }, 100);
    }, 100);
  });

  it('should unsubscribe on destroy', () => {
    const spy = jest.spyOn(component.subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });

  it('should clear message when alertService clears', (done) => {
    alertService.success('Message');

    setTimeout(() => {
      expect(component.message).toBeDefined();

      alertService.clear();

      setTimeout(() => {
        expect(component.message).toBeNull();
        done();
      }, 100);
    }, 100);
  });
});
