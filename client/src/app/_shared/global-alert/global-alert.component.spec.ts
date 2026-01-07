import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GlobalAlertComponent } from './global-alert.component';
import { ActionsService } from '../../services/actions.service';

describe('GlobalAlertComponent', () => {
  let component: GlobalAlertComponent;
  let fixture: ComponentFixture<GlobalAlertComponent>;
  let actionsService: ActionsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, GlobalAlertComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalAlertComponent);
    component = fixture.componentInstance;
    actionsService = TestBed.inject(ActionsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('closeAlert', () => {
    it('should call actions.hideGlobalAlert with the correct index', () => {
      const spy = jest.spyOn(actionsService, 'hideGlobalAlert');
      component.closeAlert(2);
      expect(spy).toHaveBeenCalledWith(2);
    });
  });

  describe('getIcon', () => {
    it('should return "info" for info severity', () => {
      expect(component.getIcon('info')).toBe('info');
    });

    it('should return "warning" for warning severity', () => {
      expect(component.getIcon('warning')).toBe('warning');
    });

    it('should return "cancel" for danger severity', () => {
      expect(component.getIcon('danger')).toBe('cancel');
    });

    it('should return "info" for success severity (default)', () => {
      expect(component.getIcon('success')).toBe('info');
    });

    it('should return "info" for secondary severity (default)', () => {
      expect(component.getIcon('secondary')).toBe('info');
    });

    it('should return "info" for contrast severity (default)', () => {
      expect(component.getIcon('contrast')).toBe('info');
    });
  });
});
