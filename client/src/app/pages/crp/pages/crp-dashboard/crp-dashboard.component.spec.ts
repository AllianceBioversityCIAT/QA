import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

// Mock @swimlane/ngx-charts before importing the component
jest.mock('@swimlane/ngx-charts', () => ({
  NgxChartsModule: class NgxChartsModule {},
  BarChartModule: class BarChartModule {},
  LineChartModule: class LineChartModule {},
  PieChartModule: class PieChartModule {},
  AdvancedPieChartModule: class AdvancedPieChartModule {},
  ScaleType: {
    Time: 'time',
    Linear: 'linear',
    Ordinal: 'ordinal',
    Quantile: 'quantile'
  }
}));

import CrpDashboardComponent from './crp-dashboard.component';

describe('CrpDashboardComponent', () => {
  let component: CrpDashboardComponent;
  let fixture: ComponentFixture<CrpDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ CrpDashboardComponent, HttpClientTestingModule ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' }),
            queryParams: of({ crp_id: '1' }),
            queryParamMap: of({
              params: { crp_id: '1' },
              get: (key: string) => '1'
            })
          }
        },
        {
          provide: NgxSpinnerService,
          useValue: { show: jest.fn(), hide: jest.fn() }
        }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .overrideComponent(CrpDashboardComponent, {
      set: {
        imports: []
      }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrpDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
