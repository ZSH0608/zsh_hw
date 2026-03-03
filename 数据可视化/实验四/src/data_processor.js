/**
 * 数据处理模块
 * 负责系列1和系列2的数据预处理
 */

// 时辰
const SHICHEN_NAMES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const SHICHEN_RANGES = [
    "23:00-01:00", "01:00-03:00", "03:00-05:00", "05:00-07:00", 
    "07:00-09:00", "09:00-11:00", "11:00-13:00", "13:00-15:00", 
    "15:00-17:00", "17:00-19:00", "19:00-21:00", "21:00-23:00"
];

/**
 * 小时转时辰索引
 * @param {number} hour - 24小时制小时数
 * @returns {number} 时辰索引 (0-11)
 */

function getShiChenIndex(hour) {
    if (hour === 23 || hour === 0) {
        return 0; // 子时
    } else {
        return Math.floor((hour + 1) / 2);
    }
}

/**
 * 系列1-----：App使用数据
 * @param {Object} rawData - 原始JSON数据
 * @returns {Map} 按App分组的数据
 */
async function processSeries1Data(rawData) {
    if (!rawData || !rawData.data) {
        console.error("Raw data format is incorrect, missing 'data' field.");
        return new Map();
    }
    
    const parsedData = [];
    // 遍历每天的数据
    rawData.data.forEach(dayData => {
        const dateString = dayData.date || "2025-10-01"; 
        const dateObj = new Date(dateString); 
        
        if (isNaN(dateObj.getTime())) {
            console.warn(`Could not parse date: ${dateString}. Skipping this record.`);
            return;
        }

        // 获取星期几
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const dayOfWeek = weekdays[dateObj.getDay()];
        const formattedDate = d3.timeFormat("%Y-%m-%d")(dateObj);

        // 遍历 apps 数组
        dayData.apps.forEach(app => {
            const appName = app.appName;
            
            // 遍历 hourlyUsage 对象
            for (const hourStr in app.hourlyUsage) {
                const hour = parseInt(hourStr);
                const durationSeconds = app.hourlyUsage[hourStr];
                const durationMinutes = Math.round(durationSeconds / 60);

                if (durationMinutes > 0) {
                    const shichenIndex = getShiChenIndex(hour);
                    
                    parsedData.push({
                        appName,
                        date: formattedDate,
                        dayOfWeek: dayOfWeek,
                        shichenIndex: shichenIndex,
                        timeRange: SHICHEN_RANGES[shichenIndex],
                        durationMinutes: durationMinutes,
                        hour: hour
                    });
                }
            }
        });
    });

    console.log("解析后的原始数据（前 10 条）:", parsedData.slice(0, 10));

    // 聚合：按 App、日期、时辰分组
    const aggregatedMap = d3.rollup(parsedData,
        v => ({
            durationMinutes: d3.sum(v, d => d.durationMinutes),
            dayOfWeek: v[0].dayOfWeek,
            timeRange: v[0].timeRange
        }),
        d => d.appName,
        d => d.date,
        d => d.shichenIndex
    );

    // 转换为扁平数组
    const finalData = [];
    for (const [appName, dateMap] of aggregatedMap) {
        for (const [date, shichenMap] of dateMap) {
            for (const [shichenIndex, aggregated] of shichenMap) {
                finalData.push({
                    appName,
                    date,
                    shichenIndex,
                    durationMinutes: aggregated.durationMinutes,
                    dayOfWeek: aggregated.dayOfWeek,
                    timeRange: aggregated.timeRange
                });
            }
        }
    }
    
    console.log(`聚合后的数据总数: ${finalData.length} 条`);
    console.log("聚合后的数据（前 10 条）:", finalData.slice(0, 10));

    // 按 App 分组
    return d3.group(finalData, d => d.appName);
}

/**
 * 系列2---------------数据预处理
 * （如果需要额外处理，可以在这里添加）
 * @param {Array} rawData - CSV原始数据
 * @returns {Array} 处理后的数据
 */
function processSeries2Data(rawData) {
    return rawData;
}

