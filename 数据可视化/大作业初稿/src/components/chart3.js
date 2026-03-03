import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { getColor } from "../data/data.js";

/**
 * Chart 3: Pie Chart - High Efficiency Models by Organization
 * @param {string} containerSelector 
 * @param {Array} data 
 */
function calculateEfficiency(mmluScore, parameters) {
  if (!mmluScore || !parameters || parameters <= 0) return 0;
  return mmluScore / Math.log10(parameters);
}

export function renderChart3(containerSelector, data) {
  const container = d3.select(containerSelector);
  container.html("");

  const width = container.node().clientWidth;
  const height = 350;
  const margin = { top: 40, right: 20, bottom: 20, left: 20 };
  
  const radius = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom) / 2 - 10;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  // 标题
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .attr("fill", "#334155")
    .attr("font-size", "14px")
    .attr("font-weight", "600")
    .text("高效模型机构分布");

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2},${(height + margin.top) / 2})`);

  // --- 筛选高效模型 ---
  const EFFICIENCY_THRESHOLD = 7.5;
  const efficientModels = data.filter(d => 
    d.mmluScore !== undefined && calculateEfficiency(d.mmluScore, d.parameters) > EFFICIENCY_THRESHOLD
  );

  // --- 按机构分组统计 ---
  const orgCounts = d3.rollup(efficientModels, v => v.length, d => d.organization);
  
  // 转换为数组并排序
  let pieData = Array.from(orgCounts, ([org, count]) => ({ org, count }))
    .sort((a, b) => b.count - a.count);

  // --- 颜色映射 (与 chart1, chart2 保持一致) ---
  const colorMap = {
    "OpenAI": getColor("OpenAI"),
    "Google": getColor("Google"),
    "Meta": getColor("Meta"),
    "Anthropic": getColor("Anthropic"),
    "Mistral": getColor("Mistral"),
    "DeepMind": getColor("DeepMind"),
    "xAI": "#8b5cf6",
  };

  const getOrgColor = (org) => {
    for (const key in colorMap) {
      if (org.includes(key)) return colorMap[key];
    }
    return "#6366f1"; // 默认颜色
  };

  // --- 创建饼图 ---
  const pie = d3.pie()
    .value(d => d.count)
    .sort(null)
    .padAngle(0.02);

  const arc = d3.arc()
    .innerRadius(radius * 0.4) // 环形图
    .outerRadius(radius);

  const arcHover = d3.arc()
    .innerRadius(radius * 0.4)
    .outerRadius(radius + 8);

  const arcLabel = d3.arc()
    .innerRadius(radius * 0.7)
    .outerRadius(radius * 0.7);

  // --- Tooltip ---
  const tooltip = d3.select("body").selectAll(".d3-tooltip").data([null]).join("div").attr("class", "d3-tooltip");

  // --- 绘制扇形 ---
  const arcs = g.selectAll(".arc")
    .data(pie(pieData))
    .enter()
    .append("g")
    .attr("class", "arc");

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => getOrgColor(d.data.org))
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("d", arcHover);

      const total = d3.sum(pieData, p => p.count);
      const percent = ((d.data.count / total) * 100).toFixed(1);
      
      tooltip.style("opacity", 1)
        .html(`
          <div class="font-bold text-slate-800">${d.data.org}</div>
          <div class="text-xs text-slate-500 mb-1">高效模型数量</div>
          <div class="flex items-center justify-between gap-4">
            <span class="text-xs text-slate-500">数量:</span>
            <span class="text-sm font-bold text-slate-700">${d.data.count} 个</span>
          </div>
          <div class="flex items-center justify-between gap-4">
            <span class="text-xs text-slate-500">占比:</span>
            <span class="text-sm font-bold text-slate-700">${percent}%</span>
          </div>
        `)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("d", arc);
      tooltip.style("opacity", 0);
    });

  // --- 添加标签 ---
  const total = d3.sum(pieData, p => p.count);
  
  arcs.append("text")
    .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "11px")
    .attr("fill", "white")
    .attr("font-weight", "600")
    .style("pointer-events", "none")
    .text(d => {
      const percent = (d.data.count / total) * 100;
      return percent >= 5 ? `${percent.toFixed(1)}%` : '';
    });

  // --- 中心文字 ---
  g.append("text")
    .attr("text-anchor", "middle")
    .attr("y", -8)
    .attr("font-size", "24px")
    .attr("font-weight", "bold")
    .attr("fill", "#334155")
    .text(efficientModels.length);

  g.append("text")
    .attr("text-anchor", "middle")
    .attr("y", 12)
    .attr("font-size", "11px")
    .attr("fill", "#64748b")
    .text("高效模型");

  // --- 图例 ---
  const legendG = svg.append("g")
    .attr("transform", `translate(${width - 65}, ${margin.top-40 })`);

  pieData.slice(0, 6).forEach((d, i) => {
    const lg = legendG.append("g")
      .attr("transform", `translate(0, ${i * 18})`);
    
    lg.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 2)
      .attr("fill", getOrgColor(d.org));
    
    lg.append("text")
      .attr("x", 16)
      .attr("y", 10)
      .attr("font-size", "10px")
      .attr("fill", "#64748b")
      .text(d.org.length > 10 ? d.org.substring(0, 10) + '...' : d.org);
  });
}
