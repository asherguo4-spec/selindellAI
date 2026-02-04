
import { GoogleGenAI, Type } from "@google/genai";

const getEnvVar = (name: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const v = (import.meta as any).env[`VITE_${name}`];
      if (v) return v;
    }
    if (typeof process !== 'undefined' && process.env) {
      const v = (process.env as any)[name];
      if (v) return v;
    }
  } catch (e) {}
  return "";
};

export class SelindellAIService {
  private getApiKey(): string {
    return getEnvVar('API_KEY') || "AIzaSyDrXn9l9G3_yuwYpce4UYhidMrP_ZZokhg";
  }

  async expandPrompt(prompt: string): Promise<string> {
    const apiKey = this.getApiKey();
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你是一位顶级手办概念设计师。请将用户的灵感 “${prompt}” 扩写成一段充满细节的手办设计描述。要求：1. 强调姿态、材质细节。2. 字数在 40 字左右。3. 只返回纯中文文本。`,
      });
      return response.text?.trim() || prompt;
    } catch (e) {
      return prompt; 
    }
  }

  async generate360Creation(prompt: string, styleSuffix: string): Promise<string[]> {
    const apiKey = this.getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const finalPrompt = `(white background), exquisite physical action figure, ${prompt}, ${styleSuffix}, 3d printed material, studio lighting, 4k`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: finalPrompt }] }],
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      const images: string[] = [];
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
          }
        }
      }
      if (images.length === 0) throw new Error("AI 未返回图像");
      return images;
    } catch (error: any) {
      throw new Error(error.message || "造物引擎暂时无法响应");
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
      return { title: "未命名造物", lore: "来自异次元的灵感碎片。", stats: { power: 80, agility: 80, soul: 80, rarity: "R" } };
    }
  }
}

export const aiService = new SelindellAIService();
export const geminiService = aiService;
