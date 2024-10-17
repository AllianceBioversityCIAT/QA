import { Router } from "@angular/router";
import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { IndicatorsService } from "src/app/services/indicators.service";
import { Chart } from "chart.js";
import { ChartColors } from "../../../utils/chart-colors";

@Component({
  selector: "app-donut-chart",
  templateUrl: "./donut-chart.component.html",
  styleUrls: ["./donut-chart.component.scss"],
})
export class DonutChartComponent implements OnInit {
  @Input() data: any;
  @Input() chartName;
  @Input() selectedIndicator;
  @ViewChild("doughnutCanvas") doughnutCanvas: ElementRef;

  chart: any;
  myData: any;
  wosColor = "#46bdc6";

  public legendLabels: any = {
    indicator_status: [
      { name: "Pending", class: "pending" },
      { name: "Quality Assessed", class: "finalized" },
    ],
    publications_status: [
      { name: "Automatically validated", class: "autochecked" },
      { name: "Pending", class: "pending" },
      { name: "Quality Assessed", class: "finalized" },
    ],
    comments: [
      { name: "Pending", class: "pending" },
      { name: "Accepted", class: "agree" },
      { name: "Accepted with comment", class: "agree-wc" },
      { name: "Disagree", class: "disagree" },
    ],
    highlight_comments: [
      { name: "Pending", class: "pending" },
      {
        name: "Solved with change request",
        class: "solved-with-change-request",
      },
      {
        name: "Solved without change request",
        class: "solved-without-change-request",
      },
    ],
  };

  constructor(
    private router: Router,
    private indicatorService: IndicatorsService
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
    const colors = this.data.dataset.map((item) => {
      if (ChartColors.CHART_COLORS[item.name]) {
        return ChartColors.CHART_COLORS[item.name];
      } else {
        const randomColor = ChartColors.generateRandomColor();
        ChartColors.CHART_COLORS[item.name] = randomColor;
        return randomColor;
      }
    });

    const ctx = this.doughnutCanvas.nativeElement.getContext("2d");
    this.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: this.data.dataset.map((item) => item.name),
        datasets: [
          {
            data: this.data.dataset.map((item) => item.value),
            backgroundColor: colors,
          },
        ],
      },
    });
  }

  onSelect(data: any): void {
    console.log("Item clicked", data);
    let status = null;
    switch (data.name) {
      case "pending":
        status = false;
        this.indicatorService.setOrderByStatus(status);
        break;
      case "Assessed 1st round":
        status = true;
        this.indicatorService.setOrderByStatus(status);
        break;
      case "Assessed 2nd round":
        status = false;
        this.indicatorService.setOrderByStatus(status);
        break;
      case "AcceptedWC":
        status = false;
        this.indicatorService.setOrderByAccpetedWC(status);
        break;
      case "Clarification":
        status = false;
        this.indicatorService.setOrderByClarification(status);
        break;
      case "Disagree":
        status = false;
        this.indicatorService.setOrderByDisagree(status);
        break;
      default:
        break;
    }
    if (status != null) {
      this.router.navigate([
        `/indicator/${this.selectedIndicator.split("qa_")[1]}/id`,
      ]);
    }
  }

  setLabelFormatting(c): string {
    let indicator = this.data.dataset.find((status) => status.name === c);
    return `${indicator.value}`;
  }
}
