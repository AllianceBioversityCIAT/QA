import { ChartColors } from './chart-colors';

describe('ChartColors', () => {
  it('should have CHART_COLORS object', () => {
    expect(ChartColors.CHART_COLORS).toBeDefined();
    expect(typeof ChartColors.CHART_COLORS).toBe('object');
  });

  it('should contain correct color values', () => {
    expect(ChartColors.CHART_COLORS['Quality Assessed']).toBe('#059669');
    expect(ChartColors.CHART_COLORS['Automatically validated']).toBe('#0284c7');
    expect(ChartColors.CHART_COLORS['Pending']).toBe('#fde68a');
    expect(ChartColors.CHART_COLORS['pending']).toBe('#fde68a');
    expect(ChartColors.CHART_COLORS['Accepted']).toBe('#34d399');
    expect(ChartColors.CHART_COLORS['Accepted with comment']).toBe('#059669');
    expect(ChartColors.CHART_COLORS['Disagree']).toBe('#f87171');
    expect(ChartColors.CHART_COLORS['Assessed 1st round']).toBe('#0891b2');
    expect(ChartColors.CHART_COLORS['Assessed 2nd round']).toBe('#34d399');
    expect(ChartColors.CHART_COLORS['AcceptedWC']).toBe('#059669');
    expect(ChartColors.CHART_COLORS['Clarification']).toBe('#60a5fa');
    expect(ChartColors.CHART_COLORS['notsure']).toBe('#60a5fa');
    expect(ChartColors.CHART_COLORS['agree']).toBe('#34d399');
    expect(ChartColors.CHART_COLORS['disagree']).toBe('#f87171');
  });

  describe('generateRandomColor', () => {
    it('should generate a valid hsl color string', () => {
      const color = ChartColors.generateRandomColor();
      expect(color).toMatch(/^hsl\(\d+, 65%, 55%\)$/);
    });

    it('should generate color with one of the predefined hues', () => {
      const validHues = [200, 160, 280, 30, 340];
      for (let i = 0; i < 20; i++) {
        const color = ChartColors.generateRandomColor();
        const match = color.match(/^hsl\((\d+), 65%, 55%\)$/);
        expect(match).not.toBeNull();
        if (match) {
          const hue = parseInt(match[1]);
          expect(validHues).toContain(hue);
        }
      }
    });

    it('should generate different colors on multiple calls', () => {
      const colors = new Set();
      for (let i = 0; i < 20; i++) {
        colors.add(ChartColors.generateRandomColor());
      }
      expect(colors.size).toBeGreaterThan(1);
    });
  });
});
