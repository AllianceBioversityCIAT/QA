import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { StatusIcon } from '../../_models/general-status.model';
import { CommentService } from '../../services/comment.service';
import { MultiSelectModule } from 'primeng/multiselect';
import moment from 'moment';

@Component({
  selector: 'app-results-table',
  standalone: true,
  imports: [TableModule, FormsModule, CheckboxModule, MultiSelectModule],
  templateUrl: './results-table.component.html',
  styleUrl: './results-table.component.scss'
})
export class ResultsTableComponent {
  @Input() resulList: any[] = [];
  @Input() returnedArray: any[] = [];
  @Input() indicatorType: string;
  @Input() currentUser: any;
  statusIcon = StatusIcon;
  submission_dates = [];

  columnsFilters = {
    showActionArea: true,
    showAcceptedComments: false,
    showDisagreedComments: false,
    showHighlightedComments: false,
    showTpbComments: false,
    showImplementedDecisions: false
  };

  columnsFiltersOptions = [
    { label: 'Action Area', value: true },
    { label: 'Accepted Comments', value: false },
    { label: 'Disagreed Comments', value: false },
    { label: 'Highlighted Comments', value: false },
    { label: 'T-pb Comments', value: false },
    { label: 'Implemented Decisions', value: false }
  ];

  columnNames = [
    {
      name: 'Result code',
      attr: 'result_code',
      showIf: () => true
    },
    {
      name: 'Brief contribution',
      attr: 'result_title',
      showIf: () => this.returnedArray?.[0]?.brief
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
      // showIf: () => this.columnsFilters.showActionArea
      showIf: () => this.columnsFiltersOptions[0].value
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
      showIf: () => this.returnedArray?.[0]?.fp
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
      showIf: () => this.columnsFiltersOptions[1].value
    },
    {
      name: 'Accepted w. comment',
      attr: 'comments_accepted_with_comment_count',
      showIf: () => this.returnedArray?.[0]?.comments_accepted_with_comment_count && this.currentUser.cycle.cycle_stage == 2
    },
    {
      name: 'Disagreed comments',
      attr: 'comments_disagreed_count',
      showIf: () => this.returnedArray?.[0]?.comments_disagreed_count && this.columnsFilters.showDisagreedComments
    },
    {
      name: 'Highlighted comments on core fields',
      attr: 'comments_highlight_count',
      showIf: () => this.columnsFiltersOptions[3].value
    },
    {
      name: 'T-pb instructions',
      attr: 'comments_tpb_count',
      showIf: () => this.columnsFiltersOptions[4].value
    },
    {
      name: 'Implemented Decisions',
      attr: 'comments_ppu_count',
      showIf: () => this.columnsFiltersOptions[5].value
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

  private readonly commentService = inject(CommentService);

  ngOnInit() {
    this.showhighlightColumn();
    this.getBatchDates();
  }

  getBatchDates() {
    this.commentService.getBatches().subscribe({
      next: res => {
        const batches = res.data;
        for (let index = 0; index < batches.length; index++) {
          let batch = {
            date: moment(batches[index].submission_date).format('ll'),
            batch_name: +batches[index].batch_name,
            checked: false,
            is_active: null
          };
          batch.is_active = !!(moment(Date.now()).isSameOrAfter(batch.date) || index === 0);
          // batch.checked = batch.is_active;
          batch.checked = batch.batch_name == 3;
          this.submission_dates.push(batch);
          console.log(this.submission_dates);
        }
      },
      error: error => {
        // this.alertService.error(error);
        console.log(error);
      }
    });
  }

  getColumns() {
    return Object.keys(this.columnsFilters).filter(key => this.columnsFilters[key]);
  }

  showhighlightColumn() {
    if (this.currentUser?.cycle.cycle_stage == 2) {
      this.columnsFilters.showHighlightedComments = true;
      this.columnsFilters.showTpbComments = true;
    }
  }
}
