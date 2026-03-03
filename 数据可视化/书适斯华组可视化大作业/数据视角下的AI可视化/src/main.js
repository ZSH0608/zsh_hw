import { aiModels } from "./data/data.js";
import { renderChart1 } from "./components/chart1.js";
import { renderChart2 } from "./components/chart2.js";
import { renderChart3 } from "./components/chart3.js";
import { renderSwarmPlot } from "./components/swarmplot.js";
import { initAllData, updatePairPlot } from "./components/pairplot.js"; 

// Global State
let state = {
  chart1: {
    showTrendLine: true,
    showLabels: false  // 默认不显示标签
  }
};

const init = async () => {
  // --- Initialize Data for Pair Plot ---
  // 提前加载所有数据以便 hover 时能即时响应
  initAllData().then(() => {
    // 数据准备就绪
    console.log("Pair plot data ready for hover interaction");
  });

  // --- Render Chart 1 (Member A) ---
  const updateChart1 = () => {
    renderChart1("#chart1", aiModels, state.chart1);
  };

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
    updateChart1();
    updateChart2();
    updateChart3();
    updateSwarmPlot();
  });
};

// Start App
document.addEventListener("DOMContentLoaded", init);