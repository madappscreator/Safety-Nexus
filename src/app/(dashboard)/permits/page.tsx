"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, FileCheck, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown } from "lucide-react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface PermitData {
  id: string;
  permitId: string;
  type: string;
  title: string;
  location: string;
  requestedBy: string;
  status: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

const permitTypes = [
  { value: "all", label: "All Types" },
  { value: "hot_work", label: "Hot Work" },
  { value: "confined_space", label: "Confined Space" },
  { value: "work_at_height", label: "Work at Height" },
  { value: "electrical", label: "Electrical" },
  { value: "excavation", label: "Excavation" },
  { value: "lifting", label: "Lifting" },
  { value: "chemical", label: "Chemical" },
  { value: "general", label: "General" },
];

const statusColors: Record<string, { bg: string; text: string; icon: React.ComponentType<{ size?: number }> }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", icon: FileCheck },
  pending_approval: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
  pending_supervisor: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
  pending_incharge: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
  pending_hse: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
  approved: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle },
  active: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
  suspended: { bg: "bg-red-100", text: "text-red-700", icon: AlertCircle },
  closed: { bg: "bg-gray-100", text: "text-gray-600", icon: XCircle },
  rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
};

export default function PermitsPage() {
  const { user } = useAuth();
  const [permits, setPermits] = useState<PermitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    console.log("useEffect - user:", user);
    fetchPermits();
  }, [user?.companyId]);

  const fetchPermits = async () => {
    try {
      console.log("Fetching permits for companyId:", user?.companyId);
      const permitsRef = collection(db, "permits");

      // Fetch all permits first (without where clause to avoid index issues)
      const snapshot = await getDocs(permitsRef);
      console.log("Total permits in DB:", snapshot.size);

      // Filter client-side by companyId
      const permitsData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((p: any) => !user?.companyId || p.companyId === user?.companyId) as PermitData[];

      // Sort by createdAt client-side
      permitsData.sort((a: any, b: any) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      console.log("Fetched permits for company:", permitsData.length);
      setPermits(permitsData);
    } catch (error) {
      console.error("Error fetching permits:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPermits = permits.filter((permit) => {
    const matchesSearch = permit.title?.toLowerCase().includes(searchQuery.toLowerCase()) || permit.permitId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || permit.type === selectedType;
    const matchesStatus = selectedStatus === "all" || permit.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Permit to Work</h1>
          <p className="text-gray-500 mt-1">Manage and track all work permits</p>
        </div>
        <Link href="/permits/new" className="inline-flex items-center gap-2 bg-[#0D47A1] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors">
          <Plus size={20} /> New Permit
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search permits..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent outline-none" />
          </div>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent outline-none bg-white">
            {permitTypes.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent outline-none bg-white">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Permits Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D47A1]"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Permit ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Requested By</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPermits.map((permit) => {
                    const status = statusColors[permit.status] || statusColors.draft;
                    const StatusIcon = status.icon;
                    return (
                      <tr key={permit.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/permits/${permit.id}`}>
                        <td className="px-6 py-4 font-medium text-[#0D47A1]">{permit.permitId || permit.id}</td>
                        <td className="px-6 py-4 text-gray-800">{permit.title}</td>
                        <td className="px-6 py-4"><span className="capitalize text-gray-600">{permit.type?.replace("_", " ") || "-"}</span></td>
                        <td className="px-6 py-4 text-gray-600">{permit.location}</td>
                        <td className="px-6 py-4 text-gray-600">{permit.requestedBy}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            <StatusIcon size={14} /> {permit.status?.replace("_", " ") || "draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{permit.startTime || "-"} - {permit.endTime || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredPermits.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileCheck className="mx-auto mb-3 text-gray-300" size={48} />
                <p>No permits found matching your criteria</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

