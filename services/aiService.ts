
import { GoogleGenAI, Type } from "@google/genai";

// 辅助函数：从各种可能的地方获取环境变量
const getEnvVar = (name: string): string => {
  try {
    // 检查 Vite 注入的 process.env
    const fromProcess = (process.env as any)[name];
    if (fromProcess && typeof fromProcess === 'string' && !fromProcess.includes('{{') && fromProcess.trim().length > 0) {
      return fromProcess.trim();
    }

    // 检查 Vite 标准的 import.meta.env
    const fromMeta = (import.meta as any).env?.[`VITE_${name}`];
    if (fromMeta && typeof fromMeta === 'string' && fromMeta.trim().length > 0) {
      return fromMeta.trim();
    }
  } catch (e) {
    console.warn(`Error reading env var ${name}:`, e);
  }

  return "";
};

export class SelindellAIService {
  constructor() {}

  /**
   * 灵感增强 (使用 Gemini 3.0 Flash)
   */
  async expandPrompt(prompt: string): Promise<string> {
    const apiKey = getEnvVar('API_KEY') || "AIzaSyDrXn9l9G3_yuwYpce4UYhidMrP_ZZokhg";
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你是一位顶级手办概念设计师。请将用户的灵感 “${prompt}” 扩写成一段充满细节的手办设计描述。
        要求：
        1. 强调姿态、面部表情、材质细节（如透明树脂、磨砂金属）。
        2. 字数在 40 字左右。
        3. 只返回纯中文描述文本，不要带任何前缀。`,
      });
      return response.text?.trim() || prompt;
    } catch (e: any) {
      console.error("Expand Error:", e);
      return prompt; 
    }
  }

  /**
   * 生图逻辑：正式迁移至腾讯混元 (OpenAI 兼容接口)
   */
  async generate360Creation(prompt: string, styleSuffix: string): Promise<string[]> {
    console.log("🚀 Starting Hunyuan Generation...");
    
    // 优先读取环境变量
    let apiKey = getEnvVar('HUNYUAN_API_KEY');
    
    // 兜底逻辑：如果环境变量无效，使用您最新生成的那个 Key
    if (!apiKey || apiKey.length < 15 || apiKey.includes('placeholder')) {
      console.log("💡 Using fallback hardcoded API Key: sk-PgFU...");
      apiKey = "sk-PgFUd1LKMRkTukKRodzIR6qhdwoRx3vBa29p2VvzzycuWOYC";
    }

    const endpoint = "https://api.hunyuan.cloud.tencent.com/v1/images/generations";
    const finalPrompt = `(纯白背景), 精致物理手办, ${prompt}, ${styleSuffix}, 3D打印材质, 极高分辨率, 细腻建模, 工作室打光, 4k`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        mode: 'cors', // 明确开启 CORS 模式
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "hunyuan-t2i",
          prompt: finalPrompt,
          n: 1,
          size: "1024x1024",
          response_format: "b64_json"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Hunyuan API Error Status:", response.status, errorData);
        throw new Error(errorData.error?.message || `API 请求失败 (状态码: ${response.status})。可能是欠费或 Key 被禁。`);
      }

      const result = await response.json();
      
      const b64Data = result.data?.[0]?.b64_json;
      if (!b64Data) {
        console.error("❌ Hunyuan API Empty Response:", result);
        throw new Error("混元造物失败，生成的图像为空。请尝试更换灵感词（如：穿西装的猫）。");
      }
      
      console.log("✅ Hunyuan Image Generated Successfully!");
      return [`data:image/png;base64,${b64Data}`]; 
    } catch (error: any) {
      console.error("🚨 Detailed Gen Error:", error);
      
      // 特殊处理 "Failed to fetch" 这种网络层错误
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new Error("网络连接失败 (Failed to fetch)。\n常见原因：\n1. 浏览器插件拦截（如 AdBlock）\n2. 网络环境防火墙限制\n3. 跨域策略拦截。请尝试更换网络或使用隐身模式打开页面。");
      }
      
      throw new Error(error.message || "混元造物引擎异常，请检查网络状况。");
    }
  }

  async generateLoreAndStats(prompt: string) {
    try {
      const apiKey = getEnvVar('API_KEY') || "AIzaSyDrXn9l9G3_yuwYpce4UYhidMrP_ZZokhg";
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `基于描述 “${prompt}”，为这个手办生成一个名称、一段富有史诗感的 30 字背景故事和战斗属性。`,
        config: { 
          responseMimeType: "application/json", 
          responseSchema: {
            type: Type.OBJECT, 
            properties: {
              title: { type: Type.STRING }, 
              lore: { type: Type.STRING },
              stats: { 
                type: Type.OBJECT, 
                properties: { 
                  power: { type: Type.NUMBER }, 
                  agility: { type: Type.NUMBER }, 
                  soul: { type: Type.NUMBER }, 
                  rarity: { type: Type.STRING } 
                },
                required: ["power", "agility", "soul", "rarity"]
              }
            },
            required: ["title", "lore", "stats"]
          }
        }
      });
      return JSON.parse(response.text?.trim() || "{}");
    } catch (e) {
      return { 
        title: "未命名造物", 
        lore: "来自异次元的灵感碎片，正在凝结成形。", 
        stats: { power: 80, agility: 80, soul: 80, rarity: "R" } 
      };
    }
  }
}

export const aiService = new SelindellAIService();
export const geminiService = aiService;
