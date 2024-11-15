import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardCacheService {
  updateChartData = signal<boolean>(false);
  constructor() {}
}
