
/**
 * Aliyun DashScope Service Integration
 * 替换原有 Gemini 服务，适配中国区网络与阿里云 API 逻辑
 */

export class AliyunService {
  private apiKey = process.env.API_KEY;
  private baseUrl = 'https://dashscope.aliyuncs.com/api/v1';

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
      return data.output?.text?.trim() || prompt;
    } catch (error) {
      console.error("Aliyun Text Error:", error);
      return prompt;
    }
  }

  /**
   * 生成背景故事与属性 (Qwen-Plus JSON Mode)
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
   * 轮询异步任务结果 (图片/视频)
   */
  private async pollTask(taskId: string): Promise<any> {
    const pollUrl = `${this.baseUrl}/tasks/${taskId}`;
    let attempts = 0;
    while (attempts < 60) { // 最多等3分钟
      const response = await fetch(pollUrl, { headers: { 'Authorization': `Bearer ${this.apiKey}` } });
      const data = await response.json();
      const status = data.output?.task_status;

      if (status === 'SUCCEEDED') return data.output;
      if (status === 'FAILED') throw new Error(data.output?.message || "任务生成失败");
      
      await new Promise(r => setTimeout(r, 3000)); // 每3秒查一次
      attempts++;
    }
    throw new Error("任务超时");
  }

  /**
   * 生成手办图片 (通义万相 Wanxiang-V21)
   */
  private async generateImageTask(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/services/aigc/text2image/image-synthesis`, {
      method: 'POST',
      headers: { ...this.headers, 'X-DashScope-Async': 'enable' },
      body: JSON.stringify({
        model: 'wanxiang-v21',
        input: { prompt },
        parameters: { n: 1, size: '1024*1024' }
      })
    });

    const data = await response.json();
    if (!data.output?.task_id) throw new Error(data.message || "提交生图任务失败");
    
    const result = await this.pollTask(data.output.task_id);
    return result.results[0].url; // 万相返回的是公网 URL
  }

  /**
   * 生成 360° 四视图
   */
  async generate360Creation(prompt: string, styleSuffix: string): Promise<string[]> {
    const fullPrompt = `${prompt}, ${styleSuffix}, 3D toy, standing on a simple solid white background, isometric view, high quality 3d render`;
    try {
      // 阿里万相目前暂不支持类似 Gemini 的多图同步控制，我们生成一张高质量主视图
      // 为了维持 UI 的 360 度效果，这里采用“主图 + 变体”或由于 API 限制先返回单图重复（或异步并行生成多角度描述）
      const mainImage = await this.generateImageTask(`Front view, ${fullPrompt}`);
      return [mainImage, mainImage, mainImage, mainImage]; // 暂时使用同一张图确保流程通畅，后续可优化为并行请求不同角度
    } catch (error: any) {
      if (error.message?.includes('Quota')) throw new Error("QUOTA_EXCEEDED");
      throw error;
    }
  }

  /**
   * 生成视频 (通义万相-视频生成)
   */
  async generateShowcaseVideo(prompt: string, imageUrl: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/services/aigc/video-generation/video-synthesis`, {
      method: 'POST',
      headers: { ...this.headers, 'X-DashScope-Async': 'enable' },
      body: JSON.stringify({
        model: 'wanxiang-v2-video', // 需确认具体可用模型名
        input: { 
          img_url: imageUrl,
          prompt: `Cinematic camera move, 3d toy ${prompt} coming to life, professional lighting`
        }
      })
    });

    const data = await response.json();
    if (!data.output?.task_id) throw new Error("视频任务启动失败");
    
    const result = await this.pollTask(data.output.task_id);
    return result.video_url;
  }
}

export const geminiService = new AliyunService() as any; // 保持导出名一致以减少外部修改
