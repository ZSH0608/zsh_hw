import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// ==========================================
// 常量配置
// ==========================================
const COLORS = {
  highRisk: '#f43f5e',
  safe: '#10b981',
  neutral: '#6366f1',
  bg: '#ffffff', // 改为白色背景以适应 Modal
  cellBg: '#f8fafc', // 浅灰背景
  border: '#e2e8f0'
};

const DIMENSIONS = [
  { key: 'visualScore', label: '视觉 AI', fixedRange: [-2, 2] },
  { key: 'langScore', label: '语言 AI', fixedRange: [-2, 2] },
  { key: 'totalScore', label: '总曝光(AIOE)', fixedRange: [-2, 2] },
  { key: 'cognitive', label: '认知依赖', fixedRange: [0, 10] },
  { key: 'disruption', label: '颠覆指数', fixedRange: [0, 10] }
];

// ==========================================
// 数据处理逻辑
// ==========================================
const processAndMergeData = (filesData) => {
  if (!filesData || filesData.length === 0) return [];
  const mergedMap = new Map();

  filesData.forEach(({ rows }) => {
    rows.forEach(row => {
      const id = row['NAICS'] || row['SOC'] || row['Code'] || row['NAICS Code'] || row['Occupation Code'];
      const name = row['NAICS Description'] || row['Occupation'] || row['Title'] || row['Description'] || row['Industry'] || id;
      
      if (!id) return; 

      if (!mergedMap.has(id)) mergedMap.set(id, { id, name });
      const item = mergedMap.get(id);

      const getVal = (keys) => {
        for (const k of keys) {
          if (row[k] !== undefined && row[k] !== "") return parseFloat(row[k]);
        }
        return undefined;
      };

      const v = getVal(['Image Generation AIIE', 'Image AIIE', 'Visual Score']);
      if (v !== undefined) item.visualScore = v;
      
      const l = getVal(['Language Modeling AIIE', 'Language AIIE', 'Language Score']);
      if (l !== undefined) item.langScore = l;
      
      const t = getVal(['AIOE', 'Total Score', 'AIIE']);
      if (t !== undefined) item.totalScore = t;
    });
  });

  return Array.from(mergedMap.values()).map(d => {
    const v = d.visualScore || 0;
    const l = d.langScore || 0;
    
    if (d.totalScore === undefined) {
      d.totalScore = (d.visualScore !== undefined && d.langScore !== undefined) ? (v + l)/2 : (v || l || 0);
    }
    
    if (d.cognitive === undefined) {
      d.cognitive = Math.max(0, Math.min(10, (l + 2.5) * 2));
    }
    
    if (d.disruption === undefined) {
      const overlap = (d.visualScore !== undefined && d.langScore !== undefined) ? 1.5 : 1;
      d.disruption = Math.max(0, (v + l + 3) * overlap);
    }
    
    return d;
  }).filter(d => d.visualScore !== undefined || d.langScore !== undefined || d.totalScore !== undefined);
};

