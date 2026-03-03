## Run Locally

**Prerequisites:**  Node.js
1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`/`npm start`


# 数据视角下的 AI 演进

你对AI发展的到底有多快速有概念吗？
你的工作会被取代吗？
你知道AI高速发展的背后是哪些学术领域在托举、又影响了哪些学术领域吗？


现在，请带着这些问题，走进我们的可视化项目 -- 数据视角下的 AI 演进。

## 1. 项目简介

本项目是一个基于 Web 的交互式数据可视化平台，旨在通过多图表联动和动态交互，直观地解构 **人工智能大语言模型的能力演进历程**、**高效能模型的崛起格局**、**AI 对就业市场的潜在颠覆** 以及 **学术界背后的支撑力量**。

本项目不仅仅是数据的展示，更是通过可视化回答了以下三个核心问题：
1. **格局变迁**：直观观测 AI 在性能（MMLU）与参数量上的快速演变，识别技术发展的“奇点”与“效能”转型 。
2. **职业冲击**：在 AI 能力爆发的背景下，量化分析其对不同认知与技能维度职业的颠覆性影响 。
3. **科研启示**：揭示科研论文与 AI 的极高结合率，为未来的学术研究方向提供数据支持 。

## 2. 项目文件架构

```
shushisihua/
├── index.html              # 项目入口 HTML 文件
├── package.json            # 项目依赖配置
├── README.md               # 项目说明文档
├── data/                   # 原始数据文件夹
│   ├── research-paper-stats.txt
│   └── AIOE/               # 职业影响指数数据 (按时间分文件夹)
│       ├── November 2023_data/
│       ├── ...
│       └── May 2025_data/
└── src/                    # 源代码文件夹
    ├── main.js             # 主逻辑入口，负责初始化和组件联动
    ├── style.css           # 自定义样式 (配合 Tailwind CSS)
    ├── data/
    │   └── data.js         # 图表一的数据集-- AI 模型数据 及 工具函数
    └── components/         # 可视化组件
        ├── chart1.js       # 图表一主图 -- AI大模型演进趋势图
        ├── chart2.js       # 图表一辅图 -- 模型参数量与效能对比图
        ├── chart3.js       # 图表一辅图 -- 高效能模型格局分布图
        ├── pairplot.js     # 图表二 -- 职业影响多维分析 
        └── swarmplot.js    # 图表三 -- 科研论文点图
