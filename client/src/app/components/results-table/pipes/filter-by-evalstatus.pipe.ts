import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'appFilterByEvalstatus',
  standalone: true,
})
export class FilterByEvalstatusPipe implements PipeTransform {
  transform(list, evalStatusFilter: string): any[] {
    if (!list) {
      return [];
    }

    if (!evalStatusFilter) {
      return list;
    }

    return list.filter((item) => {
      return item.evaluation_status === evalStatusFilter;
    });
  }
}
