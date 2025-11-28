"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { collection, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Building2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewCompanyPage() {
  const { isPlatformAdmin } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
    plan: "starter",
    userLimit: 25,
    expiryDate: "",
    allowSelfRegister: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlatformAdmin) return;

    setSaving(true);
    setError("");

    try {
      // Generate company ID from name (slug format) with timestamp to ensure uniqueness
      const baseId = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");
      let companyId = baseId;

      // Check if ID already exists, if so add a timestamp
      const existingDoc = await getDoc(doc(db, "companies", companyId));
      if (existingDoc.exists()) {
        companyId = `${baseId}_${Date.now()}`;
      }

      console.log("Creating company with ID:", companyId);

      const companyRef = doc(db, "companies", companyId);
      await setDoc(companyRef, {
        name: formData.name,
        code: formData.code.toUpperCase(),
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        isActive: true,
        subscription: {
          plan: formData.plan,
          userLimit: parseInt(String(formData.userLimit)),
          expiryDate: new Date(formData.expiryDate),
        },
        settings: {
          allowSelfRegister: formData.allowSelfRegister,
        },
        createdAt: serverTimestamp(),
      });

      console.log("Company created successfully!");
      alert("Company created successfully!");
      router.push("/platform");
    } catch (err: any) {
      console.error("Error creating company:", err);
      setError(err.code + ": " + err.message || "Failed to create company");
    } finally {
      setSaving(false);
    }
  };

  if (!isPlatformAdmin) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/platform" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Company</h1>
          <p className="text-gray-500 mt-1">Add a new tenant to the platform</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" placeholder="Acme Industries Pvt Ltd" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Code *</label>
              <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none font-mono" placeholder="ACME-001" />
              <p className="text-xs text-gray-500 mt-1">Unique code for users to login</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" placeholder="admin@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" placeholder="Industrial Area, Phase 1" />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-medium text-gray-800 mb-4">Subscription Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan *</label>
                <select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none bg-white">
                  <option value="starter">Starter (₹2,49,000/yr)</option>
                  <option value="professional">Professional (₹3,99,000/yr)</option>
                  <option value="enterprise">Enterprise (₹5,49,000/yr)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Limit *</label>
                <input type="number" min="1" required value={formData.userLimit} onChange={(e) => setFormData({ ...formData, userLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                <input type="date" required value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={formData.allowSelfRegister} onChange={(e) => setFormData({ ...formData, allowSelfRegister: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-[#0D47A1]" />
              <span className="text-sm text-gray-700">Allow self-registration with company code</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/platform" className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 bg-[#0D47A1] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50">
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
              Create Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

