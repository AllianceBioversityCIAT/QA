export const ChartColors = {
  CHART_COLORS: {
    "Quality Assessed": "rgb(5, 146, 18)",
    "Automatically validated": "rgb(5, 12, 156)",
    Pending: "rgba(251, 200, 79)",
    pending: "rgba(251, 200, 79)",
    Accepted: "rgb(5, 146, 18)",
    "Accepted with comment": "rgb(6, 208, 1)",
    Disagree: "rgb(255, 32, 78)",
    "Assessed 1st round": "rgb(0, 103, 105)",
    "Assessed 2nd round": "rgb(64, 165, 120)",
    AcceptedWC: "rgb(6, 208, 1)",
    Clarification: "rgb(53, 114, 239)",
    notsure: "rgba(255, 206, 86)",
    agree: "rgba(75, 192, 192)",
    disagree: "rgb(255, 32, 78)",
    "Answered / No action needed": "rgb(37, 139, 81)",
  },
  generateRandomColor: function () {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.8)`;
  },
};
