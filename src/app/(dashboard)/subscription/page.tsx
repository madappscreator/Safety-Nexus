"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, Users, Calendar, CheckCircle, AlertTriangle, 
  Download, RefreshCw, Crown, Zap, Building2, Clock, 
  FileText, ChevronRight, Loader2, TrendingUp
} from "lucide-react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BillingTransaction, BillingInvoice, SUBSCRIPTION_PLANS, 
  SubscriptionPlan, SubscriptionPlanDetails 
} from "@/types";

export default function SubscriptionPage() {
  const { company, user } = useAuth();
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "billing" | "invoices">("overview");

  // Get current plan details
  const currentPlan = company?.subscription?.plan || "starter";
  const planDetails = SUBSCRIPTION_PLANS[currentPlan as SubscriptionPlan] || SUBSCRIPTION_PLANS.starter;
  const expiryDate = company?.subscription?.expiryDate;
  const userLimit = company?.subscription?.userLimit || planDetails.freeUsers;

  // Calculate days until expiry
  const daysUntilExpiry = expiryDate 
    ? Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  const isExpiring = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;

  useEffect(() => {
    if (company?.id) {
      fetchData();
    }
  }, [company?.id]);

  const fetchData = async () => {
    if (!company?.id) return;
    setLoading(true);
    try {
      // Fetch user count
      const usersRef = collection(db, "users");
      const usersQuery = query(usersRef, where("companyId", "==", company.id), where("isActive", "==", true));
      const usersSnapshot = await getDocs(usersQuery);
      setUserCount(usersSnapshot.size);

      // Fetch billing transactions
      const txnRef = collection(db, `tenants/${company.id}/billing/transactions`);
      const txnQuery = query(txnRef, orderBy("paymentDate", "desc"), limit(10));
      try {
        const txnSnapshot = await getDocs(txnQuery);
        const txnList = txnSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          paymentDate: doc.data().paymentDate?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as BillingTransaction[];
        setTransactions(txnList);
      } catch (e) {
        console.log("No transactions collection yet");
      }

      // Fetch invoices
      const invRef = collection(db, `tenants/${company.id}/billing/invoices`);
      const invQuery = query(invRef, orderBy("generatedOn", "desc"), limit(10));
      try {
        const invSnapshot = await getDocs(invQuery);
        const invList = invSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          generatedOn: doc.data().generatedOn?.toDate() || new Date(),
          dueDate: doc.data().dueDate?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as BillingInvoice[];
        setInvoices(invList);
      } catch (e) {
        console.log("No invoices collection yet");
      }
    } catch (err) {
      console.error("Error fetching subscription data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "failed": return "bg-red-100 text-red-700";
      case "overdue": return "bg-red-100 text-red-700";
      case "sent": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "enterprise": return <Crown className="text-purple-500" size={24} />;
      case "standard": return <Zap className="text-blue-500" size={24} />;
      default: return <Building2 className="text-gray-500" size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D47A1]" />
        <span className="ml-2 text-gray-600">Loading subscription details...</span>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subscription & Billing</h1>
          <p className="text-gray-500 mt-1">Manage your subscription plan and billing history</p>
        </div>
        <button 
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {/* Expiry Warning */}
      {(isExpiring || isExpired) && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${isExpired ? "bg-red-50 border border-red-200" : "bg-yellow-50 border border-yellow-200"}`}>
          <AlertTriangle className={isExpired ? "text-red-500" : "text-yellow-500"} size={24} />
          <div className="flex-1">
            <p className={`font-medium ${isExpired ? "text-red-800" : "text-yellow-800"}`}>
              {isExpired ? "Your subscription has expired!" : `Your subscription expires in ${daysUntilExpiry} days`}
            </p>
            <p className={`text-sm ${isExpired ? "text-red-600" : "text-yellow-600"}`}>
              {isExpired ? "Please renew to continue using all features." : "Renew now to avoid service interruption."}
            </p>
          </div>
          <button className="px-4 py-2 bg-[#0D47A1] text-white rounded-lg font-medium hover:bg-blue-800">
            Renew Now
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Current Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Current Plan</span>
            {getPlanIcon(currentPlan)}
          </div>
          <p className="text-2xl font-bold text-gray-800">{planDetails.displayName}</p>
          <p className="text-sm text-gray-500 mt-1">{formatCurrency(planDetails.yearlyPrice)}/year</p>
        </div>

        {/* Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Active Users</span>
            <Users className="text-blue-500" size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-800">{userCount} / {userLimit}</p>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${userCount >= userLimit ? "bg-red-500" : userCount >= userLimit * 0.8 ? "bg-yellow-500" : "bg-green-500"}`}
              style={{ width: `${Math.min((userCount / userLimit) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Expiry Date */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Valid Until</span>
            <Calendar className={isExpired ? "text-red-500" : isExpiring ? "text-yellow-500" : "text-green-500"} size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatDate(expiryDate)}</p>
          <p className={`text-sm mt-1 ${isExpired ? "text-red-500" : isExpiring ? "text-yellow-500" : "text-green-500"}`}>
            {isExpired ? "Expired" : `${daysUntilExpiry} days remaining`}
          </p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Status</span>
            {isExpired ? <AlertTriangle className="text-red-500" size={24} /> : <CheckCircle className="text-green-500" size={24} />}
          </div>
          <p className={`text-2xl font-bold ${isExpired ? "text-red-600" : "text-green-600"}`}>
            {isExpired ? "Expired" : isExpiring ? "Expiring Soon" : "Active"}
          </p>
          <p className="text-sm text-gray-500 mt-1">Subscription status</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { id: "overview", label: "Plan Overview", icon: CreditCard },
            { id: "billing", label: "Billing History", icon: Clock },
            { id: "invoices", label: "Invoices", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-[#0D47A1] border-b-2 border-[#0D47A1]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Current Plan Details */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      {getPlanIcon(currentPlan)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{planDetails.displayName} Plan</h3>
                      <p className="text-gray-500">{formatCurrency(planDetails.yearlyPrice)} per year</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-[#0D47A1] text-[#0D47A1] rounded-lg font-medium hover:bg-blue-50">
                    Upgrade Plan
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planDetails.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle size={16} className="text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Plans */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.values(SUBSCRIPTION_PLANS).filter(p => p.name !== "internal").map((plan) => (
                    <div
                      key={plan.name}
                      className={`border rounded-xl p-5 ${plan.name === currentPlan ? "border-[#0D47A1] bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {getPlanIcon(plan.name)}
                        <h4 className="font-semibold text-gray-800">{plan.displayName}</h4>
                        {plan.name === currentPlan && (
                          <span className="ml-auto text-xs bg-[#0D47A1] text-white px-2 py-0.5 rounded-full">Current</span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-gray-800 mb-1">{formatCurrency(plan.yearlyPrice)}</p>
                      <p className="text-sm text-gray-500 mb-4">per year • {plan.freeUsers} users included</p>
                      <ul className="space-y-2 mb-4">
                        {plan.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                            <CheckCircle size={14} className="text-green-500" /> {f}
                          </li>
                        ))}
                      </ul>
                      {plan.name !== currentPlan && (
                        <button className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                          {SUBSCRIPTION_PLANS[currentPlan as SubscriptionPlan]?.yearlyPrice < plan.yearlyPrice ? "Upgrade" : "Downgrade"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Billing History Tab */}
          {activeTab === "billing" && (
            <div>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No billing transactions yet.</p>
                  <p className="text-sm mt-2">Your payment history will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment Mode</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(txn.paymentDate)}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{SUBSCRIPTION_PLANS[txn.plan]?.displayName || txn.plan} Plan</p>
                            <p className="text-sm text-gray-500">{txn.period}</p>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">{formatCurrency(txn.amount)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize">{txn.paymentMode.replace("_", " ")}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(txn.status)}`}>
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <div>
              {invoices.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No invoices yet.</p>
                  <p className="text-sm mt-2">Your invoices will appear here after payment.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice #</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{inv.invoiceNumber}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.generatedOn)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.dueDate)}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{formatCurrency(inv.amount)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(inv.status)}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {inv.pdfUrl && (
                              <a
                                href={inv.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#0D47A1] hover:underline text-sm"
                              >
                                <Download size={14} /> Download
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Limit Warning */}
      {userCount >= userLimit * 0.8 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
          <TrendingUp className="text-yellow-500" size={24} />
          <div className="flex-1">
            <p className="font-medium text-yellow-800">
              You&apos;re using {Math.round((userCount / userLimit) * 100)}% of your user limit
            </p>
            <p className="text-sm text-yellow-600">
              {userCount >= userLimit
                ? "You've reached your user limit. Upgrade to add more users."
                : `You have ${userLimit - userCount} user slots remaining.`}
            </p>
          </div>
          <button className="px-4 py-2 bg-[#0D47A1] text-white rounded-lg font-medium hover:bg-blue-800">
            Add More Users
          </button>
        </div>
      )}
    </div>
  );
}
