import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'appResultsTablePipe',
  standalone: true
})
export class ResultsTablePipe implements PipeTransform {
  //  Create a pipe that filters the columns of the results table based on filters (submission_date, search_text, eval_status)
  transform(value: any[], submissionDates: any[], searchText: string, evalStatusFilter: string): any[] {
    if (!value) {
      return [];
    }
    return value.filter(item => {
      let result = true;

      if (submissionDates.length > 0) {
        result = submissionDates.includes(item.submission_date);
      }

      if (searchText) {
        result = result && item.title.toLowerCase().includes(searchText.toLowerCase());
      }

      if (evalStatusFilter) {
        result = result && item.evaluation_status === evalStatusFilter;
      }

      return result;
    });
  }
}
