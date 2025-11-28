"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Building2, Users, FileCheck, AlertTriangle, CheckCircle, Clock, Star } from "lucide-react";

const statusColors: Record<string, { bg: string; text: string }> = {
  approved: { bg: "bg-green-100", text: "text-green-700" },
  pending: { bg: "bg-amber-100", text: "text-amber-700" },
  expired: { bg: "bg-red-100", text: "text-red-700" },
  suspended: { bg: "bg-gray-100", text: "text-gray-700" },
};

// Mock data
const contractors = [
  { id: "CON-001", name: "ABC Engineering Pvt Ltd", type: "Mechanical", workers: 25, activePermits: 3, safetyScore: 92, status: "approved", validUntil: "2025-03-15" },
  { id: "CON-002", name: "XYZ Electrical Services", type: "Electrical", workers: 12, activePermits: 2, safetyScore: 88, status: "approved", validUntil: "2025-01-20" },
  { id: "CON-003", name: "SafeClean Solutions", type: "Housekeeping", workers: 30, activePermits: 0, safetyScore: 95, status: "approved", validUntil: "2025-06-30" },
  { id: "CON-004", name: "BuildRight Construction", type: "Civil", workers: 45, activePermits: 5, safetyScore: 78, status: "pending", validUntil: "2024-12-01" },
  { id: "CON-005", name: "TechMaint Services", type: "Maintenance", workers: 8, activePermits: 1, safetyScore: 65, status: "suspended", validUntil: "2024-11-15" },
];

const pendingWorkers = [
  { name: "Rajesh Kumar", contractor: "ABC Engineering", document: "Safety Induction", status: "pending" },
  { name: "Sunil Sharma", contractor: "XYZ Electrical", document: "Medical Fitness", status: "pending" },
  { name: "Amit Patel", contractor: "BuildRight", document: "Work at Height Cert", status: "pending" },
];

export default function ContractorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredContractors = contractors.filter((contractor) => {
    const matchesSearch = contractor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || contractor.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: contractors.length,
    approved: contractors.filter((c) => c.status === "approved").length,
    totalWorkers: contractors.reduce((sum, c) => sum + c.workers, 0),
    activePermits: contractors.reduce((sum, c) => sum + c.activePermits, 0),
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Contractor Management</h1>
          <p className="text-gray-500 mt-1">Manage contractors, workers, and compliance</p>
        </div>
        <Link href="/contractors/new" className="inline-flex items-center gap-2 bg-[#0D47A1] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-800">
          <Plus size={20} /> Add Contractor
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Contractors</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Workers</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalWorkers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Active Permits</p>
          <p className="text-2xl font-bold text-amber-600">{stats.activePermits}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contractors List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Search contractors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
              </div>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg outline-none bg-white">
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredContractors.map((contractor) => {
                const statusStyle = statusColors[contractor.status];
                return (
                  <Link key={contractor.id} href={`/contractors/${contractor.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg"><Building2 className="text-blue-600" size={24} /></div>
                        <div>
                          <p className="font-medium text-gray-800">{contractor.name}</p>
                          <p className="text-sm text-gray-500">{contractor.type} • {contractor.workers} workers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}>{contractor.status}</span>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <Star className="text-amber-400" size={14} fill="currentColor" />
                          <span className="text-sm font-medium">{contractor.safetyScore}%</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={18} /> Pending Worker Approvals
            </h3>
            <div className="space-y-3">
              {pendingWorkers.map((worker, idx) => (
                <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-medium text-gray-800">{worker.name}</p>
                  <p className="text-sm text-gray-500">{worker.contractor}</p>
                  <p className="text-xs text-amber-700 mt-1">Missing: {worker.document}</p>
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700">Approve</button>
                    <button className="flex-1 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">Reject</button>
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

