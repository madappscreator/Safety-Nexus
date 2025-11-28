"use client";

import { useState } from "react";
import { FileText, CheckCircle, AlertTriangle, Clock, Calendar, Upload, Download, Shield } from "lucide-react";

const statusColors: Record<string, { bg: string; text: string }> = {
  compliant: { bg: "bg-green-100", text: "text-green-700" },
  pending: { bg: "bg-amber-100", text: "text-amber-700" },
  non_compliant: { bg: "bg-red-100", text: "text-red-700" },
  upcoming: { bg: "bg-blue-100", text: "text-blue-700" },
};

// Mock data
const regulations = [
  { id: "REG-001", name: "Factories Act, 1948", category: "Statutory", lastAudit: "2024-10-15", nextAudit: "2025-04-15", status: "compliant", score: 95 },
  { id: "REG-002", name: "BOCW Act", category: "Statutory", lastAudit: "2024-09-20", nextAudit: "2025-03-20", status: "compliant", score: 88 },
  { id: "REG-003", name: "Environment Protection Act", category: "Environmental", lastAudit: "2024-11-01", nextAudit: "2025-05-01", status: "pending", score: null },
  { id: "REG-004", name: "Fire Safety NOC", category: "Fire Safety", lastAudit: "2024-06-15", nextAudit: "2024-12-15", status: "upcoming", score: 92 },
  { id: "REG-005", name: "ISO 45001:2018", category: "Management System", lastAudit: "2024-08-10", nextAudit: "2025-08-10", status: "compliant", score: 90 },
];

const documents = [
  { name: "Factory License", expiry: "2025-03-31", status: "valid" },
  { name: "Fire NOC", expiry: "2024-12-31", status: "expiring" },
  { name: "Pollution Control Consent", expiry: "2025-06-30", status: "valid" },
  { name: "Electrical Safety Audit", expiry: "2024-11-30", status: "expired" },
  { name: "Pressure Vessel Certificate", expiry: "2025-01-15", status: "valid" },
];

const upcomingDeadlines = [
  { task: "Submit Form 25 (Annual Return)", deadline: "2024-12-31", regulation: "Factories Act" },
  { task: "Fire Safety Audit", deadline: "2024-12-15", regulation: "Fire NOC" },
  { task: "Renew Electrical Audit", deadline: "2024-11-30", regulation: "Electrical Safety" },
  { task: "Submit Hazardous Waste Return", deadline: "2025-01-31", regulation: "Environment Act" },
];

export default function CompliancePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const stats = {
    compliant: regulations.filter((r) => r.status === "compliant").length,
    pending: regulations.filter((r) => r.status === "pending").length,
    nonCompliant: regulations.filter((r) => r.status === "non_compliant").length,
    avgScore: Math.round(regulations.filter((r) => r.score).reduce((sum, r) => sum + (r.score || 0), 0) / regulations.filter((r) => r.score).length),
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Compliance Management</h1>
          <p className="text-gray-500 mt-1">Track regulatory compliance and legal requirements</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#0D47A1] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-800">
          <Download size={20} /> Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="text-green-600" size={20} /></div>
            <div><p className="text-sm text-gray-500">Compliant</p><p className="text-2xl font-bold text-green-600">{stats.compliant}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg"><Clock className="text-amber-600" size={20} /></div>
            <div><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-amber-600">{stats.pending}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="text-red-600" size={20} /></div>
            <div><p className="text-sm text-gray-500">Non-Compliant</p><p className="text-2xl font-bold text-red-600">{stats.nonCompliant}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Shield className="text-blue-600" size={20} /></div>
            <div><p className="text-sm text-gray-500">Avg Score</p><p className="text-2xl font-bold text-blue-600">{stats.avgScore}%</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regulations List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Regulatory Compliance</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {regulations.map((reg) => {
                const statusStyle = statusColors[reg.status];
                return (
                  <div key={reg.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{reg.name}</p>
                        <p className="text-sm text-gray-500">{reg.category} • Next Audit: {reg.nextAudit}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}>{reg.status.replace("_", " ")}</span>
                        {reg.score && <p className="text-sm font-medium text-gray-600 mt-1">{reg.score}%</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Calendar size={18} /> Upcoming Deadlines</h3>
            <div className="space-y-3">
              {upcomingDeadlines.map((item, idx) => (
                <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-medium text-gray-800 text-sm">{item.task}</p>
                  <p className="text-xs text-gray-500">{item.regulation}</p>
                  <p className="text-xs text-amber-700 mt-1 font-medium">Due: {item.deadline}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FileText size={18} /> Key Documents</h3>
            <div className="space-y-2">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                    <p className="text-xs text-gray-500">Expires: {doc.expiry}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${doc.status === "valid" ? "bg-green-100 text-green-700" : doc.status === "expiring" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <Upload size={16} /> Upload Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

