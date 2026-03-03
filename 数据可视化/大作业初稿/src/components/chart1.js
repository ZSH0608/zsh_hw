import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { formatParams, getColor } from "../data/data.js";
import { loadAndRenderPairPlot } from "./pairplot.js";

/**
 * 创建全屏 Modal 弹出层
 * @param {Object} partition - 时间分区数据
 * @param {Array} chartData - 图表数据
 */
function openPartitionModal(partition, chartData) {
  // 筛选该时间段内的数据
  const filteredData = chartData.filter(d => 
    d.date >= partition.start && d.date < partition.end
  );

  // 创建 Modal 容器
  const modal = d3.select("body")
    .append("div")
    .attr("class", "partition-modal")
    .attr("id", "partition-modal")
    .style("position", "fixed")
    .style("top", "0")
    .style("left", "0")
    .style("width", "100vw")
    .style("height", "100vh")
    .style("background", "rgba(15, 23, 42, 0.85)")
    .style("backdrop-filter", "blur(8px)")
    .style("z-index", "9999")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "center")
    .style("opacity", "0")
    .style("transition", "opacity 0.3s ease");

  // Modal 内容容器
  const modalContent = modal.append("div")
    .attr("class", "modal-content")
    .style("background", "white")
    .style("border-radius", "16px")
    .style("width", "90vw")
    .style("height", "90vh")
    .style("max-width", "1400px")
    .style("max-height", "900px")
    .style("box-shadow", "0 25px 50px -12px rgba(0, 0, 0, 0.25)")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("overflow", "hidden")
    .style("transform", "scale(0.9)")
    .style("transition", "transform 0.3s ease");

  // Modal 头部
  const modalHeader = modalContent.append("div")
    .attr("class", "modal-header")
    .style("padding", "20px 24px")
    .style("border-bottom", "1px solid #e2e8f0")
    .style("display", "flex")
    .style("justify-content", "space-between")
    .style("align-items", "center")
    .style("background", "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)");

  // 标题区域
  const titleArea = modalHeader.append("div");
  
  titleArea.append("h2")
    .style("margin", "0")
    .style("font-size", "20px")
    .style("font-weight", "700")
    .style("color", "#1e293b")
    .text(`时间分区详情: ${partition.label}`);
  
  titleArea.append("p")
    .style("margin", "4px 0 0 0")
    .style("font-size", "13px")
    .style("color", "#64748b")
    .text(`该时段共有 ${filteredData.length} 个模型数据点`);

  // 关闭按钮
  modalHeader.append("button")
    .attr("class", "modal-close-btn")
    .style("width", "40px")
    .style("height", "40px")
    .style("border", "none")
    .style("background", "#f1f5f9")
    .style("border-radius", "10px")
    .style("cursor", "pointer")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "center")
    .style("font-size", "20px")
    .style("color", "#64748b")
    .style("transition", "all 0.2s ease")
    .html("&times;")
    .on("mouseenter", function() {
      d3.select(this)
        .style("background", "#e2e8f0")
        .style("color", "#1e293b");
    })
    .on("mouseleave", function() {
      d3.select(this)
        .style("background", "#f1f5f9")
        .style("color", "#64748b");
    })
    .on("click", () => closePartitionModal());

  // Modal 主体内容区
  const modalBody = modalContent.append("div")
    .attr("class", "modal-body")
    .attr("id", "modal-body-container")
    .style("flex", "1")
    .style("padding", "24px")
    .style("overflow", "auto")
    .style("background", "#fafafa");

  // 占位内容 - 五维 Pair-plot 图将在这里渲染
  const pairplotContainer = modalBody.append("div")
    .attr("class", "pairplot-container")
    .attr("id", "pairplot-container")
    .style("width", "auto")
    //.style("height", "100%")
    .style("height", "auto")
    .style("min-height", "600px")
    .style("background", "white")
    .style("border-radius", "12px")
    .style("box-shadow", "0 1px 3px rgba(0,0,0,0.1)")
    .style("display", "flex")
    .style("flex-direction", "column");

  // Pair-plot 图头部
  pairplotContainer.append("div")
    .style("padding", "16px 20px")
    .style("border-bottom", "1px solid #e2e8f0")
    .append("h3")
    .style("margin", "0")
    .style("font-size", "16px")
    .style("font-weight", "600")
    .style("color", "#334155")
    .text("五维 Pair-plot 分析图");

  // Pair-plot 图内容区
  const pairplotContent = pairplotContainer.append("div")
    .attr("id", "pairplot-chart-area")
    .style("flex", "1")
    .style("padding", "20px")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "center");

  // 调用 Pair-plot 渲染函数
  loadAndRenderPairPlot(partition.id, "pairplot-chart-area");

  // Modal 底部信息栏
  const modalFooter = modalContent.append("div")
    .attr("class", "modal-footer")
    .style("padding", "16px 24px")
    .style("border-top", "1px solid #e2e8f0")
    .style("background", "#f8fafc")
    .style("display", "flex")
    .style("justify-content", "space-between")
    .style("align-items", "center");

  // 数据摘要
  const summaryInfo = modalFooter.append("div")
    .style("display", "flex")
    .style("gap", "24px");

  if (filteredData.length > 0) {
    const avgScore = d3.mean(filteredData, d => d.mmluScore);
    const maxScore = d3.max(filteredData, d => d.mmluScore);
    const organizations = [...new Set(filteredData.map(d => d.organization))];

    summaryInfo.append("span")
      .style("font-size", "12px")
      .style("color", "#64748b")
      .html(`<strong>平均 MMLU:</strong> ${avgScore ? avgScore.toFixed(1) : 'N/A'}%`);
    
    summaryInfo.append("span")
      .style("font-size", "12px")
      .style("color", "#64748b")
      .html(`<strong>最高 MMLU:</strong> ${maxScore ? maxScore.toFixed(1) : 'N/A'}%`);
    
    summaryInfo.append("span")
      .style("font-size", "12px")
      .style("color", "#64748b")
      .html(`<strong>涉及机构:</strong> ${organizations.length} 家`);
  }

  // 关闭提示
  modalFooter.append("span")
    .style("font-size", "11px")
    .style("color", "#94a3b8")
    .text("按 ESC 或点击 × 关闭");

  // 淡入动画
  requestAnimationFrame(() => {
    modal.style("opacity", "1");
    modalContent.style("transform", "scale(1)");
  });

  // ESC 键关闭
  const handleKeydown = (e) => {
    if (e.key === "Escape") {
      closePartitionModal();
      document.removeEventListener("keydown", handleKeydown);
    }
  };
  document.addEventListener("keydown", handleKeydown);

  // 点击背景关闭
  modal.on("click", function(event) {
    if (event.target === this) {
      closePartitionModal();
    }
  });

  // 触发自定义事件，以便外部可以加载 Pair-plot 图
  const customEvent = new CustomEvent("partitionModalOpened", {
    detail: {
      partition: partition,
      filteredData: filteredData,
      containerId: "pairplot-chart-area"
    }
  });
  document.dispatchEvent(customEvent);
}

