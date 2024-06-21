import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { Chart } from "chart.js";
import { ChartColors } from "../../../utils/chart-colors";

@Component({
  selector: "app-bar-chart",
  templateUrl: "./bar-chart.component.html",
  styleUrls: ["./bar-chart.component.scss"],
})
export class BarChartComponent implements OnInit {
  @Input() data;
  @Output() filterTagEvent = new EventEmitter<string>();
  @ViewChild("barCanvas") barCanvas: ElementRef;

  chart: any;
  chartName = true;

  tagTypesId = {
    notsure: 2,
    agree: 3,
    disagree: 4,
  };

  public legendLabels: any = {
    tags: [
      { name: "Agree", class: "agree" },
      { name: "Disagree", class: "disagree" },
      { name: "Not sure", class: "not-sure" },
    ],
  };

  constructor() {}

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

    const ctx = this.barCanvas.nativeElement.getContext("2d");
    this.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: this.data.dataset.map((item) => item.name),
        datasets: [
          {
            label: "Count",
            data: this.data.dataset.map((item) => item.value),
            backgroundColor: colors,
            barPercentage: 1,
            categoryPercentage: 1
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
          },
        },
      },
    });
  }

  onSelect(data): void {
    const clickedElementIndex = data[0].index;
    const label = this.chart.data.labels[clickedElementIndex];
    this.filterTagEvent.emit(this.tagTypesId[label]);
  }

  onActivate(data): void {}

  onDeactivate(data): void {}
}