// ==========================================
// 绘图逻辑
// ==========================================
function renderChart(data, container) {
  container.innerHTML = '';

  const width = 900;
  // 边距：左右留白以居中 (与 AIOE 一致)
  const margin = { top: 40, right: 120, bottom: 40, left: 120 };
  
  const cellSize = (width - margin.left - margin.right) / 5;
  const height = margin.top + (DIMENSIONS.length * cellSize) + margin.bottom;
  
  const cellPadding = 15;
  const innerSize = cellSize - cellPadding * 2;

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("width", "100%")
    //.style("height", "auto")
    .style("height", "100%")
    .style("overflow", "visible");

  const scales = {};
  DIMENSIONS.forEach(dim => {
    if (dim.fixedRange) {
      scales[dim.key] = d3.scaleLinear()
        .domain(dim.fixedRange)
        .range([0, innerSize]);
    } else {
      const values = data.map(d => d[dim.key] || 0);
      const [min, max] = d3.extent(values);
      const span = (max - min) || 1;
      scales[dim.key] = d3.scaleLinear()
        .domain([min - span * 0.1, max + span * 0.1])
        .range([0, innerSize]);
    }
  });

  // Tooltip
  let tooltip = d3.select("body").select(".pairplot-tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div")
      .attr("class", "pairplot-tooltip")
      .style("position", "absolute")
      .style("padding", "8px 12px")
      .style("background", "rgba(255, 255, 255, 0.95)")
      .style("border", "1px solid #e2e8f0")
      .style("border-radius", "6px")
      .style("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", 10000)
      .style("font-size", "12px")
      .style("color", "#334155");
  }

  const rootG = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

  DIMENSIONS.forEach((rowDim, rowIdx) => {
    const rowG = rootG.append("g").attr("transform", `translate(0, ${rowIdx * cellSize})`);

    // 左侧文字标签 (与 AIOE 一致)
    rowG.append("text")
      .attr("x", -15)
      .attr("y", cellSize / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", "#94a3b8")
      .attr("font-size", "14px")
      .text(rowDim.label);

    DIMENSIONS.forEach((colDim, colIdx) => {
      const cellG = rowG.append("g").attr("transform", `translate(${colIdx * cellSize}, 0)`);
      const contentG = cellG.append("g").attr("transform", `translate(${cellPadding}, ${cellPadding})`);
      const isDiagonal = rowIdx === colIdx;

      // 单元格背景框
      contentG.append("rect")
        .attr("width", innerSize)
        .attr("height", innerSize)
        .attr("fill", isDiagonal ? COLORS.cellBg : COLORS.bg)
        .attr("stroke", COLORS.border)
        .attr("stroke-width", 0.5)
        .attr("rx", 3);

      const xScale = scales[colDim.key];
      const yScale = scales[rowDim.key].copy().range([innerSize, 0]);

      if (isDiagonal) {
        // --- 对角线：直方图 ---
        const histogram = d3.bin()
          .domain(xScale.domain())
          .thresholds(xScale.ticks(15))
          .value(d => d[colDim.key] || 0);
        
        const bins = histogram(data);
        const yMax = d3.max(bins, d => d.length) || 1;
        const yHistScale = d3.scaleLinear().domain([0, yMax]).range([innerSize, 0]);

        contentG.selectAll("rect.bar")
          .data(bins)
          .enter().append("rect")
          .attr("x", d => xScale(d.x0) + 1)
          .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
          .attr("y", d => yHistScale(d.length))
          .attr("height", d => innerSize - yHistScale(d.length))
          .attr("fill", COLORS.neutral)
          .attr("opacity", 0.8);

        // 标签 (对角线内部)
        contentG.append("text")
          .attr("x", innerSize / 2)
          .attr("y", 12)
          .attr("text-anchor", "middle")
          .attr("fill", "#64748b") // 适配浅色背景
          .attr("font-size", "9px")
          .attr("font-weight", "bold")
          .text(colDim.label);
        
        // 直方图纵轴（仅第一个显示）
        if (colIdx === 0) {
          const yAxis = d3.axisLeft(yHistScale).ticks(3).tickSize(3);
          contentG.append("g")
            .call(yAxis)
            .attr("color", "#64748b")
            .selectAll("text")
            .attr("font-size", "10px");
        }

      } else {
        // --- 非对角线：散点图 ---
        const zx = xScale(0), zy = yScale(0);
        // 绘制0轴参考线
        if (zx > 0 && zx < innerSize) contentG.append("line").attr("x1", zx).attr("x2", zx).attr("y1", 0).attr("y2", innerSize).attr("stroke", "#cbd5e1").attr("stroke-dasharray", "2,2");
        if (zy > 0 && zy < innerSize) contentG.append("line").attr("x1", 0).attr("x2", innerSize).attr("y1", zy).attr("y2", zy).attr("stroke", "#cbd5e1").attr("stroke-dasharray", "2,2");

        contentG.selectAll("circle")
          .data(data)
          .enter().append("circle")
          .attr("cx", d => xScale(d[colDim.key] || 0))
          .attr("cy", d => yScale(d[rowDim.key] || 0))
          .attr("r", 1.5)
          .attr("fill", d => d.disruption > 5 ? COLORS.highRisk : COLORS.safe)
          .attr("opacity", 0.6)
          .on("mouseenter", function(event, d) {
            d3.select(this).attr("r", 5).attr("opacity", 1).attr("stroke", "#fff");
            tooltip.style("opacity", 1).html(`
              <div style="font-weight:bold; margin-bottom:4px;">${d.name}</div>
              <div style="display:grid; grid-template-columns: auto auto; gap: 4px;">
                <span>视觉:</span> <span>${d.visualScore?.toFixed(2)}</span>
                <span>语言:</span> <span>${d.langScore?.toFixed(2)}</span>
                <span>颠覆指数:</span> <span style="color:${d.disruption > 5 ? COLORS.highRisk : COLORS.safe}">${d.disruption?.toFixed(1)}</span>
              </div>
            `);
          })
          .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 10) + "px");
          })
          .on("mouseleave", function() {
            d3.select(this).attr("r", 1.5).attr("opacity", 0.6).attr("stroke", "none");
            tooltip.style("opacity", 0);
          });
      }

      // 绘制横轴（最后一行）
      if (rowIdx === DIMENSIONS.length - 1) {
        const xAxis = d3.axisBottom(xScale).ticks(3).tickSize(3);
        contentG.append("g").attr("transform", `translate(0, ${innerSize})`).call(xAxis).attr("color", "#64748b").selectAll("text").attr("font-size", "10px");
        
        // 底部列标签
        cellG.append("text")
          .attr("x", cellSize/2)
          .attr("y", cellSize + 15)
          .attr("text-anchor", "middle")
          .attr("fill", "#94a3b8")
          .attr("font-size", "14px")
          .text(colDim.label);
      }
      
      // 绘制纵轴（第一列且非对角线）
      if (colIdx === 0 && !isDiagonal) {
        const yAxis = d3.axisLeft(yScale).ticks(3).tickSize(3);
        contentG.append("g").call(yAxis).attr("color", "#64748b").selectAll("text").attr("font-size", "12px");
      }
    });
  });
}

