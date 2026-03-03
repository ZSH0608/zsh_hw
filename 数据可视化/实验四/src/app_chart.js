    /**
 * @param {string} containerId - 目标 DOM 容器的 ID (例如, 'app-chart-1')
 * @param {Array<Object>} appData - 经过聚合的 App 使用数据
 * @param {string} appName - App 名称 (用作图表标题)
 */
function drawAppRadialChart(containerId, appData, appName) {
    const container = d3.select(`#${containerId}`);
    
    if (container.empty()) {
        console.error(`错误: 找不到容器 #${containerId}`);
        return;
    }

    // ----------------------------------------------------
    //比例尺和常量定义
    // ----------------------------------------------------

    // 时辰名称和时间范围
    const SHICHEN_NAMES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    const SHICHEN_RANGES = [
        "23:00-1:00", "1:00-3:00", "3:00-5:00", "5:00-7:00", 
        "7:00-9:00", "9:00-11:00", "11:00-13:00", "13:00-15:00", 
        "15:00-17:00", "17:00-19:00", "19:00-21:00", "21:00-23:00"
    ];
    const DATE_COLORS = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2"]; 
    // SVG 尺寸和边距设置
    const margin = { top: 80, right: 100, bottom: 100, left: 180 };
    const width = 1000;
    const height = 500;
    const innerRadius = 40;
    const outerRadius = Math.min(width - margin.left - margin.right, 
                                  height - margin.top - margin.bottom) / 2;
    
    // 计算中心点
    const centerX = margin.left + outerRadius+80;
    const centerY = margin.top + outerRadius;
    // 半径比例尺
    const maxDuration = d3.max(appData, d => d.durationMinutes) || 1;

    ///////////////////////////比例尺咋选？？？？？？？？？？？？？？？？？？？？？？？
    /*const rScale = d3.scaleSqrt()
        .domain([0, maxDuration])
        .range([innerRadius, outerRadius]);
    */
    const rScale = d3.scaleLinear()
        .domain([0, 60]) 
        .range([innerRadius, outerRadius]);

    // 颜色比例尺
    const dates = Array.from(new Set(appData.map(d => d.date))).sort(); 
    const colorScale = d3.scaleOrdinal()
        .domain(dates)
        .range(DATE_COLORS);

    // 外层角度比例尺
    const phiScale = d3.scaleBand()
        .domain(SHICHEN_NAMES) 
        .range([0, 2 * Math.PI]) 
        .align(0);

    // 内层角度比例尺
    const subPhiScale = d3.scaleBand()
        .domain(dates) 
        .range([0, phiScale.bandwidth()]) 
        .paddingInner(0.1); 

    // ----------------------------------------------------
    // 创建 SVG 容器
    // ----------------------------------------------------
    container.html(''); 

    // 创建 SVG 元素并移动到中心
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${centerX}, ${centerY})`);    

    // 绘制同心圆网格
    const tickInterval = 10; 
    const tickValues = d3.range(tickInterval, maxDuration + tickInterval, tickInterval);
    //tickValues.pop();
    const gridGroup = svg.append("g").attr("class", "grid-circles");
    
    gridGroup.selectAll("circle")
        .data(tickValues)
        .join("circle")
        .attr("r", d => rScale(d))
        .attr("fill", "none")
        .attr("stroke", "#d0d0d0") 
        .attr("stroke-dasharray", "2 4") 
        .attr("stroke-width", 0.8); 
    
    // 同心圆的10min标注
    gridGroup.selectAll("text")
        .data(tickValues)
        .join("text")
        .attr("x", -8)
        .attr("y", d => -rScale(d)) 
        .attr("dy", "-0.3em") 
        .attr("text-anchor", "middle")
        .style("font-size", "8px")
        .style("fill", "#999")
        .style("font-weight", "500")
        .text(d => d + "m");

    const arcGenerator = d3.arc()
        .startAngle(d => phiScale(SHICHEN_NAMES[d.shichenIndex]) + subPhiScale(d.date))
        .endAngle(d => phiScale(SHICHEN_NAMES[d.shichenIndex]) + subPhiScale(d.date) + subPhiScale.bandwidth())
        .innerRadius(innerRadius)
        .outerRadius(d => rScale(d.durationMinutes));

    const chartGroup = svg.append("g").attr("class", "data-arcs");

    chartGroup.selectAll(".data-arc")
        .data(appData)
        .join("path")
        .attr("class", "data-arc")
        .attr("fill", d => colorScale(d.date)) 
        .attr("d", arcGenerator)
        .attr("opacity", 0.8)
        .style("stroke", "#fff")
        .style("stroke-width", 0.5)
        .on("mouseover", handleMouseOver) 
        .on("mouseout", handleMouseOut); 

    // ----------------------------------------------------
    // Hover 提示框
    // ----------------------------------------------------

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")  
        .style("pointer-events", "none"); 
    function handleMouseOver(event, d) {
        // 高亮当前弧
        d3.select(this)
            .attr("opacity", 1.0)
            .style("stroke", "#333")
            .style("stroke-width", 1.5);
        // 显示提示框
        tooltip.transition()
            .duration(200)
            .style("opacity", 0.95);
            
        tooltip.html(`
            <div class="tooltip-date">${d.date} (${d.dayOfWeek})</div>
            <div class="tooltip-value">使用时长: ${d.durationMinutes} 分钟</div>
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    }


    function handleMouseOut(event, d) {
        // 恢复原始样式
        d3.select(this)
            .attr("opacity", 0.8)
            .style("stroke", "#fff")
            .style("stroke-width", 0.5);
        // 隐藏提示框
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }
    
    
    const gapAngle = 0.02 * phiScale.bandwidth(); 
    
    const ticks = SHICHEN_NAMES.map((name, i) => {
        // 计算每个时辰的中心角度
        const centerAngle = phiScale(name) + phiScale.bandwidth() / 2;
        
        return {
            name: SHICHEN_RANGES[i], // 使用时间段作为标注名称
            angle: centerAngle,
            // 调整结束角度以创建断点
            startAngle: phiScale(name),
            endAngle: phiScale(name) + phiScale.bandwidth() - gapAngle 
        };
    });
    
    // 2. 绘制时辰分隔圆弧
    const arcRadius = outerRadius + 10;
    const labelArc = d3.arc()
        .innerRadius(arcRadius) 
        .outerRadius(arcRadius); 
        
    svg.append("g")
        .attr("class", "shichen-arcs")
        .selectAll("path")
        .data(ticks)
        .join("path")
        .attr("d", d => labelArc({ startAngle: d.startAngle, endAngle: d.endAngle })) // 使用带断点的角度
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 2); 

    // 绘制时辰标注文本 (垂直于半径，旋转 90 度)
    svg.append("g")
        .attr("class", "shichen-labels")
        .selectAll("g")
        .data(ticks)
        .join("g")
        .attr("transform", d => {
            // 计算文本位置的半径
            const textRadius = outerRadius + 20; 
            
            // 计算文本的 (x, y) 坐标
            const x = textRadius * Math.cos(d.angle - Math.PI / 2);
            const y = textRadius * Math.sin(d.angle - Math.PI / 2);
            
            return `translate(${x},${y})`;
        })
        .call(g => g.append("text")
            .attr("dy", "0.31em")
            .attr("text-anchor", "middle") // 居中对齐
            .attr("transform", d => {
                let angleDeg = d.angle * 180 / Math.PI - 90;
                
                // 使文本垂直于半径
                let rotation = angleDeg + 90; 
                
                // 如果在下半圆 (90 到 270 度)，则翻转 180 度，保证文字朝向读者
                if (rotation > 90 && rotation < 270) {
                    rotation += 180; 
                }
                return `rotate(${rotation})`;
            })
            .text(d => d.name) 
            .style("font-size", "11px")
            .style("fill", "#666"));

    // ----------------------------------------------------
    // 标题、中心圆环和图例 
    // ----------------------------------------------------

    // 中心圆环 
    svg.append("circle")
        .attr("r", innerRadius)
        .attr("fill", "#f8f8f8")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);

    const logoSize = innerRadius * 1.5; // Logo 尺寸为中心圆半径的 1.5 倍
    const logoGroup = svg.append("g")
        .attr("class", "app-logo")
        .attr("transform", `translate(${-logoSize/2}, ${-logoSize/2})`); // 居中对齐

    // 根据 appName 插入不同的 logo
    if (appName === "微信") {
        // 微信 Logo - 绿色背景
        logoGroup.append("circle")
            .attr("cx", logoSize/2)
            .attr("cy", logoSize/2)
            .attr("r", innerRadius * 0.9)
            .attr("fill", "#07C160");
        
        // 微信 SVG 路径（白色）
        logoGroup.append("path")
            .attr("d", "M18.574 13.711a.91.91 0 0 0 .898-.898c0-.498-.399-.898-.898-.898s-.898.4-.898.898c0 .5.4.898.898.898zm-4.425 0a.91.91 0 0 0 .898-.898c0-.498-.4-.898-.898-.898-.5 0-.898.4-.898.898 0 .5.399.898.898.898zm6.567 5.04a.347.347 0 0 0-.172.37c0 .048 0 .097.025.147.098.417.294 1.081.294 1.106 0 .073.025.122.025.172a.22.22 0 0 1-.221.22c-.05 0-.074-.024-.123-.048l-1.449-.836a.799.799 0 0 0-.344-.098c-.073 0-.147 0-.196.024-.688.197-1.4.295-2.161.295-3.66 0-6.607-2.457-6.607-5.505 0-3.047 2.947-5.505 6.607-5.505 3.659 0 6.606 2.458 6.606 5.505 0 1.647-.884 3.146-2.284 4.154zM16.673 8.099a9.105 9.105 0 0 0-.28-.005c-4.174 0-7.606 2.86-7.606 6.505 0 .554.08 1.09.228 1.6h-.089a9.963 9.963 0 0 1-2.584-.368c-.074-.025-.148-.025-.222-.025a.832.832 0 0 0-.418.123l-1.748 1.005c-.05.025-.099.05-.148.05a.273.273 0 0 1-.27-.27c0-.074.024-.123.049-.197.024-.024.246-.834.369-1.324 0-.05.024-.123.024-.172a.556.556 0 0 0-.221-.442C2.058 13.376 1 11.586 1 9.598 1 5.945 4.57 3 8.95 3c3.765 0 6.93 2.169 7.723 5.098zm-5.154.418c.573 0 1.026-.477 1.026-1.026 0-.573-.453-1.026-1.026-1.026s-1.026.453-1.026 1.026.453 1.026 1.026 1.026zm-5.26 0c.573 0 1.027-.477 1.027-1.026 0-.573-.454-1.026-1.027-1.026-.572 0-1.026.453-1.026 1.026s.454 1.026 1.026 1.026z")
            .attr("fill", "white")
            .attr("transform", `scale(${logoSize/24})`); // 原 SVG viewBox 是 24x24
            
    } else if (appName === "哔哩哔哩") {
        // B站 Logo - 粉色背景
        logoGroup.append("circle")
            .attr("cx", logoSize/2)
            .attr("cy", logoSize/2)
            .attr("r", innerRadius * 0.9)
            .attr("fill", "#FB7299");
        
        // B站 SVG 路径（白色）
        logoGroup.append("path")
            .attr("d", "M7.172 2.757L10.414 6h3.171l3.243-3.242a1 1 0 0 1 1.415 1.415l-1.829 1.827L18.5 6A3.5 3.5 0 0 1 22 9.5v8a3.5 3.5 0 0 1-3.5 3.5h-13A3.5 3.5 0 0 1 2 17.5v-8A3.5 3.5 0 0 1 5.5 6h2.085L5.757 4.171a1 1 0 0 1 1.415-1.415zM18.5 8h-13a1.5 1.5 0 0 0-1.493 1.356L4 9.5v8a1.5 1.5 0 0 0 1.356 1.493L5.5 19h13a1.5 1.5 0 0 0 1.493-1.356L20 17.5v-8A1.5 1.5 0 0 0 18.5 8zM8 11a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1zm8 0a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1z")
            .attr("fill", "white")
            .attr("transform", `scale(${logoSize/24})`); 
    }else if (appName === "小红书") {
        // 小红书 Logo - 红色背景
        
        logoGroup.append("circle")
            .attr("cx", logoSize/2)
            .attr("cy", logoSize/2)
            .attr("r", innerRadius * 0.9)
            .attr("fill", "#FF2442");
        
        // 小红书 SVG 路径（白色）
        
        d3.svg("src/data/xiaohongshu-seeklogo.svg").then(data => {
            const svgNode = data.documentElement;
            
            // 获取原始 SVG 的 viewBox
            const viewBox = svgNode.getAttribute("viewBox");
            const [vbX, vbY, vbWidth, vbHeight] = viewBox ? viewBox.split(" ").map(Number) : [0, 0, 100, 100];
            
            // 计算缩放比例（使 logo 适配 logoSize）
            const scale = (logoSize * 0.8) / Math.max(vbWidth, vbHeight);
            const logoContainer = logoGroup.append("g")
                .attr("transform", `translate(${logoSize/2 - (vbWidth * scale)/2}, ${logoSize/2 - (vbHeight * scale)/2}) scale(${scale})`);
            
            Array.from(svgNode.children).forEach(child => {
                logoContainer.node().appendChild(child.cloneNode(true));
            });
            
            // 使用 CSS 滤镜实现反色（红变白）
            //logoContainer.style("filter", "invert(9) brightness(7)");
            logoContainer.style("filter", "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(93deg) brightness(105%) contrast(101%)");
            
           
        }).catch(error => {
            console.error("小红书 SVG 加载失败:", error);

            logoGroup.append("text")
                .attr("x", logoSize/2)
                .attr("y", logoSize/2 + logoSize * 0.15)
                .attr("text-anchor", "middle")
                .attr("font-size", logoSize * 0.35)
                .attr("font-weight", "900")
                .attr("font-family", "Arial, sans-serif")
                .attr("fill", "white")
                .text("R");
        });
        //*/
        
    }

    /////////////////////////////////////////////// 标题 (App 名称)
    svg.append("text")
        .attr("class", "chart-title")
        .attr("text-anchor", "middle")
        .attr("y", outerRadius + 70)
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#333")
        .text(appName);

    /////////////////////////////////////////////////////////////// 注释
    // 计算每天的总使用时长
    const dailyTotals = d3.rollup(
        appData,
        v => d3.sum(v, d => d.durationMinutes),
        d => d.date
    );
    
    // 计算一周的平均使用时长
    const totalMinutes = d3.sum(appData, d => d.durationMinutes);
    const numberOfDays = dailyTotals.size;
    const averageMinutesPerDay = totalMinutes / numberOfDays;
    
    const annotationGroup = svg.append("text")
        .attr("class", "chart-subtitle")
        .attr("text-anchor", "start")
        .attr("x", -outerRadius - 120)
        .attr("y", -10) 
        .style("font-size", "14px")
        .style("fill", "#666");
    
    // 第一行: 一周总计
    annotationGroup.append("tspan")
        .attr("x", -outerRadius - 150)
        .attr("dy", "0")
        .text(`一周总计: ${d3.format(".1f")(totalMinutes / 60)}h`);
    
    // 第二行: 每天平均
    annotationGroup.append("tspan")
        .attr("x", -outerRadius - 150)
        .attr("dy", "1.2em") // 行间距
        .text(`每天平均: ${d3.format(".1f")(averageMinutesPerDay / 60)}h`);

    // 绘制图例 - 日期颜色和总时长
    
    // 1. 聚合每位日期的总时长
    const dateTotalUsage = d3.rollup(
        appData, 
        v => ({
            totalDuration: d3.sum(v, d => d.durationMinutes), // 总时长（分钟）
            dayOfWeek: v[0].dayOfWeek // 取第一条记录的星期信息
        }),
        d => d.date,
    );
    
    // 2. 创建图例所需的数据结构 (包含日期、星期、总时长和颜色)
    const legendData = Array.from(dateTotalUsage, ([date, data]) => {
        return {
            date: date,
            dayOfWeek: data.dayOfWeek,
            totalDuration: data.totalDuration, // 单位：分钟
            color: colorScale(date)
        };
    }).sort((a, b) => d3.ascending(a.date, b.date)); // 按日期排序

    console.log("图例数据:", legendData); // 调试用

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${outerRadius + 140}, ${-outerRadius})`);

    legend.selectAll(".legend-item")
        .data(legendData)
        .join("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        .call(g => g.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", d => d.color))
        .call(g => g.append("text")
            .attr("x", 15)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("font-size", "12px")
            .text(d => {
                // 将分钟转换为小时
                const hours = d3.format(".1f")(d.totalDuration / 60);
                const [year, month, day] = d.date.split('-');
                const shortDate = `${month}/${day}`;
                
                return `${shortDate} (${d.dayOfWeek}) | ${hours}h`;
            }));
}
