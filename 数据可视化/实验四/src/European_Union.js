class European_Union_Chart {
    /**
     * @param {string} selector 
     * @param {Array<Object>} rawData 
     */
    constructor(selector, rawData) {
        this.selector = selector;
        this.rawData = rawData;
        this.margin = { top: 60, right: 30, bottom: 150, left: 90 };
        this.width = 960 - this.margin.left - this.margin.right;
        this.height = 700 - this.margin.top - this.margin.bottom;
        this.chartData = this.processData(rawData); 
    }
    initChart() {
        d3.select(this.selector).html("");
        
        // 创建主SVG容器
        this.svg = d3.select(this.selector)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top+30})`);

        // 创建工具提示 (Tooltip) 元素
        this.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }
    /**
     * 1. 数据预处理：计算每个事件的累计面积、起始点和终止点。
     * @param {Array<Object>} data 原始数据
     * @returns {Array<Object>} 包含 'start_area', 'end_area' 的新数据数组
     */

    processData(data) {
        let currentTotalArea = 0;
        const processed = [];

        for (const d of data) {
            const areaChange = +d.area_change_km2; 
            const coreArea = +d.core_area_km2;
            const nonCoreArea = +d.non_core_area_km2;
            const type = d.type;

            if (type === 'total') {
                d.start_area = 0;
                d.end_area = +d.area_change_km2; // 'total'行area_change_km2即为最终总面积
               
            }
            // 创始国起始
            else if (type === 'start') {
                d.start_area = 0;
                d.end_area = areaChange;
                currentTotalArea = areaChange;
            }
            // 增加 (add) 或 减少 (sub)
            else {
                d.start_area = currentTotalArea;
                // 更新累计面积
                currentTotalArea += areaChange;
                d.end_area = currentTotalArea;

            }

            // 确定条形绘制方向和颜色类型
            d.core_area = coreArea;
            d.non_core_area = nonCoreArea;
            d.bar_direction = (areaChange > 0) ? 'up' : ((areaChange < 0) ? 'down' : 'flat');
            d.bar_type = type; // 用于颜色编码：'add', 'sub', 'start', 'total'
            d.area_change_m_km2 = areaChange / 1000000; 
            d.accumulated_area = d.end_area / 1000000; 

            processed.push(d);
        }

        return processed;
    }
    createScales() {
        
        // X 轴比例尺
        const xDomain = this.chartData.map(d => `${d.year}: ${d.event}`);
        this.xScale = d3.scaleBand()
            .domain(xDomain)
            .range([0, this.width])
            .padding(0.3);

        // Y 轴比例尺
        const maxArea = d3.max(this.chartData, d => Math.max(d.start_area, d.end_area));
        const minArea = d3.min(this.chartData, d => Math.min(d.start_area, d.end_area));

        this.yScale = d3.scaleLinear()
            .domain([minArea / 1000000 * 1.1, maxArea / 1000000 * 1.1])
            .range([this.height, 0]);
    }
            
    /**
      绘制坐标轴和网格线
     */
    drawAxes() {
        // X 轴
        const xAxis = d3.axisBottom(this.xScale)
            .tickFormat(d => d); 

        this.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.height})`)
            // .attr("transform", `translate(${this.width-80 }, -60)`); // 放置在图表右上角
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)") // 旋转标签
            .style("text-anchor", "end")
            .style("font-size", "10px")
            .attr("dx", "-.8em")
            .attr("dy", ".15em");

        // Y 轴
        const yAxis = d3.axisLeft(this.yScale)
            .tickFormat(d => d); // 百万平方公里

        this.svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        // Y轴标签
        this.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left)
            .attr("x", 0 - (this.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("面积 (百万平方公里)"); 

        // 水平网格线
        this.svg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(this.yScale)
                .tickSize(-this.width)
                .tickFormat("")
            )
            .selectAll(".tick line") 
            .attr("stroke-dasharray", "4 4");
    }

    /**
     绘制堆叠图条形
     */
    drawBars() {
    const xScale = this.xScale;
    const yScale = this.yScale;

    //  核心国 深色
    const coreColor = d3.scaleOrdinal()
        .domain(['add', 'sub', 'start', 'total'])
        .range(['#4A90A4', '#4A90A4', '#4A90A4', '#4A90A4']);
        //.range(['#4A90A4', '#4A90A4', '#2C5F6F', '#2C5F6F']);

    //  非核心国 浅色
    const nonCoreColor = d3.scaleOrdinal()
        .domain(['add', 'sub', 'start', 'total'])
        .range(['#A8D5E2', '#A8D5E2', '#A8D5E2', '#A8D5E2']);
        //.range(['#A8D5E2', '#A8D5E2', '#7FA8B8', '#7FA8B8']);

    // ============================================
    // 绘制核心国条形
    // ============================================
    this.svg.selectAll(".bar-core")
        .data(this.chartData)
        .enter().append("rect")
        .attr("class", d => `bar bar-core bar-${d.bar_type}`)
        .attr("x", d => xScale(`${d.year}: ${d.event}`))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d.core_area / 1000000))
        .attr("height", d => this.height - yScale(d.core_area / 1000000))
        .attr("fill", d => coreColor(d.bar_type))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .on("mouseover", (event, d) => this.showTooltip(event, d, 'core'))
        .on("mousemove", (event) => this.moveTooltip(event))
        .on("mouseout", () => this.hideTooltip());

    // ============================================
    // 绘制非核心国条形
    // ============================================
    this.svg.selectAll(".bar-non-core")
        .data(this.chartData)
        .enter().append("rect")
        .attr("class", d => `bar bar-non-core bar-${d.bar_type}`)
        .attr("x", d => xScale(`${d.year}: ${d.event}`))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d.end_area / 1000000)) 
        .attr("height", d => {
            const totalHeight = this.height - yScale(d.end_area / 1000000);
            const coreHeight = this.height - yScale(d.core_area / 1000000);
            return Math.max(0, totalHeight - coreHeight); 
        })
        .attr("fill", d => nonCoreColor(d.bar_type))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .on("mouseover", (event, d) => this.showTooltip(event, d, 'non-core'))
        .on("mousemove", (event) => this.moveTooltip(event))
        .on("mouseout", () => this.hideTooltip());
}

