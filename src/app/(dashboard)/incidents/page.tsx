"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, AlertTriangle, Clock, CheckCircle, Eye, StopCircle } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface IncidentData {
  id: string;
  incidentId: string;
  type: string;
  title: string;
  location: string;
  reportedBy: string;
  datetime: string;
  status: string;
}

const incidentTypes: Record<string, { bg: string; text: string }> = {
  near_miss: { bg: "bg-yellow-100", text: "text-yellow-800" },
  first_aid: { bg: "bg-blue-100", text: "text-blue-800" },
  minor: { bg: "bg-orange-100", text: "text-orange-800" },
  major: { bg: "bg-red-100", text: "text-red-800" },
  stop_work: { bg: "bg-red-200", text: "text-red-900" },
  fatality: { bg: "bg-purple-100", text: "text-purple-800" },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  reported: { bg: "bg-amber-100", text: "text-amber-700" },
  investigating: { bg: "bg-blue-100", text: "text-blue-700" },
  pending_capa: { bg: "bg-purple-100", text: "text-purple-700" },
  stop_work_active: { bg: "bg-red-200", text: "text-red-800" },
  closed: { bg: "bg-gray-100", text: "text-gray-700" },
};

export default function IncidentsPage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    if (user?.companyId) fetchIncidents();
  }, [user?.companyId]);

  const fetchIncidents = async () => {
    try {
      const incidentsRef = collection(db, "incidents");
      const snapshot = await getDocs(incidentsRef);
      const allIncidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as IncidentData[];
      // Filter by company
      const companyIncidents = allIncidents.filter(i => (i as any).companyId === user?.companyId);
      setIncidents(companyIncidents);
    } catch (err) {
      console.error("Error fetching incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch = incident.title?.toLowerCase().includes(searchQuery.toLowerCase()) || incident.incidentId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || incident.type === selectedType;
    const matchesStatus = selectedStatus === "all" || incident.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: incidents.length,
    open: incidents.filter((i) => i.status !== "closed").length,
    nearMiss: incidents.filter((i) => i.type === "near_miss").length,
    stopWork: incidents.filter((i) => i.type === "stop_work").length,
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Incident Management</h1>
          <p className="text-gray-500 mt-1">Report, track, and investigate safety incidents</p>
        </div>
        <Link href="/incidents/new" className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-amber-600 transition-colors">
          <Plus size={20} /> Report Incident
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Incidents</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Open Incidents</p>
          <p className="text-2xl font-bold text-amber-600">{stats.open}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Near Misses (MTD)</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.nearMiss}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 flex items-center gap-1"><StopCircle size={14} /> Stop Work</p>
          <p className="text-2xl font-bold text-red-600">{stats.stopWork}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search incidents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
          </div>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg outline-none bg-white">
            <option value="all">All Types</option>
            <option value="near_miss">Near Miss</option>
            <option value="first_aid">First Aid</option>
            <option value="minor">Minor</option>
            <option value="major">Major</option>
            <option value="stop_work">Stop Work</option>
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg outline-none bg-white">
            <option value="all">All Status</option>
            <option value="reported">Reported</option>
            <option value="investigating">Investigating</option>
            <option value="pending_capa">Pending CAPA</option>
            <option value="stop_work_active">Stop Work Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D47A1] mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading incidents...</p>
        </div>
      )}

      {/* Incidents List */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reported By</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date/Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredIncidents.map((incident) => {
                  const typeStyle = incidentTypes[incident.type] || { bg: "bg-gray-100", text: "text-gray-800" };
                  const statusStyle = statusColors[incident.status] || { bg: "bg-gray-100", text: "text-gray-700" };
                  return (
                    <tr key={incident.id} className={`hover:bg-gray-50 ${incident.type === "stop_work" ? "bg-red-50" : ""}`}>
                      <td className="px-6 py-4 font-medium text-[#0D47A1]">{incident.incidentId}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${typeStyle.bg} ${typeStyle.text}`}>
                          {incident.type === "stop_work" && <StopCircle size={12} className="inline mr-1" />}
                          {incident.type?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-800">{incident.title}</td>
                      <td className="px-6 py-4 text-gray-600">{incident.location}</td>
                      <td className="px-6 py-4 text-gray-600">{incident.reportedBy}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{incident.datetime?.split("T")[0]}</td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}>{incident.status?.replace("_", " ")}</span></td>
                      <td className="px-6 py-4"><Link href={`/incidents/${incident.id}`} className="text-[#0D47A1] hover:underline flex items-center gap-1"><Eye size={16} /> View</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredIncidents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle className="mx-auto mb-3 text-gray-300" size={48} />
              <p>No incidents found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

