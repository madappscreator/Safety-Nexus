"use client";

import { useState, useEffect } from "react";
import { Users, Building2, Settings, Shield, Plus, Search, Edit, Trash2, CheckCircle, XCircle, X, Loader2, AlertTriangle, Key } from "lucide-react";
import { collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { User, UserRole, ROLE_HIERARCHY } from "@/types";

const tabs = [
  { id: "users", label: "Users", icon: Users },
  { id: "roles", label: "Roles & Permissions", icon: Shield },
  { id: "locations", label: "Locations", icon: Building2 },
  { id: "config", label: "Configuration", icon: Settings },
];

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "company_admin", label: "Company Admin" },
  { value: "hse_manager", label: "HSE Manager" },
  { value: "hse_supervisor", label: "HSE Supervisor" },
  { value: "safety_officer", label: "Safety Officer" },
  { value: "shift_manager", label: "Shift Manager" },
  { value: "shift_incharge", label: "Shift Incharge" },
  { value: "line_manager", label: "Line Manager" },
  { value: "line_incharge", label: "Line Incharge" },
  { value: "supervisor", label: "Supervisor" },
  { value: "employee", label: "Employee" },
  { value: "worker", label: "Worker" },
  { value: "contractor", label: "Contractor" },
];

const rolePermissions: Record<string, string[]> = {
  company_admin: ["All permissions - Full system access"],
  hse_manager: ["Manage permits", "Manage incidents", "View reports", "Manage training", "Conduct audits"],
  hse_supervisor: ["Approve permits (HSE)", "Manage incidents", "View reports", "Conduct inspections"],
  safety_officer: ["Approve permits (HSE)", "Report incidents", "Conduct inspections", "Manage training"],
  shift_manager: ["Approve permits (Stage 2)", "View team reports", "Manage shift operations"],
  shift_incharge: ["Approve permits (Stage 2)", "View team reports"],
  line_manager: ["Approve permits (Stage 2)", "View line reports", "Manage line operations"],
  line_incharge: ["Approve permits (Stage 2)", "View line reports"],
  supervisor: ["Approve permits (Stage 1)", "View team reports", "Assign workers"],
  employee: ["Create permits", "Report incidents", "View own permits"],
  worker: ["View permits", "Report incidents", "Complete training"],
  contractor: ["View assigned permits", "Report incidents"],
};

interface UserFormData {
  displayName: string;
  email: string;
  role: UserRole;
  phone: string;
  password: string;
}

const initialFormData: UserFormData = {
  displayName: "",
  email: "",
  role: "worker",
  phone: "",
  password: "",
};

