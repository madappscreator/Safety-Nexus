"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Plus, X, Calendar, Clock, MapPin, AlertTriangle, Users, FileText, Wrench } from "lucide-react";
import Link from "next/link";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import { PERMIT_APPROVAL_ROLES } from "@/types";

interface UserOption {
  uid: string;
  displayName: string;
  role: string;
  email: string;
}

const permitTypes = [
  { value: "hot_work", label: "Hot Work Permit", description: "Welding, cutting, grinding", critical: true },
  { value: "confined_space", label: "Confined Space Entry", description: "Tanks, vessels, manholes", critical: true },
  { value: "work_at_height", label: "Work at Height", description: "Ladders, scaffolds, roofs", critical: true },
  { value: "electrical", label: "Electrical Work", description: "Live work, isolations", critical: true },
  { value: "excavation", label: "Excavation", description: "Trenching, digging", critical: true },
  { value: "lifting", label: "Lifting Operations", description: "Cranes, hoists", critical: true },
  { value: "chemical", label: "Chemical Handling", description: "Hazardous substances", critical: true },
  { value: "general", label: "General Safe Work", description: "Other activities", critical: false },
];

const ppeOptions = ["Hard Hat", "Safety Glasses", "Gloves", "Safety Shoes", "High Visibility Vest", "Ear Protection", "Face Shield", "Respirator", "Fall Protection Harness", "Chemical Suit"];
const hazardOptions = ["Fire/Explosion", "Electrical", "Fall from Height", "Confined Space", "Chemical Exposure", "Moving Equipment", "Hot Surfaces", "Noise", "Dust/Fumes", "Manual Handling"];

