import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { IndicatorsService } from 'src/app/services/indicators.service';
import { Chart } from 'chart.js';
import { ChartColors } from '@utils/chart-colors';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comments-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comments-chart.component.html',
  styleUrls: ['./comments-chart.component.scss']
})
export class CommentsChartComponent implements OnInit {
  @Input() data;
  @Input() total;
  @Input() chartName;
  @Input() selectedIndicator;
  @ViewChild('doughnutCanvas') doughnutCanvas: ElementRef;

  myData;

  legendLabels = {
    commentsLabels: [
      { name: 'Pending', class: 'pending', value: 0 },
      { name: 'Accepted', class: 'agree', value: 0 },
      { name: 'Accepted with comment', class: 'agree-wc', value: 0 },
      { name: 'Disagreed', class: 'disagree', value: 0 }
    ],
    commentsLabelsPublications: [
      { name: 'Pending', class: 'pending', value: 0 },
      { name: 'Accepted', class: 'agree', value: 0 },
      { name: 'Accepted with comment', class: 'agree-wc', value: 0 },
      { name: 'Disagreed', class: 'disagree', value: 0 }
    ]
  };

  public chartType: any;
  public chart: any;

  constructor(private router: Router, private indicatorService: IndicatorsService) {}

  ngOnInit() {
    if (this.chartName == 'qa_publications') {
      this.chartType = 'commentsLabelsPublications';
    } else {
      this.chartType = 'commentsLabels';
    }

    this.updateLegendValues();

    setTimeout(() => this.createChart(), 0);
  }

  updateLegendValues() {
    this.legendLabels[this.chartType].forEach(label => {
      const dataItem = this.data.dataset.find(d => d.name === label.name);
      if (dataItem) {
        label.value = dataItem.value;
      }
    });
  }

  createChart() {
    const colors = this.data.dataset.map(item => {
      if (ChartColors.CHART_COLORS[item.name]) {
        return ChartColors.CHART_COLORS[item.name];
      } else {
        const randomColor = ChartColors.generateRandomColor();
        ChartColors.CHART_COLORS[item.name] = randomColor;
        return randomColor;
      }
    });

    const ctx = this.doughnutCanvas.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.data.dataset.map(item => item.name),
        datasets: [
          {
            data: this.data.dataset.map(item => item.value),
            backgroundColor: colors
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          // legend: {
          //   display: this.showLegend,
          //   position: this.legendPosition,
          // },
          tooltip: {
            callbacks: {
              label: context => `${context.label}: ${context.raw}`
            }
          }
        }
      }
    });
  }

  onSelect(data): void {
    let status = true;
    if (data.name == 'pending') {
      status = false;
    }
    this.indicatorService.setOrderByStatus(status);
    this.router.navigate([`/indicator/${this.selectedIndicator.split('qa_')[1]}/id`]);
  }

  onActivate(data): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {}
}
