import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

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

import { StatusChartComponent } from './status-chart.component';

describe('StatusChartComponent', () => {
  let component: StatusChartComponent;
  let fixture: ComponentFixture<StatusChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ StatusChartComponent, HttpClientTestingModule ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({})
          }
        }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .overrideComponent(StatusChartComponent, {
      set: {
        imports: []
      }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusChartComponent);
    component = fixture.componentInstance;

    // Initialize required inputs
    component.indicator = [{
      name: 'Test Indicator',
      series: [
        { status: 'complete', value: 5 },
        { status: 'pending', value: 3 }
      ]
    }];
    component.indicators = [];
    component.total = 8;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
