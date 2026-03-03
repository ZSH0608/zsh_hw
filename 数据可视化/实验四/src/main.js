/**
 * 主控制器
 * 负责协调数据加载和图表渲染
 */

// 数据路径配置
const DATA_PATH_SERIES1 = 'src/data/app_usage_2025-10-28_7days.json'; 
const DATA_PATH_SERIES2 = 'src/data/eu_area_evolution.csv'; 

/**
 * 初始化所有图表
 */
async function initializeCharts() {
    console.log("项目启动: 开始加载数据...");
    
    // ============================================
    // 系列1: App使用情况径向图
    // ============================================
    try {
        const rawSeries1Data = await d3.json(DATA_PATH_SERIES1);
        const appGroupedData = await processSeries1Data(rawSeries1Data); 
        
        if (appGroupedData.size === 0) {
            console.error("系列1数据为空，请检查JSON格式。");
            d3.select("#app-chart-1").html(`<p style='text-align: center; color: red;'>错误: 数据为空</p>`);
            return;
        }

        // 获取绘图函数
        const drawRadialChart = typeof drawAppRadialChart === 'function' 
            ? drawAppRadialChart 
            : window.drawAppRadialChart;

        // 绘制微信图表
        const wechatData = appGroupedData.get("微信");
        if (wechatData) {
            console.log("绘制 App 1: 微信");
            d3.select("#app-chart-1").html(""); 
            drawRadialChart("app-chart-1", wechatData, "微信");
        } else {
            d3.select("#app-chart-1").html("<p style='text-align: center; color: #666;'>未找到微信数据</p>");
        }

        // 绘制小红书图表
        const redNoteData = appGroupedData.get("小红书");
        if (redNoteData) {
            console.log("绘制 App 2: 小红书");
            d3.select("#app-chart-2").html(""); 
            drawRadialChart("app-chart-2", redNoteData, "小红书");
        } else {
            d3.select("#app-chart-2").html("<p style='text-align: center; color: #666;'>未找到小红书数据</p>");
        }

        // 绘制哔哩哔哩图表
        const bilibiliData = appGroupedData.get("哔哩哔哩");
        if (bilibiliData) {
            console.log("绘制 App 3: 哔哩哔哩");
            d3.select("#app-chart-3").html(""); 
            drawRadialChart("app-chart-3", bilibiliData, "哔哩哔哩");
        } else {
            d3.select("#app-chart-3").html("<p style='text-align: center; color: #666;'>未找到哔哩哔哩数据</p>");
        }
        
    } catch (error) {
        console.error(`系列1数据加载失败: ${DATA_PATH_SERIES1}`, error);
        d3.select("#app-chart-1").html(`
            <p style='text-align: center; color: red;'>错误: 无法加载 APP 数据。</p>
            <p style='text-align: center; font-size: 12px;'>文件路径: ${DATA_PATH_SERIES1}</p>
        `);
        d3.select("#app-chart-2").html("");
        d3.select("#app-chart-3").html("");
    }

    // ============================================
    // 系列2: 欧盟领土演变瀑布图
    // ============================================
    try {
        const euData = await d3.csv(DATA_PATH_SERIES2);
        console.log("欧盟数据加载完成:", euData);

        if (typeof European_Union_Chart !== 'undefined') {
            const euChart = new European_Union_Chart('#eu-chart', euData);
            euChart.render();
            console.log("欧盟瀑布图渲染完成。");
        } else {
            console.error("错误: European_Union_Chart 类未定义，请检查文件引入。");
            d3.select("#eu-chart").html(`
                <p style='text-align: center; color: red;'>错误: European_Union_Chart 未加载</p>
            `);
        }
    } catch (error) {
        console.error(`系列2数据加载失败: ${DATA_PATH_SERIES2}`, error);
        d3.select("#eu-chart").html(`
            <p style='text-align: center; color: red;'>错误: 无法加载欧盟数据。</p>
            <p style='text-align: center; font-size: 12px;'>文件路径: ${DATA_PATH_SERIES2}</p>
        `);
    }
}

// 启动程序
initializeCharts();