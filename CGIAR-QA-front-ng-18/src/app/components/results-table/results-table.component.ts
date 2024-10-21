import { Component, Input, input } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-results-table',
  standalone: true,
  imports: [TableModule],
  templateUrl: './results-table.component.html',
  styleUrl: './results-table.component.scss'
})
export class ResultsTableComponent {
  @Input() resulList: any[] = [];
  columnNames = [
    {
      name: 'Result code',
      attr: 'result_code'
    },
    {
      name: 'Title',
      attr: 'title'
    },
    {
      name: 'Initiative',
      attr: 'full_title'
    },
    {
      name: 'Action Area',
      attr: 'crp_action_area'
    },
    {
      name: "Assessors' comments",
      attr: 'comments_count'
    },
    {
      name: 'Comments answered by initiatives',
      attr: 'comments_replies_count'
    },
    {
      name: 'Accepted comments',
      attr: 'comments_accepted_count'
    },
    {
      name: 'Disagreed comments',
      attr: ''
    },
    {
      name: 'Export comments',
      attr: ''
    },
    {
      name: 'Assessed By',
      attr: ''
    },
    {
      name: 'QA Status',
      attr: ''
    }
  ];
}
