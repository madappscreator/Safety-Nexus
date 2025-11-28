"use client";

import { FileCheck, AlertTriangle, ClipboardCheck, Users, TrendingDown, TrendingUp, Calendar, Shield } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import PendingTasks from "@/components/dashboard/PendingTasks";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="fade-in">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.displayName?.split(" ")[0]}!</h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your safety management today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Permits"
          value={12}
          change="+3 from yesterday"
          changeType="positive"
          icon={FileCheck}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Open Incidents"
          value={5}
          change="-2 from last week"
          changeType="positive"
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
        />
        <StatCard
          title="Pending Inspections"
          value={8}
          change="3 due today"
          changeType="neutral"
          icon={ClipboardCheck}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Overdue CAPAs"
          value={2}
          change="Needs attention"
          changeType="negative"
          icon={Shield}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <PendingTasks />
          <ActivityFeed />
        </div>

        {/* Right Column - Quick Actions & Summary */}
        <div className="space-y-6">
          <QuickActions />

          {/* Safety Score Card */}
          <div className="bg-gradient-to-br from-[#0D47A1] to-[#2E7D32] rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-4">Safety Score</h3>
            <div className="flex items-end gap-4">
              <span className="text-5xl font-bold">92</span>
              <div className="flex items-center gap-1 text-green-300 mb-2">
                <TrendingUp size={16} />
                <span className="text-sm">+5% this month</span>
              </div>
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 w-[92%]"></div>
            </div>
            <p className="text-sm text-white/80 mt-2">Based on incidents, audits, and compliance</p>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={18} /> Upcoming Events
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-bold">28</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Monthly Safety Meeting</p>
                  <p className="text-xs text-gray-500">10:00 AM - Conference Room A</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-sm font-bold">30</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Fire Drill</p>
                  <p className="text-xs text-gray-500">2:00 PM - All Areas</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-sm font-bold">02</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Safety Training: Hazmat</p>
                  <p className="text-xs text-gray-500">9:00 AM - Training Room</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

