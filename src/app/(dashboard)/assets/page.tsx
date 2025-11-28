"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Package, AlertTriangle, CheckCircle, Clock, Wrench, Calendar, QrCode } from "lucide-react";

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-green-100", text: "text-green-700" },
  maintenance: { bg: "bg-amber-100", text: "text-amber-700" },
  expired: { bg: "bg-red-100", text: "text-red-700" },
  retired: { bg: "bg-gray-100", text: "text-gray-700" },
};

// Mock data
const assets = [
  { id: "AST-001", name: "Fire Extinguisher - ABC Type", category: "Fire Safety", location: "Building A, Floor 1", lastInspection: "2024-11-15", nextInspection: "2024-12-15", status: "active" },
  { id: "AST-002", name: "First Aid Kit", category: "Medical", location: "Production Floor", lastInspection: "2024-11-01", nextInspection: "2024-12-01", status: "active" },
  { id: "AST-003", name: "Safety Harness Set", category: "PPE", location: "Maintenance Store", lastInspection: "2024-10-20", nextInspection: "2024-11-20", status: "expired" },
  { id: "AST-004", name: "Gas Detector - H2S", category: "Detection", location: "Tank Farm", lastInspection: "2024-11-10", nextInspection: "2024-11-25", status: "maintenance" },
  { id: "AST-005", name: "Emergency Shower", category: "Emergency", location: "Chemical Storage", lastInspection: "2024-11-20", nextInspection: "2025-02-20", status: "active" },
];

const categories = [
  { name: "Fire Safety", count: 45, icon: "🧯" },
  { name: "PPE", count: 120, icon: "🦺" },
  { name: "Medical", count: 25, icon: "🩹" },
  { name: "Detection", count: 18, icon: "📡" },
  { name: "Emergency", count: 12, icon: "🚨" },
];

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || asset.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || asset.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: assets.length,
    active: assets.filter((a) => a.status === "active").length,
    maintenance: assets.filter((a) => a.status === "maintenance").length,
    expired: assets.filter((a) => a.status === "expired").length,
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Safety Assets</h1>
          <p className="text-gray-500 mt-1">Manage safety equipment and maintenance schedules</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50">
            <QrCode size={20} /> Scan QR
          </button>
          <Link href="/assets/new" className="inline-flex items-center gap-2 bg-[#0D47A1] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-800">
            <Plus size={20} /> Add Asset
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Assets</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Under Maintenance</p>
          <p className="text-2xl font-bold text-amber-600">{stats.maintenance}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Expired/Due</p>
          <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Categories</h3>
            <div className="space-y-2">
              <button onClick={() => setSelectedCategory("all")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === "all" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-50"}`}>
                All Categories
              </button>
              {categories.map((cat) => (
                <button key={cat.name} onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${selectedCategory === cat.name ? "bg-blue-100 text-blue-700" : "hover:bg-gray-50"}`}>
                  <span>{cat.icon} {cat.name}</span>
                  <span className="text-sm text-gray-500">{cat.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assets List */}
        <div className="lg:col-span-3">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Search assets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
              </div>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg outline-none bg-white">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Assets Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Next Inspection</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAssets.map((asset) => {
                    const statusStyle = statusColors[asset.status];
                    return (
                      <tr key={asset.id} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800">{asset.name}</p>
                          <p className="text-sm text-gray-500">{asset.id}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{asset.category}</td>
                        <td className="px-6 py-4 text-gray-600">{asset.location}</td>
                        <td className="px-6 py-4 text-gray-600">{asset.nextInspection}</td>
                        <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}>{asset.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

