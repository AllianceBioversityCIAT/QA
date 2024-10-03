import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssesorDashboardComponent } from './assesor-dashboard.component';

describe('AssesorDashboardComponent', () => {
  let component: AssesorDashboardComponent;
  let fixture: ComponentFixture<AssesorDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssesorDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssesorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
