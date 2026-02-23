import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import * as moment from 'moment';

import { TimelineComponent } from './timeline.component';
import { DashboardService } from '../../services/dashboard.service';

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;
  let mockDashService: any;

  beforeEach(async () => {
    mockDashService = {
      getAllBatches: jest.fn().mockReturnValue(of({ data: [] })),
    };

    await TestBed.configureTestingModule({
      imports: [TimelineComponent, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}) } },
        { provide: DashboardService, useValue: mockDashService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('calculateStepState', () => {
    it('should return completed when today is after end date', () => {
      const past = moment.default().subtract(10, 'days').toISOString();
      const pastEnd = moment.default().subtract(1, 'day').toISOString();
      expect(component.calculateStepState(past, pastEnd)).toBe('completed');
    });

    it('should return in_progress when today is between start and end', () => {
      const start = moment.default().subtract(1, 'day').toISOString();
      const end = moment.default().add(10, 'days').toISOString();
      expect(component.calculateStepState(start, end)).toBe('in_progress');
    });

    it('should return upcoming when today is before start date', () => {
      const future = moment.default().add(10, 'days').toISOString();
      const futureEnd = moment.default().add(20, 'days').toISOString();
      expect(component.calculateStepState(future, futureEnd)).toBe('upcoming');
    });

    it('should return in_progress when end is null and today is after start', () => {
      const past = moment.default().subtract(1, 'day').toISOString();
      expect(component.calculateStepState(past, null)).toBe('in_progress');
    });

    it('should return upcoming when end is null and today is before start', () => {
      const future = moment.default().add(10, 'days').toISOString();
      expect(component.calculateStepState(future, null)).toBe('upcoming');
    });
  });

  describe('getConnectorState', () => {
    it('should return completed for completed step', () => {
      component.steps = [
        { id: '1', label: 'S1', title: 'T1', startDate: '', endDate: '', state: 'completed' },
        { id: '2', label: 'S2', title: 'T2', startDate: '', endDate: '', state: 'in_progress' },
      ];
      expect(component.getConnectorState(0)).toBe('completed');
    });

    it('should return transition for in_progress step', () => {
      component.steps = [
        { id: '1', label: 'S1', title: 'T1', startDate: '', endDate: '', state: 'in_progress' },
        { id: '2', label: 'S2', title: 'T2', startDate: '', endDate: '', state: 'upcoming' },
      ];
      expect(component.getConnectorState(0)).toBe('transition');
    });

    it('should return pending for upcoming step', () => {
      component.steps = [
        { id: '1', label: 'S1', title: 'T1', startDate: '', endDate: '', state: 'upcoming' },
        { id: '2', label: 'S2', title: 'T2', startDate: '', endDate: '', state: 'upcoming' },
      ];
      expect(component.getConnectorState(0)).toBe('pending');
    });

    it('should return pending for last step', () => {
      component.steps = [
        { id: '1', label: 'S1', title: 'T1', startDate: '', endDate: '', state: 'completed' },
      ];
      expect(component.getConnectorState(0)).toBe('pending');
    });
  });

  describe('buildSteps', () => {
    it('should build all 5 steps from batch data', () => {
      const past = moment.default().subtract(30, 'days').toISOString();
      const future = moment.default().add(30, 'days').toISOString();

      component.batches = {
        2: {
          assessors_start_date: past,
          assessors_end_date: future,
          idts_start_date: past,
          idts_end_date: future,
          lead_assesor_start_date: past,
          lead_assesor_end_date: future,
          tpb_start_date: past,
          tpb_end_date: future,
          ppu_start_date: past,
          ppu_end_date: future,
        },
      };

      component.buildSteps();
      expect(component.steps).toHaveLength(5);
      expect(component.steps[0].id).toBe('assessors');
      expect(component.steps[1].id).toBe('idts');
      expect(component.steps[2].id).toBe('lead-assessor');
      expect(component.steps[3].id).toBe('tpb');
      expect(component.steps[4].id).toBe('ppu');
    });

    it('should skip steps with missing dates', () => {
      component.batches = {
        2: {
          assessors_start_date: '2024-01-01',
          assessors_end_date: '2024-06-01',
          idts_start_date: null,
          idts_end_date: null,
          lead_assesor_start_date: null,
          tpb_start_date: null,
          tpb_end_date: null,
          ppu_start_date: null,
        },
      };

      component.buildSteps();
      expect(component.steps).toHaveLength(1);
      expect(component.steps[0].id).toBe('assessors');
    });

    it('should handle lead_assessor with null end date', () => {
      component.batches = {
        2: {
          assessors_start_date: null,
          assessors_end_date: null,
          idts_start_date: null,
          idts_end_date: null,
          lead_assesor_start_date: '2024-01-01',
          lead_assesor_end_date: null,
          tpb_start_date: null,
          tpb_end_date: null,
          ppu_start_date: null,
        },
      };

      component.buildSteps();
      expect(component.steps).toHaveLength(1);
      expect(component.steps[0].endDate).toBeNull();
    });

    it('should handle ppu with null end date', () => {
      component.batches = {
        2: {
          assessors_start_date: null,
          assessors_end_date: null,
          idts_start_date: null,
          idts_end_date: null,
          lead_assesor_start_date: null,
          tpb_start_date: null,
          tpb_end_date: null,
          ppu_start_date: '2024-01-01',
          ppu_end_date: null,
        },
      };

      component.buildSteps();
      expect(component.steps).toHaveLength(1);
      expect(component.steps[0].endDate).toBeNull();
    });
  });

  describe('getBatches', () => {
    it('should call buildSteps when batch[2] exists', () => {
      const buildStepsSpy = jest.spyOn(component, 'buildSteps');
      mockDashService.getAllBatches.mockReturnValue(of({
        data: { 2: { assessors_start_date: '2024-01-01', assessors_end_date: '2024-06-01' } },
      }));
      component.getBatches();
      expect(buildStepsSpy).toHaveBeenCalled();
    });

    it('should not call buildSteps when batch[2] does not exist', () => {
      const buildStepsSpy = jest.spyOn(component, 'buildSteps');
      mockDashService.getAllBatches.mockReturnValue(of({ data: { 1: {} } }));
      component.getBatches();
      expect(buildStepsSpy).not.toHaveBeenCalled();
    });

    it('should not call buildSteps when data is null', () => {
      const buildStepsSpy = jest.spyOn(component, 'buildSteps');
      mockDashService.getAllBatches.mockReturnValue(of({ data: null }));
      component.getBatches();
      expect(buildStepsSpy).not.toHaveBeenCalled();
    });
  });

  describe('formatDateRange', () => {
    it('should format date range with both dates', () => {
      const result = component.formatDateRange('2024-01-15', '2024-06-30');
      expect(result).toContain('2024-01-15');
      expect(result).toContain('2024-06-30');
    });

    it('should format only start date when end is null', () => {
      const result = component.formatDateRange('2024-01-15', null);
      expect(result).toBe('2024-01-15');
    });
  });

  describe('handleStepClick', () => {
    it('should emit stepClick event', () => {
      const emitSpy = jest.spyOn(component.stepClick, 'emit');
      const step = { id: 'test', label: 'S1', title: 'T1', startDate: '', endDate: '', state: 'completed' as const };
      component.handleStepClick(step);
      expect(emitSpy).toHaveBeenCalledWith(step);
    });

    it('should call onStepClick callback if provided', () => {
      const callback = jest.fn();
      component.onStepClick = callback;
      const step = { id: 'test', label: 'S1', title: 'T1', startDate: '', endDate: '', state: 'completed' as const };
      component.handleStepClick(step);
      expect(callback).toHaveBeenCalledWith(step);
    });
  });

  describe('getAriaLabel', () => {
    it('should return formatted aria label', () => {
      const step = { id: 'test', label: 'STEP 1', title: 'Test Step', startDate: '2024-01-15', endDate: '2024-06-30', state: 'in_progress' as const };
      const result = component.getAriaLabel(step);
      expect(result).toContain('STEP 1');
      expect(result).toContain('Test Step');
      expect(result).toContain('in_progress');
    });
  });
});
