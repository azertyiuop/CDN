import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, MessageSquare, Activity } from 'lucide-react';

interface AnalyticsChartProps {
  type: 'users' | 'messages' | 'streams';
  timeRange: '24h' | '7d' | '30d';
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ type, timeRange }) => {
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [stats, setStats] = useState({
    current: 0,
    previous: 0,
    change: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [type, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/analytics/${type}?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        setLabels(result.labels);
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      const mockData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 100));
      const mockLabels = Array.from({ length: 24 }, (_, i) => `${i}h`);
      setData(mockData);
      setLabels(mockLabels);
      setStats({
        current: mockData[mockData.length - 1],
        previous: mockData[0],
        change: ((mockData[mockData.length - 1] - mockData[0]) / mockData[0]) * 100
      });
    }
  };

  const maxValue = Math.max(...data);
  const chartHeight = 200;

  const getIcon = () => {
    switch (type) {
      case 'users':
        return <Users className="h-6 w-6 text-cyan-400" />;
      case 'messages':
        return <MessageSquare className="h-6 w-6 text-purple-400" />;
      case 'streams':
        return <Activity className="h-6 w-6 text-green-400" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'users':
        return 'cyan';
      case 'messages':
        return 'purple';
      case 'streams':
        return 'green';
    }
  };

  const color = getColor();

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <h3 className="text-lg font-bold capitalize">{type}</h3>
            <p className="text-sm text-slate-400">Dernières {timeRange === '24h' ? '24 heures' : timeRange === '7d' ? '7 jours' : '30 jours'}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{stats.current}</div>
          <div className={`text-sm flex items-center gap-1 ${stats.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className={`h-4 w-4 ${stats.change < 0 && 'rotate-180'}`} />
            {Math.abs(stats.change).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="relative" style={{ height: chartHeight }}>
        <svg width="100%" height={chartHeight} className="overflow-visible">
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={`var(--${color}-500)`} stopOpacity="0.3" />
              <stop offset="100%" stopColor={`var(--${color}-500)`} stopOpacity="0" />
            </linearGradient>
          </defs>

          <path
            d={`
              M 0 ${chartHeight}
              ${data.map((value, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = chartHeight - (value / maxValue) * chartHeight;
                return `L ${x}% ${y}`;
              }).join(' ')}
              L 100% ${chartHeight}
              Z
            `}
            fill={`url(#gradient-${type})`}
          />

          <polyline
            points={data.map((value, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = chartHeight - (value / maxValue) * chartHeight;
              return `${x}%,${y}`;
            }).join(' ')}
            fill="none"
            stroke={`var(--${color}-400)`}
            strokeWidth="2"
            className={`stroke-${color}-400`}
          />

          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = chartHeight - (value / maxValue) * chartHeight;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={y}
                r="3"
                className={`fill-${color}-400`}
              />
            );
          })}
        </svg>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-500 mt-2">
          <span>{labels[0]}</span>
          <span>{labels[Math.floor(labels.length / 2)]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
