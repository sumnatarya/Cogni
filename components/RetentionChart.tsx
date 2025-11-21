import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface RetentionChartProps {
  reps: number;
}

export const RetentionChart: React.FC<RetentionChartProps> = ({ reps }) => {
  // Mock data generation simulating Ebbinghaus Forgetting Curve vs Spaced Repetition
  const generateData = () => {
    const data = [];
    const days = 10;
    
    // Base forgetting curve (Exponential decay)
    // R = e^(-t/S) where S is stability.
    
    for (let t = 0; t <= days; t++) {
      // Without Spaced Repetition (Rapid decay)
      const retentionNoRep = Math.exp(-t * 0.5) * 100;
      
      // With Spaced Repetition (Simulated resets)
      // Assuming reps happen at t=1, t=3, t=6 for example
      let retentionWithRep = 0;
      
      if (t === 0) retentionWithRep = 100;
      else if (t === 1) retentionWithRep = 100; // First rep
      else if (t === 3 && reps > 1) retentionWithRep = 100; // Second rep
      else if (t === 6 && reps > 2) retentionWithRep = 100; // Third rep
      else {
         // Decay is slower after each rep
         // Simple logic: find last rep time, decay from there with higher stability
         let lastRepT = 0;
         let stability = 2; // Initial stability
         
         if (t > 1) { lastRepT = 1; stability = 5; }
         if (t > 3 && reps > 1) { lastRepT = 3; stability = 10; }
         if (t > 6 && reps > 2) { lastRepT = 6; stability = 20; }
         
         const timeSinceRep = t - lastRepT;
         retentionWithRep = Math.exp(-timeSinceRep / stability) * 100;
      }

      data.push({
        day: `Day ${t}`,
        noRep: Math.max(0, retentionNoRep),
        withRep: Math.max(0, retentionWithRep)
      });
    }
    return data;
  };

  const data = generateData();

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWithRep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{fontSize: 10}} tickLine={false} axisLine={false} interval={2} />
          <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} unit="%" />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ fontSize: '12px' }}
            labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="withRep" 
            stroke="#14b8a6" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#colorWithRep)" 
            name="With Plan"
          />
          <Line 
            type="monotone" 
            dataKey="noRep" 
            stroke="#94a3b8" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            dot={false} 
            name="Typical Forgetting"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
