
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
        <span className="text-[10px] font-mono text-gray-900 font-bold">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-1000 shadow-sm`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="glass-card rounded-[28px] p-7 border-white/80 relative shadow-sm bg-white/60">
      <div className="absolute top-0 right-0 px-4 py-1.5 bg-purple-600 text-[10px] font-black italic rounded-bl-2xl text-white shadow-sm">
        {stats.rarity}
      </div>
      <div className="mb-7">
        <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3">背景故事</h3>
        <p className="text-sm text-gray-700 font-medium italic leading-relaxed">"{lore}"</p>
      </div>
      <div className="space-y-4.5">
        <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">战斗模组</h3>
        <StatRow label="战力" value={stats.power} icon={Zap} color="text-yellow-500" />
        <StatRow label="敏捷" value={stats.agility} icon={Star} color="text-blue-500" />
        <StatRow label="灵魂" value={stats.soul} icon={Heart} color="text-pink-500" />
      </div>
    </div>
  );
};

export default StatsCard;