showTooltip(event, d, areaType) {
    // 高亮当前条形
    d3.select(event.currentTarget).style("opacity", 0.7);
    
    // 高亮 x 轴标签
    const barColor = areaType === 'core' ? '#2C5F6F' : '#7FA8B8';
    d3.select(".x-axis")
        .selectAll("text")
        .filter(text => text === `${d.year}: ${d.event}`)
        .style("font-weight", "bold")
        .style("fill", barColor);

    // 构建提示框内容
    let tooltipContent = `
        <strong>${d.year}: ${d.event}</strong><br/>
        <strong>事件概要：</strong> ${d.tooltip_details}<br/>
    `;

    if (areaType === 'core') {
        tooltipContent += `
            <strong>核心国家面积：</strong> ${(d.core_area / 1000000).toFixed(2)} 百万 km²<br/>
        `;
    } else {
        tooltipContent += `
            <strong>非核心国面积：</strong> ${(d.non_core_area / 1000000).toFixed(2)} 百万 km²<br/>
        `;
    }

    tooltipContent += `<strong>总面积：</strong> ${d.accumulated_area.toFixed(2)} 百万 km²`;

    this.tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
    this.tooltip.html(tooltipContent)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY + 15) + "px");
}

moveTooltip(event) {
    this.tooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY + 15) + "px");
}

