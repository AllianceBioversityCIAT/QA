import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DashboardService } from 'src/app/services/dashboard.service';
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {
  batches = null;
  timelineState = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.getBatches();
    this.getState();
  }

  getBatches() {
    this.dashboardService.getAllBatches().subscribe(res => {
      console.log({ res });
      this.batches = res.data;
    });
  }

  getState() {
    this.dashboardService.getAllBatches().subscribe(res => {
      let datetime = res.data;
      const currentDate = moment.default();
      if (currentDate.isBefore(datetime[2].assessors_start_date)) {
        this.timelineState = 'before';
      } else if (currentDate.isBetween(datetime[2].assessors_start_date, datetime[2].assessors_end_date)) {
        this.timelineState = 'during';
      } else {
        this.timelineState = 'after';
      }
    });
  }
}
