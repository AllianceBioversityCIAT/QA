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
  datetime = null;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.getBatches();
    this.getState();
  }

  getBatches() {
    this.dashboardService.getAllBatches().subscribe(res => {
      console.log({ res });
      this.batches = res.data;
      this.datetime = res.data;
    })
  }

  getState() {

    setInterval(() => {
      const currentDate = moment();
      if (currentDate.isBefore(this.datetime[2].assessors_start_date)) {
        this.timelineState = 'before';
      } else if (currentDate.isBetween(this.datetime[2].assessors_start_date, this.datetime[2].assessors_end_date)) {
        this.timelineState = 'during';
      } else {
        this.timelineState = 'after';
      }
    }, 1000);
  }




}
