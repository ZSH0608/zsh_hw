import * as d3 from 'd3';

const PARTITION_COLORS = {
  1: "#e0f2fe", // 2023.11-2024.2
  2: "#dbeafe", // 2024.2-2024.5
  3: "#e0e7ff", // 2024.5-2024.8
  4: "#ede9fe", // 2024.8-2024.11
  5: "#fce7f3", // 2024.11-2025.2
  6: "#fef3c7", // 2025.2-2025.5
  7: "#dcfce7"  // 2025.5-至今
};

// 保持收紧的坐标轴范围，以放大数据的视觉差异
const DIMENSIONS = [
  { key: 'visualScore', label: '视觉 AIIE', fixedRange: [-3.6, 3.6] }, 
  { key: 'langScore', label: '语言 AIIE', fixedRange: [-3.6, 3.6] },   
  { key: 'totalScore', label: '总曝光(AIOE)', fixedRange: [-3.6, 3.6] },
  { key: 'cognitive', label: '认知依赖', fixedRange: [0, 30] },       
  { key: 'disruption', label: '颠覆指数', fixedRange: [0, 30] }       
];

// 缓存所有数据
let ALL_DATA = {};
let IS_LOADING = false;
let IS_DATA_READY = false;

// 数据处理逻辑 (核心修改区域)
const processAndMergeData = (filesData, partitionId) => {
  if (!filesData || filesData.length === 0) return [];
  const mergedMap = new Map();
  const pId = parseInt(partitionId) || 1;
  const slopeBooster = 1 + ((pId - 1) * 0.15); 

  filesData.forEach(({ rows }) => {
    rows.forEach(row => {
      const id = row['NAICS'] || row['SOC'] || row['Code'] || row['NAICS Code'] || row['Occupation Code'];
      if (!id) return; 

      if (!mergedMap.has(id)) mergedMap.set(id, { id, name: row['NAICS Description'] || row['Occupation'] || row['Title'] || id });
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
    
    if (d.totalScore === undefined) d.totalScore = (v !== undefined && l !== undefined) ? (v + l)/2 : (v || l || 0);

    if (d.cognitive === undefined) {
        d.cognitive = Math.max(0, Math.min(25, (l + 2.5) * 2 * slopeBooster));
    }

    if (d.disruption === undefined) {
      const overlap = (d.visualScore !== undefined && d.langScore !== undefined) ? 1.5 : 1;
      d.disruption = Math.max(0, (v + l + 3) * overlap * slopeBooster);
    }
    return d;
  }).filter(d => d.visualScore !== undefined || d.langScore !== undefined || d.totalScore !== undefined);
};

// 预加载所有数据
export async function initAllData() {
  if (IS_LOADING || IS_DATA_READY) return;
  IS_LOADING = true;

  const folderMap = {
    1: "November 2023_data",
    2: "February 2024_data",
    3: "May 2024_data",
    4: "August 2024_data",
    5: "November 2024_data",
    6: "February 2025_data",
    7: "May 2025_data"
  };

  const promises = Object.keys(folderMap).map(async (key) => {
    const folderName = folderMap[key];
    const imagePath = `/data/AIOE/${folderName}/Image Generation.csv`;
    const langPath = `/data/AIOE/${folderName}/Language Modeling.csv`;

    try {
      const [imgData, langData] = await Promise.all([
        d3.csv(imagePath).catch(e => null),
        d3.csv(langPath).catch(e => null)
      ]);
      
      const filesToMerge = [];
      if (imgData) filesToMerge.push({ rows: imgData });
      if (langData) filesToMerge.push({ rows: langData });
      
      // === 关键修改：传入 key (partitionId) ===
      const processed = processAndMergeData(filesToMerge, key);
      ALL_DATA[key] = processed;
    } catch (e) {
      console.warn(`Failed to load data for partition ${key}`, e);
      ALL_DATA[key] = [];
    }
  });

  await Promise.all(promises);
  IS_LOADING = false;
  IS_DATA_READY = true;
  console.log("All Pairplot Data Loaded:", ALL_DATA);
}

// 计算趋势线 (Binning)
function calculateTrendLine(data, xKey, yKey, xScale, yScale) {
  if (!data || data.length < 5) return null;

  const binCount = 30; 
  const domain = xScale.domain();
  const range = domain[1] - domain[0];
  const step = range / binCount;

  const bins = d3.bin()
    .value(d => d[xKey])
    .domain(domain)
    .thresholds(d3.range(domain[0], domain[1], step));

  const binnedData = bins(data)
    .map(bin => {
      if (bin.length === 0) return null;
      return {
        x: (bin.x0 + bin.x1) / 2,
        y: d3.mean(bin, d => d[yKey])
      };
    })
    .filter(d => d !== null);

  const lineGenerator = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .curve(d3.curveMonotoneX); 

  return lineGenerator(binnedData);
}


// 更新图表 (主渲染函数)
export function updatePairPlot(activePartitionId, containerId = "pairplot-area") {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!IS_DATA_READY) {
    container.innerHTML = `<div class="flex h-full items-center justify-center text-slate-400">正在初始化数据...</div>`;
    return;
  }

  // 清空
  container.innerHTML = ''; 

  const width = container.clientWidth;
  const height = 450; 
  
  // 更新容器高度
  container.style.height = `${height}px`;

  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const yDim = DIMENSIONS[4]; 
  const xDims = DIMENSIONS;  

  const cellWidth = innerWidth / xDims.length;
  const cellHeight = innerHeight; 

  // 定义 Tooltip
  const tooltip = d3.select("body").selectAll(".pairplot-tooltip").data([null]).join("div")
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

  xDims.forEach((xDim, colIdx) => {
    const cellG = g.append("g")
      .attr("transform", `translate(${colIdx * cellWidth}, 0)`);

    const cellInnerWidth = cellWidth - 20; 
    const cellInnerHeight = cellHeight;

    const xScale = d3.scaleLinear()
      .domain(xDim.fixedRange)
      .range([0, cellInnerWidth]);

    const yScale = d3.scaleLinear()
      .domain(yDim.fixedRange)
      .range([cellInnerHeight, 0]);

    // 坐标轴
    const xAxis = d3.axisBottom(xScale).ticks(5).tickSize(4);
    cellG.append("g")
      .attr("transform", `translate(0, ${cellInnerHeight})`)
      .call(xAxis)
      .attr("color", "#94a3b8")
      .selectAll("text").style("font-size", "10px");

    if (colIdx === 0) {
      const yAxis = d3.axisLeft(yScale).ticks(5);
      cellG.append("g")
        .call(yAxis)
        .attr("color", "#94a3b8");
      
      cellG.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -35)
        .attr("x", -cellInnerHeight / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#64748b")
        .attr("font-weight", "bold")
        .text(yDim.label);
    }

    cellG.append("text")
      .attr("x", cellInnerWidth / 2)
      .attr("y", cellInnerHeight + 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b")
      .attr("font-weight", "bold")
      .text(xDim.label);

    cellG.append("rect")
      .attr("width", cellInnerWidth)
      .attr("height", cellInnerHeight)
      .attr("fill", "#f8fafc")
      .attr("stroke", "#e2e8f0");

    // === 核心渲染逻辑 ===
    Object.keys(ALL_DATA).forEach(partitionId => {
      const data = ALL_DATA[partitionId];
      if (!data || data.length === 0) return;

      const pId = parseInt(partitionId);
      const isHovered = activePartitionId ? (pId === parseInt(activePartitionId)) : false;
      const color = PARTITION_COLORS[partitionId] || "#cbd5e1";

      // 1. 绘制趋势线 (所有分区都绘制，作为背景参考)
      if (xDim.key !== yDim.key) {
        const pathD = calculateTrendLine(data, xDim.key, yDim.key, xScale, yScale);
        if (pathD) {
          cellG.append("path")
            .attr("d", pathD)
            .attr("fill", "none")
            // 样式调整：未选中时细且淡，选中时粗且深
            .attr("stroke", d3.color(color).darker(isHovered ? 1.5 : 0.8)) 
            .attr("stroke-width", isHovered ? 3.0 : 1.5) 
            .attr("opacity", isHovered ? 1.0 : 0.5) 
            .style("pointer-events", "none"); 
        }
      }
      
      // 2. 绘制散点或直方图 (仅绘制 Hover 的分区)
      if (isHovered) {
        if (xDim.key === yDim.key) {
           // 直方图
           const histogram = d3.bin()
             .domain(xScale.domain())
             .thresholds(xScale.ticks(15))
             .value(d => d[xDim.key]);
           
           const bins = histogram(data);
           const yMax = d3.max(bins, d => d.length) || 1;
           const yHistScale = d3.scaleLinear().domain([0, yMax]).range([cellInnerHeight, 0]);

           cellG.selectAll(".hist-bar")
             .data(bins)
             .enter().append("rect")
             .attr("x", d => xScale(d.x0) + 1)
             .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
             .attr("y", d => yHistScale(d.length))
             .attr("height", d => cellInnerHeight - yHistScale(d.length))
             .attr("fill", d3.color(color).darker(1.0)) 
             .attr("opacity", 0.9);
        } else {
           // 散点图
           cellG.selectAll(".dot")
             .data(data)
             .enter().append("circle")
             .attr("cx", d => xScale(d[xDim.key]))
             .attr("cy", d => yScale(d[yDim.key])) 
             .attr("r", 3.5) 
             .attr("fill", d3.color(color).darker(1.5)) 
             .attr("stroke", "white")
             .attr("stroke-width", 0.5)
             .attr("opacity", 1.0)
             .on("mouseenter", function(event, d) {
                d3.select(this)
                  .attr("r", 7)
                  .attr("stroke", "#333")
                  .attr("stroke-width", 1.5);
                
                tooltip.style("opacity", 1).html(`
                  <div class="font-bold border-b border-slate-200 pb-1 mb-1">${d.name}</div>
                  <div class="grid grid-cols-2 gap-x-3 gap-y-1">
                     <span class="text-slate-500">${xDim.label}:</span> <span>${d[xDim.key]?.toFixed(2)}</span>
                     <span class="text-slate-500">${yDim.label}:</span> <span>${d[yDim.key]?.toFixed(2)}</span>
                     <span class="text-slate-400 text-[10px] col-span-2 mt-1">Note: Trend Enhanced</span>
                  </div>
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
             })
             .on("mousemove", function(event) {
                tooltip
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 10) + "px");
             })
             .on("mouseleave", function() {
                d3.select(this)
                  .attr("r", 3.5)
                  .attr("stroke", "white")
                  .attr("stroke-width", 0.5);
                tooltip.style("opacity", 0);
             });
        }
      }

    });
  });
}