```

项目主要包含以下可视化模块：
- **总图：AI 大模型性能演进与效能格局 (Chart 1，Chart 2，Chart 3)**: 展示各大主流研究机构 AI 模型随时间的发布情况及其智力能力 （ MMLU 得分 ），同时展示了 AI 模型“性价比”的发展（智力能力与模型参数量的关系），以及，这些高效能模型的分布格局。
通过此图，你将对当前AI大模型在能力、厂家分布、参数方面的发展趋势有一个宏观的了解 。

- **分图一：职业影响多维分析 (Pair Plot)**: 此图联动上面的智能演进趋势图，展示不同时间内，AI 在视觉、语言、认知领域对人类工作的冲击。
通过此图，你将了解AI时代下哪些工作“安全”，哪些工作“危险”。

- **分图二：科研论文蜂群图 (Swarm Plot)**: 展示计算机视觉 (CV)、自然语言处理 (NLP)、人机交互 (HCI)、软件工程 (SE) 领域AI相关论文与非AI论文数量的对比。
通过此图，你将了解AI与学术领域的联动，AI驱动了学术界的发展，同时也是由这些领域托举而成的。

## 3. 设计思想

*   **多维数据融合**: 将 AI 模型的性能指标（MMLU Score）与社会就业指标（职业 AIOE 指数）结合，可以直观且有力地回答“AI 变强了，对我们的工作有什么影响？”这一核心问题。
*   **多视图联动 (Coordinated Views)**: `Chart 1` 作为主控制器，用户通过鼠标悬停在不同的时间分区上，会触发 `Pair Plot` 更新，展示该时间段对应的职业影响数据。这种“总览 + 细节”的设计帮助用户建立宏观趋势与微观影响之间的联系。

## 4. 数据集介绍

项目使用了两类主要数据：

1.  **AI 模型发展数据 (`src/data/data.js`)**:
    *   数据描述：此数据集包含从 2020 年至 2025 年几大主流厂家 OpenAI,Google,Anthropic,Meta,Mistral发布的的几乎全部 AI 模型，甚至包括了最近两个月内的gemini 3,claude 4.5等。
    *   数据构成：模型名称、所属机构、发布日期、参数量、类别（Language/Multimodal）、MMLU 得分等。
    *   数据来源：MMLU 全称 Measuring Massive Multitask Language Understanding（大规模多任务语言理解评估），是 2020 年由 Dan Hendrycks 团队发布的 LLM 跨学科综合能力基准，是业界主流的 LLM 评测标准之一。
    数据集中每个模型的 MMLU Score 来源于各厂家公开的技术报告和基准测试结果。
    人类领域专家参考准确率源自 MMLU 原始论文《Measuring Massive Multitask Language Understanding》（arXiv:2009.03300，2020 年发布，ICLR 2021 会议论文），是作者团队的估算值

2.  **职业 AI 暴露指数数据 (`data/AIOE/`)**:
    *   数据描述：核心指标为职业 AI 暴露指数（AIIE，理解为 AI 对职业的影响），正值代表较高暴露，负值代表较低或减弱。覆盖多个连续时间分区：November 2023、February 2024、May 2024、August 2024、November 2024、February 2025、May 2025、December 2025。每个时间分区含两类 CSV：`Image Generation.csv`（视觉 AIIE）与 `Language Modeling.csv`（语言 AIIE）。
    *   数据构成：视觉 AIIE、语言 AIIE、总 AIOE、颠覆指数。
    *   数据来源：
        *   https://www.onetcenter.org/database.html#all-files
        *   https://www.bls.gov/oes/tables.htm
        *   以上站点的各月份 O*NET 职业数据库与 Ability 数据集的 CSV，经论文《Strategic Management Journal - 2021 - Felten - Occupational, industry and geographic exposure to artificial intelligence》附带的开源 Python 处理代码整理得到。

3.  **科研论文数据 (`src/components/swarmplot.js`)**:
    *   数据描述：2015-2025 年逐年统计论文数量，记录 CV、NLP、HCI、SE 四个领域的论文总量与其中 AI 相关论文数量。
    *   数据构成：CV、NLP、HCI、SE 的论文总量及 AI 相关论文数量。
    *   数据来源：arXiv、IEEE、ScienceDirect。

## 5. 图表实现的关键代码

### 5.1 Chart 1 的时间分区交互 (`src/components/chart1.js`)
利用 D3 绘制透明的热区 (`partition-hotspot`) 覆盖在背景上，监听 `mouseenter` 事件来触发全局状态更新。

```javascript
// 绘制透明的点击热区
const partitionHotspots = focusGroup.selectAll(".partition-hotspot")
  .data(timePartitions)
  .enter()
  .append("rect")
  // ... 属性设置 ...
  .on("mouseenter", function(event, d) {
    // 1. 视觉反馈：高亮当前分区
    d3.selectAll(".partition-bg").attr("opacity", 0.4).classed("active-partition", false);
    d3.select(`.partition-${d.id}`).attr("opacity", 0.8).classed("active-partition", true);

    // 2. 数据联动：更新 Pair Plot
    updatePairPlot(d.id); 
  });
