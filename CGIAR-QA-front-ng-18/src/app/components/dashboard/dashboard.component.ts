import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnChanges {
  @Input() dataCharts: any;

  dataGeneralStatus: any;
  optionGeneralStatus: any;
  dataAssessorInteractions: any;
  optionAssessorInteractions: any;
  dataResponseToComments: any;
  optionResponseToComments: any;
  dataAssessmentByField: any;
  optionAssessmentByField: any;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataCharts'] && this.dataCharts) {
      this.updateChartData();
    }
  }

  updateChartData() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    const createChartData = (dataset: any[], colors: string[]) => ({
      labels: dataset.map((item: any) => item.name),
      datasets: [
        {
          label: 'Count',
          data: dataset.map((item: any) => item.value),
          backgroundColor: colors.map(color => documentStyle.getPropertyValue(color)),
          hoverBackgroundColor: colors.map(color => documentStyle.getPropertyValue(color).replace('500', '400'))
        }
      ]
    });

    const createChartOptions = () => ({
      cutout: '60%',
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      }
    });

    if (this.dataCharts.generalStatus) {
      this.dataGeneralStatus = createChartData(this.dataCharts.generalStatus.dataset, ['--blue-500', '--yellow-500', '--green-500']);
      this.optionGeneralStatus = createChartOptions();
    }

    if (this.dataCharts.assessorsInteractions) {
      this.dataAssessorInteractions = createChartData(this.dataCharts.assessorsInteractions.dataset, ['--blue-500', '--yellow-500', '--green-500']);
      this.optionAssessorInteractions = createChartOptions();
    }

    if (this.dataCharts.responseToComments) {
      this.dataResponseToComments = createChartData(this.dataCharts.responseToComments.dataset, ['--blue-500', '--yellow-500', '--green-500']);
      this.optionResponseToComments = createChartOptions();
    }

    if (this.dataCharts.assessmentByField) {
      this.dataAssessmentByField = createChartData(this.dataCharts.assessmentByField.dataset, ['--blue-500', '--yellow-500', '--green-500']);
      this.optionAssessmentByField = createChartOptions();
    }
  }
}