export default function NewPermitPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Users for selection
  const [supervisors, setSupervisors] = useState<UserOption[]>([]);
  const [allWorkers, setAllWorkers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [formData, setFormData] = useState({
    type: "", title: "", description: "", location: "", workArea: "",
    startDate: "", startTime: "", endDate: "", endTime: "",
    supervisorId: "", supervisorName: "",
    selectedWorkers: [] as UserOption[],
    hazards: [] as string[], controls: "", ppe: [] as string[],
    // Documents
    swmsFile: null as File | null,
    medicalFitnessFile: null as File | null,
    safetyAuditFile: null as File | null,
    equipmentCertFile: null as File | null,
    locationPhotos: [] as File[],
    toolReferences: [] as File[],
  });

  // Fetch supervisors and workers on mount
  useEffect(() => {
    if (user?.companyId) {
      fetchUsers();
    }
  }, [user?.companyId]);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users for company:", user?.companyId);
      const usersRef = collection(db, "users");
      // Simplified query - just filter by companyId (avoid composite index requirement)
      const snapshot = await getDocs(usersRef);

      console.log("Total users found:", snapshot.docs.length);

      // Filter by companyId and active status in JS
      const users = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(u => (u as any).companyId === user?.companyId)
        .filter(u => (u as any).isActive !== false) as UserOption[];

      console.log("Users in company:", users.length, users.map(u => ({ name: u.displayName, role: u.role })));

      // Filter supervisors (stage 1 approvers)
      const supervisorRoles = PERMIT_APPROVAL_ROLES.stage1;
      const filteredSupervisors = users.filter(u => supervisorRoles.includes(u.role as any));
      console.log("Supervisors found:", filteredSupervisors.length, filteredSupervisors.map(s => s.displayName));
      setSupervisors(filteredSupervisors);

      // Workers are employees, workers, contractors
      const workerRoles = ["employee", "worker", "contractor"];
      const filteredWorkers = users.filter(u => workerRoles.includes(u.role));
      console.log("Workers found:", filteredWorkers.length, filteredWorkers.map(w => w.displayName));
      setAllWorkers(filteredWorkers);

    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
  };

  const toggleWorker = (worker: UserOption) => {
    const exists = formData.selectedWorkers.find(w => w.uid === worker.uid);
    if (exists) {
      setFormData({ ...formData, selectedWorkers: formData.selectedWorkers.filter(w => w.uid !== worker.uid) });
    } else {
      setFormData({ ...formData, selectedWorkers: [...formData.selectedWorkers, worker] });
    }
  };

  const isCriticalPermit = permitTypes.find(p => p.value === formData.type)?.critical || false;

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in to create a permit");
      return;
    }

    if (!formData.supervisorId) {
      setError("Please select a supervisor for approval");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Generate permit ID
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      const permitId = `PTW-${year}-${random}`;

      // Upload documents
      const documents: any[] = [];
      const basePath = `permits/${user?.companyId}/${permitId}`;

      if (formData.swmsFile) {
        const url = await uploadFile(formData.swmsFile, `${basePath}/swms_${formData.swmsFile.name}`);
        documents.push({ name: formData.swmsFile.name, url, type: "swms", uploadedAt: new Date(), uploadedBy: user.uid });
      }
      if (formData.medicalFitnessFile) {
        const url = await uploadFile(formData.medicalFitnessFile, `${basePath}/medical_${formData.medicalFitnessFile.name}`);
        documents.push({ name: formData.medicalFitnessFile.name, url, type: "medical_fitness", uploadedAt: new Date(), uploadedBy: user.uid });
      }
      if (formData.safetyAuditFile) {
        const url = await uploadFile(formData.safetyAuditFile, `${basePath}/audit_${formData.safetyAuditFile.name}`);
        documents.push({ name: formData.safetyAuditFile.name, url, type: "safety_audit", uploadedAt: new Date(), uploadedBy: user.uid });
      }
      if (formData.equipmentCertFile) {
        const url = await uploadFile(formData.equipmentCertFile, `${basePath}/cert_${formData.equipmentCertFile.name}`);
        documents.push({ name: formData.equipmentCertFile.name, url, type: "equipment_certificate", uploadedAt: new Date(), uploadedBy: user.uid });
      }
      for (const photo of formData.locationPhotos) {
        const url = await uploadFile(photo, `${basePath}/location_${photo.name}`);
        documents.push({ name: photo.name, url, type: "location_photo", uploadedAt: new Date(), uploadedBy: user.uid });
      }

      const permitData = {
        permitId,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        workArea: formData.workArea,
        startDate: formData.startDate,
        startTime: formData.startTime,
        endDate: formData.endDate,
        endTime: formData.endTime,

        // Approval workflow
        supervisorId: formData.supervisorId,
        supervisorName: formData.supervisorName,
        currentApprovalStage: "supervisor",
        approvals: [{
          stage: "supervisor",
          approverId: formData.supervisorId,
          approverName: formData.supervisorName,
          approverRole: "supervisor",
          status: "pending",
        }],
        status: "pending_supervisor",

        // Workers
        workers: formData.selectedWorkers.map(w => ({
          uid: w.uid,
          name: w.displayName,
          role: w.role,
        })),

        // Hazards and controls
        hazards: formData.hazards,
        controls: formData.controls,
        ppe: formData.ppe,

        // Documents
        documents,
        assets: [],

        // Critical permit flags
        isCritical: isCriticalPermit,
        swmsRequired: isCriticalPermit,
        medicalFitnessRequired: isCriticalPermit,

        // Requester
        requestedBy: user?.displayName || user?.email || "Unknown",
        requestedByUid: user.uid,
        companyId: user?.companyId || "unknown",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "permits"), permitData);
      alert("Permit submitted for approval!");
      router.push("/permits");
    } catch (err: any) {
      console.error("Error creating permit:", err);
      setError(err.message || "Failed to create permit");
    } finally {
      setSaving(false);
    }
  };

  const stepLabels = ["Basic Info", "Supervisor & Workers", "Hazards & Controls", "Documents & Review"];

  return (
    <div className="fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/permits" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={24} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">New Permit Request</h1>
          <p className="text-gray-500">Step {step} of 4: {stepLabels[step - 1]}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-2 rounded-full ${s <= step ? "bg-[#0D47A1]" : "bg-gray-200"}`}></div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Permit Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permit Type *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {permitTypes.map((type) => (
                  <button key={type.value} type="button" onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${formData.type === type.value ? "border-[#0D47A1] bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" placeholder="Brief description of work" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" placeholder="Detailed work description..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" placeholder="Building, Area, Floor" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Supervisor & Workers */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Supervisor & Workers</h2>

            {/* Supervisor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline mr-2" size={16} />
                Select Supervisor for Approval *
              </label>
              {loadingUsers ? (
                <div className="text-gray-500">Loading supervisors...</div>
              ) : supervisors.length === 0 ? (
                <div className="text-amber-600 bg-amber-50 p-3 rounded-lg">No supervisors found. Please contact admin to add supervisors.</div>
              ) : (
                <select
                  value={formData.supervisorId}
                  onChange={(e) => {
                    const sup = supervisors.find(s => s.uid === e.target.value);
                    setFormData({ ...formData, supervisorId: e.target.value, supervisorName: sup?.displayName || "" });
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none bg-white"
                >
                  <option value="">-- Select Supervisor --</option>
                  {supervisors.map(sup => (
                    <option key={sup.uid} value={sup.uid}>{sup.displayName} ({sup.email})</option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">The supervisor will be the first approver for this permit.</p>
            </div>

            {/* Workers Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline mr-2" size={16} />
                Select Workers for this Activity *
              </label>
              {loadingUsers ? (
                <div className="text-gray-500">Loading workers...</div>
              ) : allWorkers.length === 0 ? (
                <div className="text-amber-600 bg-amber-50 p-3 rounded-lg">No workers found. Please add workers first.</div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                  {allWorkers.map(worker => (
                    <label key={worker.uid} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${formData.selectedWorkers.find(w => w.uid === worker.uid) ? "bg-blue-50 border border-blue-200" : ""}`}>
                      <input
                        type="checkbox"
                        checked={!!formData.selectedWorkers.find(w => w.uid === worker.uid)}
                        onChange={() => toggleWorker(worker)}
                        className="w-4 h-4 text-[#0D47A1] rounded"
                      />
                      <div>
                        <div className="font-medium text-sm">{worker.displayName}</div>
                        <div className="text-xs text-gray-500">{worker.email} • {worker.role}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {formData.selectedWorkers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.selectedWorkers.map(w => (
                    <span key={w.uid} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {w.displayName}
                      <button type="button" onClick={() => toggleWorker(w)} className="hover:text-red-600"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Hazards & Controls */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Hazards & Controls</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Identify Hazards *</label>
              <div className="flex flex-wrap gap-2">
                {hazardOptions.map((hazard) => (
                  <button key={hazard} type="button" onClick={() => setFormData({ ...formData, hazards: toggleArrayItem(formData.hazards, hazard) })}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${formData.hazards.includes(hazard) ? "bg-amber-100 border-amber-400 text-amber-800" : "border-gray-300 hover:border-gray-400"}`}>
                    {hazard}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Control Measures *</label>
              <textarea value={formData.controls} onChange={(e) => setFormData({ ...formData, controls: e.target.value })} rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" placeholder="Describe safety measures and controls..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required PPE *</label>
              <div className="flex flex-wrap gap-2">
                {ppeOptions.map((ppe) => (
                  <button key={ppe} type="button" onClick={() => setFormData({ ...formData, ppe: toggleArrayItem(formData.ppe, ppe) })}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${formData.ppe.includes(ppe) ? "bg-green-100 border-green-400 text-green-800" : "border-gray-300 hover:border-gray-400"}`}>
                    {ppe}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Documents & Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Documents & Review</h2>

            {/* Document Uploads for Critical Permits */}
            {isCriticalPermit && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                  <AlertTriangle size={18} />
                  Critical/Hazardous Activity - Additional Documents Required
                </div>
                <p className="text-sm text-amber-700">This is a {formData.type.replace("_", " ")} permit. Please attach required safety documents.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FileText className="inline mr-1" size={14} /> Safe Work Method Statement (SWMS)
                </label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFormData({ ...formData, swmsFile: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FileText className="inline mr-1" size={14} /> Medical Fitness Certificate
                </label>
                <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => setFormData({ ...formData, medicalFitnessFile: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Wrench className="inline mr-1" size={14} /> Safety Audit Report
                </label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFormData({ ...formData, safetyAuditFile: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Wrench className="inline mr-1" size={14} /> Equipment Certificate
                </label>
                <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => setFormData({ ...formData, equipmentCertFile: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline mr-1" size={14} /> Location Photos (Optional)
              </label>
              <input type="file" accept="image/*" multiple onChange={(e) => setFormData({ ...formData, locationPhotos: Array.from(e.target.files || []) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>

            {/* Review Summary */}
            <h3 className="text-md font-semibold text-gray-800 pt-4 border-t">Review Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Type:</span><span className="font-medium capitalize">{formData.type.replace("_", " ")}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Title:</span><span className="font-medium">{formData.title}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Location:</span><span className="font-medium">{formData.location}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Duration:</span><span className="font-medium">{formData.startDate} {formData.startTime} - {formData.endDate} {formData.endTime}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Supervisor:</span><span className="font-medium">{formData.supervisorName || "Not selected"}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Workers:</span><span className="font-medium">{formData.selectedWorkers.length} selected</span></div>
              <div><span className="text-gray-600">Hazards:</span><div className="flex flex-wrap gap-1 mt-1">{formData.hazards.map((h) => <span key={h} className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded">{h}</span>)}</div></div>
              <div><span className="text-gray-600">PPE:</span><div className="flex flex-wrap gap-1 mt-1">{formData.ppe.map((p) => <span key={p} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">{p}</span>)}</div></div>
            </div>

            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="text-blue-600 mt-0.5" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Approval Workflow</p>
                <p>1. Supervisor ({formData.supervisorName || "Not selected"}) → 2. Shift/Line Incharge → 3. HSE Team</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="text-amber-600 mt-0.5" size={20} />
              <p className="text-sm text-amber-800">By submitting this permit, you confirm that all information is accurate and all required safety measures will be implemented.</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button onClick={() => setStep(step - 1)} disabled={step === 1} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Back</button>
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className="px-6 py-2.5 bg-[#0D47A1] text-white rounded-lg hover:bg-blue-800">Continue</button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 bg-[#2E7D32] text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {saving ? "Submitting..." : "Submit for Approval"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

