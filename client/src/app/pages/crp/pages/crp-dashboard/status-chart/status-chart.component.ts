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
    { name: 'Validated / Result Status', class: 'answered', value: 0 },
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
      let status = element.status == 'complete' ? 'Validated / Result Status' : 'Pending';
      this.legendLabels.find(el => el.name == status).value = element.value;
      this.results[0].series.push({
        name: status,
        value: +element.value
      });
    });
    this.results[0].series.reverse();
    const isAllPending = this.results[0].series.find(el => el.name == 'Validated / Result Status' && el.value == 0);

    if (this.results[0].series.find(el => el.name == 'Pending' && el.value == this.total)) {
      this.colorScheme.domain.shift();
    }
  }

  /** Plugin para mostrar el total en el centro del doughnut */
  private get centerTotalPlugin() {
    const total = this.total ?? 0;
    return {
      id: 'centerTotal',
      afterDraw(chart: Chart) {
        if (chart.config.type !== 'doughnut' || !chart.ctx) return;
        const ctx = chart.ctx;
        const a = chart.chartArea;
        if (!a) return;
        const cx = (a.left + a.right) / 2;
        const cy = (a.top + a.bottom) / 2;
        const size = Math.min(a.right - a.left, a.bottom - a.top);
        const fontSize = Math.max(14, size / 6);
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `600 ${fontSize}px Poppins, sans-serif`;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillText(String(total), cx, cy - fontSize * 0.25);
        ctx.font = `500 ${fontSize * 0.45}px Poppins, sans-serif`;
        ctx.fillStyle = '#64748b';
        ctx.fillText('total', cx, cy + fontSize * 0.35);
        ctx.restore();
      },
    };
  }

  createChart() {
    const ctx = this.barCanvas.nativeElement.getContext('2d');
    const labels = this.results[0].series.map(item => item.name);
    const dataValues = this.results[0].series.map(item => item.value);
    const backgroundColors = this.results[0].series.map(item => {
      if (item.name === 'Validated / Result Status') {
        return ChartColors.CHART_COLORS['Validated / Result Status'];
      }
      return ChartColors.CHART_COLORS['Pending'];
    });

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            label: 'Status',
            data: dataValues,
            backgroundColor: backgroundColors,
            borderColor: '#fff',
            borderWidth: 2,
            hoverOffset: 10,
            borderRadius: 8,
          },
        ],
      },
      plugins: [this.centerTotalPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '55%',
        layout: {
          padding: 8,
        },
        animation: {
          duration: 600,
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 12,
              font: { family: 'Poppins, sans-serif', size: 11 },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(26, 26, 26, 0.9)',
            padding: 10,
            titleFont: { size: 12 },
            bodyFont: { size: 12 },
            callbacks: {
              label: (ctx) => {
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const pct = total ? Math.round((Number(ctx.raw) / total) * 100) : 0;
                return ` ${ctx.label}: ${Number(ctx.raw)} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  indicatorIsEnable() {
    return this.indicators.find(indicator => indicator.view_name == this.indicator[0].name)?.comment_meta.enable_crp;
  }
}
