import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { GlobalToastComponent } from './global-toast.component';
import { ActionsService } from '../../services/actions.service';

describe('GlobalToastComponent', () => {
  let component: GlobalToastComponent;
  let fixture: ComponentFixture<GlobalToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalToastComponent, BrowserAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have ActionsService injected', () => {
    expect(component.actions).toBeDefined();
  });
});
