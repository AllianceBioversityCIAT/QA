import { Component, EventEmitter, Output, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { StatusIcon, StatusIconCRP } from '../../_models/general-status.model';
import { CommentService } from '../../services/comment.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink } from '@angular/router';
import { FilterTableBySearchPipe } from './pipes/filter-table-by-search.pipe';
import { FilterByDatesPipe } from './pipes/filter-by-dates.pipe';
import { FilterByEvalstatusPipe } from './pipes/filter-by-evalstatus.pipe';

@Component({
  selector: 'app-results-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    CheckboxModule,
    MultiSelectModule,
    ButtonModule,
    InputTextModule,
    RouterLink,
    FilterTableBySearchPipe,
    FilterByDatesPipe,
    FilterByEvalstatusPipe
  ],
  templateUrl: './results-table.component.html',
  styleUrl: './results-table.component.scss'
})
export class ResultsTableComponent {
  @Input() resulList: any[] = [];
  @Input() returnedArray: any[] = [];
  @Input() submissionDates: any[] = [];
  @Input() indicatorType: string;
  @Input() currentUser: any;
  @Input() isCRP: boolean;
  @Input() selectedDates = [];
  @Output() generateExcel = new EventEmitter<any>();

  statusIcon = StatusIcon;
  StatusIconCRP = StatusIconCRP;

  evalStatusFilter = null;
  searchText = '';

  selectedFilters = [];

  // Filter section visibility states
  showSearch = false;
  showColumns = false;
  showState = false;
  showDates = false;

  columnsFiltersOptions = [
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
      showIf: () => !this.isCRP
    },
    {
      name: 'Action Area',
      attr: 'crp_action_area',
      showIf: () => this.getColumnsFilters('showActionArea') && !this.isCRP
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
      name: 'Comments answered by SP/A',
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
      showIf: () => this.returnedArray?.[0]?.comments_accepted_with_comment_count && this.currentUser?.cycle?.cycle_stage == 2
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
      name: 'Third party broker instructions',
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
      showIf: () => this.currentUser?.cycle?.cycle_stage != 2 && !this.isCRP
    },
    {
      name: 'Assessed By (2nd round)',
      attr: 'assessed_r2',
      showIf: () => this.currentUser?.cycle?.cycle_stage == 2
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

    if (!this.isCRP) {
      this.columnsFiltersOptions.unshift({
        label: 'Action Area',
        key: 'showActionArea'
      });
      this.selectedFilters.push({
        label: 'Action Area',
        key: 'showActionArea'
      });
    }
  }

  onGenerateExcel(result: any) {
    this.generateExcel.emit(result);
  }

  getTotalTableColumns() {
    return this.columnNames.filter(column => column.showIf()).length;
  }

  getColumnsFilters(key: string) {
    return this.selectedFilters.find(filter => filter.key === key);
  }

  showhighlightColumn() {
    if (this.currentUser?.cycle?.cycle_stage == 2) {
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

  handleFilterChange(key: string | null) {
    if (this.evalStatusFilter === key) {
      this.evalStatusFilter = null;
      this.showState = false;
      return;
    }

    this.evalStatusFilter = key;
    if (key) {
      // Auto-close state panel after selection
      setTimeout(() => {
        this.showState = false;
      }, 300);
    }
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (this.showSearch) {
      this.showColumns = false;
      this.showState = false;
      this.showDates = false;
    }
  }

  toggleColumns() {
    this.showColumns = !this.showColumns;
    if (this.showColumns) {
      this.showSearch = false;
      this.showState = false;
      this.showDates = false;
    }
  }

  toggleState() {
    this.showState = !this.showState;
    if (this.showState) {
      this.showSearch = false;
      this.showColumns = false;
      this.showDates = false;
    }
  }

  toggleDates() {
    this.showDates = !this.showDates;
    if (this.showDates) {
      this.showSearch = false;
      this.showColumns = false;
      this.showState = false;
    }
  }

  hasActiveFilters(): boolean {
    return !!(this.evalStatusFilter || 
             (this.selectedDates && this.selectedDates.length > 0) || 
             (this.selectedFilters && this.selectedFilters.length > 0));
  }

  removeDate(date: string) {
    const index = this.selectedDates.indexOf(date);
    if (index > -1) {
      this.selectedDates.splice(index, 1);
    }
  }

  removeColumnFilter(filter: any) {
    const index = this.selectedFilters.findIndex(f => f.key === filter.key);
    if (index > -1) {
      this.selectedFilters.splice(index, 1);
    }
  }

  isColumnSelected(key: string): boolean {
    return !!this.selectedFilters.find(filter => filter.key === key);
  }

  toggleColumnFilter(option: any) {
    const index = this.selectedFilters.findIndex(f => f.key === option.key);
    if (index > -1) {
      // Remove if already selected
      this.selectedFilters.splice(index, 1);
    } else {
      // Add if not selected
      this.selectedFilters.push(option);
    }
  }
}
