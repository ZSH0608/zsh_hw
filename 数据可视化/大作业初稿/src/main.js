import { aiModels } from "./data/data.js";
import { renderChart1 } from "./components/chart1.js";
import { renderChart2 } from "./components/chart2.js";
import { renderChart3 } from "./components/chart3.js";
import { renderSwarmPlot } from "./components/swarmplot.js";

// Global State
let state = {
  chart1: {
    showTrendLine: true,
    showLabels: false  // 默认不显示标签
  }
};

const init = () => {
  // --- Render Chart 1 (Member A) ---
  const updateChart1 = () => {
    renderChart1("#chart1", aiModels, state.chart1);
  };
  
  // Attach Listeners for Chart 1
  document.getElementById("c1-trend").addEventListener("change", (e) => {
    state.chart1.showTrendLine = e.target.checked;
    updateChart1();
  });

  // --- Render Chart 2 (Member A/B) ---
  const updateChart2 = () => {
    renderChart2("#chart2", aiModels);
  };

  // --- Render Chart 3 (Pie Chart) ---
  const updateChart3 = () => {
    renderChart3("#chart3", aiModels);
  };

  // --- Render Swarm Plot ---
  const updateSwarmPlot = () => {
    renderSwarmPlot("#swarm-plot");
  };

  // --- Initial Render ---
  updateChart1();
  updateChart2();
  updateChart3();
  updateSwarmPlot();

  // --- Responsive Resize ---
  window.addEventListener("resize", () => {
    // Debounce resize could be added here for performance
    updateChart1();
    updateChart2();
    updateChart3();
    updateSwarmPlot();
  });
};

// Start App
document.addEventListener("DOMContentLoaded", init);