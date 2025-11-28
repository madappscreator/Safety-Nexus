"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Building2, Users, Shield, TrendingUp, Plus, Search, MoreVertical, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface CompanyData {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  subscription: { plan: string; userLimit: number; expiryDate: any };
  createdAt: any;
}

export default function PlatformAdminPage() {
  const { user, isPlatformAdmin } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ totalCompanies: 0, activeCompanies: 0, totalUsers: 0 });

  useEffect(() => {
    if (!isPlatformAdmin) {
      router.push("/dashboard");
      return;
    }
    fetchCompanies();
  }, [isPlatformAdmin, router]);

  const fetchCompanies = async () => {
    try {
      const companiesRef = collection(db, "companies");
      // Fetch without orderBy to avoid index issues
      const snapshot = await getDocs(companiesRef);
      console.log("Fetched companies:", snapshot.size);

      const companiesData = snapshot.docs.map((doc) => {
        console.log("Company:", doc.id, doc.data());
        return { id: doc.id, ...doc.data() };
      }) as CompanyData[];

      // Sort client-side instead
      companiesData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setCompanies(companiesData);

      // Fetch user counts
      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);

      setStats({
        totalCompanies: companiesData.length,
        activeCompanies: companiesData.filter((c) => c.isActive).length,
        totalUsers: usersSnap.size,
      });
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isPlatformAdmin) return null;

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Platform Administration</h1>
          <p className="text-gray-500 mt-1">Manage all companies and users across the platform</p>
        </div>
        <Link href="/platform/companies/new"
          className="inline-flex items-center gap-2 bg-[#0D47A1] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-800">
          <Plus size={20} /> Add Company
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg"><Building2 className="text-blue-600" size={24} /></div>
            <div><p className="text-2xl font-bold text-gray-800">{stats.totalCompanies}</p><p className="text-sm text-gray-500">Total Companies</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg"><TrendingUp className="text-green-600" size={24} /></div>
            <div><p className="text-2xl font-bold text-gray-800">{stats.activeCompanies}</p><p className="text-sm text-gray-500">Active Companies</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg"><Users className="text-purple-600" size={24} /></div>
            <div><p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p><p className="text-sm text-gray-500">Total Users</p></div>
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Search companies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D47A1]"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0D47A1] rounded-lg flex items-center justify-center text-white font-bold">{company.name.charAt(0)}</div>
                        <div><p className="font-medium text-gray-800">{company.name}</p><p className="text-sm text-gray-500">ID: {company.id}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600">{company.code}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">{company.subscription?.plan || "N/A"}</span></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${company.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {company.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />} {company.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/platform/companies/${company.id}`} className="text-sm text-[#0D47A1] hover:underline">Manage</Link>
                        <Link href={`/platform/companies/${company.id}/users`} className="text-sm text-gray-600 hover:underline">Users</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

