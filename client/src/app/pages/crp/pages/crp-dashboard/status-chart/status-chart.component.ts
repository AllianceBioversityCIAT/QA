import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Chart } from 'chart.js';
import { ChartColors } from 'src/app/utils/chart-colors'; // Asegúrate de importar ChartColors
import { ReplacePipe } from '../../../../../pipes/replace.pipe';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartModule } from 'primeng/chart';


@Component({
  selector: 'app-status-chart',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ReplacePipe, NgxChartsModule, ChartModule],
  templateUrl: './status-chart.component.html',
  styleUrls: ['./status-chart.component.scss']
})
export class StatusChartComponent implements OnInit {
  @Input() indicator;
  @Input() indicators;
  @Input() total;
  @ViewChild('barCanvas') barCanvas: ElementRef;
  chart: any;
  legendLabels = [
    { name: 'Answered / No action needed', class: 'answered', value: 0 },
    { name: 'Pending', class: 'pending', value: 0 }
  ];
  results: any[];

  colorScheme = {
    domain: ['var(--color-answered)', 'var(--color-pending)']
  };

  constructor() {}

  ngOnInit() {
    this.formatIndicator();
  }

  ngAfterViewInit() {
    this.createChart();
  }

  onSelect(event) {
    console.log(event);
  }

  formatIndicator() {
    this.results = [{ name: this.indicator[0].name, series: [] }];
    this.indicator[0].series.forEach(element => {
      let status = element.status == 'complete' ? 'Answered / No action needed' : 'Pending';
      this.legendLabels.find(el => el.name == status).value = element.value;
      this.results[0].series.push({
        name: status,
        value: +element.value
      });
    });
    this.results[0].series.reverse();
    const isAllPending = this.results[0].series.find(el => el.name == 'Answered / No action needed' && el.value == 0);

    if (this.results[0].series.find(el => el.name == 'Pending' && el.value == this.total)) {
      this.colorScheme.domain.shift();
    }
  }

  createChart() {
    const ctx = this.barCanvas.nativeElement.getContext('2d');
    const labels = this.results[0].series.map(item => item.name);
    const dataValues = this.results[0].series.map(item => item.value);
    const backgroundColors = this.results[0].series.map(item => {
      if (item.name === 'Answered / No action needed') {
        return ChartColors.CHART_COLORS['Answered / No action needed'];
      } else {
        return ChartColors.CHART_COLORS['Pending'];
      }
    });


    this.chart = new Chart(ctx, {
      type: 'doughnut'  ,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Status',
            data: dataValues,
            backgroundColor: backgroundColors
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        }
      }
    });
  }

  indicatorIsEnable() {
    return this.indicators.find(indicator => indicator.view_name == this.indicator[0].name)?.comment_meta.enable_crp;
  }
}
