// Mock for @swimlane/ngx-charts
export class NgxChartsModule {
  static forRoot = jest.fn();
}

export class BarChartModule {}
export class LineChartModule {}
export class PieChartModule {}
export class AdvancedPieChartModule {}

// Mock ScaleType enum
export enum ScaleType {
  Time = 'time',
  Linear = 'linear',
  Ordinal = 'ordinal',
  Quantile = 'quantile'
}

// Mock Color interface
export interface Color {
  name?: string;
  value?: string;
  domain?: string[];
  group?: ScaleType;
  selectable?: boolean;
}
