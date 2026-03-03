import * as d3 from 'd3';
import { formatParams, getColor } from "../data/data.js";

/**
 * @param {string} containerSelector 
 * @param {Array} data 
 */
function calculateEfficiency(mmluScore, parameters) {
  if (!mmluScore || !parameters || parameters <= 0) return 0;
  return mmluScore / Math.log10(parameters);
}

export function renderChart2(containerSelector, data) {
  const container = d3.select(containerSelector);
  container.html("");

  const width = container.node().clientWidth;
  const height = 400; // 调整高度以适应新布局
  const margin = { top: 50, right: 30, bottom: 85, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "overflow-visible");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // --- Data & Scales ---
  const chartData = data
    .filter(d => d.mmluScore !== undefined)
    .sort((a, b) => a.parameters - b.parameters);

  const xMax = d3.max(chartData, d => d.parameters) || 1e12;

  const xScale = d3.scaleLinear().domain([0, xMax * 1.1]).range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([35, 100])
    .range([innerHeight, 0]);

  // --- Grid Lines ---
  g.append("g").attr("class", "grid-lines")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).tickSize(-innerHeight).ticks(6).tickFormat(""))
    .call(g => g.select(".domain").remove());

  g.append("g").attr("class", "grid-lines")
    .call(d3.axisLeft(yScale).tickSize(-innerWidth).ticks(5).tickFormat(""))
    .call(g => g.select(".domain").remove());

  // --- Axes ---
  const formatTick = (val) => {
    if (val >= 1e12) return (val/1e12) + "T";
    if (val >= 1e9) return (val/1e9) + "B";
    return val;
  };

  const xAxis = d3.axisBottom(xScale).tickFormat(formatTick);

  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xAxis)
    .call(g => g.select(".domain").attr("stroke", "#cbd5e1"))
    .call(g => g.selectAll(".tick text").attr("dy", "1em"));

  g.append("g")
    .call(d3.axisLeft(yScale).tickFormat(d => d + "%"))
    .call(g => g.select(".domain").remove());

  // Labels
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 45)
    .attr("text-anchor", "middle")
    .attr("fill", "#475569")
    .attr("font-size", "13px")
    .text("参数量");

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -45)
    .attr("text-anchor", "middle")
    .attr("fill", "#475569")
    .attr("font-size", "13px")
    .attr("font-weight", "600")
    .text("MMLU 基准得分 (%)");

  // --- Data Points ---
  const tooltip = d3.select("body").selectAll(".d3-tooltip").data([null]).join("div").attr("class", "d3-tooltip");
  const EFFICIENCY_THRESHOLD = 7.5;
  const efficientModels = chartData.filter(d => calculateEfficiency(d.mmluScore, d.parameters) > EFFICIENCY_THRESHOLD);

  g.selectAll(".ring")
    .data(efficientModels)
    .enter().append("circle")
    .attr("cx", d => xScale(d.parameters))
    .attr("cy", d => yScale(d.mmluScore))
    .attr("r", 7)
    .attr("fill", "none")
    .attr("stroke", "#f59e0b")
    .attr("stroke-width", 2)
    .attr("stroke-opacity", 0.5);

  const circles = g.selectAll(".dot")
    .data(chartData)
    .enter().append("circle")
    .attr("cx", d => xScale(d.parameters))
    .attr("cy", d => yScale(d.mmluScore))
    .attr("r", 5)
    .attr("fill", d => getColor(d.organization))
    .attr("stroke", "white")
    .attr("stroke-width", 1.5)
    .style("cursor", "pointer")
    .style("opacity", 0.8);

  circles
    .on("mouseover", function(event, d) {
      d3.select(this).transition().duration(200).attr("r", 10).attr("stroke", "#1e293b").style("opacity", 1);
      const efficiency = calculateEfficiency(d.mmluScore, d.parameters);
      tooltip.style("opacity", 1)
        .html(`
          <div class="font-bold text-slate-800">${d.name}</div>
          <div class="text-xs text-slate-500 mb-1">${d.organization}</div>
          <div class="flex items-center justify-between gap-4">
            <span class="text-xs text-slate-500">MMLU:</span>
            <span class="text-sm font-bold text-slate-700">${d.mmluScore}%</span>
          </div>
          <div class="flex items-center justify-between gap-4">
            <span class="text-xs text-slate-500">参数:</span>
            <span class="text-sm font-mono text-slate-600">${formatParams(d.parameters)}</span>
          </div>
        `)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).transition().duration(200).attr("r", 6).attr("stroke", "white");
      tooltip.style("opacity", 0);
    });

}