
import React, { useState } from 'react';
import { ChevronLeft, MessageCircle, Mail, HelpCircle, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

interface CustomerServiceProps {
  onBack: () => void;
}

const CustomerService: React.FC<CustomerServiceProps> = ({ onBack }) => {
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
    setSubmitted(false);

    try {
      const userId = '82930415-0000-0000-0000-000000000000'; // 使用 App 中定义的固定 ID
      
      // 这里的 'feedbacks' 表需要你在 Supabase 中创建
      // 字段建议：content (text), contact (text), user_id (uuid), created_at (timestamp)
      const { error } = await supabase.from('feedbacks').insert([
        {
          content: feedback.trim(),
          contact: contactInfo.trim(),
          user_id: userId
        }
      ]);

      if (error) throw error;

      setSubmitted(true);
      setFeedback('');
      setContactInfo('');
      // 3秒后重置成功状态，允许再次反馈
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      console.error("Feedback submission failed:", err);
      alert(`反馈提交失败: ${err.message || '请检查数据库 feedbacks 表是否存在'}`);
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

      {/* Online Options */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <button className="glass-card p-6 rounded-3xl flex flex-col items-center space-y-3 hover:border-purple-500/40 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <MessageCircle size={24} />
          </div>
          <span className="font-bold text-sm">在线咨询</span>
          <span className="text-[10px] text-gray-500">9:00 - 22:00</span>
        </button>
        <button className="glass-card p-6 rounded-3xl flex flex-col items-center space-y-3 hover:border-purple-500/40 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Mail size={24} />
          </div>
          <span className="font-bold text-sm">邮件反馈</span>
          <span className="text-[10px] text-gray-500">24小时接收</span>
        </button>
      </div>

      {/* FAQ Section */}
      <div className="mb-10">
        <div className="flex items-center space-x-2 mb-4 px-1">
          <HelpCircle size={16} className="text-purple-400" />
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">常见问题</h3>
        </div>
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

      {/* Feedback Form */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4 px-1">
          <Send size={16} className="text-purple-400" />
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">问题反馈</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass-card rounded-3xl p-4 border-white/5 focus-within:border-purple-500/30 transition-colors">
            <textarea 
              className="w-full bg-transparent border-none focus:ring-0 text-sm h-32 resize-none placeholder:text-gray-700 text-white"
              placeholder="请详细描述您遇到的问题或您的宝贵建议..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="glass-card rounded-2xl p-4 border-white/5 flex items-center space-x-3 focus-within:border-purple-500/30 transition-colors">
            <Mail size={18} className="text-gray-600" />
            <input 
              type="text" 
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-gray-700 text-white"
              placeholder="您的联系方式 (手机或邮箱)"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting || !feedback.trim()}
            className={`w-full h-14 rounded-2xl flex items-center justify-center space-x-2 font-bold transition-all ${
              isSubmitting || !feedback.trim() 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'purple-gradient shadow-xl shadow-purple-500/30 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center space-x-2">
                <Loader2 size={20} className="animate-spin" />
                <span>正在传送至云端...</span>
              </span>
            ) : submitted ? (
              <span className="flex items-center space-x-2 text-green-400">
                <CheckCircle2 size={20} />
                <span>反馈已收到，感谢！</span>
              </span>
            ) : (
              <span>提交反馈</span>
            )}
          </button>
        </form>
      </div>

      <div className="text-center p-4">
        <p className="text-[10px] text-gray-700 italic tracking-widest uppercase">
          Selindell AI Feedback Engine v1.0
        </p>
      </div>
    </div>
  );
};

export default CustomerService;
