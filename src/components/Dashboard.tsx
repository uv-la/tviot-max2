import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  TrendingUp, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { Claim } from '../App';

interface DashboardProps {
  claims: Claim[];
  onViewClaim: (claim: Claim) => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard({ claims, onViewClaim }: DashboardProps) {
  const stats = useMemo(() => {
    const total = claims.length;
    const open = claims.filter(c => !['הסתיים', 'בוטל'].includes(c.status)).length;
    const closed = claims.filter(c => c.status === 'הסתיים').length;
    
    // Average processing time for closed claims (in days)
    const closedClaims = claims.filter(c => c.status === 'הסתיים' && c.last_activity_at);
    const avgProcessingTime = closedClaims.length > 0
      ? closedClaims.reduce((acc, c) => {
          const start = new Date(c.created_at).getTime();
          const end = new Date(c.last_activity_at!).getTime();
          return acc + (end - start);
        }, 0) / (closedClaims.length * 1000 * 60 * 60 * 24)
      : 0;

    // Claims by type
    const typeCounts: Record<string, number> = {};
    claims.forEach(c => {
      typeCounts[c.claim_type] = (typeCounts[c.claim_type] || 0) + 1;
    });
    const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

    // Claims by status
    const statusCounts: Record<string, number> = {};
    claims.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Recently updated claims
    const recentClaims = [...claims]
      .sort((a, b) => {
        const dateA = new Date(a.last_activity_at || a.created_at).getTime();
        const dateB = new Date(b.last_activity_at || b.created_at).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    // Claims over time (last 6 months)
    const claimsByMonth: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('he-IL', { month: 'short' });
      claimsByMonth[monthName] = 0;
    }

    claims.forEach(c => {
      const d = new Date(c.created_at);
      const monthName = d.toLocaleString('he-IL', { month: 'short' });
      if (claimsByMonth[monthName] !== undefined) {
        claimsByMonth[monthName]++;
      }
    });
    const trendData = Object.entries(claimsByMonth).map(([name, value]) => ({ name, value }));

    return {
      total,
      open,
      closed,
      avgProcessingTime: avgProcessingTime.toFixed(1),
      typeData,
      statusData,
      recentClaims,
      trendData
    };
  }, [claims]);

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title='סה"כ תביעות' 
          value={stats.total} 
          icon={<FileText className="w-6 h-6 text-blue-500" />}
          color="bg-blue-50"
        />
        <StatCard 
          title="תביעות פתוחות" 
          value={stats.open} 
          icon={<Clock className="w-6 h-6 text-amber-500" />}
          color="bg-amber-50"
        />
        <StatCard 
          title="תביעות שהסתיימו" 
          value={stats.closed} 
          icon={<CheckCircle className="w-6 h-6 text-emerald-500" />}
          color="bg-emerald-50"
        />
        <StatCard 
          title="זמן טיפול ממוצע (ימים)" 
          value={stats.avgProcessingTime} 
          icon={<TrendingUp className="w-6 h-6 text-indigo-500" />}
          color="bg-indigo-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims by Type Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <h3 className="text-lg font-semibold mb-6 text-slate-800">התפלגות לפי סוג תביעה</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Claims Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <h3 className="text-lg font-semibold mb-6 text-slate-800">מגמת תביעות חדשות (6 חודשים)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <h3 className="text-lg font-semibold mb-6 text-slate-800">סטטוס תביעות</h3>
          <div className="space-y-4">
            {stats.statusData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm text-slate-600 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ 
                        width: `${(item.value / stats.total) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recently Updated */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">עדכונים אחרונים</h3>
            <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
              צפה בכל התביעות <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 font-semibold text-slate-500 text-sm">לקוח</th>
                  <th className="pb-3 font-semibold text-slate-500 text-sm">פוליסה</th>
                  <th className="pb-3 font-semibold text-slate-500 text-sm">רכב</th>
                  <th className="pb-3 font-semibold text-slate-500 text-sm">סטטוס</th>
                  <th className="pb-3 font-semibold text-slate-500 text-sm">עדכון אחרון</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentClaims.map((claim) => {
                  const isDocsComplete = claim.requested_docs && claim.requested_docs.length > 0 && claim.requested_docs.every(field => !!(claim as any)[field]);
                  return (
                    <tr key={claim.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1 shrink-0 items-center justify-center w-5">
                            <span 
                              className={`w-4 h-4 rounded-full ${isDocsComplete ? 'bg-emerald-500' : 'bg-yellow-400'}`} 
                              title={isDocsComplete ? 'כל המסמכים הנדרשים הועלו' : 'חסרים מסמכים נדרשים'}
                            ></span>
                            {claim.has_customer_updates ? (
                              <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse" title="מסמכים חדשים מהלקוח"></span>
                            ) : (
                              <div className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-slate-800 truncate">{claim.customer_name}</div>
                            <div className="text-xs text-slate-500 truncate">{claim.customer_phone}</div>
                          </div>
                        </div>
                      </td>
                    <td className="py-4">
                      <div className="text-sm text-slate-600">{claim.policy_number || '-'}</div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm text-slate-700">{claim.car_number}</div>
                      <div className="text-xs text-slate-500">{claim.car_model}</div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        claim.status === 'הסתיים' ? 'bg-emerald-100 text-emerald-700' :
                        claim.status === 'בוטל' ? 'bg-slate-100 text-slate-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-500">
                      {new Date(claim.last_activity_at || claim.created_at).toLocaleDateString('he-IL')}
                    </td>
                    <td className="py-4 text-left">
                      <button 
                        onClick={() => onViewClaim(claim)}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <ArrowRight className="w-5 h-5 rotate-180" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <div className="text-sm text-slate-500 font-medium">{title}</div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
      </div>
    </motion.div>
  );
}
