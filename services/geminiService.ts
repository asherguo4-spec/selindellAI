
import { GoogleGenAI, GenerateContentParameters, Type } from "@google/genai";

export class GeminiService {
  private getAIInstance() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }
    return new GoogleGenAI({ apiKey: apiKey });
  }

  async expandPrompt(prompt: string): Promise<string> {
    try {
      const ai = this.getAIInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你是一个潮玩艺术家。请将以下简短的灵感扩写成一段生动、具体的描述，适合用于生成高品质的3D艺术或潮玩设计。要求：中文表达，重点描述外形、材质、配色，控制在100字以内。只需返回扩写后的内容。
        
        灵感：${prompt}`,
      });
      return response.text?.trim() || prompt;
    } catch (error: any) {
      if (error.message?.includes('429')) throw new Error("QUOTA_EXCEEDED");
      console.error("Gemini Text Expansion Error:", error);
      return prompt;
    }
  }

  async generateLoreAndStats(prompt: string): Promise<{title: string, lore: string, stats: any}> {
    const ai = this.getAIInstance();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `基于灵感 "${prompt}"，为这个潮玩手办设计一个霸气的名字、一段感人的背景故事，并给出战斗属性（1-100）。`,
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
                  power: { type: Type.INTEGER },
                  agility: { type: Type.INTEGER },
                  soul: { type: Type.INTEGER },
                  rarity: { type: Type.STRING }
                },
                required: ["power", "agility", "soul", "rarity"]
              }
            },
            required: ["title", "lore", "stats"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error: any) {
      if (error.message?.includes('429')) throw new Error("QUOTA_EXCEEDED");
      console.error("Lore Gen Error:", error);
      return {
        title: "无名造物",
        lore: "这是一段来自数字深渊的神秘记忆。",
        stats: { power: 50, agility: 50, soul: 50, rarity: "Common" }
      };
    }
  }

  private async generateOneAngle(prompt: string, imagePart?: any): Promise<string> {
    const ai = this.getAIInstance();
    const contents: any = imagePart 
      ? { parts: [imagePart, { text: prompt }] } 
      : { parts: [{ text: prompt }] };
    
    try {
      const params: GenerateContentParameters = {
        model: 'gemini-2.5-flash-image',
        contents: contents,
        config: {
          imageConfig: { aspectRatio: "1:1" }
        },
      };

      const response = await ai.models.generateContent(params);
      const candidate = response.candidates?.[0];
      
      if (candidate?.finishReason === 'SAFETY') {
        throw new Error("SAFETY_BLOCK");
      }

      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) return part.inlineData.data;
        }
      }
      throw new Error("GEN_FAILED");
    } catch (error: any) {
      if (error.message?.includes('429')) throw new Error("QUOTA_EXCEEDED");
      throw error;
    }
  }

  async generate360Creation(prompt: string, styleSuffix: string): Promise<string[]> {
    const baseDesc = `${prompt}, ${styleSuffix}, 3D toy style, high quality render, white background`;
    try {
      const frontBase64 = await this.generateOneAngle(`Front view of ${baseDesc}`);
      const imagePart = { inlineData: { mimeType: 'image/png', data: frontBase64 } };
      const results = [frontBase64];
      const angles = [`Right view`, `Back view`, `Left view`];

      for (const anglePrompt of angles) {
        try {
          await new Promise(r => setTimeout(r, 800));
          const b64 = await this.generateOneAngle(`${anglePrompt} of the same character`, imagePart);
          results.push(b64);
        } catch (err: any) {
          if (err.message === "QUOTA_EXCEEDED") throw err;
          results.push(frontBase64);
        }
      }
      return results.map(b64 => `data:image/png;base64,${b64}`);
    } catch (error: any) {
      if (error.message === "QUOTA_EXCEEDED") throw error;
      throw new Error(error.message || "生成故障");
    }
  }

  async generateShowcaseVideo(prompt: string, baseImageBase64: string): Promise<string> {
    const aistudio = (window as any).aistudio;
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) await aistudio.openSelectKey();

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Cinematic showcase: ${prompt}`,
        image: { imageBytes: baseImageBase64.split(',')[1], mimeType: 'image/png' },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });

      while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error: any) {
      if (error.message?.includes('429')) throw new Error("QUOTA_EXCEEDED");
      if (error.message?.includes("Requested entity was not found")) {
        await aistudio.openSelectKey();
      }
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
