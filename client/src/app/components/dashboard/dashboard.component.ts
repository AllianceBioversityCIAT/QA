import { Component, effect, inject, Input } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DashboardCacheService } from './dashboard-cache.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  dashboardCacheService = inject(DashboardCacheService);
  @Input() cycle_stage: string;
  @Input() dataCharts: any;
  @Input() isAdmin: boolean = false;

  dataGeneralStatus: any;
  optionGeneralStatus: any;
  dataAssessorInteractions: any;
  optionAssessorInteractions: any;
  dataResponseToComments: any;
  optionResponseToComments: any;
  dataAssessmentByField: any;
  optionAssessmentByField: any;
  dataHighlightComment: any;
  optionHighlightComment: any;

  onChange = effect(
    () => {
      if (this.dashboardCacheService.updateChartData()) {
        this.updateChartData();
        this.dashboardCacheService.updateChartData.set(false);
      }
    },
    { allowSignalWrites: true }
  );

  allAreZero(list) {
    return list.every(item => item.value === 0);
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
      const qualityAssessedIndex = this.dataCharts.generalStatus.dataset.findIndex(item => item.name === 'Quality Assessed');
      if (qualityAssessedIndex !== -1) {
        const qualityAssessed = this.dataCharts.generalStatus.dataset.splice(qualityAssessedIndex, 1)[0];
        this.dataCharts.generalStatus.dataset.unshift(qualityAssessed);
      }


      this.dataGeneralStatus = createChartData(
        this.dataCharts.generalStatus.dataset,
        this.dataCharts.generalStatus.dataset.some(item => item.name === "Automatically validated") 
          ? ['--blue-500', '--purple-500']
          : ['--blue-500', '--yellow-500']
      );
      this.optionGeneralStatus = createChartOptions();
    }

    if (this.dataCharts.assessorsInteractions) {
      this.dataAssessorInteractions = createChartData(this.dataCharts.assessorsInteractions.dataset, ['--blue-500', '--yellow-500', '--green-500']);
      this.optionAssessorInteractions = createChartOptions();
    }

    if (this.dataCharts.responseToComments) {
      const dataset = this.dataCharts.responseToComments.dataset;
      const moveAcceptedWithCommentsToFront = (data: any[]) => {
        const index = data.findIndex(item => item.name === 'Accepted with comments');
        if (index !== -1) {
          const [acceptedWithComments] = data.splice(index, 1);
          data.unshift(acceptedWithComments);
        }
        return data;
      };

      const sortedDataset = moveAcceptedWithCommentsToFront(dataset);

      this.dataResponseToComments = createChartData(
        sortedDataset,
        ['--blue-500', '--green-500', '--red-500', '--yellow-500'],
      );
      this.optionResponseToComments = createChartOptions();
    }

    if (this.dataCharts.assessmentByField) {
      this.dataAssessmentByField = createChartData(this.dataCharts.assessmentByField.dataset, ['--blue-500', '--yellow-500', '--green-500']);
      this.optionAssessmentByField = createChartOptions();
    }
    if (this.dataCharts.highlitedPendingComments) {
      this.dataHighlightComment = createChartData(this.dataCharts.highlitedPendingComments.dataset, ['--blue-500', '--yellow-500', '--green-500']);
      this.optionHighlightComment = createChartOptions();
    }
  }
}
