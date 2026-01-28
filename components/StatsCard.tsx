
import React from 'react';
import { Shield, Zap, Heart, Star } from 'lucide-react';
import { CreationStats } from '../types';

interface StatsCardProps {
  stats: CreationStats;
  lore: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats, lore }) => {
  const StatRow = ({ label, value, icon: Icon, color }: any) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center space-x-1.5">
          <Icon size={12} className={color} />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-[10px] font-mono text-white">{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-1000`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="glass-card rounded-[28px] p-6 border-white/10 relative">
      <div className="absolute top-0 right-0 px-4 py-1.5 bg-purple-500 text-[10px] font-black italic rounded-bl-2xl">
        {stats.rarity}
      </div>
      <div className="mb-6">
        <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">背景故事</h3>
        <p className="text-sm text-gray-300 italic">"{lore}"</p>
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">战斗模组</h3>
        <StatRow label="战力" value={stats.power} icon={Zap} color="text-yellow-400" />
        <StatRow label="敏捷" value={stats.agility} icon={Star} color="text-blue-400" />
        <StatRow label="灵魂" value={stats.soul} icon={Heart} color="text-pink-400" />
      </div>
    </div>
  );
};

export default StatsCard;
