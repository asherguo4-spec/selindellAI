
import React, { useState } from 'react';
import { ChevronLeft, MessageCircle, Mail, HelpCircle, Send, CheckCircle2, Loader2, Lock, Sparkles, Headphones, User } from 'lucide-react';
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
  const [formError, setFormError] = useState<string | null>(null);

  const faqs = [
    { q: '生成后的手办什么时候发货？', a: '由于是 AI 定制产品，生产周期通常为 7-14 个工作日，发货后您会收到物流通知。' },
    { q: '可以修改已经生成的图片吗？', a: '生成后如有不满意，建议重新输入创意生成，目前暂不支持对已生成结果的局部修改。' },
    { q: '收到的实物与图片有色差怎么办？', a: '受屏幕显示和生产工艺影响，实物可能存在微小色差，这属于定制类产品的正常范围。' },
    { q: '订单支持退款吗？', a: '由于是私人深度定制产品，订单进入生产流程后不支持无理由退款，请您谅解。' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) { setFormError("请填写您的反馈内容"); return; }
    if (!userId) return;
    
    setIsSubmitting(true);
    setFormError(null);
    try {
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
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      console.error("Feedback submission failed:", err);
      setFormError(`提交失败，请重试`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGuest = !userId;
  const isButtonDisabled = isSubmitting || isGuest;

  return (
    <div className="p-6 pb-24 animate-in slide-in-from-right duration-300 h-full overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 bg-gray-100 rounded-full"><ChevronLeft size={20} className="text-gray-400" /></button>
          <h2 className="text-xl font-bold text-gray-900">客户服务</h2>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 bg-green-500/10 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">顾问在线</span>
        </div>
      </div>

      {/* Main Support Entry */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <button className="glass-card p-6 rounded-[32px] flex flex-col items-center space-y-4 border-gray-100 bg-white relative group overflow-hidden active:scale-95 transition-all">
          <div className="absolute top-0 right-0 p-2 bg-purple-500/10 text-purple-400">
            <Sparkles size={10} />
          </div>
          <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 p-1.5 relative shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <div className="w-full h-full rounded-full overflow-hidden bg-purple-500/10 flex items-center justify-center">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lynn&backgroundColor=b6e3f4" alt="Lynn" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-4 border-white rounded-full"></div>
          </div>
          <div className="text-center">
            <span className="font-bold text-sm block text-gray-900">接入人工</span>
            <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest mt-0.5">顾问 - 灵汐</span>
          </div>
        </button>
        <button className="glass-card p-6 rounded-[32px] flex flex-col items-center space-y-4 border-gray-100 bg-white active:scale-95 transition-all">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <MessageCircle size={28} />
          </div>
          <div className="text-center">
            <span className="font-bold text-sm block text-gray-900">在线留言</span>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">24h 异步受理</span>
          </div>
        </button>
      </div>

      {/* FAQ Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5 px-1">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">常见问题解答</h3>
          <span className="text-[9px] text-purple-500/60 font-black uppercase tracking-widest">Self-Service</span>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details key={idx} className="glass-card rounded-2xl group border-gray-100 bg-white overflow-hidden shadow-sm">
              <summary className="p-4 list-none flex justify-between items-center cursor-pointer font-bold text-sm text-gray-700">
                <span>{faq.q}</span>
                <ChevronLeft size={16} className="-rotate-90 group-open:rotate-90 transition-transform text-gray-300" />
              </summary>
              <div className="px-5 pb-5 text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-4 animate-in fade-in duration-300">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Feedback Form */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5 px-1">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">反馈与建议</h3>
          <HelpCircle size={12} className="text-gray-300" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass-card rounded-[32px] p-6 border-gray-100 focus-within:border-purple-500/30 transition-all bg-gray-50">
            <textarea 
              className="w-full bg-transparent border-none focus:ring-0 text-sm h-32 resize-none placeholder:text-gray-300 text-gray-900 leading-relaxed no-scrollbar"
              placeholder="请详细描述您的建议或遇到的困难，灵汐会认真阅读每一条消息..."
              value={feedback}
              onChange={(e) => { setFeedback(e.target.value); setFormError(null); }}
              disabled={isSubmitting}
            />
          </div>
          <div className="glass-card rounded-[24px] px-5 py-4 border-gray-100 flex items-center space-x-3 focus-within:border-purple-500/30 transition-all bg-gray-50">
            <Mail size={18} className="text-gray-400 shrink-0" />
            <input 
              type="text" 
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-gray-300 text-gray-900 font-medium"
              placeholder="您的联系方式 (手机/微信，选填)"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          {formError && (
            <p className="text-xs text-red-400 font-bold px-1 animate-pulse">{formError}</p>
          )}

          <button 
            type="submit"
            disabled={isButtonDisabled}
            className={`w-full h-18 rounded-[28px] flex items-center justify-center space-x-3 font-black transition-all ${
              isButtonDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'purple-gradient active:scale-95 shadow-2xl shadow-purple-500/40 text-white'
            }`}
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : submitted ? (
              <CheckCircle2 size={20} />
            ) : isGuest ? (
              <Lock size={18} />
            ) : (
              <Send size={20} />
            )}
            <span className="text-lg">
              {isSubmitting ? '正在投递...' : submitted ? '提交成功，感谢反馈' : isGuest ? '登录后即可提交反馈' : '提交反馈'}
            </span>
          </button>
          
          {isGuest && (
            <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.1em] mt-3">
              灵汐的小贴士：完成登录即可开启专属造物档案
            </p>
          )}
        </form>
      </div>

      {/* Support Slogan */}
      <div className="text-center py-6">
        <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.4em] opacity-50">
          Crafted with care by Selindell Ops
        </p>
      </div>
    </div>
  );
};

export default CustomerService;