hideTooltip() {
    d3.selectAll(".bar").style("opacity", 1);
    d3.select(".x-axis").selectAll("text")
        .style("font-weight", "normal")
        .style("fill", null);
    this.tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}
   
   /*
    绘制图例 
     */
    drawLegend() {
    const legendData = [
        { type: 'add', label: '领土扩张', color: '#007A7A', shape: 'arrow-up' },
        { type: 'sub', label: '领土缩小', color: '#E04070', shape: 'arrow-down' },
        { type: 'core', label: '核心国', color: '#4A90A4', shape: 'rect' }, 
        { type: 'non-core', label: '非核心国', color: '#A8D5E2', shape: 'rect' },
    ];

    const legend = this.svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${this.width - 200}, -80)`); 

    legendData.forEach((item, i) => {
        const legendItem = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`); 

        if (item.shape === 'rect') {
            // 矩形图例
            legendItem.append("rect")
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", item.color)
                .attr("stroke", "#fff")
                .attr("stroke-width", 1);
        } else if (item.shape === 'arrow-up') {
            // 上箭头
            legendItem.append("path")
                .attr("d", "M 9 0 L 18 12 L 12 12 L 12 18 L 6 18 L 6 12 L 0 12 Z")
                .attr("fill", item.color);
        } else if (item.shape === 'arrow-down') {
            // 下箭头
            legendItem.append("path")
                .attr("d", "M 9 18 L 0 6 L 6 6 L 6 0 L 12 0 L 12 6 L 18 6 Z")
                .attr("fill", item.color);
        }

        legendItem.append("text")
            .attr("x", 25)
            .attr("y", 14)
            .text(item.label)
            .style("font-size", "13px")
            .style("fill", "#333");
    });
}

    drawDifferenceArrows() {
        const xScale = this.xScale;
        const yScale = this.yScale;
        const data = this.chartData;

        // 定义箭头标记
        const defs = this.svg.append("defs");
        
        // 上行箭头（绿色）
        defs.append("marker")
            .attr("id", "arrow-up")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 5)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "90")
            .append("path")
            .attr("d", "M 0 5 L 5 0 L 10 5 L 5 3 Z") // 向上的箭头
            .attr("fill", "#007A7A");

        // 下行箭头（红色）
        defs.append("marker")
            .attr("id", "arrow-down")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 5)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "270")
            .append("path")
            .attr("d", "M 0 5 L 5 10 L 10 5 L 5 7 Z") // 向下的箭头
            .attr("fill", "#E04070");

        // 绘制高度差辅助线和箭头
        for (let i = 1; i < data.length; i++) {
            const current = data[i];
            const previous = data[i - 1];

            if (current.bar_type === 'total') continue;

            const x1 = xScale(`${previous.year}: ${previous.event}`) + xScale.bandwidth();
            const y1 = yScale(previous.end_area / 1000000);
            const x2 = xScale(`${current.year}: ${current.event}`);
            const y2 = yScale(current.end_area / 1000000);

            // 计算高度差
            const heightDiff = current.end_area - previous.end_area;
            const isUp = heightDiff > 0;

            // 辅助线的 x 坐标（在两个条形之间）
            const midX = (x1 + x2) / 2;

            // 绘制前一个条形右端到垂直辅助线的水平线
            this.svg.append("line")
            .attr("class", "horizontal-connector-line")
            .attr("x1", x1)                    // 前一个条形右端
            .attr("y1", y1)
            .attr("x2", midX)                  // 垂直辅助线的 x 坐标
            .attr("y2", y1)
            .attr("stroke", isUp ? "#007A7A" : "#E04070")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3 3");
            
            // 绘制垂直辅助线（带箭头）
            this.svg.append("line")
                .attr("class", "difference-line")
                .attr("x1", midX)
                .attr("y1", y1)
                .attr("x2", midX)
                .attr("y2", y2)
                .attr("stroke", isUp ? "#007A7A" : "#E04070")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "3 3")
                .attr("marker-end", isUp ? "url(#arrow-up)" : "url(#arrow-down)") // 箭头在终点
                //.attr("marker-start", isUp ? "url(#arrow-down)" : "url(#arrow-up)"); // 箭头在起点（反向）

            // 添加高度差数值标签
            const labelY = (y1 + y2) / 2;
            this.svg.append("text")
                .attr("class", "difference-label")
                .attr("x", isUp ? midX - 32 : midX + 3) 
                .attr("y", labelY)
                .attr("text-anchor", "start")
                .attr("dominant-baseline", "middle")
                .style("font-size", "10px")
                .style("fill", isUp ? "#007A7A" : "#E04070")
                .style("font-weight", "bold")
                .text(`${isUp ? '+' : ''}${(heightDiff / 1000000).toFixed(2)}`);
        }
    }
   
    render() {
        this.initChart();
        this.createScales();  
        this.drawBars();
        this.drawDifferenceArrows();
        this.drawLegend();
        this.drawAxes();
    }
}