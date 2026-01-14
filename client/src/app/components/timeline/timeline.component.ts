import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule, DatePipe } from '@angular/common';

export interface TimelineStep {
  id: string;
  label: string;
  title: string;
  startDate: Date | string;
  endDate: Date | string | null;
  state: 'completed' | 'in_progress' | 'upcoming';
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {
  @Input() onStepClick?: (step: TimelineStep) => void;
  @Output() stepClick = new EventEmitter<TimelineStep>();

  batches: any = null;
  steps: TimelineStep[] = [];
  today = moment.default();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.getBatches();
  }

  getBatches(): void {
    this.dashboardService.getAllBatches().subscribe(res => {
      this.batches = res.data;
      if (this.batches && this.batches[2]) {
        this.buildSteps();
      }
    });
  }

  buildSteps(): void {
    const batch = this.batches[2];
    const steps: TimelineStep[] = [];

    // Step 1: Assessors
    if (batch.assessors_start_date && batch.assessors_end_date) {
      steps.push({
        id: 'assessors',
        label: 'ROUND 1',
        title: 'QA Platform opens for assessors',
        startDate: batch.assessors_start_date,
        endDate: batch.assessors_end_date,
        state: this.calculateStepState(batch.assessors_start_date, batch.assessors_end_date)
      });
    }

    // Step 2: Initiatives/IDTs
    if (batch.idts_start_date && batch.idts_end_date) {
      steps.push({
        id: 'idts',
        label: 'ROUND 2',
        title: 'QA Platform opens for SP/A',
        startDate: batch.idts_start_date,
        endDate: batch.idts_end_date,
        state: this.calculateStepState(batch.idts_start_date, batch.idts_end_date)
      });
    }

    // Step 3: Lead Assessor
    if (batch.lead_assesor_start_date) {
      steps.push({
        id: 'lead-assessor',
        label: 'ROUND 3',
        title: 'QA Platform opens for Lead assessor',
        startDate: batch.lead_assesor_start_date,
        endDate: batch.lead_assesor_end_date || null,
        state: this.calculateStepState(batch.lead_assesor_start_date, batch.lead_assesor_end_date)
      });
    }

    // Step 4: TP-Broker
    if (batch.tpb_start_date && batch.tpb_end_date) {
      steps.push({
        id: 'tpb',
        label: 'ROUND 4',
        title: 'QA Platform opens for TP-Broker',
        startDate: batch.tpb_start_date,
        endDate: batch.tpb_end_date,
        state: this.calculateStepState(batch.tpb_start_date, batch.tpb_end_date)
      });
    }

    // Step 5: PPU
    if (batch.ppu_start_date) {
      steps.push({
        id: 'ppu',
        label: 'ROUND 5',
        title: 'QA Platform opens for PPU',
        startDate: batch.ppu_start_date,
        endDate: batch.ppu_end_date || null,
        state: this.calculateStepState(batch.ppu_start_date, batch.ppu_end_date)
      });
    }

    this.steps = steps;
  }

  calculateStepState(startDate: Date | string, endDate: Date | string | null): 'completed' | 'in_progress' | 'upcoming' {
    const start = moment.default(startDate);
    const end = endDate ? moment.default(endDate) : null;

    if (end && this.today.isAfter(end)) {
      return 'completed';
    } else if (this.today.isSameOrAfter(start) && (end ? this.today.isSameOrBefore(end) : true)) {
      return 'in_progress';
    } else {
      return 'upcoming';
    }
  }

  getConnectorState(index: number): 'completed' | 'transition' | 'pending' {
    if (index >= this.steps.length - 1) {
      return 'pending';
    }
    const currentStep = this.steps[index];
    if (currentStep.state === 'completed') {
      return 'completed';
    } else if (currentStep.state === 'in_progress') {
      return 'transition';
    } else {
      return 'pending';
    }
  }

  formatDateRange(startDate: Date | string, endDate: Date | string | null): string {
    const start = moment.default(startDate).format('YYYY-MM-DD');
    if (endDate) {
      const end = moment.default(endDate).format('YYYY-MM-DD');
      return `${start} - ${end}`;
    }
    return start;
  }

  handleStepClick(step: TimelineStep): void {
    if (this.onStepClick) {
      this.onStepClick(step);
    }
    this.stepClick.emit(step);
  }

  getAriaLabel(step: TimelineStep): string {
    const dateRange = this.formatDateRange(step.startDate, step.endDate);
    return `${step.label} - ${step.title} - ${step.state} - ${dateRange}`;
  }
}
