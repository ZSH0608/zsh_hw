const d = (year, month, day = 1) => new Date(year, month - 1, day);

export const aiModels = [
  // The Pre-MMLU / Early Era
  { name: "GPT-3", organization: "OpenAI", date: d(2020, 5), parameters: 175e9, category: "Language", mmluScore: 43.9 },
  
  // 2021
  { name: "Gopher", organization: "DeepMind", date: d(2021, 12), parameters: 280e9, category: "Language", mmluScore: 60.0 },
  { name: "Jurassic-1 Jumbo", organization: "AI21", date: d(2021, 8), parameters: 178e9, category: "Language", mmluScore: 68.0 },
  
  // 2022
  { name: "Chinchilla", organization: "DeepMind", date: d(2022, 3), parameters: 70e9, category: "Language", mmluScore: 67.5 },
  { name: "PaLM", organization: "Google", date: d(2022, 4), parameters: 540e9, category: "Language", mmluScore: 69.3 },
  { name: "Minerva", organization: "Google", date: d(2022, 6), parameters: 540e9, category: "Language", mmluScore: 75.0 },
  { name: "BLOOM", organization: "BigScience", date: d(2022, 7), parameters: 176e9, category: "Language", mmluScore: 59.3 },
  { name: "GLM-130B", organization: "Tsinghua", date: d(2022, 8), parameters: 130e9, category: "Language", mmluScore: 57.3 },

  // 2023 - The Explosion
  { name: "Llama 1 65B", organization: "Meta", date: d(2023, 2), parameters: 65e9, category: "Language", mmluScore: 63.4 },
  { name: "GPT-4", organization: "OpenAI", date: d(2023, 3), parameters: 1.76e12, category: "Multimodal", mmluScore: 86.4 },
  { name: "PaLM 2-L", organization: "Google", date: d(2023, 5), parameters: 340e9, category: "Language", mmluScore: 78.3 },
  { name: "Claude 2", organization: "Anthropic", date: d(2023, 7), parameters: 150e9, category: "Language", mmluScore: 78.5 },
  { name: "Llama 2 70B", organization: "Meta", date: d(2023, 7), parameters: 70e9, category: "Language", mmluScore: 68.9 },
  { name: "Falcon 180B", organization: "TII", date: d(2023, 9), parameters: 180e9, category: "Language", mmluScore: 70.4 },
  { name: "Mistral 7B", organization: "Mistral", date: d(2023, 9), parameters: 7e9, category: "Language", mmluScore: 62.5 },
  { name: "Grok-1", organization: "xAI", date: d(2023, 11), parameters: 314e9, category: "Language", mmluScore: 73.0 },
  { name: "Gemini 1.0 Ultra", organization: "Google", date: d(2023, 12), parameters: 1.56e12, category: "Multimodal", mmluScore: 90.0 },
  { name: "Gemini 1.0 Pro", organization: "Google", date: d(2023, 12), parameters: 100e9, category: "Multimodal", mmluScore: 71.8 },
  // 修正：增加 (MoE) 标识以保持一致性
  { name: "Mixtral 8x7B", organization: "Mistral", date: d(2023, 12), parameters: 47e9, category: "Language (MoE)", mmluScore: 70.6 },

  // 2024 - State of the Art (Real)
  { name: "Gemini 1.5 Pro", organization: "Google", date: d(2024, 2), parameters: 600e9, category: "Multimodal (Long Context)", mmluScore: 81.9 },
  { name: "Claude 3 Opus", organization: "Anthropic", date: d(2024, 3), parameters: 2e12, category: "Multimodal", mmluScore: 86.8 },
  { name: "Claude 3 Sonnet", organization: "Anthropic", date: d(2024, 3), parameters: 70e9, category: "Multimodal", mmluScore: 79.0 },
  // 修正：Claude 3 Haiku 是多模态模型 (支持视觉)，不是单纯的 "Fast"
  { name: "Claude 3 Haiku", organization: "Anthropic", date: d(2024, 3), parameters: 20e9, category: "Multimodal", mmluScore: 75.2 },
  { name: "Llama 3 70B", organization: "Meta", date: d(2024, 4), parameters: 100e9, category: "Language", mmluScore: 82.0 },
  { name: "GPT-4o", organization: "OpenAI", date: d(2024, 5), parameters: 1.1e12, category: "Multimodal", mmluScore: 88.7 },
  { name: "Gemini 1.5 Flash", organization: "Google", date: d(2024, 5), parameters: 2.7e10, category: "Multimodal (High Speed)", mmluScore: 78.9 },
  { name: "Claude 3.5 Sonnet", organization: "Anthropic", date: d(2024, 6), parameters: 180e9, category: "Multimodal", mmluScore: 88.7 },
  { name: "Llama 3.1 405B", organization: "Meta", date: d(2024, 7), parameters: 405e9, category: "Language", mmluScore: 88.6 },
  { name: "Mistral Large 2", organization: "Mistral", date: d(2024, 7), parameters: 123e9, category: "Language", mmluScore: 84.0 },
  // 修正：Grok-2 具备视觉能力，应为 Multimodal
  { name: "Grok-2", organization: "xAI", date: d(2024, 8), parameters: 314e9, category: "Multimodal", mmluScore: 87.5 },
  // 修正：o1 的核心区分点是 Reasoning (推理)，且初期API不支持视觉
  { name: "OpenAI o1", organization: "OpenAI", date: d(2024, 9), parameters: 1.8e12, category: "Reasoning", mmluScore: 92.3 },
  // 建议：3.5 Sonnet (New) 归类为 Agentic 没问题，或者 "Multimodal (Agentic)"
  { name: "Claude 3.5 Sonnet (New)", organization: "Anthropic", date: d(2024, 10), parameters: 1.75e11, category: "Agentic (Coding)", mmluScore: 88.7 },
  // 修正：Claude 3.5 Haiku 初期版本是纯文本/代码 (无视觉)，所以回归 Language
  { name: "Claude 3.5 Haiku", organization: "Anthropic", date: d(2024, 10), parameters: 4e10, category: "Language", mmluScore: 81.7 },
  { name: "Gemini 2.0 Flash", organization: "Google", date: d(2024, 12), parameters: 1.2e11, category: "Multimodal (Real-time)", mmluScore: 87.5 },

  // 2025 - Predicted
  { name: "GPT-4.5", organization: "OpenAI", date: d(2025, 2), parameters: 2.5e12, category: "Multimodal", mmluScore: 93.0 },
  { name: "o3", organization: "OpenAI", date: d(2025, 4), parameters: 175e9, category: "Reasoning", mmluScore: 94.5 },
  { name: "o4-mini", organization: "OpenAI", date: d(2025, 3), parameters: 150e9, category: "Reasoning", mmluScore: 89.5 },
  { name: "GPT-5", organization: "OpenAI", date: d(2025, 8), parameters: 5e12, category: "Multimodal", mmluScore: 94.8 },
  // 修正：Llama 4 系列大概率会是原声多模态，但目前保持 Language (Open-Source) 也可以，比较稳妥
  { name: "Llama 4 Scout", organization: "Meta", date: d(2025, 4), parameters: 109e9, category: "Language (Open-Source)", mmluScore: 89.8 },
  { name: "Llama 4 Maverick", organization: "Meta", date: d(2025, 4), parameters: 400e9, category: "Language (Open-Source)", mmluScore: 91.5 },
  { name: "Llama 4 Behemoth", organization: "Meta", date: d(2025, 4), parameters: 2e12, category: "Language (Open-Source)", mmluScore: 93.2 },
  { name: "Claude 3.7 Sonnet", organization: "Anthropic", date: d(2025, 2), parameters: 200e9, category: "Multimodal", mmluScore: 90.5 },
  { name: "Gemini 2.0 Pro", organization: "Google", date: d(2025, 2), parameters: 800e9, category: "Multimodal (Agentic)", mmluScore: 93.5 },
  { name: "Claude 4 Opus", organization: "Anthropic", date: d(2025, 5), parameters: 2.2e12, category: "Multimodal", mmluScore: 94.2 },
  { name: "Claude 4 Sonnet", organization: "Anthropic", date: d(2025, 5), parameters: 3.5e11, category: "General Purpose (Agent)", mmluScore: 92.5 },
  { name: "[Anthropic Agent]", organization: "Anthropic", date: d(2025, 11), parameters: 800e9, category: "Agent/Coding", mmluScore: 92.5 },
  { name: "Gemini 3 Flash", organization: "Google", date: d(2025, 6), parameters: 50e9, category: "Multimodal", mmluScore: 91.0 },
  { name: "Gemini 3 Pro", organization: "Google", date: d(2025, 11), parameters: 1.5e12, category: "Multimodal", mmluScore: 95.2 },

  // --- 补充 Meta Llama 历史与最新系列 ---
  
  // Llama 2 Series (2023 补全)
  { name: "Llama 2 7B", organization: "Meta", date: d(2023, 7), parameters: 7e9, category: "Language", mmluScore: 45.3 },
  { name: "Llama 2 13B", organization: "Meta", date: d(2023, 7), parameters: 13e9, category: "Language", mmluScore: 54.8 },

  // Llama 3 Series (2024.4 补全)
  { name: "Llama 3 8B", organization: "Meta", date: d(2024, 4), parameters: 8e9, category: "Language", mmluScore: 68.4 }, 

  // Llama 3.1 Series (2024.7 补全 - 405B已有)
  { name: "Llama 3.1 8B", organization: "Meta", date: d(2024, 7), parameters: 8e9, category: "Language", mmluScore: 69.4 },
  { name: "Llama 3.1 70B", organization: "Meta", date: d(2024, 7), parameters: 70e9, category: "Language", mmluScore: 86.0 },

  // Llama 3.2 Series (2024.9 - Edge & Vision)
  // 修正：Mobile/Edge 是场景，但从模型能力看，1B/3B 是纯文本模型
  { name: "Llama 3.2 1B", organization: "Meta", date: d(2024, 9), parameters: 1e9, category: "Language (Edge)", mmluScore: 49.3 }, 
  { name: "Llama 3.2 3B", organization: "Meta", date: d(2024, 9), parameters: 3e9, category: "Language (Edge)", mmluScore: 63.4 },
  { name: "Llama 3.2 11B Vision", organization: "Meta", date: d(2024, 9), parameters: 11e9, category: "Multimodal", mmluScore: 73.0 },
  { name: "Llama 3.2 90B Vision", organization: "Meta", date: d(2024, 9), parameters: 90e9, category: "Multimodal", mmluScore: 86.2 },

  // Llama 3.3 Series (2024.12 - 最新)
  { name: "Llama 3.3 70B", organization: "Meta", date: d(2024, 12), parameters: 70e9, category: "Language", mmluScore: 86.0 },

  // --- 补充 Mistral 家族 ---

  // Mistral Early & Specialized
  { name: "Mistral Medium", organization: "Mistral", date: d(2023, 12), parameters: 70e9, category: "Language", mmluScore: 75.3 },
  
  // Mixtral High-End
  { name: "Mixtral 8x22B", organization: "Mistral", date: d(2024, 4), parameters: 141e9, category: "Language (MoE)", mmluScore: 77.8 },

  // Mistral New Era (2024 H2)
  { name: "Codestral 22B", organization: "Mistral", date: d(2024, 5), parameters: 22e9, category: "Coding", mmluScore: 69.0 },
  { name: "Mistral NeMo", organization: "Mistral", date: d(2024, 7), parameters: 12e9, category: "Language", mmluScore: 68.0 },
  { name: "Mistral Small v3", organization: "Mistral", date: d(2024, 9), parameters: 22e9, category: "Language", mmluScore: 76.0 },
  { name: "Pixtral 12B", organization: "Mistral", date: d(2024, 9), parameters: 12e9, category: "Multimodal", mmluScore: 69.2 },
];
export const formatParams = (num) => {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + "万亿";
  if (num >= 1e8) return (num / 1e8).toFixed(1) + "亿"; 
  if (num >= 1e4) return (num / 1e4).toFixed(0) + "万";
  return num.toString();
};

export const getColor = (org) => {
  if (org.includes("OpenAI")) return "#10b981"; // Emerald
  if (org.includes("Google")) return "#3b82f6"; // Blue
  if (org.includes("Meta")) return "#06b6d4"; // Cyan
  if (org.includes("Anthropic")) return "#d946ef"; // Fuchsia
  if (org.includes("Mistral")) return "#f59e0b"; // Amber
  if (org.includes("DeepMind")) return "#6366f1"; // Indigo
  return "#6366f1"; // Default
};