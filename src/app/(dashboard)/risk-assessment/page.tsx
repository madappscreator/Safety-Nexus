"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Shield, AlertTriangle, CheckCircle, Clock, FileText, BarChart3 } from "lucide-react";

const riskLevels: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: "bg-green-100", text: "text-green-700", label: "Low" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium" },
  high: { bg: "bg-orange-100", text: "text-orange-700", label: "High" },
  critical: { bg: "bg-red-100", text: "text-red-700", label: "Critical" },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700" },
  pending_review: { bg: "bg-amber-100", text: "text-amber-700" },
  approved: { bg: "bg-green-100", text: "text-green-700" },
  expired: { bg: "bg-red-100", text: "text-red-700" },
};

// Mock data
const assessments = [
  { id: "HIRA-2024-025", title: "Hot Work in Confined Space", type: "HIRA", activity: "Welding inside storage tank", riskLevel: "critical", status: "approved", createdDate: "2024-11-20", reviewDate: "2025-05-20" },
  { id: "JSA-2024-042", title: "Roof Maintenance Work", type: "JSA", activity: "Cleaning and repair of roof panels", riskLevel: "high", status: "approved", createdDate: "2024-11-18", reviewDate: "2025-02-18" },
  { id: "HIRA-2024-024", title: "Chemical Transfer Operations", type: "HIRA", activity: "Transfer of hazardous chemicals", riskLevel: "high", status: "pending_review", createdDate: "2024-11-25", reviewDate: null },
  { id: "JSA-2024-041", title: "Forklift Operations", type: "JSA", activity: "Material handling in warehouse", riskLevel: "medium", status: "approved", createdDate: "2024-11-10", reviewDate: "2025-05-10" },
  { id: "HIRA-2024-023", title: "Electrical Panel Maintenance", type: "HIRA", activity: "Maintenance of HT panels", riskLevel: "critical", status: "expired", createdDate: "2024-05-15", reviewDate: "2024-11-15" },
];

const riskMatrix = [
  { severity: "Catastrophic", likelihood: ["Medium", "High", "Critical", "Critical", "Critical"] },
  { severity: "Major", likelihood: ["Low", "Medium", "High", "Critical", "Critical"] },
  { severity: "Moderate", likelihood: ["Low", "Medium", "Medium", "High", "High"] },
  { severity: "Minor", likelihood: ["Low", "Low", "Medium", "Medium", "High"] },
  { severity: "Negligible", likelihood: ["Low", "Low", "Low", "Low", "Medium"] },
];

export default function RiskAssessmentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || assessment.type === selectedType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: assessments.length,
    critical: assessments.filter((a) => a.riskLevel === "critical").length,
    pending: assessments.filter((a) => a.status === "pending_review").length,
    expired: assessments.filter((a) => a.status === "expired").length,
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Risk Assessment</h1>
          <p className="text-gray-500 mt-1">HIRA, JSA, and risk management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/risk-assessment/new?type=hira" className="inline-flex items-center gap-2 bg-[#0D47A1] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-800">
            <Plus size={20} /> New HIRA
          </Link>
          <Link href="/risk-assessment/new?type=jsa" className="inline-flex items-center gap-2 border border-[#0D47A1] text-[#0D47A1] px-4 py-2.5 rounded-lg font-medium hover:bg-blue-50">
            <Plus size={20} /> New JSA
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Assessments</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Critical Risks</p>
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Pending Review</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Expired</p>
          <p className="text-2xl font-bold text-gray-600">{stats.expired}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessments List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Search assessments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
              </div>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg outline-none bg-white">
                <option value="all">All Types</option>
                <option value="HIRA">HIRA</option>
                <option value="JSA">JSA</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredAssessments.map((assessment) => {
                const riskStyle = riskLevels[assessment.riskLevel];
                const statusStyle = statusColors[assessment.status];
                return (
                  <Link key={assessment.id} href={`/risk-assessment/${assessment.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${riskStyle.bg}`}><Shield className={riskStyle.text} size={20} /></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">{assessment.type}</span>
                            <p className="font-medium text-gray-800">{assessment.title}</p>
                          </div>
                          <p className="text-sm text-gray-500">{assessment.activity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${riskStyle.bg} ${riskStyle.text}`}>{riskStyle.label} Risk</span>
                        <p className="text-sm text-gray-500 mt-1">{assessment.createdDate}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Risk Matrix */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 size={18} /> Risk Matrix</h3>
            <div className="text-xs">
              <div className="grid grid-cols-6 gap-1 mb-1">
                <div></div>
                {["Rare", "Unlikely", "Possible", "Likely", "Certain"].map((l) => (
                  <div key={l} className="text-center text-gray-500 font-medium">{l.slice(0, 3)}</div>
                ))}
              </div>
              {riskMatrix.map((row, i) => (
                <div key={i} className="grid grid-cols-6 gap-1 mb-1">
                  <div className="text-gray-500 font-medium text-right pr-1">{row.severity.slice(0, 3)}</div>
                  {row.likelihood.map((level, j) => (
                    <div key={j} className={`h-6 rounded ${riskLevels[level.toLowerCase()].bg}`}></div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-3 mt-4 text-xs">
              {Object.entries(riskLevels).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${val.bg}`}></div>
                  <span>{val.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