/**
 * 关闭 Modal 弹出层
 */
function closePartitionModal() {
  const modal = d3.select("#partition-modal");
  if (!modal.empty()) {
    modal.select(".modal-content")
      .style("transform", "scale(0.9)");
    modal
      .style("opacity", "0")
      .transition()
      .duration(300)
      .remove();
  }
}

// 导出 Modal 函数供外部使用
export { openPartitionModal, closePartitionModal };

/**
 * Chart 1: Evolution of Intelligence (Scatter + Trend)
 * @param {string} containerSelector - ID of container
 * @param {Array} data - Data array
 * @param {Object} options - { showTrendLine, showLabels }
 */
export function renderChart1(containerSelector, data, options = {}) {
  const container = d3.select(containerSelector);
  container.html(""); // Clean up before render

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

  // --- Focus Box (Annotation) --- 最先绘制，作为背景层
  const focusGroup = g.append("g").attr("class", "focus-group");

  // 绘制时间分区背景
  timePartitions.forEach(partition => {
    const xStart = Math.max(xScale(partition.start), 0);
    const xEnd = Math.min(xScale(partition.end), innerWidth);
    
    if (xEnd > xStart) {
      focusGroup.append("rect")
        .attr("class", `partition-bg partition-${partition.id}`)
        .attr("x", xStart)
        .attr("y", 0)
        .attr("width", xEnd - xStart)
        .attr("height", innerHeight)
        .attr("fill", partition.color)
        .attr("opacity", 0.4);
    }
  });

  // 绘制透明的点击热区（覆盖在背景之上）
  const partitionHotspots = focusGroup.selectAll(".partition-hotspot")
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
    .attr("fill", "transparent")
    .attr("stroke", "none")
    .style("cursor", "pointer")
    .on("mouseenter", function(event, d) {
      // 悬停时颜色加深
      d3.select(this)
        .transition()
        .duration(200)
        .attr("fill", d.color)
        .attr("opacity", 0.5);
      
      // 同时加深对应的背景
      focusGroup.select(`.partition-${d.id}`)
        .transition()
        .duration(200)
        .attr("opacity", 0.7);
    })
    .on("mouseleave", function(event, d) {
      // 恢复透明
      d3.select(this)
        .transition()
        .duration(200)
        .attr("fill", "transparent")
        .attr("opacity", 1);
      
      // 恢复背景透明度
      focusGroup.select(`.partition-${d.id}`)
        .transition()
        .duration(200)
        .attr("opacity", 0.4);
    })
    .on("click", function(event, d) {
      // 点击时弹出全屏 Modal
      openPartitionModal(d, chartData);
    });

  // 添加分区标签（在分区顶部显示时间范围）
  timePartitions.forEach(partition => {
    const xStart = Math.max(xScale(partition.start), 0);
    const xEnd = Math.min(xScale(partition.end), innerWidth);
    const midX = (xStart + xEnd) / 2;
    
    if (xEnd > xStart && (xEnd - xStart) > 40) { // 只在足够宽的分区显示标签
      focusGroup.append("text")
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

  // 添加大模型爆发期总标题
  focusGroup.append("text")
    .attr("x", (xScale(new Date(2023, 10, 1)) + xScale(new Date(2026, 0, 1))) / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("class", "focus-text")
    .attr("fill", "#475569")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .text("大模型爆发期 (点击分区查看详情)");

  // --- Grid Lines ---
  g.append("g")
    .attr("class", "grid-lines")
    .call(d3.axisLeft(yScale).tickSize(-innerWidth).ticks(5).tickFormat(""))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").attr("stroke", "#cbd5e1").attr("stroke-opacity", 0.9));

  // --- Axes ---
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

  // --- Human Expert Line ---
  const expertLevel = 89.8;
  g.append("line")
    .attr("x1", 0)
    .attr("x2", innerWidth)
    .attr("y1", yScale(expertLevel))
    .attr("y2", yScale(expertLevel))
    .attr("stroke", "#ef4444")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "4,2")
    .attr("opacity", 0.7);

  g.append("text")
    .attr("x", innerWidth + 10)
    .attr("y", yScale(expertLevel) + 4)
    .attr("fill", "#ef4444")
    .attr("font-size", "11px")
    .attr("font-weight", "bold")
    .text("人类专家 (89.8%)");

  // --- Series Lines (按系列绘制平滑曲线) ---
  // 定义模型系列及其对应的颜色
  const seriesConfig = [
    { 
      name: "GPT", 
      color: getColor("OpenAI"), 
      keywords: ["GPT-3", "GPT-4", "GPT-4o", "GPT-4.5", "GPT-5"],
      displayName: "GPT 系列"
    },
    // { 
    //   name: "OpenAI-o", 
    //   color: "#059669", // 深一点的绿色区分
    //   keywords: ["OpenAI o1", "o3", "o4-mini"],
    //   displayName: "OpenAI o 系列"
    // },
    { 
      name: "Claude", 
      color: getColor("Anthropic"), 
      keywords: ["Claude"],
      include: ["Sonnet"], // 只连接Sonnet系列
      displayName: "Claude 系列"
    },
    { 
      name: "Llama", 
      color: getColor("Meta"), 
      keywords: ["Llama"],
      include: ["70B", "90B"], // 只拟合70B和90B的样本
      displayName: "Llama 系列"
    },
    { 
      name: "Gemini", 
      color: "#2563eb", // 深蓝色
      keywords: ["Gemini"],
      include: ["Pro"], // 只连接Pro版本
      displayName: "Gemini 系列"
    },
    // { 
    //   name: "Mistral", 
    //   color: getColor("Mistral"), 
    //   keywords: ["Mistral", "Mixtral"],
    //   displayName: "Mistral 系列"
    // },
    // { 
    //   name: "PaLM", 
    //   color: "#60a5fa", // 浅蓝色
    //   keywords: ["PaLM"],
    //   displayName: "PaLM 系列"
    // },
    // { 
    //   name: "Grok", 
    //   color: "#8b5cf6", // 紫色
    //   keywords: ["Grok"],
    //   displayName: "Grok 系列"
    // }
  ];

  // 为每个系列筛选数据并绘制曲线
  const seriesLineGenerator = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.mmluScore))
    .curve(d3.curveMonotoneX);

  const seriesGroup = g.append("g").attr("class", "series-lines");

  seriesConfig.forEach(series => {
    // 筛选属于该系列的模型，支持排除特定模型和只包含特定关键词
    const seriesData = chartData.filter(d => {
      const matchesKeyword = series.keywords.some(kw => d.name.includes(kw));
      const isExcluded = series.exclude ? series.exclude.includes(d.name) : false;
      // 如果有include规则，必须匹配include中的某个关键词
      const matchesInclude = series.include ? series.include.some(inc => d.name.includes(inc)) : true;
      return matchesKeyword && !isExcluded && matchesInclude;
    }).sort((a, b) => a.date - b.date);

    // 只有当系列有2个及以上数据点时才绘制曲线
    if (seriesData.length >= 2) {
      // 绘制曲线
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

  // --- Tooltip & Interactivity ---
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
    //.attr("opacity", d => d.date.getFullYear() >= 2025 ? 0.6 : 1);
    .attr("opacity", 0.9);
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

  // --- Legend (系列图例 + 机构散点图例) ---
  const seriesLegendData = seriesConfig.filter(series => {
    // 只显示有2个及以上数据点的系列
    const seriesData = chartData.filter(d => {
      const matchesKeyword = series.keywords.some(kw => d.name.includes(kw));
      const isExcluded = series.exclude ? series.exclude.includes(d.name) : false;
      const matchesInclude = series.include ? series.include.some(inc => d.name.includes(inc)) : true;
      return matchesKeyword && !isExcluded && matchesInclude;
    });
    return seriesData.length >= 2;
  });

  // 机构散点图例数据
  const orgLegendData = [
    { label: "OpenAI", color: getColor("OpenAI") },
    { label: "Google", color: getColor("Google") },
    { label: "Anthropic", color: getColor("Anthropic") },
    { label: "Meta", color: getColor("Meta") },
    { label: "Mistral", color: getColor("Mistral") },
    { label: "xAI", color: "#8b5cf6" },
    { label: "其他", color: getColor("Other") },
  ];

  const legend = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${15})`);

  // 第一行：系列曲线图例
  legend.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .text("系列趋势:")
    .attr("font-size", "10px")
    .attr("fill", "#94a3b8")
    .attr("font-weight", "600");

  seriesLegendData.forEach((item, i) => {
    const itemWidth = 95; 
    const x = 60 + (i % 8) * itemWidth;
    const y = Math.floor(i / 8) * 18 - 4; 
    
    const lg = legend.append("g").attr("transform", `translate(${x}, ${y})`);
    // 绘制短线段表示曲线
    lg.append("line")
      .attr("x1", 0)
      .attr("x2", 16)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", item.color)
      .attr("stroke-width", 2.5)
      .attr("opacity", 0.6);
    // 在线段中间添加小圆点
    lg.append("circle")
      .attr("cx", 8)
      .attr("cy", 0)
      .attr("r", 3)
      .attr("fill", item.color);
    lg.append("text")
      .attr("x", 20)
      .attr("y", 3)
      .text(item.displayName)
      .attr("font-size", "10px")
      .attr("fill", "#64748b");
  });

  // 第二行：机构散点图例
  const orgLegendRow = legend.append("g")
    .attr("transform", `translate(0, 18)`);

  orgLegendRow.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .text("研发机构:")
    .attr("font-size", "10px")
    .attr("fill", "#94a3b8")
    .attr("font-weight", "600");

  orgLegendData.forEach((item, i) => {
    const itemWidth = 75; 
    const x = 60 + i * itemWidth;
    
    const lg = orgLegendRow.append("g").attr("transform", `translate(${x}, -4)`);
    lg.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", item.color);
    lg.append("text")
      .attr("x", 8)
      .attr("y", 3)
      .text(item.label)
      .attr("font-size", "10px")
      .attr("fill", "#64748b");
  });

}