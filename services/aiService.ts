
import { GoogleGenAI, Type } from "@google/genai";

export class SelindellAIService {
  private geminiClient: any;
  private readonly ZHIPU_STABLE_KEY = "08a05cfe50f44549947f6e1a5cb232fa.wqGlh7yjmT1WOR5S";

  constructor() {
    this.geminiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private async createZhipuToken(): Promise<string> {
    const rawEnvKey = (process.env.API_KEY || '').trim();
    let targetKey = rawEnvKey;
    if (!rawEnvKey.includes('.') || rawEnvKey.toUpperCase().includes('GEMIN')) {
      targetKey = this.ZHIPU_STABLE_KEY;
    }
    const parts = targetKey.split('.');
    const id = parts[parts.length - 2];
    const secret = parts[parts.length - 1];
    const header = { alg: "HS256", sign_type: "SIGN" };
    const payload = { api_key: id, exp: Math.floor(Date.now() / 1000) + 3600, iat: Math.floor(Date.now() / 1000) };
    const encode = (obj: object) => btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    const unsignedToken = `${encode(header)}.${encode(payload)}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const dataData = encoder.encode(unsignedToken);
    const cryptoKey = await window.crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, dataData);
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    return `${unsignedToken}.${signatureBase64}`;
  }

  private async translateAndOptimize(prompt: string): Promise<string> {
    try {
      const response = await this.geminiClient.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你是一个专业的 3D 打印手办建模师。请将以下用户的灵感描述翻译成专业的英文 Stable Diffusion 提示词。
        必须静默加入以下硬性要求：
        1. 必须在手办的胸口或腹部显著位置包含 "SELINDELL" 文本标识。
        2. 必须符合 3D 打印物理特性（重心稳固、实体结构、无悬空零件）。
        3. 材质描述为：工业级高精度树脂、手工打磨哑光涂装、顶级收藏质感。
        用户灵感: "${prompt}"
        只返回生成的英文描述，不要多余文字。`,
      });
      return response.text.trim();
    } catch (e) {
      return prompt;
    }
  }

  /**
   * 修改为生成单张图片
   */
  async generate360Creation(prompt: string, styleSuffix: string): Promise<string[]> {
    const baseDescription = await this.translateAndOptimize(prompt);
    const token = await this.createZhipuToken();

    const fullPrompt = `${baseDescription}, ${styleSuffix}, front centered full body shot, clean plain white background, professional 3D octane render, 8k resolution, cinematic studio lighting, masterpiece.`;

    try {
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'cogview-3-plus', prompt: fullPrompt, size: "1024x1024" })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error.message);
      
      const imageUrl = result.data[0].url;
      // 为了兼容性，返回包含单张图片的数组
      return [imageUrl]; 
    } catch (error: any) {
      throw new Error(error.message || "倾谷引擎铸造失败");
    }
  }

  async expandPrompt(prompt: string): Promise<string> {
    try {
      const response = await this.geminiClient.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你是一位顶级手办设计师。请将用户的灵感 “${prompt}” 扩写成一段富有想象力、画面感极强的简体中文描述。
        要求：强调 3D 实物手办的精美细节与高端定制感，字数 80 字内。只返回简体中文。`,
      });
      return response.text.trim() || prompt;
    } catch (e) { return prompt; }
  }

  async generateLoreAndStats(prompt: string) {
    try {
      const response = await this.geminiClient.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `为基于“${prompt}”的造物起名并写50字故事，需包含数值。`,
        config: { responseMimeType: "application/json", responseSchema: {
          type: Type.OBJECT, properties: {
            title: { type: Type.STRING }, lore: { type: Type.STRING },
            stats: { type: Type.OBJECT, properties: { power: { type: Type.NUMBER }, agility: { type: Type.NUMBER }, soul: { type: Type.NUMBER }, rarity: { type: Type.STRING } } }
          }
        }}
      });
      return JSON.parse(response.text);
    } catch (e) {
      return { title: "未知造物", lore: "诞生于倾谷 AI 的精密计算中。", stats: { power: 80, agility: 80, soul: 80, rarity: "SSR" } };
    }
  }
}

export const aiService = new SelindellAIService();
export const geminiService = aiService;