export default function AdminPage() {
  const { user: currentUser, company, isCompanyAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch users from Firestore
  useEffect(() => {
    if (company?.id) {
      fetchUsers();
    }
  }, [company?.id]);

  const fetchUsers = async () => {
    if (!company?.id) return;

    setLoading(true);
    setError(null);

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("companyId", "==", company.id));
      const snapshot = await getDocs(q);

      const usersList: User[] = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastSeen: doc.data().lastSeen?.toDate() || new Date(),
      })) as User[];

      // Sort by role hierarchy (higher roles first)
      usersList.sort((a, b) => (ROLE_HIERARCHY[b.role] || 0) - (ROLE_HIERARCHY[a.role] || 0));

      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open create user modal
  const handleAddUser = () => {
    setFormData(initialFormData);
    setSelectedUser(null);
    setModalMode("create");
    setFormError(null);
    setShowModal(true);
  };

  // Open edit user modal
  const handleEditUser = (user: User) => {
    setFormData({
      displayName: user.displayName || "",
      email: user.email || "",
      role: user.role,
      phone: user.phone || "",
      password: "",
    });
    setSelectedUser(user);
    setModalMode("edit");
    setFormError(null);
    setShowModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Get user limit from subscription
  const userLimit = company?.subscription?.userLimit || 50;
  const activeUserCount = users.filter(u => u.isActive).length;
  const canAddMoreUsers = activeUserCount < userLimit;

  // Create or update user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.id) return;

    setSubmitting(true);
    setFormError(null);

    try {
      if (modalMode === "create") {
        // Check user limit before creating
        if (!canAddMoreUsers) {
          setFormError(`User limit reached (${userLimit} users). Please upgrade your subscription to add more users.`);
          setSubmitting(false);
          return;
        }

        // Create Firebase Auth user
        const credential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

        // Create Firestore user document
        await setDoc(doc(db, "users", credential.user.uid), {
          uid: credential.user.uid,
          email: formData.email,
          displayName: formData.displayName,
          companyId: company.id,
          role: formData.role,
          phone: formData.phone || null,
          isActive: true,
          createdAt: serverTimestamp(),
          lastSeen: serverTimestamp(),
        });
      } else if (selectedUser) {
        // Update existing user
        await updateDoc(doc(db, "users", selectedUser.uid), {
          displayName: formData.displayName,
          role: formData.role,
          phone: formData.phone || null,
          updatedAt: serverTimestamp(),
        });
      }

      setShowModal(false);
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      console.error("Error saving user:", err);
      if (err.code === "auth/email-already-in-use") {
        setFormError("This email is already registered.");
      } else if (err.code === "auth/weak-password") {
        setFormError("Password should be at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setFormError("Invalid email address.");
      } else {
        setFormError(err.message || "Failed to save user. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleting(true);

    try {
      // Soft delete - just mark as inactive
      await updateDoc(doc(db, "users", userToDelete.uid), {
        isActive: false,
        deletedAt: serverTimestamp(),
      });

      setShowDeleteConfirm(false);
      setUserToDelete(null);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user: User) => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        isActive: !user.isActive,
        updatedAt: serverTimestamp(),
      });
      fetchUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
      alert("Failed to update user status.");
    }
  };

  // Send password reset email
  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset email sent to ${email}`);
    } catch (err) {
      console.error("Error sending password reset:", err);
      alert("Failed to send password reset email.");
    }
  };

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return "Never";
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get role label
  const getRoleLabel = (role: UserRole) => {
    const roleOption = roleOptions.find(r => r.value === role);
    return roleOption?.label || role;
  };

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
          <p className="text-gray-500 mt-1">Manage users, roles, and system configuration for {company?.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "text-[#0D47A1] border-b-2 border-[#0D47A1]" : "text-gray-500 hover:text-gray-700"}`}>
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" placeholder="Search users by name, email, or role..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none" />
                </div>
                <button
                  onClick={handleAddUser}
                  disabled={!canAddMoreUsers}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    canAddMoreUsers
                      ? "bg-[#0D47A1] text-white hover:bg-blue-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  title={!canAddMoreUsers ? `User limit reached (${userLimit} users)` : "Add new user"}
                >
                  <Plus size={20} /> Add User
                </button>
              </div>

              {/* User Limit Warning */}
              {!canAddMoreUsers && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-800">
                  <AlertTriangle size={18} />
                  <span className="text-sm">
                    User limit reached ({activeUserCount}/{userLimit}).
                    <a href="/subscription" className="ml-1 text-[#0D47A1] underline">Upgrade your subscription</a> to add more users.
                  </span>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0D47A1]" />
                  <span className="ml-2 text-gray-600">Loading users...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="flex items-center justify-center py-12 text-red-600">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  {error}
                  <button onClick={fetchUsers} className="ml-4 text-[#0D47A1] underline">Try again</button>
                </div>
              )}

              {/* Users Table */}
              {!loading && !error && (
                <div className="overflow-x-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      {searchQuery ? "No users found matching your search." : "No users in this company yet. Click 'Add User' to create one."}
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Seen</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => (
                          <tr key={user.uid} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#0D47A1] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                  {user.displayName?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{user.displayName || "Unknown"}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                  {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                {getRoleLabel(user.role)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                                  user.isActive
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                              >
                                {user.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                {user.isActive ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.lastSeen)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                  title="Edit User"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleResetPassword(user.email)}
                                  className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600 transition-colors"
                                  title="Reset Password"
                                >
                                  <Key size={16} />
                                </button>
                                <button
                                  onClick={() => { setUserToDelete(user); setShowDeleteConfirm(true); }}
                                  className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                  title="Delete User"
                                  disabled={user.uid === currentUser?.uid}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* User Stats */}
              {!loading && !error && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>Total Users: <strong className="text-gray-800">{users.length}</strong></span>
                  <span>Active: <strong className="text-green-600">{users.filter(u => u.isActive).length}</strong></span>
                  <span>Inactive: <strong className="text-red-600">{users.filter(u => !u.isActive).length}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === "roles" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roleOptions.map((role) => {
                const roleUserCount = users.filter(u => u.role === role.value).length;
                const permissions = rolePermissions[role.value] || [];
                return (
                  <div key={role.value} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">{role.label}</h3>
                      <span className="text-sm text-gray-500">{roleUserCount} users</span>
                    </div>
                    <div className="space-y-1">
                      {permissions.slice(0, 4).map((perm, idx) => (
                        <p key={idx} className="text-sm text-gray-600 flex items-center gap-1">
                          <CheckCircle size={14} className="text-green-500 flex-shrink-0" /> {perm}
                        </p>
                      ))}
                      {permissions.length > 4 && <p className="text-sm text-gray-400">+{permissions.length - 4} more</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === "locations" && (
            <div className="text-center py-12 text-gray-500">
              <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Location management will be available soon.</p>
              <p className="text-sm mt-2">Locations are managed at the company level.</p>
            </div>
          )}

          {/* Config Tab */}
          {activeTab === "config" && (
            <div className="space-y-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Permit Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between"><span className="text-gray-600">Require supervisor approval</span><input type="checkbox" defaultChecked className="w-4 h-4" /></label>
                  <label className="flex items-center justify-between"><span className="text-gray-600">Auto-close permits after end time</span><input type="checkbox" defaultChecked className="w-4 h-4" /></label>
                  <label className="flex items-center justify-between"><span className="text-gray-600">Send reminder 1 hour before expiry</span><input type="checkbox" defaultChecked className="w-4 h-4" /></label>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Incident Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between"><span className="text-gray-600">Notify HSE Manager on all incidents</span><input type="checkbox" defaultChecked className="w-4 h-4" /></label>
                  <label className="flex items-center justify-between"><span className="text-gray-600">Require photos for incident reports</span><input type="checkbox" className="w-4 h-4" /></label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                {modalMode === "create" ? "Add New User" : "Edit User"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={modalMode === "edit"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none disabled:bg-gray-100"
                  placeholder="Enter email address"
                />
              </div>

              {modalMode === "create" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none"
                    placeholder="Min 6 characters"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none"
                >
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] outline-none"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#0D47A1] text-white rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {modalMode === "create" ? "Create User" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Delete User</h2>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to deactivate <strong>{userToDelete.displayName}</strong>?
              They will no longer be able to access the system.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 size={18} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

