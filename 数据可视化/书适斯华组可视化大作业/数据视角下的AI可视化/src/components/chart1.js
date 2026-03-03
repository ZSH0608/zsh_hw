import * as d3 from 'd3';
import { formatParams, getColor } from "../data/data.js";
import { updatePairPlot } from "./pairplot.js"; 

/**
 * Chart 1: Evolution of Intelligence (Scatter + Trend)
 * @param {string} containerSelector - ID of container
 * @param {Array} data - Data array
 * @param {Object} options - { showTrendLine, showLabels }
 */
export function renderChart1(containerSelector, data, options = {}) {
  const container = d3.select(containerSelector);
  container.html(""); // Clean up before render
  
  // 用于控制隐藏的定时器，防止在相邻分区切换时闪烁
  let hideTimer = null;
  // 新增：记录当前锁定的分区ID
  let lockedPartitionId = null;

  const { showTrendLine = true, showLabels = true } = options;
  const width = container.node().clientWidth;
  const height = 550;
  const margin = { top: 80, right: 120, bottom: 80, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // --- 1. 背景层 (最底层) ---
  const bgGroup = g.append("g").attr("class", "bg-group");

  // --- Data & Scales ---
  const chartData = data
    .filter(d => d.mmluScore !== undefined)
    .sort((a, b) => a.date - b.date);

  const minDate = new Date(2020, 0, 1);
  const maxDate = new Date(2026, 0, 1);

  const xScale = d3.scaleTime()
    .domain([minDate, maxDate])
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([35, 100])
    .range([innerHeight, 0]);

  // --- 时间分区定义 ---
  const timePartitions = [
    { id: 1, start: new Date(2023, 10, 1), end: new Date(2024, 1, 1), label: "2023.11-2024.2", color: "#e0f2fe" },
    { id: 2, start: new Date(2024, 1, 1), end: new Date(2024, 4, 1), label: "2024.2-2024.5", color: "#dbeafe" },
    { id: 3, start: new Date(2024, 4, 1), end: new Date(2024, 7, 1), label: "2024.5-2024.8", color: "#e0e7ff" },
    { id: 4, start: new Date(2024, 7, 1), end: new Date(2024, 10, 1), label: "2024.8-2024.11", color: "#ede9fe" },
    { id: 5, start: new Date(2024, 10, 1), end: new Date(2025, 1, 1), label: "2024.11-2025.2", color: "#fce7f3" },
    { id: 6, start: new Date(2025, 1, 1), end: new Date(2025, 4, 1), label: "2025.2-2025.5", color: "#fef3c7" },
    { id: 7, start: new Date(2025, 4, 1), end: new Date(2026, 0, 1), label: "2025.5-至今", color: "#dcfce7" },
  ];

  // 绘制静态背景块 (视觉效果)
  timePartitions.forEach(partition => {
    const xStart = Math.max(xScale(partition.start), 0);
    const xEnd = Math.min(xScale(partition.end), innerWidth);
    
    if (xEnd > xStart) {
      bgGroup.append("rect")
        .attr("class", `partition-bg partition-${partition.id}`)
        .attr("x", xStart)
        .attr("y", 0)
        .attr("width", xEnd - xStart)
        .attr("height", innerHeight)
        .attr("fill", partition.color)
        .attr("opacity", 0.4)
        .style("pointer-events", "none"); // 背景层不参与交互
    }
  });

  // --- 2. 网格线与坐标轴 ---
  g.append("g")
    .attr("class", "grid-lines")
    .call(d3.axisLeft(yScale).tickSize(-innerWidth).ticks(5).tickFormat(""))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").attr("stroke", "#cbd5e1").attr("stroke-opacity", 0.9));

  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat("%Y")))
    .call(g => g.select(".domain").attr("stroke", "#cbd5e1"))
    .call(g => g.selectAll(".tick text").attr("dy", "1em"));

  g.append("g")
    .call(d3.axisLeft(yScale).tickFormat(d => d + "%"))
    .call(g => g.select(".domain").remove());

  // Axis Labels
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 45)
    .attr("text-anchor", "middle")
    .attr("fill", "#475569")
    .attr("font-size", "13px")
    .text("发布年份");

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -45)
    .attr("text-anchor", "middle")
    .attr("fill", "#475569")
    .attr("font-size", "13px")
    .attr("font-weight", "600")
    .text("MMLU 基准得分 (%)");

  // --- 3. 交互热区层 (Interaction Layer) ---
  const hotspotGroup = g.append("g").attr("class", "hotspot-group");

  const partitionHotspots = hotspotGroup.selectAll(".partition-hotspot")
    .data(timePartitions)
    .enter()
    .append("rect")
    .attr("class", d => `partition-hotspot partition-hotspot-${d.id}`)
    .attr("x", d => Math.max(xScale(d.start), 0))
    .attr("y", 0)
    .attr("width", d => {
      const xStart = Math.max(xScale(d.start), 0);
      const xEnd = Math.min(xScale(d.end), innerWidth);
      return Math.max(xEnd - xStart, 0);
    })
    .attr("height", innerHeight)
    // 关键: opacity 0 且 fill 为实色，确保能捕获事件
    .attr("fill", d => d.color)
    .attr("opacity", 0) 
    .style("cursor", "crosshair")
    .on("click", function(event, d) {
      if (lockedPartitionId === d.id) {
        // 再次点击相同区块：解锁
        lockedPartitionId = null;
        // 如果鼠标还在该区域，虽然解锁，但保持 active (因为 mouseenter 逻辑)
        // 这里我们不做额外操作，让 mouseleave 来处理隐藏。
      } else {
        // 点击不同区块：锁定新区块
        lockedPartitionId = d.id;
        // 确保显示
        d3.select("#section-pairplot").classed("active", true);
        updatePairPlot(d.id);
      }
    })
    .on("mouseenter", function(event, d) {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }

      // 热区自身高亮 (始终响应，提供视觉反馈)
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 0.3);
      
      // 联动背景层加深
      bgGroup.select(`.partition-${d.id}`)
        .transition()
        .duration(200)
        .attr("opacity", 0.8);

      // 如果未锁定，则正常更新图表
      // 如果已锁定，则不更新图表内容，保持锁定的视图
      if (!lockedPartitionId) {
        d3.select("#section-pairplot").classed("active", true);
        updatePairPlot(d.id);
      }
    })
    .on("mouseleave", function(event, d) {
      // 恢复热区透明
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 0);
      
      // 恢复背景层
      bgGroup.select(`.partition-${d.id}`)
        .transition()
        .duration(200)
        .attr("opacity", 0.4);
      
      // 只有在未锁定时，才隐藏图表
      if (!lockedPartitionId) {
        hideTimer = setTimeout(() => {
          d3.select("#section-pairplot").classed("active", false);
        }, 50); 
      }
    });

  // --- 4. 曲线与专家线 ---
  const expertLevel = 89.8;
  g.append("line")
    .attr("x1", 0)
    .attr("x2", innerWidth)
    .attr("y1", yScale(expertLevel))
    .attr("y2", yScale(expertLevel))
    .attr("stroke", "#ef4444")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "4,2")
    .attr("opacity", 0.7)
    .style("pointer-events", "none");

  g.append("text")
    .attr("x", innerWidth + 10)
    .attr("y", yScale(expertLevel) + 4)
    .attr("fill", "#ef4444")
    .attr("font-size", "11px")
    .attr("font-weight", "bold")
    .text("人类专家 (89.8%)");

  const seriesLineGenerator = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.mmluScore))
    .curve(d3.curveMonotoneX);

  const seriesGroup = g.append("g").attr("class", "series-lines").style("pointer-events", "none");

  const seriesConfig = [
    { name: "GPT", color: getColor("OpenAI"), keywords: ["GPT-3", "GPT-4", "GPT-4o", "GPT-4.5", "GPT-5"], displayName: "GPT 系列" },
    { name: "Claude", color: getColor("Anthropic"), keywords: ["Claude"], include: ["Sonnet"], displayName: "Claude 系列" },
    { name: "Llama", color: getColor("Meta"), keywords: ["Llama"], include: ["70B", "90B"], displayName: "Llama 系列" },
    { name: "Gemini", color: "#2563eb", keywords: ["Gemini"], include: ["Pro"], displayName: "Gemini 系列" },
  ];

  seriesConfig.forEach(series => {
    const seriesData = chartData.filter(d => {
      const matchesKeyword = series.keywords.some(kw => d.name.includes(kw));
      const isExcluded = series.exclude ? series.exclude.includes(d.name) : false;
      const matchesInclude = series.include ? series.include.some(inc => d.name.includes(inc)) : true;
      return matchesKeyword && !isExcluded && matchesInclude;
    }).sort((a, b) => a.date - b.date);

    if (seriesData.length >= 2) {
      seriesGroup.append("path")
        .datum(seriesData)
        .attr("fill", "none")
        .attr("stroke", series.color)
        .attr("stroke-width", 2.0)
        .attr("d", seriesLineGenerator)
        .attr("opacity", 0.7)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");
    }
  });

  // --- 5. 圆点 (最顶层交互) ---
  const tooltip = d3.select("body").selectAll(".d3-tooltip").data([null]).join("div").attr("class", "d3-tooltip");
  const FIXED_RADIUS = 6;

  const circles = g.selectAll(".dot")
    .data(chartData)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.date))
    .attr("cy", d => yScale(d.mmluScore))
    .attr("r", FIXED_RADIUS)
    .attr("fill", d => getColor(d.organization))
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .style("filter", "drop-shadow(0px 2px 2px rgba(0,0,0,0.1))")
    .attr("opacity", 0.9);
  
  circles.raise(); 

  circles
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition().duration(200)
        .attr("r", FIXED_RADIUS + 4)
        .attr("stroke", "#1e293b")
        .style("opacity", 1);

      const isPredicted = d.date.getFullYear() >= 2025;
      
      tooltip.style("opacity", 1)
        .html(`
          <div class="font-bold text-slate-800 flex items-center gap-2">
            ${d.name}
            ${isPredicted ? '<span class="text-[10px] bg-slate-100 text-slate-500 px-1 rounded">预测</span>' : ''}
          </div>
          <div class="text-xs text-slate-500 mb-2">${d.organization} • ${d.date.getFullYear()}</div>
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
      d3.select(this)
        .transition().duration(200)
        .attr("r", FIXED_RADIUS)
        .attr("stroke", "white");
      tooltip.style("opacity", 0);
    });

  // --- Labels ---
  if (showLabels) {
    const hiddenLabels = ["Llama 2 70B", "Claude 3 Sonnet", "Mixtral 8x7B", "GLM-130B", "Minerva", "PaLM 2-L", "Llama 3 70B", "Grok-2", "Claude 3.5 Opus"];
    
    g.selectAll(".label")
      .data(chartData)
      .enter()
      .append("text")
      .attr("x", d => xScale(d.date) + FIXED_RADIUS + 6)
      .attr("y", d => yScale(d.mmluScore) + 4)
      .text(d => d.name)
      .attr("font-size", "11px")
      .attr("fill", "#334155")
      .attr("font-weight", "600")
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 2px rgba(255,255,255,0.8)")
      .attr("opacity", d => hiddenLabels.includes(d.name) ? 0 : 1);
  }

  // --- 标题与标签 ---
  timePartitions.forEach(partition => {
    const xStart = Math.max(xScale(partition.start), 0);
    const xEnd = Math.min(xScale(partition.end), innerWidth);
    const midX = (xStart + xEnd) / 2;
    
    if (xEnd > xStart && (xEnd - xStart) > 40) { 
      bgGroup.append("text")
        .attr("class", "partition-label")
        .attr("x", midX)
        .attr("y", innerHeight - 8)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("fill", "#64748b")
        .attr("opacity", 0.7)
        .style("pointer-events", "none")
        .text(partition.label);
    }
  });

  bgGroup.append("text")
    .attr("x", (xScale(new Date(2023, 10, 1)) + xScale(new Date(2026, 0, 1))) / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("class", "focus-text")
    .attr("fill", "#475569")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .text("大模型爆发期 (悬停查看各阶段职业影响)");

  // --- Legend ---
  const legend = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${15})`);
    
  const seriesLegendData = seriesConfig.filter(series => {
    const seriesData = chartData.filter(d => {
      const matchesKeyword = series.keywords.some(kw => d.name.includes(kw));
      const isExcluded = series.exclude ? series.exclude.includes(d.name) : false;
      const matchesInclude = series.include ? series.include.some(inc => d.name.includes(inc)) : true;
      return matchesKeyword && !isExcluded && matchesInclude;
    });
    return seriesData.length >= 2;
  });

  const orgLegendData = [
    { label: "OpenAI", color: getColor("OpenAI") },
    { label: "Google", color: getColor("Google") },
    { label: "Anthropic", color: getColor("Anthropic") },
    { label: "Meta", color: getColor("Meta") },
    { label: "Mistral", color: getColor("Mistral") },
    { label: "xAI", color: "#8b5cf6" },
    { label: "其他", color: getColor("Other") },
  ];

  legend.append("text").attr("x", 0).attr("y", 0).text("系列趋势:").attr("font-size", "10px").attr("fill", "#94a3b8").attr("font-weight", "600");
  seriesLegendData.forEach((item, i) => {
    const x = 60 + (i % 8) * 95; const y = Math.floor(i / 8) * 18 - 4;
    const lg = legend.append("g").attr("transform", `translate(${x}, ${y})`);
    lg.append("line").attr("x1",0).attr("x2",16).attr("stroke",item.color).attr("stroke-width",2.5).attr("opacity",0.6);
    lg.append("circle").attr("cx",8).attr("r",3).attr("fill",item.color);
    lg.append("text").attr("x",20).attr("y",3).text(item.displayName).attr("font-size","10px").attr("fill","#64748b");
  });

  const orgLegendRow = legend.append("g").attr("transform", `translate(0, 18)`);
  orgLegendRow.append("text").text("研发机构:").attr("font-size","10px").attr("fill","#94a3b8").attr("font-weight","600");
  orgLegendData.forEach((item, i) => {
    const x = 60 + i * 75;
    const lg = orgLegendRow.append("g").attr("transform", `translate(${x}, -4)`);
    lg.append("circle").attr("r",4).attr("fill",item.color);
    lg.append("text").attr("x",8).attr("y",3).text(item.label).attr("font-size","10px").attr("fill","#64748b");
  });
}