
import React, { useState } from 'react';
import { ChevronLeft, MessageCircle, Mail, HelpCircle, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

interface CustomerServiceProps {
  userId: string;
  onBack: () => void;
}

const CustomerService: React.FC<CustomerServiceProps> = ({ userId, onBack }) => {
  const [feedback, setFeedback] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    { q: '生成后的手办什么时候发货？', a: '由于是 AI 定制产品，生产周期通常为 7-14 个工作日，发货后您会收到物流通知。' },
    { q: '可以修改已经生成的图片吗？', a: '生成后如有不满意，建议重新输入创意生成，目前暂不支持对已生成结果的局部修改。' },
    { q: '收到的实物与图片有色差怎么办？', a: '受屏幕显示和生产工艺影响，实物可能存在微小色差，这属于定制类产品的正常范围。' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    setIsSubmitting(true);
    try {
      // 尝试插入，带上 user_id
      const { error } = await supabase.from('feedbacks').insert([
        {
          content: feedback.trim(),
          contact: contactInfo.trim(),
          user_id: userId
        }
      ]);

      if (error) {
        // 如果是因为 user_id 不存在，尝试不带 user_id 再次提交
        if (error.message.includes('user_id') || error.code === '42703') {
          const { error: retryError } = await supabase.from('feedbacks').insert([
            {
              content: feedback.trim(),
              contact: contactInfo.trim()
            }
          ]);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }

      setSubmitted(true);
      setFeedback('');
      setContactInfo('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      console.error("Feedback submission failed:", err);
      alert(`反馈提交失败: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 pb-24 animate-in slide-in-from-right duration-300 min-h-screen overflow-y-auto no-scrollbar">
      <div className="flex items-center space-x-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold">联系客服</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <button className="glass-card p-6 rounded-[32px] flex flex-col items-center space-y-3 border-white/5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <MessageCircle size={24} />
          </div>
          <span className="font-bold text-sm">在线咨询</span>
          <span className="text-[10px] text-gray-500">9:00 - 22:00</span>
        </button>
        <button className="glass-card p-6 rounded-[32px] flex flex-col items-center space-y-3 border-white/5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Mail size={24} />
          </div>
          <span className="font-bold text-sm">邮件反馈</span>
          <span className="text-[10px] text-gray-500">24小时接收</span>
        </button>
      </div>

      <div className="mb-10">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-1">常见问题</h3>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details key={idx} className="glass-card rounded-2xl group border-white/5">
              <summary className="p-4 list-none flex justify-between items-center cursor-pointer font-medium text-sm">
                <span>{faq.q}</span>
                <ChevronLeft size={16} className="-rotate-90 group-open:rotate-90 transition-transform text-gray-600" />
              </summary>
              <div className="px-4 pb-4 text-xs text-gray-500 leading-relaxed border-t border-white/5 pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-1">问题反馈</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass-card rounded-[28px] p-4 border-white/10 focus-within:border-purple-500/30 transition-colors">
            <textarea 
              className="w-full bg-transparent border-none focus:ring-0 text-sm h-32 resize-none placeholder:text-gray-800 text-white leading-relaxed"
              placeholder="您的建议将直接发送给造物主团队..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="glass-card rounded-[20px] px-4 py-3 border-white/10 flex items-center space-x-3 focus-within:border-purple-500/30 transition-colors">
            <Mail size={18} className="text-gray-600 shrink-0" />
            <input 
              type="text" 
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-gray-800 text-white"
              placeholder="您的联系方式 (选填)"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting || !feedback.trim()}
            className={`w-full h-16 rounded-[24px] flex items-center justify-center space-x-2 font-bold transition-all ${
              isSubmitting || !feedback.trim() ? 'bg-gray-800 text-gray-500' : 'purple-gradient active:scale-95 shadow-xl shadow-purple-500/30'
            }`}
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : submitted ? <CheckCircle2 size={20} /> : <Send size={20} />}
            <span>{isSubmitting ? '发送中...' : submitted ? '已收到反馈' : '提交反馈'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerService;
