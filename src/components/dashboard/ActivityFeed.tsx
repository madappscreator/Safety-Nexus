"use client";

import { FileCheck, AlertTriangle, ClipboardCheck, Users, Wrench } from "lucide-react";

const activities = [
  { id: 1, type: "permit", message: "Hot Work Permit #PTW-2024-089 approved", user: "Rahul Sharma", time: "5 min ago", icon: FileCheck, color: "text-blue-600", bg: "bg-blue-100" },
  { id: 2, type: "incident", message: "Near miss reported at Assembly Line 3", user: "Priya Patel", time: "15 min ago", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100" },
  { id: 3, type: "inspection", message: "Fire Safety Audit completed - Score: 92%", user: "Amit Kumar", time: "1 hour ago", icon: ClipboardCheck, color: "text-green-600", bg: "bg-green-100" },
  { id: 4, type: "training", message: "5 employees completed First Aid Training", user: "System", time: "2 hours ago", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
  { id: 5, type: "asset", message: "Crane #CR-007 maintenance completed", user: "Vijay Singh", time: "3 hours ago", icon: Wrench, color: "text-gray-600", bg: "bg-gray-100" },
];

export default function ActivityFeed() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${activity.bg}`}>
              <activity.icon className={activity.color} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">{activity.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{activity.user}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 text-sm text-[#0D47A1] hover:underline">
        View all activity
      </button>
    </div>
  );
}