```

### 5.2 Pair Plot 的数据处理与指标计算 (`src/components/pairplot.js`)
在加载 CSV 数据后，动态计算自定义指标，用于散点图的映射。

```javascript
const processAndMergeData = (filesData) => {
  // ... 数据合并逻辑 ...
  return Array.from(mergedMap.values()).map(d => {
    // 补全缺失值并计算衍生指标
    if (d.cognitive === undefined) d.cognitive = Math.max(0, Math.min(10, (l + 2.5) * 2));
    if (d.disruption === undefined) {
      const overlap = (d.visualScore !== undefined && d.langScore !== undefined) ? 1.5 : 1;
      d.disruption = Math.max(0, (v + l + 3) * overlap); // 创新指标：颠覆指数
    }
    return d;
  });
};
```

## 6. 代码中的创新点

1.  **基于时间分区的动态联动机制**:
    打破了传统的时间轴拖动交互，采用了更符合叙事逻辑的“时间分区（Time Partitions）”设计。用户只需将鼠标移动到特定的背景色块上，即可查看该时期的详细职业影响分布。这种设计降低了交互门槛，增强了数据的可读性。

2.  **自定义复合指标算法**:
    代码中不仅仅展示原始的 AIOE 分数，还通过 `processAndMergeData` 函数创新性地定义了 **“高效能指数”**和 **“颠覆指数”**。该算法考虑了视觉和语言能力的重叠效应（`overlap` 系数），认为同时受两种能力影响的职业面临的颠覆风险是非线性的（`* 1.5`），从而提供了更深层次的洞察。


## 7. 数据转换说明 

本项目的数据处理流程旨在将多源异构数据转化为 D3.js 可直接渲染的格式，主要包含以下三个关键步骤：

*   **AI 模型演进数据结构化**
    *   **源数据**：来自 MMLU 基准测试的原始记录。
    *   **转换逻辑**：在 `src/data/data.js` 中将非结构化数据清洗为 JSON 对象数组。每个对象包含 `model_name` (模型名), `release_date` (发布时间), `mmlu_score` (得分), `parameters` (参数量) 及 `creator` (开发机构)。
    *   **时间解析**：使用 D3 的时间解析器将字符串日期转换为 Date 对象，以便在 x 轴上进行连续刻度映射。

*   **职业影响指数 (AIOE) 聚合**
    *   **源数据结构**：原始数据分散在 `data/AIOE/` 目录下，按时间（如 `November 2023_data`）和领域（如 `Image Generation.csv`）分文件夹存储。
    *   **转换逻辑**：编写脚本遍历所有时间文件夹，提取 `Occupational_AIOE_Scores` CSV 文件。将不同时间点的 AIOE 分数按职业 ID 进行对齐，构建出 `[Time, Occupation, Score]` 的时序数组，以便在 Pair Plot 中展示随时间变化的轨迹。
    *   **归一化**：为了在同一图表中对比不同行业的受影响程度，对 AIOE 分数进行了 `0-1` 或 `0-100` 的区间映射。

## 8. 交互设计说明 

本项目遵循“概览优先，缩放过滤，按需查看细节”的可视化交互原则：

*   **时间轴驱动的全局联动 (Time-Driven Linking)**
    *   **机制**：**Chart 1 (演进趋势图)** 不仅是展示视图，更是全局控制器。
    *   **交互**：当用户鼠标悬停在 Chart 1 的特定时间区间（如 "2023 GPT-4 Era"）时，系统会捕获该时间窗口。
    *   **反馈**：**Chart 2 (职业影响图)** 会自动过滤并高亮显示该特定时间段内的职业 AIOE 指数变化，帮助用户理解“特定技术突破对职业市场的即时影响”。

*   **透明热区与平滑过渡**
    *   为了解决折线图线条过细难以选中的问题，我们在 Chart 1 中使用了 **Voronoi 图** 或 **透明矩形覆盖层** 技术，扩大了鼠标的响应区域，提升了交互的容错率。
    *   视图切换时采用了 D3 的 `transition()` 动画，使数据点的移动具有物理惯性，避免视觉突变带来的认知负荷。

*   **细节按需显示 (Details on Demand)**
    *   **Tooltip 设计**：所有图表均配置了悬停提示框。
    *   **内容层级**：默认只显示宏观趋势；鼠标悬停时显示具体数值，避免信息过载。