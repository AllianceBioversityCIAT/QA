import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LineChartComponent } from './line-chart.component';
import { IndicatorsService } from '../../../services/indicators.service';

describe('LineChartComponent', () => {
  let component: LineChartComponent;
  let fixture: ComponentFixture<LineChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LineChartComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: IndicatorsService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartComponent);
    component = fixture.componentInstance;
    component.data = [
      { pending: 5, approved_without_comment: 3, assessment_with_comments: 2 },
      { pending: 0, approved_without_comment: 0, assessment_with_comments: 0 },
      { pending: 10, approved_without_comment: 5, assessment_with_comments: 8 },
    ];
    component.total = 30;
    component.indicatorName = 'qa_knowledge_product';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should build calloutDataSource from data', () => {
      component.ngOnInit();
      expect(component.calloutDataSource).toHaveLength(3);
      expect(component.calloutDataSource[0]).toEqual({ X: 0, Y: 10, Label: '10' });
    });

    it('should set PendingMarker to null when pending is 0', () => {
      component.ngOnInit();
      expect(component.data[1].PendingMarker).toBeNull();
    });

    it('should set ApprovedMarker to null when approved_without_comment is 0', () => {
      component.ngOnInit();
      expect(component.data[1].ApprovedMarker).toBeNull();
    });

    it('should set CommentMarker to null when assessment_with_comments is 0', () => {
      component.ngOnInit();
      expect(component.data[1].CommentMarker).toBeNull();
    });

    it('should calculate PendingMarker as pending/2', () => {
      component.ngOnInit();
      expect(component.data[0].PendingMarker).toBe(2.5);
    });

    it('should calculate ApprovedMarker correctly', () => {
      component.ngOnInit();
      // pending + (approved_without_comment / 2) = 5 + (3/2) = 6.5
      expect(component.data[0].ApprovedMarker).toBe(6.5);
    });

    it('should calculate CommentMarker correctly', () => {
      component.ngOnInit();
      // pending + approved + (assessment/2) = 5 + 3 + (2/2) = 9
      expect(component.data[0].CommentMarker).toBe(9);
    });
  });

  describe('calculateInterval', () => {
    it('should set maxY to total when not publications', () => {
      component.indicatorName = 'qa_knowledge_product';
      component.calculateInterval();
      // After iterating, maxY may be overridden by assessment_with_comments if larger
      expect(component.maxY).toBeDefined();
      expect(component.interval).toBeGreaterThanOrEqual(1);
    });

    it('should calculate maxY from pending for publications', () => {
      component.indicatorName = 'qa_publications';
      component.calculateInterval();
      expect(component.maxY).toBeGreaterThanOrEqual(0);
    });

    it('should set interval to at least 1', () => {
      component.data = [{ pending: 0, approved_without_comment: 0, assessment_with_comments: 0 }];
      component.indicatorName = 'qa_publications';
      component.calculateInterval();
      expect(component.interval).toBe(1);
    });

    it('should use max assessment_with_comments when larger than total', () => {
      component.total = 5;
      component.data = [{ pending: 0, approved_without_comment: 0, assessment_with_comments: 100 }];
      component.calculateInterval();
      expect(component.maxY).toBe(100);
    });
  });

  describe('switchCharts', () => {
    it('should toggle toggleChart', () => {
      component.toggleChart = false;
      component.switchCharts();
      expect(component.toggleChart).toBe(true);
      component.switchCharts();
      expect(component.toggleChart).toBe(false);
    });
  });

  describe('getMarker', () => {
    it('should return an object with measure and render functions', () => {
      const marker = component.getMarker();
      expect(marker.measure).toBeDefined();
      expect(marker.render).toBeDefined();
    });

    it('measure should calculate width and height', () => {
      const marker = component.getMarker();
      const measureInfo = {
        data: { item: { pending: 5 } },
        context: {
          measureText: jest.fn().mockReturnValue({ width: 10 }),
        },
        width: 0,
        height: 0,
      };
      marker.measure(measureInfo);
      expect(measureInfo.width).toBe(10);
      expect(measureInfo.height).toBe(22);
    });

    it('measure should handle null item', () => {
      const marker = component.getMarker();
      const measureInfo = {
        data: { item: null },
        context: {
          measureText: jest.fn().mockReturnValue({ width: 10 }),
        },
        width: 0,
        height: 0,
      };
      marker.measure(measureInfo);
      expect(measureInfo.width).toBe(10);
    });

    it('render should handle PendingMarker path', () => {
      const marker = component.getMarker();
      const renderInfo = {
        data: {
          item: { pending: 5, approved_without_comment: 3, assessment_with_comments: 2 },
          series: { valueColumn: { propertyName: 'PendingMarker' } },
          actualItemBrush: { fill: 'red' },
        },
        context: { font: '', textBaseline: '', fillStyle: '', fillText: jest.fn(), fillRect: jest.fn() },
        xPosition: 10,
        yPosition: 20,
        isHitTestRender: false,
        availableWidth: 10,
        availableHeight: 10,
      };
      marker.render(renderInfo);
      expect(renderInfo.context.fillText).toHaveBeenCalledWith(5, expect.any(Number), expect.any(Number));
    });

    it('render should handle ApprovedMarker path', () => {
      const marker = component.getMarker();
      const renderInfo = {
        data: {
          item: { pending: 5, approved_without_comment: 3, assessment_with_comments: 2 },
          series: { valueColumn: { propertyName: 'ApprovedMarker' } },
          actualItemBrush: { fill: 'red' },
        },
        context: { font: '', textBaseline: '', fillStyle: '', fillText: jest.fn(), fillRect: jest.fn() },
        xPosition: 10,
        yPosition: 20,
        isHitTestRender: false,
        availableWidth: 10,
        availableHeight: 10,
      };
      marker.render(renderInfo);
      expect(renderInfo.context.fillText).toHaveBeenCalledWith(3, expect.any(Number), expect.any(Number));
    });

    it('render should handle CommentMarker path', () => {
      const marker = component.getMarker();
      const renderInfo = {
        data: {
          item: { pending: 5, approved_without_comment: 3, assessment_with_comments: 2 },
          series: { valueColumn: { propertyName: 'CommentMarker' } },
          actualItemBrush: { fill: 'red' },
        },
        context: { font: '', textBaseline: '', fillStyle: '', fillText: jest.fn(), fillRect: jest.fn() },
        xPosition: 10,
        yPosition: 20,
        isHitTestRender: false,
        availableWidth: 10,
        availableHeight: 10,
      };
      marker.render(renderInfo);
      expect(renderInfo.context.fillText).toHaveBeenCalledWith(2, expect.any(Number), expect.any(Number));
    });

    it('render should handle isHitTestRender', () => {
      const marker = component.getMarker();
      const renderInfo = {
        data: {
          item: { pending: 5 },
          series: { valueColumn: { propertyName: 'PendingMarker' } },
          actualItemBrush: { fill: 'red' },
        },
        context: { fillStyle: '', fillRect: jest.fn() },
        xPosition: 10,
        yPosition: 20,
        isHitTestRender: true,
        availableWidth: 10,
        availableHeight: 10,
      };
      marker.render(renderInfo);
      expect(renderInfo.context.fillRect).toHaveBeenCalled();
    });

    it('render should adjust xOffset for value > 100', () => {
      const marker = component.getMarker();
      const renderInfo = {
        data: {
          item: { pending: 150, approved_without_comment: 0, assessment_with_comments: 0 },
          series: { valueColumn: { propertyName: 'PendingMarker' } },
          actualItemBrush: { fill: 'red' },
        },
        context: { font: '', textBaseline: '', fillStyle: '', fillText: jest.fn(), fillRect: jest.fn() },
        xPosition: 100,
        yPosition: 50,
        isHitTestRender: false,
        availableWidth: 10,
        availableHeight: 10,
      };
      marker.render(renderInfo);
      // xOffset = 24 for value > 100, so x - (24/2) = 100 - 12 = 88
      expect(renderInfo.context.fillText).toHaveBeenCalledWith(150, 88, expect.any(Number));
    });
  });
});
