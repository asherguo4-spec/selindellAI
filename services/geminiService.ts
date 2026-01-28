
/**
 * Aliyun DashScope Service Integration
 * 适配最新的通义万相 2.6 (Wan2.6-t2i) 协议
 * 已通过 Vite Proxy 解决跨域问题
 */

export class AliyunService {
  // 注意：在浏览器环境使用代理时，baseUrl 应该指向 Vite 配置的代理前缀
  private baseUrl = '/aliyun-api';
  private apiKey = process.env.API_KEY;

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-SSE': 'disable'
    };
  }

  /**
   * 文本生成/扩写 (Qwen-Plus)
   */
  async expandPrompt(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: 'qwen-plus',
          input: {
            messages: [
              { role: 'system', content: '你是一个潮玩艺术家。请将用户的灵感扩写成适合AI生图的专业描述词，重点描述材质（如PVC、树脂、半透明）、细节和配色。中文表达，100字以内。只需返回扩写后的内容。' },
              { role: 'user', content: prompt }
            ]
          }
        })
      });

      const data = await response.json();
      if (data.code) throw new Error(data.message || "文本生成失败");
      return data.output?.text?.trim() || prompt;
    } catch (error: any) {
      console.error("Aliyun Text Error:", error);
      throw error;
    }
  }

  /**
   * 生成背景故事与属性
   */
  async generateLoreAndStats(prompt: string): Promise<{title: string, lore: string, stats: any}> {
    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: 'qwen-plus',
          input: {
            messages: [
              { role: 'system', content: '请为手办设计名字、背景故事和属性。返回严格的JSON格式：{"title": "...", "lore": "...", "stats": {"power": 80, "agility": 70, "soul": 90, "rarity": "Legendary"}}' },
              { role: 'user', content: `基于灵感: ${prompt}` }
            ]
          },
          parameters: { response_format: { type: 'json_object' } }
        })
      });

      const data = await response.json();
      const content = data.output?.text || "{}";
      return JSON.parse(content);
    } catch (error) {
      return {
        title: "无名造物",
        lore: "来自数字荒野的神秘存在。",
        stats: { power: 50, agility: 50, soul: 50, rarity: "Common" }
      };
    }
  }

  /**
   * 轮询异步任务结果
   */
  private async pollTask(taskId: string): Promise<any> {
    const pollUrl = `${this.baseUrl}/tasks/${taskId}`;
    let attempts = 0;
    while (attempts < 60) {
      const response = await fetch(pollUrl, { 
        headers: { 'Authorization': `Bearer ${this.apiKey}` } 
      });
      const data = await response.json();
      const status = data.output?.task_status;

      if (status === 'SUCCEEDED') return data.output;
      if (status === 'FAILED') throw new Error(data.output?.message || "任务生成失败");
      
      await new Promise(r => setTimeout(r, 3000));
      attempts++;
    }
    throw new Error("任务超时");
  }

  /**
   * 生成图片 (Wan2.6-t2i)
   */
  private async generateImageTask(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/services/aigc/multimodal-generation/generation`, {
      method: 'POST',
      headers: { ...this.headers, 'X-DashScope-Async': 'enable' },
      body: JSON.stringify({
        model: 'wan2.6-t2i',
        input: {
          messages: [
            {
              role: "user",
              content: [{ text: prompt }]
            }
          ]
        },
        parameters: {
          size: '1024*1024',
          n: 1
        }
      })
    });

    const data = await response.json();
    if (data.code || !data.output?.task_id) {
      throw new Error(data.message || "提交万相 2.6 任务失败");
    }
    
    const result = await this.pollTask(data.output.task_id);
    return result.results[0].url;
  }

  /**
   * 生成 360° 四视图
   */
  async generate360Creation(prompt: string, styleSuffix: string): Promise<string[]> {
    if (!this.apiKey || this.apiKey.includes('YOUR_API_KEY')) {
      throw new Error("未检测到有效的 API_KEY，请检查 .env 文件并重启服务。");
    }

    const fullPrompt = `Action figure of ${prompt}, ${styleSuffix}, 3D toy, sitting on a simple solid white background, high quality 3d render, detailed textures`;
    try {
      const mainImage = await this.generateImageTask(fullPrompt);
      // 万相 2.6 生成质量很高，暂时使用同一张图作为演示。
      // 若需要多角度，可在此处循环调用生成不同角度的 Prompt。
      return [mainImage, mainImage, mainImage, mainImage]; 
    } catch (error: any) {
      if (error.message?.includes('Quota') || error.message?.includes('Limit')) {
        throw new Error("QUOTA_EXCEEDED");
      }
      throw error;
    }
  }
}

export const geminiService = new AliyunService() as any;
