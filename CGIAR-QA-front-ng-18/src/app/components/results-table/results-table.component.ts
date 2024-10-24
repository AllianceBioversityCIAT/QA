import { Component, Input, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-results-table',
  standalone: true,
  imports: [TableModule, FormsModule],
  templateUrl: './results-table.component.html',
  styleUrl: './results-table.component.scss'
})
export class ResultsTableComponent {
  @Input() resulList: any[] = [];
  @Input() returnedArray: any[] = [];
  @Input() showActionArea: boolean = true;
  @Input() indicatorType: string;
  @Input() showAcceptedComments: boolean = false;
  @Input() showDisagreedComments: boolean = false;
  @Input() showHighlightedComments: boolean = false;
  @Input() showTpbComments: boolean = false;
  @Input() showImplementedDecisions: boolean = false;
  @Input() currentUser: any;
  @Input() statusIcon: any;

  columnNames = [
    {
      name: 'Result code',
      attr: 'result_code',
      showIf: () => true
    },
    {
      name: 'Brief contribution',
      attr: 'result_title',
      showIf: () => this.returnedArray && this.returnedArray[0].brief
    },
    {
      name: 'Title',
      attr: 'title',
      showIf: () => true
    },
    {
      name: 'Initiative',
      attr: 'full_title',
      showIf: () => true
    },
    {
      name: 'Action Area',
      attr: 'crp_action_area',
      showIf: () => this.showActionArea
    },
    {
      name: 'is Melia',
      attr: 'is_melia',
      showIf: () => this.indicatorType === 'knowledge_product'
    },
    {
      name: 'KP type',
      attr: 'knowledge_product_type',
      showIf: () => this.indicatorType === 'knowledge_product'
    },
    {
      name: 'Flagship',
      attr: 'fp',
      showIf: () => this.returnedArray && this.returnedArray[0].fp
    },
    {
      name: "Assessors' comments",
      attr: 'comments_count',
      showIf: () => true
    },
    {
      name: 'Comments answered by initiatives',
      attr: 'comments_replies_count',
      showIf: () => true
    },
    {
      name: 'Accepted comments',
      attr: 'comments_accepted_count',
      showIf: () => this.showAcceptedComments
    },
    {
      name: 'Accepted w. comment',
      attr: 'comments_accepted_with_comment_count',
      showIf: () => this.returnedArray && this.returnedArray[0].comments_accepted_with_comment_count && this.currentUser.cycle.cycle_stage == 2
    },
    {
      name: 'Disagreed comments',
      attr: 'comments_disagreed_count',
      showIf: () => this.returnedArray && this.returnedArray[0].comments_disagreed_count && this.showDisagreedComments
    },
    {
      name: 'Highlighted comments on core fields',
      attr: 'comments_highlight_count',
      showIf: () => this.showHighlightedComments
    },
    {
      name: 'T-pb instructions',
      attr: 'comments_tpb_count',
      showIf: () => this.showTpbComments
    },
    {
      name: 'Implemented Decisions',
      attr: 'comments_ppu_count',
      showIf: () => this.showImplementedDecisions
    },
    {
      name: 'Export comments',
      attr: 'export_comments',
      showIf: () => true
    },
    {
      name: 'Assessed By',
      attr: 'comment_by',
      showIf: () => this.currentUser.cycle.cycle_stage != 2
    },
    {
      name: 'Assessed By (2nd round)',
      attr: 'assessed_r2',
      showIf: () => this.currentUser.cycle.cycle_stage == 2
    },
    {
      name: 'QA Status',
      attr: 'status',
      showIf: () => true
    }
  ];
}
