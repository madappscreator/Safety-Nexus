"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, GraduationCap, Users, Calendar, Clock, CheckCircle, AlertCircle, Play, Award, Eye, Edit, Trash2, BookOpen, FileText, Filter } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, query, where, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

// Types
interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  category: "safety" | "technical" | "compliance" | "leadership" | "general";
  type: "mandatory" | "optional" | "certification";
  duration: number; // in minutes
  validityPeriod: number; // in months (0 = no expiry)
  modules: { title: string; content: string; duration: number }[];
  passingScore: number;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
}

interface TrainingSession {
  id: string;
  sessionId: string;
  courseId: string;
  courseTitle: string;
  description: string;
  trainer: string;
  trainerName: string;
  location: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  participants: { uid: string; name: string; status: "registered" | "attended" | "absent" | "completed"; score?: number }[];
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  materials: { name: string; url: string }[];
  companyId: string;
  createdAt: Date;
}

interface UserCertification {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  sessionId?: string;
  completedDate: Date;
  expiryDate?: Date;
  score: number;
  certificateUrl?: string;
  status: "valid" | "expiring" | "expired";
  companyId: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  scheduled: { bg: "bg-blue-100", text: "text-blue-700" },
  in_progress: { bg: "bg-amber-100", text: "text-amber-700" },
  completed: { bg: "bg-green-100", text: "text-green-700" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-500" },
  valid: { bg: "bg-green-100", text: "text-green-700" },
  expiring: { bg: "bg-amber-100", text: "text-amber-700" },
  expired: { bg: "bg-red-100", text: "text-red-700" },
};

const categoryColors: Record<string, string> = {
  safety: "bg-red-100 text-red-700",
  technical: "bg-blue-100 text-blue-700",
  compliance: "bg-purple-100 text-purple-700",
  leadership: "bg-amber-100 text-amber-700",
  general: "bg-gray-100 text-gray-700",
};

export default function TrainingPage() {
  const { user } = useAuth();
  const [view, setView] = useState<"sessions" | "courses" | "certifications">("sessions");
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [certifications, setCertifications] = useState<UserCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (user?.companyId) {
      fetchData();
    }
  }, [user?.companyId]);

  const fetchData = async () => {
    try {
      // Fetch sessions
      const sessionsSnap = await getDocs(collection(db, "training_sessions"));
      const sessionsData = sessionsSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as TrainingSession))
        .filter(s => s.companyId === user?.companyId);
      sessionsData.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
      setSessions(sessionsData);

      // Fetch courses
      const coursesSnap = await getDocs(collection(db, "training_courses"));
      const coursesData = coursesSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as TrainingCourse))
        .filter(c => c.companyId === user?.companyId && c.isActive);
      setCourses(coursesData);

      // Fetch certifications
      const certsSnap = await getDocs(collection(db, "certifications"));
      const certsData = certsSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as UserCertification))
        .filter(c => c.companyId === user?.companyId);
      setCertifications(certsData);
    } catch (err) {
      console.error("Error fetching training data:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    scheduled: sessions.filter(s => s.status === "scheduled").length,
    inProgress: sessions.filter(s => s.status === "in_progress").length,
    completed: sessions.filter(s => s.status === "completed").length,
    totalCourses: courses.length,
    validCerts: certifications.filter(c => c.status === "valid").length,
    expiringCerts: certifications.filter(c => c.status === "expiring").length,
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sessionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await deleteDoc(doc(db, "training_sessions", id));
      setSessions(sessions.filter(s => s.id !== id));
    } catch (err) {
      console.error("Error deleting session:", err);
      alert("Failed to delete session");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Training Management</h1>
          <p className="text-gray-500 mt-1">Manage safety training sessions, courses, and certifications</p>
        </div>
        <div className="flex gap-2">
          <Link href="/training/courses/new" className="inline-flex items-center gap-2 bg-white border border-purple-600 text-purple-600 px-4 py-2.5 rounded-lg font-medium hover:bg-purple-50 transition-colors">
            <BookOpen size={20} /> New Course
          </Link>
          <Link href="/training/new" className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors">
            <Plus size={20} /> Schedule Session
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Completed (MTD)</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Active Courses</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalCourses}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Valid Certs</p>
          <p className="text-2xl font-bold text-green-600">{stats.validCerts}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Expiring Soon</p>
          <p className="text-2xl font-bold text-amber-600">{stats.expiringCerts}</p>
        </div>
      </div>

      {/* View Toggle & Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex gap-2">
          <button onClick={() => setView("sessions")} className={`px-4 py-2 rounded-lg font-medium transition-all ${view === "sessions" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            <Calendar className="inline mr-2" size={18} /> Sessions
          </button>
          <button onClick={() => setView("courses")} className={`px-4 py-2 rounded-lg font-medium transition-all ${view === "courses" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            <GraduationCap className="inline mr-2" size={18} /> Courses
          </button>
          <button onClick={() => setView("certifications")} className={`px-4 py-2 rounded-lg font-medium transition-all ${view === "certifications" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            <Award className="inline mr-2" size={18} /> Certifications
          </button>
        </div>
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {view === "sessions" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
        </div>
      </div>

      {/* Sessions View */}
      {view === "sessions" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
              <p>No training sessions found</p>
              <Link href="/training/new" className="text-purple-600 hover:underline mt-2 inline-block">Schedule your first session</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Session</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trainer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Participants</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSessions.map((session) => {
                    const statusStyle = statusColors[session.status];
                    return (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800">{session.courseTitle}</p>
                          <p className="text-sm text-gray-500">{session.sessionId}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{session.trainerName}</td>
                        <td className="px-6 py-4">
                          <p className="text-gray-800">{session.scheduledDate}</p>
                          <p className="text-sm text-gray-500">{session.startTime} - {session.endTime}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{session.location}</td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Users size={16} /> {session.participants?.length || 0}/{session.maxParticipants}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}>
                            {session.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/training/sessions/${session.id}`} className="p-1 text-gray-400 hover:text-purple-600">
                              <Eye size={18} />
                            </Link>
                            <Link href={`/training/sessions/${session.id}/edit`} className="p-1 text-gray-400 hover:text-blue-600">
                              <Edit size={18} />
                            </Link>
                            <button onClick={() => handleDeleteSession(session.id)} className="p-1 text-gray-400 hover:text-red-600">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Courses View */}
      {view === "courses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
              <BookOpen className="mx-auto mb-4 text-gray-300" size={48} />
              <p>No courses found</p>
              <Link href="/training/courses/new" className="text-purple-600 hover:underline mt-2 inline-block">Create your first course</Link>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <GraduationCap className="text-purple-600" size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[course.category]}`}>
                      {course.category}
                    </span>
                    {course.type === "mandatory" && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Required</span>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><FileText size={14} /> {course.modules?.length || 0} modules</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {course.duration} min</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/training/courses/${course.id}`} className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 text-sm">
                    <Eye size={16} /> View
                  </Link>
                  <Link href={`/training/courses/${course.id}/edit`} className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Edit size={16} className="text-gray-500" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Certifications View */}
      {view === "certifications" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {certifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Award className="mx-auto mb-4 text-gray-300" size={48} />
              <p>No certifications found</p>
              <p className="text-sm mt-1">Certifications are awarded when users complete training sessions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Completed</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {certifications.map((cert) => {
                    const statusStyle = statusColors[cert.status];
                    return (
                      <tr key={cert.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{cert.userName}</td>
                        <td className="px-6 py-4 text-gray-600">{cert.courseTitle}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {cert.completedDate ? new Date(cert.completedDate as any).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {cert.expiryDate ? new Date(cert.expiryDate as any).toLocaleDateString() : "No Expiry"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${cert.score >= 80 ? "text-green-600" : cert.score >= 60 ? "text-amber-600" : "text-red-600"}`}>
                            {cert.score}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}>
                            {cert.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {cert.certificateUrl ? (
                            <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline flex items-center gap-1">
                              <FileText size={16} /> Download
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

