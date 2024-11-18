import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'appFilterByDates',
  standalone: true,
})
export class FilterByDatesPipe implements PipeTransform {
  transform(list, submissionDates: any[]): any[] {
    if (!list) {
      return [];
    }

    if (!submissionDates.length) {
      return list;
    }

    return list.filter((item) => {
      return submissionDates.includes(item.submission_date);
    });
  }
}
