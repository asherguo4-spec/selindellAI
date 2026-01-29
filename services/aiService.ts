
import { GoogleGenAI, Type } from "@google/genai";

export class SelindellAIService {
  // 智谱保底 Key (仅当环境变量完全缺失时使用)
  private readonly ZHIPU_STABLE_KEY = "08a05cfe50f44549947f6e1a5cb232fa.wqGlh7yjmT1WOR5S";

  constructor() {}

  private async createZhipuToken(): Promise<string> {
    const targetKey = (process.env.ZHIPU_API_KEY || this.ZHIPU_STABLE_KEY).trim();
    if (!targetKey.includes('.')) {
      throw new Error("智谱 API KEY 格式错误，请检查 .env 中的 ZHIPU_API_KEY");
    }

    const parts = targetKey.split('.');
    const id = parts[0];
    const secret = parts[1];
    
    const header = { alg: "HS256", sign_type: "SIGN" };
    const payload = { 
      api_key: id, 
      exp: Math.floor(Date.now() / 1000) + 3600, 
      iat: Math.floor(Date.now() / 1000) 
    };

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

  /**
   * 灵感增强：仅在点击按钮时触发
   * 要求：30字内，核心词位置灵活（句首/句中/句末）
   */
  async expandPrompt(prompt: string): Promise<string> {
    if (!process.env.API_KEY || process.env.API_KEY.includes('.')) {
      throw new Error("未检测到有效的 Gemini 密钥 (API_KEY)。");
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你是一位世界顶级的手办概念设计师。请将用户的原始灵感 “${prompt}” 扩写成一段充满想象力和细节的手办描述。
        要求：
        1. 必须保留用户原始输入的主体。
        2. 核心词可以自然地出现在句子的开头、中间或末尾，不要死板。
        3. 字数严格限制在 30 字以内。
        4. 语言要富有画面感（如动态、神态、光影感）。
        5. 只返回扩写后的简体中文文本。`,
      });
      return response.text?.trim() || prompt;
    } catch (e: any) {
      console.error("Expand Error:", e);
      throw new Error("灵感增强失败，请检查网络连接。");
    }
  }

  /**
   * 生图逻辑：完全使用智谱，紧扣输入框内容
   * 强化：白色背景、材质风格严格应用、物理手办质感
   */
  async generate360Creation(prompt: string, styleSuffix: string): Promise<string[]> {
    let translatedPrompt = prompt;
    
    // 内部静默翻译：确保智谱能更好地理解描述的主体，并转化为高质量提示词
    try {
      if (process.env.API_KEY && !process.env.API_KEY.includes('.')) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Translate the following action figure description into a high-quality, professional English image prompt. 
          Text: "${prompt}"
          Focus on capturing the core subject and physical 3D attributes.`,
        });
        translatedPrompt = response.text?.trim() || prompt;
      }
    } catch (e) {
      // 翻译失败降级使用原句
    }

    const token = await this.createZhipuToken();
    
    /**
     * 核心生图指令构造：
     * 1. 权重最高的纯白背景 (Pure white background)
     * 2. 紧扣用户输入主体 (translatedPrompt)
     * 3. 严格遵循用户选择的材质风格 (styleSuffix)
     * 4. 强制 3D 打印物理手办质感 (Physical action figure, realistic textures, 3D printable model)
     */
    const finalPrompt = `(Pure white background:1.8), realistic physical action figure of ${translatedPrompt}, ${styleSuffix}, 3D printable model, studio lighting, high quality resin material, octane render, sharp details, centered composition, high-end toy photography, 8k resolution.`;

    try {
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          model: 'cogview-3-plus', 
          prompt: finalPrompt, 
          size: "1024x1024" 
        })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error.message);
      if (!result.data || !result.data[0]?.url) throw new Error("绘图服务未返回有效图片。");
      
      return [result.data[0].url]; 
    } catch (error: any) {
      throw new Error(error.message || "绘图引擎响应异常，请重试。");
    }
  }

  async generateLoreAndStats(prompt: string) {
    try {
      if (!process.env.API_KEY || process.env.API_KEY.includes('.')) throw new Error("Skip");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `根据描述 “${prompt}”，为这个手办起一个名字并写一个30字内的背景故事，包含战斗属性。`,
        config: { 
          responseMimeType: "application/json", 
          responseSchema: {
            type: Type.OBJECT, 
            properties: {
              title: { type: Type.STRING }, 
              lore: { type: Type.STRING },
              stats: { 
                type: Type.OBJECT, 
                properties: { power: { type: Type.NUMBER }, agility: { type: Type.NUMBER }, soul: { type: Type.NUMBER }, rarity: { type: Type.STRING } }
              }
            }
          }
        }
      });
      return JSON.parse(response.text?.trim() || "{}");
    } catch (e) {
      return { title: "未知造物", lore: "诞生于倾谷 AI 的精密计算中。", stats: { power: 90, agility: 90, soul: 90, rarity: "SSR" } };
    }
  }
}

export const aiService = new SelindellAIService();
export const geminiService = aiService;
