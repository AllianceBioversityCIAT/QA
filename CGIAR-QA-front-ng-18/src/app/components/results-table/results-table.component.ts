import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { StatusIcon } from '../../_models/general-status.model';
import { CommentService } from '../../services/comment.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import moment from 'moment';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-results-table',
  standalone: true,
  imports: [TableModule, FormsModule, CheckboxModule, MultiSelectModule, ButtonModule, InputTextModule],
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

  evalStatusFilter = null;
  searchText = '';

  selectedFilters = [
    {
      label: 'Action Area',
      key: 'showActionArea'
    }
  ];

  columnsFiltersOptions = [
    { label: 'Action Area', key: 'showActionArea' },
    { label: 'Accepted Comments', key: 'showAcceptedComments' },
    { label: 'Disagreed Comments', key: 'showDisagreedComments' },
    { label: 'Highlighted Comments', key: 'showHighlightedComments' },
    { label: 'Third party broker instructions', key: 'showTpbComments' },
    { label: 'Implemented Decisions', key: 'showImplementedDecisions' }
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
      showIf: () => this.getColumnsFilters('showActionArea')
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
      showIf: () => this.getColumnsFilters('showAcceptedComments')
    },
    {
      name: 'Accepted w. comment',
      attr: 'comments_accepted_with_comment_count',
      showIf: () => this.returnedArray?.[0]?.comments_accepted_with_comment_count && this.currentUser.cycle.cycle_stage == 2
    },
    {
      name: 'Disagreed comments',
      attr: 'comments_disagreed_count',
      showIf: () => this.returnedArray?.[0]?.comments_disagreed_count && this.getColumnsFilters('showDisagreedComments')
    },
    {
      name: 'Highlighted comments on core fields',
      attr: 'comments_highlight_count',
      showIf: () => this.getColumnsFilters('showHighlightedComments')
    },
    {
      name: 'T-pb instructions',
      attr: 'comments_tpb_count',
      showIf: () => this.getColumnsFilters('showTpbComments')
    },
    {
      name: 'Implemented Decisions',
      attr: 'comments_ppu_count',
      showIf: () => this.getColumnsFilters('showImplementedDecisions')
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
        const batches = res.data.map((batch, index) => ({
          date: moment(batch.submission_date).format('ll'),
          batch_name: +batch.batch_name,
          checked: batch.batch_name == 3,
          is_active: !!(moment(Date.now()).isSameOrAfter(moment(batch.submission_date)) || index === 0)
        }));
        this.submission_dates = batches;
        console.log(this.submission_dates);
      },
      error: error => {
        console.error('Error fetching batch dates:', error);
      }
    });
  }

  getColumnsFilters(key: string) {
    return this.selectedFilters.find(filter => filter.key === key);
  }

  showhighlightColumn() {
    if (this.currentUser?.cycle.cycle_stage == 2) {
      this.selectedFilters.push({
        label: 'Highlighted Comments',
        key: 'showHighlightedComments'
      });
      this.selectedFilters.push({
        label: 'Third party broker instructions',
        key: 'showTpbComments'
      });
    }
  }

  handleFilterChange(key: string) {
    if (this.evalStatusFilter === key) {
      this.evalStatusFilter = null;
      return;
    }

    this.evalStatusFilter = key;
  }
}
