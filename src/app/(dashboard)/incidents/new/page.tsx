"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, MapPin, AlertTriangle, StopCircle } from "lucide-react";
import Link from "next/link";
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";

const incidentTypes = [
  { value: "near_miss", label: "Near Miss", description: "Close call, no injury", color: "bg-yellow-100 border-yellow-400 text-yellow-800" },
  { value: "first_aid", label: "First Aid Case", description: "Minor injury, first aid only", color: "bg-blue-100 border-blue-400 text-blue-800" },
  { value: "minor", label: "Minor Incident", description: "Requires medical attention", color: "bg-orange-100 border-orange-400 text-orange-800" },
  { value: "major", label: "Major Incident", description: "Serious injury/hospitalization", color: "bg-red-100 border-red-400 text-red-800" },
  { value: "stop_work", label: "Stop Work", description: "Immediate work stoppage required", color: "bg-red-200 border-red-600 text-red-900" },
];

export default function NewIncidentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isQuickReport, setIsQuickReport] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    type: "", title: "", description: "", location: "", datetime: "",
    relatedPermitId: "", stopWorkReason: "",
    injuredPersons: [{ name: "", injury: "", treatment: "" }],
    witnesses: "", immediateActions: "", attachments: [] as File[],
  });

  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in");
      return;
    }
    if (!formData.type || !formData.title || !formData.location) {
      setError("Please fill in all required fields");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Generate incident ID
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      const incidentId = `INC-${year}-${random}`;

      // Upload photos
      const photos: any[] = [];
      const basePath = `incidents/${user.companyId}/${incidentId}`;
      for (const file of formData.attachments) {
        const storageRef = ref(storage, `${basePath}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        photos.push({ name: file.name, url, uploadedAt: new Date() });
      }

      const incidentData = {
        incidentId,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        datetime: formData.datetime || new Date().toISOString(),
        relatedPermitId: formData.relatedPermitId || null,
        stopWorkReason: formData.type === "stop_work" ? formData.stopWorkReason : null,
        injuredPersons: formData.injuredPersons.filter(p => p.name),
        witnesses: formData.witnesses,
        immediateActions: formData.immediateActions,
        photos,
        status: formData.type === "stop_work" ? "stop_work_active" : "reported",
        reportedBy: user.displayName || "Unknown",
        reportedByUid: user.uid,
        companyId: user.companyId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "incidents"), incidentData);

      // If stop work, suspend related permit
      if (formData.type === "stop_work" && formData.relatedPermitId) {
        const permitsRef = collection(db, "permits");
        const q = query(permitsRef, where("permitId", "==", formData.relatedPermitId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const permitDoc = snapshot.docs[0];
          await updateDoc(doc(db, "permits", permitDoc.id), {
            status: "suspended",
            suspensionRemarks: `Stop Work issued: ${formData.stopWorkReason}`,
            suspendedAt: serverTimestamp(),
            suspendedBy: user.uid,
            relatedIncidentId: incidentId,
          });
        }
      }

      alert(formData.type === "stop_work" ? "Stop Work issued! Related permit has been suspended." : "Incident reported successfully!");
      router.push("/incidents");
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Failed to submit incident");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/incidents" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={24} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Report Incident</h1>
          <p className="text-gray-500">Log a safety incident or near miss</p>
        </div>
      </div>

      {/* Report Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setIsQuickReport(true)} className={`flex-1 py-3 rounded-lg font-medium transition-all ${isQuickReport ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600"}`}>
          ⚡ Quick Report
        </button>
        <button onClick={() => setIsQuickReport(false)} className={`flex-1 py-3 rounded-lg font-medium transition-all ${!isQuickReport ? "bg-[#0D47A1] text-white" : "bg-gray-100 text-gray-600"}`}>
          📋 Full Report
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-6">
          {/* Incident Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Incident Type *</label>
            <div className="grid grid-cols-2 gap-3">
              {incidentTypes.map((type) => (
                <button key={type.value} type="button" onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${formData.type === type.value ? type.color + " border-2" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs opacity-75">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What happened? *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Brief description of the incident" />
          </div>

          {/* Stop Work Fields */}
          {formData.type === "stop_work" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-red-800 font-medium">
                <StopCircle size={20} /> Stop Work Order
              </div>
              <div>
                <label className="block text-sm font-medium text-red-800 mb-1">Related Permit ID (if any)</label>
                <input type="text" value={formData.relatedPermitId} onChange={(e) => setFormData({ ...formData, relatedPermitId: e.target.value })}
                  className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g., PTW-2024-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-red-800 mb-1">Reason for Stop Work *</label>
                <textarea value={formData.stopWorkReason} onChange={(e) => setFormData({ ...formData, stopWorkReason: e.target.value })} rows={2}
                  className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Why is work being stopped?" />
              </div>
              <p className="text-xs text-red-600">⚠️ This will immediately suspend the related permit and notify all stakeholders.</p>
            </div>
          )}

          {/* Location & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Where did it happen?" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
              <input type="datetime-local" value={formData.datetime} onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
            </div>
          </div>

          {/* Photo Upload - Quick Report */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Photos</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-amber-400 transition-colors cursor-pointer">
              <Camera className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-500">Click to take or upload photos</p>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFormData({ ...formData, attachments: Array.from(e.target.files || []) })} />
            </div>
          </div>

          {/* Extended fields for full report */}
          {!isQuickReport && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Provide a detailed account of what happened..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Injured Persons</label>
                {formData.injuredPersons.map((person, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                    <input type="text" placeholder="Name" value={person.name} onChange={(e) => {
                      const updated = [...formData.injuredPersons];
                      updated[idx].name = e.target.value;
                      setFormData({ ...formData, injuredPersons: updated });
                    }} className="px-3 py-2 border border-gray-300 rounded-lg outline-none" />
                    <input type="text" placeholder="Injury" value={person.injury} onChange={(e) => {
                      const updated = [...formData.injuredPersons];
                      updated[idx].injury = e.target.value;
                      setFormData({ ...formData, injuredPersons: updated });
                    }} className="px-3 py-2 border border-gray-300 rounded-lg outline-none" />
                    <input type="text" placeholder="Treatment" value={person.treatment} onChange={(e) => {
                      const updated = [...formData.injuredPersons];
                      updated[idx].treatment = e.target.value;
                      setFormData({ ...formData, injuredPersons: updated });
                    }} className="px-3 py-2 border border-gray-300 rounded-lg outline-none" />
                  </div>
                ))}
                <button type="button" onClick={() => setFormData({ ...formData, injuredPersons: [...formData.injuredPersons, { name: "", injury: "", treatment: "" }] })}
                  className="text-sm text-[#0D47A1] hover:underline">+ Add another person</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Witnesses</label>
                <input type="text" value={formData.witnesses} onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" placeholder="Names of witnesses (comma separated)" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Immediate Actions Taken</label>
                <textarea value={formData.immediateActions} onChange={(e) => setFormData({ ...formData, immediateActions: e.target.value })} rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none" placeholder="What actions were taken immediately after the incident?" />
              </div>
            </>
          )}
        </div>

        {/* Error Display */}
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mt-4">{error}</div>}

        {/* Submit */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
          <Link href="/incidents" className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</Link>
          {formData.type === "stop_work" ? (
            <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50">
              <StopCircle size={18} /> {saving ? "Issuing..." : "Issue Stop Work"}
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2 disabled:opacity-50">
              <AlertTriangle size={18} /> {saving ? "Submitting..." : "Submit Report"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

