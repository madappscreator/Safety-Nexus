"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle, Users, FileText, Shield, StopCircle } from "lucide-react";
import Link from "next/link";
import { PERMIT_APPROVAL_ROLES } from "@/types";

interface PermitData {
  id: string; permitId: string; type: string; title: string; description: string;
  location: string; workArea?: string; startDate: string; startTime: string;
  endDate: string; endTime: string; status: string; requestedBy: string;
  requestedByUid: string; supervisorId: string; supervisorName: string;
  currentApprovalStage: string; approvals: any[]; workers: any[];
  hazards: string[]; controls: string; ppe: string[]; documents: any[];
  isCritical: boolean; closureRemarks?: string; companyId: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending_supervisor: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending Supervisor" },
  pending_incharge: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending Incharge" },
  pending_hse: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending HSE" },
  approved: { bg: "bg-blue-100", text: "text-blue-700", label: "Approved" },
  active: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
  suspended: { bg: "bg-red-100", text: "text-red-700", label: "Suspended" },
  closed: { bg: "bg-gray-100", text: "text-gray-700", label: "Closed" },
  rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
};

export default function PermitDetailPage() {
  const params = useParams();
  const permitId = params.id as string;
  const { user } = useAuth();

  const [permit, setPermit] = useState<PermitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [guidelines, setGuidelines] = useState("");

  useEffect(() => { if (permitId) fetchPermit(); }, [permitId]);

  const fetchPermit = async () => {
    try {
      const docSnap = await getDoc(doc(db, "permits", permitId));
      if (docSnap.exists()) setPermit({ id: docSnap.id, ...docSnap.data() } as PermitData);
    } catch (err) { console.error("Error:", err); }
    finally { setLoading(false); }
  };

  const canApprove = () => {
    if (!permit || !user) return false;
    const stage = permit.currentApprovalStage;
    const role = user.role;
    if (stage === "supervisor" && permit.supervisorId === user?.uid) return true;
    if (stage === "incharge" && PERMIT_APPROVAL_ROLES.stage2.includes(role as any)) return true;
    if (stage === "hse" && PERMIT_APPROVAL_ROLES.stage3.includes(role as any)) return true;
    return false;
  };

  const canClose = () => permit && user && permit.requestedByUid === user.uid && permit.status === "active";

  const handleApprove = async () => {
    if (!permit || !user) return;
    setActionLoading(true);
    try {
      const stage = permit.currentApprovalStage;
      let nextStatus = "", nextStage = "";
      if (stage === "supervisor") { nextStatus = "pending_incharge"; nextStage = "incharge"; }
      else if (stage === "incharge") { nextStatus = "pending_hse"; nextStage = "hse"; }
      else if (stage === "hse") { nextStatus = "active"; nextStage = "completed"; }

      const approvalRecord = { stage, approverId: user.uid, approverName: user.displayName,
        approverRole: user.role, status: "approved", remarks, guidelines, approvedAt: new Date() };

      await updateDoc(doc(db, "permits", permitId), {
        status: nextStatus, currentApprovalStage: nextStage,
        approvals: arrayUnion(approvalRecord), updatedAt: serverTimestamp(),
      });
      alert("Approved!"); fetchPermit();
    } catch (err: any) { alert("Error: " + err.message); }
    finally { setActionLoading(false); setRemarks(""); setGuidelines(""); }
  };

  const handleReject = async () => {
    if (!permit || !user || !remarks) { alert("Please provide rejection remarks"); return; }
    setActionLoading(true);
    try {
      const approvalRecord = { stage: permit.currentApprovalStage, approverId: user.uid,
        approverName: user.displayName, approverRole: user.role, status: "rejected", remarks, approvedAt: new Date() };
      await updateDoc(doc(db, "permits", permitId), { status: "rejected", approvals: arrayUnion(approvalRecord), updatedAt: serverTimestamp() });
      alert("Rejected"); fetchPermit();
    } catch (err: any) { alert("Error: " + err.message); }
    finally { setActionLoading(false); }
  };

  const handleClose = async () => {
    if (!remarks) { alert("Please provide closure remarks"); return; }
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "permits", permitId), { status: "closed", closureRemarks: remarks, closedAt: serverTimestamp(), closedBy: user?.uid, updatedAt: serverTimestamp() });
      alert("Permit closed!"); fetchPermit();
    } catch (err: any) { alert("Error: " + err.message); }
    finally { setActionLoading(false); }
  };

  const handleSuspend = async () => {
    if (!remarks) { alert("Please provide suspension reason"); return; }
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "permits", permitId), { status: "suspended", suspensionRemarks: remarks, suspendedAt: serverTimestamp(), suspendedBy: user?.uid, updatedAt: serverTimestamp() });
      alert("Permit suspended!"); fetchPermit();
    } catch (err: any) { alert("Error: " + err.message); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D47A1]"></div></div>;
  if (!permit) return <div className="text-center py-12 text-red-600">Permit not found</div>;
  const status = statusConfig[permit.status] || statusConfig.pending_supervisor;

  return (
    <div className="fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/permits" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={24} /></Link>
          <div><h1 className="text-2xl font-bold text-gray-800">{permit.permitId}</h1><p className="text-gray-500">{permit.title}</p></div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>{status.label}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Permit Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Type:</span><p className="font-medium capitalize">{permit.type.replace("_", " ")}</p></div>
              <div><span className="text-gray-500">Location:</span><p className="font-medium">{permit.location}</p></div>
              <div><span className="text-gray-500">Start:</span><p className="font-medium">{permit.startDate} {permit.startTime}</p></div>
              <div><span className="text-gray-500">End:</span><p className="font-medium">{permit.endDate} {permit.endTime}</p></div>
              <div className="col-span-2"><span className="text-gray-500">Description:</span><p className="font-medium">{permit.description || "N/A"}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Users size={18} /> Assigned Workers</h2>
            <div className="flex flex-wrap gap-2">
              {permit.workers?.map((w: any, i: number) => <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{w.name || w}</span>)}
              {(!permit.workers || permit.workers.length === 0) && <span className="text-gray-500">No workers assigned</span>}
            </div>
          </div>
          {/* Hazards & PPE */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><AlertTriangle size={18} /> Hazards & Controls</h2>
            <div className="space-y-4">
              <div><span className="text-sm text-gray-500">Identified Hazards:</span>
                <div className="flex flex-wrap gap-2 mt-1">{permit.hazards?.map((h, i) => <span key={i} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">{h}</span>)}</div>
              </div>
              <div><span className="text-sm text-gray-500">Control Measures:</span><p className="text-sm mt-1">{permit.controls || "N/A"}</p></div>
              <div><span className="text-sm text-gray-500">Required PPE:</span>
                <div className="flex flex-wrap gap-2 mt-1">{permit.ppe?.map((p, i) => <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">{p}</span>)}</div>
              </div>
            </div>
          </div>
          {/* Documents */}
          {permit.documents && permit.documents.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FileText size={18} /> Documents</h2>
              <div className="space-y-2">
                {permit.documents.map((d: any, i: number) => (
                  <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100">
                    <FileText size={16} className="text-gray-500" /><span className="text-sm">{d.name}</span><span className="text-xs text-gray-400 ml-auto">{d.type}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Sidebar - Approval Workflow */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Shield size={18} /> Approval Workflow</h2>
            <div className="space-y-4">
              {["supervisor", "incharge", "hse"].map((stage) => {
                const approval = permit.approvals?.find((a: any) => a.stage === stage);
                const isApproved = approval?.status === "approved";
                const isRejected = approval?.status === "rejected";
                const isCurrent = permit.currentApprovalStage === stage;
                const labels: Record<string, string[]> = { supervisor: ["Supervisor Approval", permit.supervisorName], incharge: ["Shift/Line Incharge", "Shift Manager / Line Manager"], hse: ["HSE Approval", "HSE Manager / Safety Officer"] };
                return (
                  <div key={stage} className={`flex items-start gap-3 ${isCurrent ? "opacity-100" : "opacity-60"}`}>
                    {isApproved ? <CheckCircle className="text-green-600 mt-0.5" size={20} /> : isRejected ? <XCircle className="text-red-600 mt-0.5" size={20} /> : <Clock className={isCurrent ? "text-amber-600" : "text-gray-400"} size={20} />}
                    <div><p className="font-medium text-sm">{labels[stage][0]}</p><p className="text-xs text-gray-500">{labels[stage][1]}</p>
                      {approval?.remarks && <p className="text-xs text-gray-600 mt-1 italic">"{approval.remarks}"</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Approval Actions */}
          {canApprove() && permit.status !== "rejected" && permit.status !== "closed" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Approval</h2>
              <div className="space-y-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Remarks / Observations</label>
                  <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Add your observations..." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Guidelines (Optional)</label>
                  <textarea value={guidelines} onChange={(e) => setGuidelines(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Safety guidelines..." /></div>
                <div className="flex gap-2">
                  <button onClick={handleApprove} disabled={actionLoading} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm">{actionLoading ? "..." : "Approve"}</button>
                  <button onClick={handleReject} disabled={actionLoading} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm">Reject</button>
                </div>
              </div>
            </div>
          )}
          {/* Close/Suspend Actions */}
          {(canClose() || (permit.status === "active" && user?.role && PERMIT_APPROVAL_ROLES.stage3.includes(user.role as any))) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Permit Actions</h2>
              <div className="space-y-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Closure/Suspension Remarks *</label>
                  <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Observations..." /></div>
                <div className="flex gap-2">
                  {canClose() && <button onClick={handleClose} disabled={actionLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center justify-center gap-1"><CheckCircle size={16} /> Close</button>}
                  <button onClick={handleSuspend} disabled={actionLoading} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm flex items-center justify-center gap-1"><StopCircle size={16} /> Suspend</button>
                </div>
              </div>
            </div>
          )}
          {/* Requester Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Requested By</h2>
            <p className="font-medium">{permit.requestedBy}</p><p className="text-sm text-gray-500">Initiator</p>
          </div>
        </div>
      </div>
    </div>
  );
}

