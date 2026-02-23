/** Colores alineados con variables CSS del proyecto (variables.scss) */
export const ChartColors = {
  CHART_COLORS: {
    "Quality Assessed": "#059669",
    "Automatically validated": "#0284c7",
    Pending: "#fde68a",
    pending: "#fde68a",
    Accepted: "#34d399",
    "Accepted with comment": "#059669",
    "Accepted with comments": "#059669",
    Disagree: "#f87171",
    disagree: "#f87171",
    Discarded: "#cbd5e1",
    "Assessed 1st round": "#0891b2",
    "Assessed 2nd round": "#34d399",
    AcceptedWC: "#059669",
    Clarification: "#60a5fa",
    notsure: "#60a5fa",
    agree: "#34d399",
    "Validated / Result status": "#0891b2",
    "Validated / Result Status": "#0891b2",
    Pending_Tpb: "#fde68a",
  },
  generateRandomColor: function () {
    const hues = [200, 160, 280, 30, 340];
    const h = hues[Math.floor(Math.random() * hues.length)];
    return `hsl(${h}, 65%, 55%)`;
  },
};
