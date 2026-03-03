import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * Swarm Plot: Research Paper Trends 2015-2025
 * @param {string} containerSelector 
 */
export function renderSwarmPlot(containerSelector) {
  const container = d3.select(containerSelector);
  container.html("");

  // 更新后的数据定义
  const data = {
    'Computer Vision': {
      2015: 298, 2016: 463, 2017: 686, 2018: 1027, 2019: 1243,
      2020: 1662, 2021: 2135, 2022: 2392, 2023: 2885, 2024: 3747, 2025: 4674
    },
    'Natural Language Processing': {
      2015: 119, 2016: 217, 2017: 329, 2018: 552, 2019: 729,
      2020: 1137, 2021: 1458, 2022: 1651, 2023: 2527, 2024: 3551, 2025: 4152
    },
    'Knowledge Graph': {
      2015: 92, 2016: 112, 2017: 211, 2018: 350, 2019: 532,
      2020: 852, 2021: 1090, 2022: 1265, 2023: 1440, 2024: 1931, 2025: 2734
    },
    'Voice Conversion': {
      2015: 5, 2016: 5, 2017: 12, 2018: 29, 2019: 52,
      2020: 111, 2021: 114, 2022: 144, 2023: 152, 2024: 192, 2025: 261
    }
  };

  // 领域颜色定义
  const categoryColors = {
    'Computer Vision': '#3182ce',
    'Natural Language Processing': '#38a169',
    'Knowledge Graph': '#805ad5',
    'Voice Conversion': '#dd6b20'
  };

  const config = {
    width: 1400,
    height: 660,
    margin: { top: 20, right: 100, bottom: 100, left: 100 },
    
    // 点的大小
    dotRadius: 2.7,
    
    // 不同的领域使用不同的点比例
    papersPerDot: {
      'Computer Vision': 100,
      'Natural Language Processing': 100,
      'Knowledge Graph': 100,
      'Voice Conversion': 10
    },
    
    // 领域间距
    areaWidth: 120,
    areaGap: 17,
    
    // 点布局参数
    verticalSpacing: 6.0,
    horizontalSpacing: 9.0,
    verticalSpread: 7.5,
    horizontalSpread: 64,
    
    // 点之间的最小距离
    minDistance: 2.0
  };

  // 绘图区域  
  const chartWidth = config.width - config.margin.left - config.margin.right;
  const chartHeight = config.height - config.margin.top - config.margin.bottom;

  // 领域顺序
  const categories = ['Computer Vision', 'Natural Language Processing', 'Knowledge Graph', 'Voice Conversion'];
  const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

  // 创建SVG
  const svg = container.append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${config.width} ${config.height}`)
    .append('g')
    .attr('transform', `translate(${config.margin.left}, ${config.margin.top})`);

  // Y轴（年份）  
  const yScale = d3.scaleLinear()
    .domain([2014.5, 2025.5])
    .range([chartHeight, 0]);

  svg.append('g')
    .call(d3.axisLeft(yScale)
      .tickFormat(d => {
        if (Number.isInteger(d) && d >= 2015 && d <= 2025) {
          return d;
        }
        return '';
      })
      .ticks(12)
    )
    .attr('class', 'y-axis')
    .selectAll('text')
    .style('font-size', '12px')
    .style('fill', '#4a5568');

  // Y轴标签
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -chartHeight / 2)
    .attr('y', -50)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('fill', '#4a5568')
    .style('font-weight', '500')
    .text('Year');

  // 年份参考线
  svg.selectAll('.year-line')
    .data(years)
    .enter()
    .append('line')
    .attr('class', 'year-line')
    .attr('x1', 0)
    .attr('x2', chartWidth)
    .attr('y1', d => yScale(d))
    .attr('y2', d => yScale(d))
    .attr('stroke', '#f0f0f0')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '2,2');

  // 每个领域的起始X位置
  const areaPositions = {};
  const startX = (chartWidth - (categories.length * config.areaWidth + (categories.length - 1) * config.areaGap)) / 2;

  categories.forEach((category, index) => {
    areaPositions[category] = {
      center: startX + index * (config.areaWidth + config.areaGap) + config.areaWidth / 2,
      left: startX + index * (config.areaWidth + config.areaGap) + 10,
      right: startX + index * (config.areaWidth + config.areaGap) + config.areaWidth - 10
    };
  });

  // 领域标签
  categories.forEach(category => {
    const x = areaPositions[category].center;
    
    if (category === 'Natural Language Processing' || category === 'Voice Conversion') {
      const labelGroup = svg.append('g')
        .attr('class', 'area-label-multiline')
        .attr('transform', `translate(${x}, ${chartHeight + 30})`);
      
      if (category === 'Natural Language Processing') {
        labelGroup.append('text')
          .attr('x', 0)
          .attr('y', -8)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .text('Natural Language');
        
        labelGroup.append('text')
          .attr('x', 0)
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .text('Processing');
      } else {
        labelGroup.append('text')
          .attr('x', 0)
          .attr('y', 0)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .text(category);
      }
    } else {
      svg.append('text')
        .attr('class', 'area-label')
        .attr('x', x)
        .attr('y', chartHeight + 20)
        .attr('text-anchor', 'middle')
        .text(category);
    }
  });

  // 工具提示
  const tooltip = d3.select('body').append('div')
    .attr('class', 'swarm-tooltip')
    .style('position', 'absolute')
    .style('padding', '10px 14px')
    .style('background-color', 'rgba(26, 32, 44, 0.95)')
    .style('color', 'white')
    .style('border-radius', '4px')
    .style('font-size', '13px')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('transition', 'opacity 0.2s')
    .style('box-shadow', '0 2px 8px rgba(0, 0, 0, 0.15)')
    .style('z-index', '100')
    .style('min-width', '160px');

  // 创建数据点
  categories.forEach(category => {
    const areaCenterX = areaPositions[category].center;
    const areaLeft = areaPositions[category].left;
    const areaRight = areaPositions[category].right;
    const dotColor = categoryColors[category];
    const papersPerDot = config.papersPerDot[category];
    
    years.forEach(year => {
      const papers = data[category][year];
      const y = yScale(year);

      const dotCount = Math.max(1, Math.ceil(papers / papersPerDot));
      
      const effectiveHorizontalSpread = Math.min(
        config.horizontalSpread * Math.log(dotCount) / Math.log(8),
        (areaRight - areaLeft) / 2 - config.dotRadius
      );
      
      const points = [];
      
      for (let i = 0; i < dotCount; i++) {
        let attempts = 0;
        let pointPlaced = false;
        
        while (attempts < 100 && !pointPlaced) {
          const layer = Math.floor(Math.sqrt(i));
          const layerIndex = i - layer * layer;
          
          let xOffset = 0;
          if (layer === 0) {
            xOffset = 0;
          } else {
            const angle = (layerIndex / (layer * 2)) * Math.PI;
            const radius = layer * config.horizontalSpacing;
            xOffset = Math.cos(angle) * radius;
          }
          
          let yOffset = 0;
          if (dotCount > 1) {
            const verticalLayer = layer;
            const verticalIndex = layerIndex;
            yOffset = (verticalLayer * config.verticalSpacing * 0.8) - 
                      (verticalLayer * config.verticalSpacing * 0.4);
            
            yOffset += (Math.random() - 0.5) * config.verticalSpread;
          }
          
          let overlapping = false;
          for (let j = 0; j < points.length; j++) {
            const dx = xOffset - points[j].x;
            const dy = yOffset - points[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.minDistance) {
              overlapping = true;
              break;
            }
          }
          
          if (!overlapping) {
            points.push({ x: xOffset, y: yOffset });
            pointPlaced = true;
            
            svg.append('circle')
              .attr('class', 'swarm-dot')
              .attr('cx', areaCenterX + xOffset)
              .attr('cy', y + yOffset)
              .attr('r', config.dotRadius)
              .attr('fill', dotColor)
              .attr('opacity', 0.7)
              .attr('data-category', category)
              .attr('data-year', year)
              .attr('data-papers', papers)
              .on('mouseover', function(event) {
                d3.select(this).attr('opacity', 1).attr('r', 5);
                
                const papers = d3.select(this).attr('data-papers');
                const year = d3.select(this).attr('data-year');
                const category = d3.select(this).attr('data-category');
                
                tooltip
                  .style('opacity', 1)
                  .html(`
                    <div style="font-weight: 600; color: ${dotColor};">${category}</div>
                    <div style="margin-top: 4px;">Year: ${year}</div>
                    <div>Papers: ${parseInt(papers).toLocaleString()}</div>
                    <div style="margin-top: 4px; font-size: 12px; color: #cbd5e0;">${config.papersPerDot[category]} papers per dot</div>
                    <div style="font-size: 12px; color: #cbd5e0;">Dots: ${dotCount}</div>
                  `)
                  .style('left', (event.pageX + 10) + 'px')
                  .style('top', (event.pageY - 10) + 'px');
              })
              .on('mousemove', function(event) {
                tooltip
                  .style('left', (event.pageX + 10) + 'px')
                  .style('top', (event.pageY - 10) + 'px');
              })
              .on('mouseout', function() {
                d3.select(this).attr('opacity', 0.7).attr('r', config.dotRadius);
                tooltip.style('opacity', 0);
              });
          }
          
          attempts++;
        }
        
        if (!pointPlaced && attempts >= 100) {
          const xOffset = (Math.random() - 0.5) * effectiveHorizontalSpread;
          const yOffset = (Math.random() - 0.5) * config.verticalSpread;
          
          svg.append('circle')
            .attr('class', 'swarm-dot')
            .attr('cx', areaCenterX + xOffset)
            .attr('cy', y + yOffset)
            .attr('r', config.dotRadius)
            .attr('fill', dotColor)
            .attr('opacity', 0.7)
            .attr('data-category', category)
            .attr('data-year', year)
            .attr('data-papers', papers)
            .on('mouseover', function(event) {
              d3.select(this).attr('opacity', 1).attr('r', 5);
              
              const papers = d3.select(this).attr('data-papers');
              const year = d3.select(this).attr('data-year');
              const category = d3.select(this).attr('data-category');
              
              tooltip
                .style('opacity', 1)
                .html(`
                  <div style="font-weight: 600; color: ${dotColor};">${category}</div>
                  <div style="margin-top: 4px;">Year: ${year}</div>
                  <div>Papers: ${parseInt(papers).toLocaleString()}</div>
                  <div style="margin-top: 4px; font-size: 12px; color: #cbd5e0;">${config.papersPerDot[category]} papers per dot</div>
                  <div style="font-size: 12px; color: #cbd5e0;">Dots: ${dotCount}</div>
                `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
            })
            .on('mousemove', function(event) {
              tooltip
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', function() {
              d3.select(this).attr('opacity', 0.7).attr('r', config.dotRadius);
              tooltip.style('opacity', 0);
            });
        }
      }
    });
  });

  // 创建图例
  const legendContainer = container.append('div')
    .attr('class', 'swarm-legend');

  categories.forEach(category => {
    const legendItem = legendContainer.append('div')
      .attr('class', 'swarm-legend-item');
    
    legendItem.append('div')
      .attr('class', 'swarm-legend-color')
      .style('background-color', categoryColors[category]);
    
    legendItem.append('div')
      .attr('class', 'swarm-legend-text')
      .text(category);
  });

  // 统计信息
  const statsContainer = container.append('div')
    .attr('class', 'swarm-stats');

  categories.forEach(category => {
    const total = years.reduce((sum, year) => sum + data[category][year], 0);
    const color = categoryColors[category];
    
    const statBox = statsContainer.append('div')
      .attr('class', 'swarm-stat-box');
    
    statBox.append('div')
      .attr('class', 'swarm-stat-value')
      .style('color', color)
      .text(total.toLocaleString());
    
    statBox.append('div')
      .attr('class', 'swarm-stat-label')
      .text(`Total papers in ${category}`);
  });

  console.log('✅ Research paper trends visualization generated successfully!');
}
