"use client";

import { useState } from "react";
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Filter, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";

const reportTypes = [
  { name: "Incident Summary", description: "Monthly incident statistics", icon: "📊" },
  { name: "Permit Analytics", description: "PTW trends and analysis", icon: "📋" },
  { name: "Training Compliance", description: "Training completion rates", icon: "🎓" },
  { name: "Audit Findings", description: "Inspection and audit results", icon: "🔍" },
  { name: "CAPA Status", description: "Corrective action tracking", icon: "✅" },
  { name: "Contractor Performance", description: "Contractor safety scores", icon: "🏗️" },
];

const kpis = [
  { name: "LTIFR", value: "0.42", change: -15, unit: "", description: "Lost Time Injury Frequency Rate" },
  { name: "TRIFR", value: "1.28", change: -8, unit: "", description: "Total Recordable Injury Frequency Rate" },
  { name: "Near Miss Ratio", value: "12:1", change: 25, unit: "", description: "Near misses per incident" },
  { name: "Training Compliance", value: "94", change: 5, unit: "%", description: "Employees with valid training" },
  { name: "Permit Closure Rate", value: "98", change: 2, unit: "%", description: "Permits closed on time" },
  { name: "Audit Score", value: "89", change: 3, unit: "%", description: "Average audit score" },
];

const recentReports = [
  { name: "November 2024 Safety Report", type: "Monthly", date: "2024-11-25", size: "2.4 MB" },
  { name: "Q3 2024 Incident Analysis", type: "Quarterly", date: "2024-10-15", size: "5.1 MB" },
  { name: "Annual Safety Review 2023", type: "Annual", date: "2024-01-30", size: "12.8 MB" },
  { name: "Contractor Safety Report", type: "Monthly", date: "2024-11-20", size: "1.8 MB" },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("month");

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Safety performance metrics and insights</p>
        </div>
        <div className="flex gap-2">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg outline-none bg-white">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="inline-flex items-center gap-2 bg-[#0D47A1] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-800">
            <Download size={20} /> Export
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">{kpi.name}</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-gray-800">{kpi.value}{kpi.unit}</span>
              <span className={`flex items-center text-xs font-medium ${kpi.change > 0 ? "text-green-600" : "text-red-600"}`}>
                {kpi.change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(kpi.change)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Trend Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Incident Trends</h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Incidents</span>
                <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Near Misses</span>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-400">
                <BarChart3 size={48} className="mx-auto mb-2" />
                <p>Chart visualization will be rendered here</p>
                <p className="text-sm">Integration with Chart.js or Recharts</p>
              </div>
            </div>
          </div>

          {/* Safety Score Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Safety Score Trend</h3>
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-400">
                <TrendingUp size={48} className="mx-auto mb-2" />
                <p>Line chart showing safety score over time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Generate Report</h3>
            <div className="space-y-2">
              {reportTypes.map((report) => (
                <button key={report.name} className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{report.icon}</span>
                    <div>
                      <p className="font-medium text-gray-800">{report.name}</p>
                      <p className="text-xs text-gray-500">{report.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FileText size={18} /> Recent Reports</h3>
            <div className="space-y-3">
              {recentReports.map((report, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{report.name}</p>
                    <p className="text-xs text-gray-500">{report.type} • {report.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{report.size}</span>
                    <Download size={16} className="text-gray-400 hover:text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

