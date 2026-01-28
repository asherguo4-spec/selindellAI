
/**
 * Aliyun DashScope Service Integration
 * 适配最新的通义万相 2.6 (Wan2.6-t2i) 协议
 */

export class AliyunService {
  private baseUrl = '/aliyun-api';
  private apiKey = (process.env.API_KEY || '').trim();

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-SSE': 'disable'
    };
  }

  /**
   * 文本生成/扩写
   */
  async expandPrompt(prompt: string): Promise<string> {
    console.log("TS: 正在扩写 Prompt...", prompt);
    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: 'qwen-plus',
          input: {
            messages: [
              { role: 'system', content: '你是一个潮玩艺术家。将灵感扩写成50字以内的专业生图描述词，包含材质（PVC/树脂）、细节。只返回描述词。' },
              { role: 'user', content: prompt }
            ]
          }
        })
      });

      const data = await response.json();
      if (data.code) {
        console.error("TS: 文本生成 API 报错:", data);
        return prompt;
      }
      return data.output?.text?.trim() || prompt;
    } catch (error) {
      console.error("TS: 文本扩写网络请求失败:", error);
      return prompt;
    }
  }

  /**
   * 生成背景故事
   */
  async generateLoreAndStats(prompt: string): Promise<{title: string, lore: string, stats: any}> {
    console.log("TS: 正在构思背景故事...");
    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: 'qwen-plus',
          input: {
            messages: [
              { role: 'system', content: '设计手办名字、故事和属性。返回严格JSON: {"title": "...", "lore": "...", "stats": {"power": 80, "agility": 70, "soul": 90, "rarity": "Legendary"}}' },
              { role: 'user', content: prompt }
            ]
          },
          parameters: { response_format: { type: 'json_object' } }
        })
      });

      const data = await response.json();
      return JSON.parse(data.output?.text || "{}");
    } catch (error) {
      console.warn("TS: 故事生成失败，使用默认值");
      return { title: "数字幻兽", lore: "来自虚空的造物。", stats: { power: 50, agility: 50, soul: 50, rarity: "Rare" } };
    }
  }

  /**
   * 轮询异步任务 (带超时和详细报错)
   */
  private async pollTask(taskId: string): Promise<any> {
    console.log(`TS: 开始轮询任务 [${taskId}]...`);
    const pollUrl = `${this.baseUrl}/tasks/${taskId}`;
    let attempts = 0;
    const maxAttempts = 40; // 约 2 分钟

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(pollUrl, { 
          headers: { 'Authorization': `Bearer ${this.apiKey}` } 
        });
        const data = await response.json();
        
        // 关键修复：如果接口报错(如401)，直接抛出异常，不再循环
        if (data.code) {
          throw new Error(`API错误 (${data.code}): ${data.message}`);
        }

        const status = data.output?.task_status;
        console.log(`TS: 轮询中 (${attempts+1}/${maxAttempts}) - 状态: ${status}`);

        if (status === 'SUCCEEDED') {
          console.log("TS: 任务成功!", data.output);
          return data.output;
        }
        if (status === 'FAILED') {
          throw new Error(data.output?.message || "阿里云生成任务失败");
        }
        
        // 继续等待
        await new Promise(r => setTimeout(r, 3000));
        attempts++;
      } catch (e: any) {
        console.error("TS: 轮询过程中出错:", e);
        throw e;
      }
    }
    throw new Error("生图超时，请检查网络或稍后重试");
  }

  /**
   * 提交生图任务 (Wan2.6)
   */
  private async generateImageTask(prompt: string): Promise<string> {
    console.log("TS: 正在提交 Wan2.6 生成任务...");
    const response = await fetch(`${this.baseUrl}/services/aigc/multimodal-generation/generation`, {
      method: 'POST',
      headers: { ...this.headers, 'X-DashScope-Async': 'enable' },
      body: JSON.stringify({
        model: 'wan2.6-t2i',
        input: {
          messages: [{ role: "user", content: [{ text: prompt }] }]
        },
        parameters: { size: '1024*1024', n: 1 }
      })
    });

    const data = await response.json();
    if (data.code || !data.output?.task_id) {
      console.error("TS: 提交任务失败:", data);
      throw new Error(data.message || "无法连接到通义万相服务");
    }
    
    const result = await this.pollTask(data.output.task_id);
    const imageUrl = result.results?.[0]?.url;
    if (!imageUrl) throw new Error("API 未返回有效图片链接");
    return imageUrl;
  }

  async generate360Creation(prompt: string, styleSuffix: string): Promise<string[]> {
    if (!this.apiKey || this.apiKey.length < 10) {
      throw new Error("请在 .env 文件中配置有效的 API_KEY 并重启服务");
    }

    const fullPrompt = `${prompt}, ${styleSuffix}, action figure style, 3d toy, studio lighting, white background`;
    const imageUrl = await this.generateImageTask(fullPrompt);
    return [imageUrl, imageUrl, imageUrl, imageUrl]; 
  }
}

export const geminiService = new AliyunService() as any;
