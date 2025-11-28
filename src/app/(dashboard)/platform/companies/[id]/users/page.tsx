"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Plus, Search, CheckCircle, XCircle, X } from "lucide-react";
import Link from "next/link";
import { UserRole } from "@/types";

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  lastSeen?: any;
}

export default function CompanyUsersPage() {
  const { isPlatformAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [company, setCompany] = useState<any>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!isPlatformAdmin) {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [isPlatformAdmin, companyId]);

  const fetchData = async () => {
    try {
      const companyDoc = await getDoc(doc(db, "companies", companyId));
      if (companyDoc.exists()) {
        setCompany({ id: companyDoc.id, ...companyDoc.data() });
      }

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("companyId", "==", companyId));
      const snapshot = await getDocs(q);
      setUsers(snapshot.docs.map((d) => ({ uid: d.id, ...d.data() })) as UserData[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isPlatformAdmin) return null;

  return (
    <div className="fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/platform" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{company?.name || "Company"} - Users</h1>
          <p className="text-gray-500 mt-1">Manage users for this company</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-[#0D47A1] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-800">
          <Plus size={20} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D47A1]"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0D47A1] rounded-full flex items-center justify-center text-white text-sm font-medium">{user.displayName?.charAt(0) || "U"}</div>
                        <div><p className="font-medium text-gray-800">{user.displayName}</p><p className="text-sm text-gray-500">{user.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="capitalize text-gray-600">{user.role?.replace("_", " ")}</span></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {user.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />} {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3"><button className="text-sm text-[#0D47A1] hover:underline">Edit</button></td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && <AddUserModal companyId={companyId} onClose={() => setShowAddModal(false)} onSuccess={fetchData} />}
    </div>
  );
}

function AddUserModal({ companyId, onClose, onSuccess }: { companyId: string; onClose: () => void; onSuccess: () => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "", displayName: "", role: "worker" as UserRole, phone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          role: formData.role,
          companyId,
          phone: formData.phone,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }
      onSuccess();
      onClose();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Add New User</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input type="text" required value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none bg-white">
              <option value="company_admin">Company Admin</option>
              <option value="hse_manager">HSE Manager</option>
              <option value="hse_supervisor">HSE Supervisor</option>
              <option value="safety_officer">Safety Officer</option>
              <option value="shift_manager">Shift Manager</option>
              <option value="shift_incharge">Shift Incharge</option>
              <option value="line_manager">Line Manager</option>
              <option value="line_incharge">Line Incharge</option>
              <option value="supervisor">Supervisor</option>
              <option value="employee">Employee</option>
              <option value="worker">Worker</option>
              <option value="contractor">Contractor</option>
            </select></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="bg-[#0D47A1] text-white px-4 py-2 rounded-lg disabled:opacity-50">{saving ? "Creating..." : "Create User"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

