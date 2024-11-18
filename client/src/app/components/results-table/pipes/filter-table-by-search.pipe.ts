import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'appFilterTableBySearch',
  standalone: true,
})
export class FilterTableBySearchPipe implements PipeTransform {
  transform(list, searchFilter: string): any[] {
    if (!list) {
      return [];
    }

    if (!searchFilter) {
      return list;
    }

    list.forEach((item) => {
      item.joinAll = this.createJoinAllString(item);
    });

    return list.filter((item) =>
      item.joinAll.toUpperCase().includes(searchFilter.toUpperCase()),
    );
  }

  private createJoinAllString(item): string {
    return this.createDefaultString(item);
  }

  private createDefaultString(item): string {
    return `${item?.result_code} ${item?.title} ${item?.full_title} ${item?.crp_action_area}`;
  }
}