// ==========================================
// 主入口函数
// ==========================================
export async function loadAndRenderPairPlot(partitionId, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // 显示加载状态
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#64748b;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span style="margin-top:8px; font-size:14px;">正在加载数据...</span>
    </div>
  `;

  // 映射 Partition ID 到文件夹名称
  const folderMap = {
    1: "November 2023_data",
    2: "February 2024_data",
    3: "May 2024_data",
    4: "August 2024_data",
    5: "November 2024_data",
    6: "February 2025_data",
    7: "May 2025_data"
  };

  const folderName = folderMap[partitionId];
  if (!folderName) {
    container.innerHTML = `<div style="text-align:center; color:#ef4444;">未找到该时间段的数据配置</div>`;
    return;
  }

  const imagePath = `data/AIOE/${folderName}/Image Generation.csv`;
  const langPath = `data/AIOE/${folderName}/Language Modeling.csv`;

  try {
    const [imgData, langData] = await Promise.all([
      d3.csv(imagePath).catch(e => null),
      d3.csv(langPath).catch(e => null)
    ]);

    const filesToMerge = [];
    if (imgData) filesToMerge.push({ rows: imgData });
    if (langData) filesToMerge.push({ rows: langData });

    if (filesToMerge.length > 0) {
      const appData = processAndMergeData(filesToMerge);
      renderChart(appData, container);
    } else {
      container.innerHTML = `<div style="text-align:center; color:#64748b;">该时间段暂无数据文件</div>`;
    }

  } catch (error) {
    console.error("Error loading pairplot data:", error);
    container.innerHTML = `<div style="text-align:center; color:#ef4444;">数据加载失败</div>`;
  }
}
