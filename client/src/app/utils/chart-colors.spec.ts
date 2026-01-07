import { ChartColors } from './chart-colors';

describe('ChartColors', () => {
  it('should have CHART_COLORS object', () => {
    expect(ChartColors.CHART_COLORS).toBeDefined();
    expect(typeof ChartColors.CHART_COLORS).toBe('object');
  });

  it('should contain correct color values', () => {
    expect(ChartColors.CHART_COLORS['Quality Assessed']).toBe('rgb(5, 146, 18)');
    expect(ChartColors.CHART_COLORS['Automatically validated']).toBe('rgb(5, 12, 156)');
    expect(ChartColors.CHART_COLORS['Pending']).toBe('rgba(251, 200, 79)');
    expect(ChartColors.CHART_COLORS['pending']).toBe('rgba(251, 200, 79)');
    expect(ChartColors.CHART_COLORS['Accepted']).toBe('rgb(5, 146, 18)');
    expect(ChartColors.CHART_COLORS['Accepted with comment']).toBe('rgb(6, 208, 1)');
    expect(ChartColors.CHART_COLORS['Disagree']).toBe('rgb(255, 32, 78)');
    expect(ChartColors.CHART_COLORS['Assessed 1st round']).toBe('rgb(0, 103, 105)');
    expect(ChartColors.CHART_COLORS['Assessed 2nd round']).toBe('rgb(64, 165, 120)');
    expect(ChartColors.CHART_COLORS['AcceptedWC']).toBe('rgb(6, 208, 1)');
    expect(ChartColors.CHART_COLORS['Clarification']).toBe('rgb(53, 114, 239)');
    expect(ChartColors.CHART_COLORS['notsure']).toBe('rgba(255, 206, 86)');
    expect(ChartColors.CHART_COLORS['agree']).toBe('rgba(75, 192, 192)');
    expect(ChartColors.CHART_COLORS['disagree']).toBe('rgb(255, 32, 78)');
    expect(ChartColors.CHART_COLORS['Answered / No action needed']).toBe('rgb(37, 139, 81)');
  });

  describe('generateRandomColor', () => {
    it('should generate a valid rgba color string', () => {
      const color = ChartColors.generateRandomColor();
      expect(color).toMatch(/^rgba\(\d+, \d+, \d+, 0\.8\)$/);
    });

    it('should generate color with values between 0 and 255', () => {
      const color = ChartColors.generateRandomColor();
      const matches = color.match(/rgba\((\d+), (\d+), (\d+), 0\.8\)/);

      expect(matches).not.toBeNull();
      if (matches) {
        const r = parseInt(matches[1]);
        const g = parseInt(matches[2]);
        const b = parseInt(matches[3]);

        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThan(255);
        expect(g).toBeGreaterThanOrEqual(0);
        expect(g).toBeLessThan(255);
        expect(b).toBeGreaterThanOrEqual(0);
        expect(b).toBeLessThan(255);
      }
    });

    it('should generate different colors on multiple calls', () => {
      const colors = new Set();
      for (let i = 0; i < 10; i++) {
        colors.add(ChartColors.generateRandomColor());
      }
      // With high probability, at least some colors should be different
      expect(colors.size).toBeGreaterThan(1);
    });
  });
});
