"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, ClipboardCheck, Calendar, CheckCircle, Clock, AlertCircle, BarChart3 } from "lucide-react";

const statusColors: Record<string, { bg: string; text: string }> = {
  scheduled: { bg: "bg-blue-100", text: "text-blue-700" },
  in_progress: { bg: "bg-amber-100", text: "text-amber-700" },
  completed: { bg: "bg-green-100", text: "text-green-700" },
  overdue: { bg: "bg-red-100", text: "text-red-700" },
};

// Mock data
const inspections = [
  { id: "INS-2024-042", type: "Safety Walk", area: "Production Floor", assignedTo: "Rahul Sharma", scheduledDate: "2024-11-27", status: "in_progress", score: null },
  { id: "INS-2024-041", type: "Fire Safety Audit", area: "Building A", assignedTo: "Priya Patel", scheduledDate: "2024-11-28", status: "scheduled", score: null },
  { id: "INS-2024-040", type: "Housekeeping", area: "Warehouse", assignedTo: "Amit Kumar", scheduledDate: "2024-11-26", status: "completed", score: 85 },
  { id: "INS-2024-039", type: "PPE Compliance", area: "All Areas", assignedTo: "Vijay Singh", scheduledDate: "2024-11-25", status: "completed", score: 92 },
  { id: "INS-2024-038", type: "Electrical Safety", area: "Control Room", assignedTo: "Suresh Kumar", scheduledDate: "2024-11-20", status: "overdue", score: null },
];

const templates = [
  { name: "Daily Safety Walk", questions: 15, duration: "15 min" },
  { name: "Weekly Housekeeping", questions: 25, duration: "30 min" },
  { name: "Fire Safety Audit", questions: 40, duration: "1 hr" },
  { name: "PPE Compliance Check", questions: 12, duration: "10 min" },
];

export default function InspectionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [view, setView] = useState<"list" | "calendar">("list");

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch = inspection.type.toLowerCase().includes(searchQuery.toLowerCase()) || inspection.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || inspection.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    scheduled: inspections.filter((i) => i.status === "scheduled").length,
    inProgress: inspections.filter((i) => i.status === "in_progress").length,
    completed: inspections.filter((i) => i.status === "completed").length,
    overdue: inspections.filter((i) => i.status === "overdue").length,
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inspections & Audits</h1>
          <p className="text-gray-500 mt-1">Schedule and conduct safety inspections</p>
        </div>
        <div className="flex gap-2">
          <Link href="/inspections/new" className="inline-flex items-center gap-2 bg-[#2E7D32] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors">
            <Plus size={20} /> New Inspection
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg"><Calendar className="text-blue-600" size={20} /></div>
          <div><p className="text-sm text-gray-500">Scheduled</p><p className="text-xl font-bold text-gray-800">{stats.scheduled}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg"><Clock className="text-amber-600" size={20} /></div>
          <div><p className="text-sm text-gray-500">In Progress</p><p className="text-xl font-bold text-gray-800">{stats.inProgress}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="text-green-600" size={20} /></div>
          <div><p className="text-sm text-gray-500">Completed</p><p className="text-xl font-bold text-gray-800">{stats.completed}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg"><AlertCircle className="text-red-600" size={20} /></div>
          <div><p className="text-sm text-gray-500">Overdue</p><p className="text-xl font-bold text-red-600">{stats.overdue}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Search inspections..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E7D32] outline-none" />
              </div>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg outline-none bg-white">
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Inspections List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredInspections.map((inspection) => {
                const statusStyle = statusColors[inspection.status];
                return (
                  <Link key={inspection.id} href={`/inspections/${inspection.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg"><ClipboardCheck className="text-green-600" size={20} /></div>
                        <div>
                          <p className="font-medium text-gray-800">{inspection.type}</p>
                          <p className="text-sm text-gray-500">{inspection.area} • {inspection.assignedTo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}>{inspection.status.replace("_", " ")}</span>
                        <p className="text-sm text-gray-500 mt-1">{inspection.scheduledDate}</p>
                        {inspection.score && <p className="text-sm font-medium text-green-600">{inspection.score}%</p>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {filteredInspections.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <ClipboardCheck className="mx-auto mb-3 text-gray-300" size={48} />
                <p>No inspections found</p>
              </div>
            )}
          </div>
        </div>

        {/* Templates Sidebar */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Start Templates</h3>
            <div className="space-y-3">
              {templates.map((template) => (
                <Link key={template.name} href={`/inspections/new?template=${encodeURIComponent(template.name)}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
                  <p className="font-medium text-gray-800">{template.name}</p>
                  <p className="text-xs text-gray-500">{template.questions} questions • ~{template.duration}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

