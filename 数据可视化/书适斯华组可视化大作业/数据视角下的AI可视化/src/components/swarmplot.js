import * as d3 from 'd3';

/**
 * Swarm Plot: Research Paper Trends 2015-2025
 * 使用修正后的条形布局蜂群图
 * 确保非AI点在最上面，AI点从底部开始填满
 * 
 * @param {string} containerSelector 
 */
export function renderSwarmPlot(containerSelector) {
  const container = d3.select(containerSelector);
  container.html("");

  const data = {
    'CV': {
      total: 21212, 
      aiPapers: 20796,
      nonAiPapers: 416, 
      color: '#3182ce',
      label: 'Computer Vision'
    },
    'NLP': {
      total: 16422, 
      aiPapers: 15433, 
      nonAiPapers: 989,  
      color: '#38a169',
      label: 'Natural Language Processing'
    },
    'HCI': {
      total: 10525,
      aiPapers: 9893,
      nonAiPapers: 632,  
      color: '#805ad5',
      label: 'Human-Computer Interaction'
    },
    'SE': {
      total: 19147,
      aiPapers: 17285,
      nonAiPapers: 1862,  
      color: '#dd6b20',
      label: 'Software Engineering'
    }
  };

  const config = {
    width: 1200,
    height: 700, 
    margin: { top: 80, right: 100, bottom: 120, left: 120 },
    
    // 点的大小
    dotRadius: 5.5,
    
    // 每个点代表的论文数 
    papersPerDot: 100,
    
    // 领域宽度
    areaWidth: 120,
    
    // 蜂群图布局参数
    horizontalSpacing: 11, // 水平间距
    verticalSpacing: 11,   // 垂直间距
    maxDotsPerRow: 12,    // 每行最多点数
  };

  // 绘图区域  
  const chartWidth = config.width - config.margin.left - config.margin.right;
  const chartHeight = config.height - config.margin.top - config.margin.bottom;

  // 领域顺序
  const categories = ['CV', 'NLP', 'HCI', 'SE'];

  // 创建SVG
  const svg = container.append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${config.width} ${config.height}`)
    .style('background-color', 'white')
    .append('g')
    .attr('transform', `translate(${config.margin.left}, ${config.margin.top})`);
 
  // 计算实际Y轴范围（基于实际论文数量）
  const maxPapers = Math.max(...categories.map(cat => data[cat].total));
  const maxDots = Math.ceil(maxPapers / config.papersPerDot);
  const maxRows = Math.ceil(maxDots / config.maxDotsPerRow);
  const yDomainMax = maxRows * config.maxDotsPerRow * config.papersPerDot;
  
  console.log(`最大论文数: ${maxPapers}, 最大点数: ${maxDots}, 最大行数: ${maxRows}, Y轴最大值: ${yDomainMax}`);
  
  // 创建Y轴比例尺
  const yScale = d3.scaleLinear()
    .domain([0, 52000])
    .range([chartHeight, 0]);

  // 生成Y轴刻度
  const yTickCount = Math.min(10, maxRows + 1);
  const yTicks = yScale.ticks(yTickCount);
  
  // 添加Y轴网格线
  const yAxisGrid = svg.append('g')
    .attr('class', 'y-axis-grid')
    .selectAll('line')
    .data(yTicks)
    .enter().append('line')
    .attr('x1', 0)
    .attr('x2', chartWidth)
    .attr('y1', d => yScale(d))
    .attr('y2', d => yScale(d))
    .attr('stroke', '#e2e8f0')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '3,2');

  // 添加Y轴刻度标签
  const yAxisLabels = svg.append('g')
    .attr('class', 'y-axis-labels')
    .selectAll('text')
    .data(yTicks)
    .enter().append('text')
    .attr('x', -10)
    .attr('y', d => yScale(d))
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .style('font-size', '12px')
    .style('fill', '#4a5568')
    .text(d => d.toLocaleString());

  // 添加Y轴标签
  svg.append('text')
    .attr('class', 'y-axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -chartHeight / 2)
    .attr('y', -80)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('fill', '#4a5568')
    .style('font-weight', '500')
    .text('论文数量 (篇)');
  
  // 计算每个领域的X位置
  const categorySpacing = chartWidth / (categories.length + 1);
  const areaPositions = {};
  
  categories.forEach((category, index) => {
    areaPositions[category] = {
      center: categorySpacing * (index + 1),
      left: categorySpacing * (index + 1) - config.areaWidth / 2,
      right: categorySpacing * (index + 1) + config.areaWidth / 2
    };
  });

  // 添加X轴刻度标签
  categories.forEach(category => {
    const x = areaPositions[category].center;
    const areaData = data[category];
    
    // 领域名称
    svg.append('text')
      .attr('x', x)
      .attr('y', chartHeight + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .style('fill', areaData.color)
      .text(category);
    
    // 统计信息
    svg.append('text')
      .attr('x', x)
      .attr('y', chartHeight + 60)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#4a5568')
      .text(`Total: ${areaData.total.toLocaleString()}`);
    
    svg.append('text')
      .attr('x', x)
      .attr('y', chartHeight + 75)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', areaData.color)
      .text(`AI: ${areaData.aiPapers.toLocaleString()}`);
  });

  // 工具提示
  const tooltip = d3.select('body').append('div')
    .attr('class', 'swarm-tooltip')
    .style('position', 'absolute')
    .style('padding', '12px 16px')
    .style('background-color', 'white')
    .style('color', '#1a202c')
    .style('border-radius', '6px')
    .style('font-size', '13px')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('transition', 'opacity 0.2s')
    .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.15)')
    .style('z-index', '100')
    .style('min-width', '220px')
    .style('border', '1px solid #e2e8f0');

  /**
   * 生成修正后的条形布局点
   * 每行最多12个点，从下往上排列
   * 非AI点在最顶部行，AI点从底部开始填满
   * 留白在最上面一行
   */
  function generatePointsBarFixed(totalDots, aiDots, centerX, areaData) {
    if (totalDots === 0) return { aiPoints: [], nonAiPoints: [] };
    
    const aiPoints = [];
    const nonAiPoints = [];
    const nonAiDots = totalDots - aiDots;
    
    console.log(`\n=== ${areaData.label} ===`);
    console.log(`总点数: ${totalDots} (AI: ${aiDots}, 非AI: ${nonAiDots})`);
    
    // 计算需要的行数
    const totalRows = Math.ceil(totalDots / config.maxDotsPerRow);
    const nonAiRows = Math.ceil(nonAiDots / config.maxDotsPerRow);
    const aiRows = totalRows - nonAiRows;
    
    console.log(`总行数: ${totalRows}, 非AI行数: ${nonAiRows}, AI行数: ${aiRows}`);
    
    // 生成点的二维数组
    const allDots = new Array(totalRows).fill(null).map(() => 
      new Array(config.maxDotsPerRow).fill(null)
    );
    
    let dotIndex = 0;
    let currentRow = 0;
    let currentCol = 0;
    
    // 1. 首先放置所有点（AI+非AI），但暂时不区分类型
    for (let i = 0; i < totalDots; i++) {
      allDots[currentRow][currentCol] = dotIndex;
      dotIndex++;
      currentCol++;
      
      if (currentCol >= config.maxDotsPerRow) {
        currentCol = 0;
        currentRow++;
      }
    }
    
    console.log(`填充网格: ${totalDots}个点放入${totalRows}行`);
    
    // 2. 从顶部开始标记AI点（原逻辑是标记非AI，现在调换）
    let aiCount = 0;
    for (let row = 0; row < totalRows && aiCount < aiDots; row++) {
      for (let col = 0; col < config.maxDotsPerRow; col++) {
        if (aiCount >= aiDots) break;
        
        if (allDots[row][col] !== null) {
          allDots[row][col] = { type: 'ai', index: aiCount };
          aiCount++;
        }
      }
    }
    
    // 3. 从底部开始标记非AI点（原逻辑是标记AI，现在调换）
    let nonAiCount = 0;
    for (let row = totalRows - 1; row >= 0 && nonAiCount < nonAiDots; row--) {
      for (let col = 0; col < config.maxDotsPerRow; col++) {
        if (nonAiCount >= nonAiDots) break;
        
        if (allDots[row][col] === null) {
          continue;
        }
        
        if (allDots[row][col].type !== 'ai') {
          allDots[row][col] = { type: 'nonAI', index: nonAiCount };
          nonAiCount++;
        }
      }
    }
    
    console.log(`已标记: ${aiCount}个AI点, ${nonAiCount}个非AI点`);
    
    // 4. 生成最终点位置（类型对应关系不变）
    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < config.maxDotsPerRow; col++) {
        const dot = allDots[row][col];
        
        if (dot !== null && dot !== undefined) {
          // 计算Y坐标（从底部开始）
          const rowY = chartHeight - (row + 0.5) * config.verticalSpacing;
          
          // 计算X坐标
          const rowWidth = (config.maxDotsPerRow - 1) * config.horizontalSpacing;
          const startX = centerX - rowWidth / 2;
          const x = startX + col * config.horizontalSpacing;
          
          const point = {
            x: x + (Math.random() - 0.5) * 0.3,
            y: rowY + (Math.random() - 0.5) * 0.5,
            category: areaData.label,
            row: totalRows - row, // 行号（从底部开始为1）
            papers: dot.type === 'nonAI' ? areaData.nonAiPapers : areaData.aiPapers
          };
          
          if (dot.type === 'nonAI') {
            nonAiPoints.push({ ...point, type: 'Non-AI' });
          } else {
            aiPoints.push({ ...point, type: 'AI' });
          }
        }
      }
    }
    
    // 统计验证
    const filledDots = aiPoints.length + nonAiPoints.length;
    const emptySpots = totalRows * config.maxDotsPerRow - filledDots;
    
    console.log(`放置结果: AI点=${aiPoints.length}, 非AI点=${nonAiPoints.length}, 总点数=${filledDots}`);
    console.log(`空位: ${emptySpots} (都在最上面${Math.floor(emptySpots / config.maxDotsPerRow)}行)`);
    
    return { aiPoints, nonAiPoints };
  }

  // 绘制每个领域的数据
  categories.forEach(category => {
    const areaData = data[category];
    const centerX = areaPositions[category].center;
    
    // 中心线
    svg.append('line')
      .attr('x1', centerX)
      .attr('x2', centerX)
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,2');
    
    // 计算需要的点数
    const aiDots = Math.ceil(areaData.aiPapers / config.papersPerDot);
    const nonAiDots = Math.ceil(areaData.nonAiPapers / config.papersPerDot);
    const totalDots = aiDots + nonAiDots;
    
    console.log(`\n=== ${category} 计算 ===`);
    console.log(`论文: 总=${areaData.total}, AI=${areaData.aiPapers}, 非AI=${areaData.nonAiPapers}`);
    console.log(`点数: 总=${totalDots}, AI=${aiDots}, 非AI=${nonAiDots}`);
    console.log(`比例: AI=${((aiDots/totalDots)*100).toFixed(1)}%, 非AI=${((nonAiDots/totalDots)*100).toFixed(1)}%`);
    
    // 生成点
    const points = generatePointsBarFixed(totalDots, aiDots, centerX, areaData);
    
    // 绘制AI论文点
    svg.selectAll(`.ai-dot-${category}`)
      .data(points.aiPoints)
      .enter().append('circle')
      .attr('class', `swarm-dot ai-dot ${category}`)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', config.dotRadius)
      .attr('fill', areaData.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.85)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', 1.5)
          .attr('stroke', 'white');
        
        tooltip
          .style('opacity', 1)
          .html(`
            <div style="font-weight: 600; font-size: 14px; color: ${areaData.color}; margin-bottom: 8px;">${areaData.label}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #4a5568;">AI Papers:</span>
              <span style="font-weight: 600; color: ${areaData.color};">${areaData.aiPapers.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #4a5568;">Non-AI Papers:</span>
              <span style="font-weight: 600;">${areaData.nonAiPapers.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
              <span style="font-weight: 600;">Total:</span>
              <span style="font-weight: 600;">${areaData.total.toLocaleString()}</span>
            </div>
            <div style="font-size: 11px; color: #a0aec0; margin-top: 4px;">1 dot = ${config.papersPerDot} papers</div>
            <div style="font-size: 11px; color: #a0aec0; margin-top: 2px;">行: ${d.row}</div>
          `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.85)
          .attr('stroke-width', 0.5);
        tooltip.style('opacity', 0);
      });
    
    // 绘制非AI论文点
    svg.selectAll(`.nonai-dot-${category}`)
      .data(points.nonAiPoints)
      .enter().append('circle')
      .attr('class', `swarm-dot nonai-dot ${category}`)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', config.dotRadius)
      .attr('fill', 'white')
      .attr('stroke', areaData.color)
      .attr('stroke-width', 2)
      .attr('opacity', 0.85)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', 2.5);
        
        tooltip
          .style('opacity', 1)
          .html(`
            <div style="font-weight: 600; font-size: 14px; color: ${areaData.color}; margin-bottom: 8px;">${areaData.label}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #4a5568;">Non-AI Papers:</span>
              <span style="font-weight: 600;">${areaData.nonAiPapers.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #4a5568;">AI Papers:</span>
              <span style="font-weight: 600; color: ${areaData.color};">${areaData.aiPapers.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
              <span style="font-weight: 600;">Total:</span>
              <span style="font-weight: 600;">${areaData.total.toLocaleString()}</span>
            </div>
            <div style="font-size: 11px; color: #a0aec0; margin-top: 4px;">1 dot = ${config.papersPerDot} papers</div>
            <div style="font-size: 11px; color: #a0aec0; margin-top: 2px;">行: ${d.row}</div>
          `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.85)
          .attr('stroke-width', 2);
        tooltip.style('opacity', 0);
      });
  });

  // 创建图例
  const legendGroup = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${chartWidth - 180}, 20)`);

  // 图例标题
  legendGroup.append('text')
    .attr('x', 0)
    .attr('y', -10)
    .style('font-size', '12px')
    .style('font-weight', '600')
    .style('fill', '#4a5568')
    .text('图例');

  // AI论文图例
  const colors = ['#3182ce', '#38a169', '#805ad5', '#dd6b20'];
  const categoriesForLegend = ['CV', 'NLP', 'HCI', 'SE'];
  
  categoriesForLegend.forEach((cat, i) => {
    legendGroup.append('circle')
      .attr('cx', i * 25)
      .attr('cy', 10)
      .attr('r', 6)
      .attr('fill', colors[i])
      .attr('stroke', 'white')
      .attr('stroke-width', 1);
  });

  legendGroup.append('text')
    .attr('x', 100)
    .attr('y', 14)
    .style('font-size', '12px')
    .style('fill', '#4a5568')
    .text('AI 论文 (实心)');

  // 非AI论文图例
  categoriesForLegend.forEach((cat, i) => {
    legendGroup.append('circle')
      .attr('cx', i * 25)
      .attr('cy', 35)
      .attr('r', 6)
      .attr('fill', 'white')
      .attr('stroke', colors[i])
      .attr('stroke-width', 2);
  });

  legendGroup.append('text')
    .attr('x', 100)
    .attr('y', 39)
    .style('font-size', '12px')
    .style('fill', '#4a5568')
    .text('非AI论文 (空心)');

  // 统计信息
  const statsGroup = svg.append('g')
    .attr('class', 'stats')
    .attr('transform', `translate(${20}, 20)`);

  statsGroup.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .style('font-size', '12px')
    .style('fill', '#4a5568')
    .text(`每个点代表约 ${config.papersPerDot} 篇论文`);

  statsGroup.append('text')
    .attr('x', 0)
    .attr('y', 20)
    .style('font-size', '12px')
    .style('fill', '#4a5568')
    .style('font-style', 'normal')
    .text('数据来源: 2015-2025年研究论文趋势');

  // 调试信息
  const debugGroup = svg.append('g')
    .attr('class', 'debug-info')
    .attr('transform', `translate(${20}, 50)`);

  statsGroup.append('text')
    .attr('x', 0)
    .attr('y', 40)
    .style('font-size', '11px')
    .style('fill', '#718096')

  console.log('\n✅ 修正后的条形布局蜂群图生成成功！');
  console.log('关键修改:');
  console.log('1. AI点从底部开始填充');
  console.log('2. 非AI点从顶部开始放置');
  console.log('3. 留白在最上面一行（如果需要）');
  console.log('4. 确保每行最多12个点');
}