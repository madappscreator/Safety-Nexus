"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Building2, ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

interface CompanyData {
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  subscription: { plan: string; userLimit: number; expiryDate: any };
  settings?: { allowSelfRegister: boolean };
}

export default function ManageCompanyPage() {
  const { isPlatformAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<CompanyData | null>(null);

  useEffect(() => {
    if (!isPlatformAdmin) {
      router.push("/dashboard");
      return;
    }
    fetchCompany();
  }, [isPlatformAdmin, companyId]);

  const fetchCompany = async () => {
    try {
      const docRef = doc(db, "companies", companyId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as CompanyData;
        setFormData({
          ...data,
          subscription: {
            ...data.subscription,
            expiryDate: data.subscription?.expiryDate?.toDate?.()?.toISOString?.().split("T")[0] || "",
          },
        });
      } else {
        setError("Company not found");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const docRef = doc(db, "companies", companyId);
      await updateDoc(docRef, {
        name: formData.name,
        code: formData.code,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        isActive: formData.isActive,
        subscription: {
          plan: formData.subscription.plan,
          userLimit: formData.subscription.userLimit,
          expiryDate: new Date(formData.subscription.expiryDate),
        },
        settings: { allowSelfRegister: formData.settings?.allowSelfRegister || false },
        updatedAt: serverTimestamp(),
      });
      setSuccess("Company updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isPlatformAdmin) return null;
  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D47A1]"></div></div>;
  if (!formData) return <div className="text-center py-12 text-red-600">{error || "Company not found"}</div>;

  return (
    <div className="fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/platform" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Company</h1>
          <p className="text-gray-500 mt-1">{formData.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Code</label>
              <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.isActive ? "active" : "inactive"} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "active" })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none bg-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/platform" className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#0D47A1] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50">
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />} Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

