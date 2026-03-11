import React, { useState, useMemo } from 'react';
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
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  FileText, 
  TrendingUp, 
  Calendar,
  Filter,
  Download,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Claim } from '../App';

interface ReportsProps {
  claims: Claim[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Reports({ claims }: ReportsProps) {
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredClaims = useMemo(() => {
    return claims.filter(claim => {
      const claimDate = new Date(claim.claim_date);
      const fromDate = dateRange.from ? new Date(dateRange.from) : null;
      const toDate = dateRange.to ? new Date(dateRange.to) : null;

      const matchesDate = (!fromDate || claimDate >= fromDate) && (!toDate || claimDate <= toDate);
      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;

      return matchesDate && matchesStatus;
    });
  }, [claims, dateRange, statusFilter]);

  const stats = useMemo(() => {
    const total = filteredClaims.length;
    const open = filteredClaims.filter(c => !['הסתיים', 'בוטל'].includes(c.status)).length;
    const closed = filteredClaims.filter(c => c.status === 'הסתיים').length;
    const totalValue = filteredClaims.reduce((acc, c) => acc + (c.claim_value || 0), 0);
    
    // Average processing time for closed claims
    const closedClaims = filteredClaims.filter(c => c.status === 'הסתיים' && c.last_activity_at);
    const avgProcessingTime = closedClaims.length > 0
      ? closedClaims.reduce((acc, c) => {
          const start = new Date(c.created_at).getTime();
          const end = new Date(c.last_activity_at!).getTime();
          return acc + (end - start);
        }, 0) / (closedClaims.length * 1000 * 60 * 60 * 24)
      : 0;

    // Claims by type
    const typeCounts: Record<string, number> = {};
    filteredClaims.forEach(c => {
      typeCounts[c.claim_type] = (typeCounts[c.claim_type] || 0) + 1;
    });
    const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

    // Claims by status
    const statusCounts: Record<string, number> = {};
    filteredClaims.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Value by type
    const typeValue: Record<string, number> = {};
    filteredClaims.forEach(c => {
      typeValue[c.claim_type] = (typeValue[c.claim_type] || 0) + (c.claim_value || 0);
    });
    const typeValueData = Object.entries(typeValue).map(([name, value]) => ({ name, value }));

    // Monthly trend (last 12 months or based on range)
    const monthlyData: Record<string, { count: number, value: number }> = {};
    filteredClaims.sort((a, b) => new Date(a.claim_date).getTime() - new Date(b.claim_date).getTime()).forEach(c => {
      const d = new Date(c.claim_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) monthlyData[key] = { count: 0, value: 0 };
      monthlyData[key].count++;
      monthlyData[key].value += (c.claim_value || 0);
    });
    const trendData = Object.entries(monthlyData).map(([name, data]) => ({ 
      name, 
      count: data.count, 
      value: data.value 
    }));

    return {
      total,
      open,
      closed,
      totalValue,
      avgProcessingTime: avgProcessingTime.toFixed(1),
      typeData,
      statusData,
      typeValueData,
      trendData
    };
  }, [filteredClaims]);

  const exportToCSV = () => {
    const headers = ['מספר תביעה', 'מספר פוליסה', 'שם לקוח', 'מספר רכב', 'תאריך', 'סוג', 'סטטוס', 'סכום'];
    const rows = filteredClaims.map(c => [
      c.claim_number || '',
      c.policy_number || '',
      c.customer_name,
      c.car_number,
      c.claim_date,
      c.claim_type,
      c.status,
      c.claim_value || 0
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "\uFEFF" // BOM for Excel Hebrew support
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `claims_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 p-6" dir="rtl">
      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Calendar size={14} /> מתאריך
              </label>
              <input 
                type="date" 
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Calendar size={14} /> עד תאריך
              </label>
              <input 
                type="date" 
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Filter size={14} /> סטטוס
              </label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">כל הסטטוסים</option>
                <option value="חדש">חדש</option>
                <option value="בטיפול">בטיפול</option>
                <option value="ממתין לחלקים">ממתין לחלקים</option>
                <option value="הסתיים">הסתיים</option>
                <option value="בוטל">בוטל</option>
              </select>
            </div>
          </div>
          <button 
            onClick={exportToCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm shrink-0"
          >
            <Download size={18} />
            <span>ייצוא לאקסל</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportStatCard 
          title='סה"כ תביעות' 
          value={stats.total} 
          icon={<FileText className="w-6 h-6 text-blue-500" />}
          color="bg-blue-50"
        />
        <ReportStatCard 
          title="סכום תביעות כולל" 
          value={`₪${stats.totalValue.toLocaleString()}`} 
          icon={<DollarSign className="w-6 h-6 text-emerald-500" />}
          color="bg-emerald-50"
        />
        <ReportStatCard 
          title="זמן טיפול ממוצע" 
          value={`${stats.avgProcessingTime} ימים`} 
          icon={<Clock className="w-6 h-6 text-indigo-500" />}
          color="bg-indigo-50"
        />
        <ReportStatCard 
          title="אחוז סגירה" 
          value={stats.total > 0 ? `${((stats.closed / stats.total) * 100).toFixed(1)}%` : '0%'} 
          icon={<CheckCircle className="w-6 h-6 text-amber-500" />}
          color="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims by Type Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <h3 className="text-lg font-semibold mb-6 text-slate-800">התפלגות לפי סוג תביעה</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

        {/* Claims by Status Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <h3 className="text-lg font-semibold mb-6 text-slate-800">כמות תביעות לפי סטטוס</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={100} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Value Trend Area Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
      >
        <h3 className="text-lg font-semibold mb-6 text-slate-800">מגמת סכומי תביעות לאורך זמן</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.trendData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`₪${value.toLocaleString()}`, 'סכום']}
              />
              <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Value by Type Bar Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
      >
        <h3 className="text-lg font-semibold mb-6 text-slate-800">סכום תביעות מצטבר לפי סוג</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.typeValueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`₪${value.toLocaleString()}`, 'סכום']}
              />
              <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

function ReportStatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
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
