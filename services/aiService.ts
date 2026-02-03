
import { GoogleGenAI, Type } from "@google/genai";

// 辅助函数：从各种可能的地方获取环境变量
const getEnvVar = (name: string): string => {
  try {
    // 优先从环境变量中读取
    const val = (process.env as any)[name] || (import.meta as any).env?.[`VITE_${name}`];
    if (val && typeof val === 'string' && !val.includes('{{') && val.trim().length > 0) {
      return val.trim();
    }
  } catch (e) {
    console.warn(`Error reading env var ${name}:`, e);
  }
  return "";
};

export class SelindellAIService {
  private getApiKey(): string {
    // 核心 API KEY
    return getEnvVar('API_KEY') || "AIzaSyDrXn9l9G3_yuwYpce4UYhidMrP_ZZokhg";
  }

  /**
   * 灵感增强 (使用 Gemini 3.0 Flash)
   */
  async expandPrompt(prompt: string): Promise<string> {
    const apiKey = this.getApiKey();
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
   * 生图逻辑：切换至 Gemini 2.5 Flash Image
   * 针对移动端环境优化了错误捕获
   */
  async generate360Creation(prompt: string, styleSuffix: string): Promise<string[]> {
    console.log("🚀 Starting Gemini Image Generation...");
    const apiKey = this.getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    // 组合最终提示词
    const finalPrompt = `(white background), exquisite physical action figure, ${prompt}, ${styleSuffix}, 3d printed material, high resolution, detailed modeling, studio lighting, 4k`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{
          parts: [{ text: finalPrompt }]
        }],
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      const images: string[] = [];
      
      // 遍历所有 candidate 的 parts，提取 inlineData 中的图片数据
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
          }
        }
      }

      if (images.length === 0) {
        console.error("❌ Gemini Image Response empty parts:", response);
        throw new Error("造物失败：AI 未返回图像数据。请尝试更换灵感词。");
      }

      console.log("✅ Gemini Image Generated Successfully!");
      return images;
    } catch (error: any) {
      console.error("🚨 Detailed Gen Error:", error);
      
      const errMsg = error?.toString() || "";
      
      // 专门捕获 iOS/Safari 常见的网络失败错误
      if (errMsg.includes('Load failed') || errMsg.includes('fetch') || errMsg.includes('NetworkError')) {
        throw new Error("网络握手失败 (Load failed)。\n由于生图引擎位于海外服务器，移动端请确保：\n1. 您的网络环境允许访问 Google API (建议检查代理或科学上网状态)\n2. 手机未开启强力广告拦截插件\n3. 尝试切换 WiFi 或 5G 网络。");
      }
      
      if (errMsg.includes('403') || errMsg.includes('API_KEY_INVALID')) {
        throw new Error("授权失败：API Key 校验未通过，请联系管理员更新。");
      }
      
      throw new Error(error.message || "造物引擎暂时无法响应，请稍后再试。");
    }
  }

  async generateLoreAndStats(prompt: string) {
    try {
      const apiKey = this.getApiKey();
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
