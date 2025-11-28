"use client";

import Link from "next/link";
import { Plus, AlertTriangle, ClipboardCheck, Siren } from "lucide-react";

const quickActions = [
  { name: "New Permit", href: "/permits/new", icon: Plus, color: "bg-[#0D47A1] hover:bg-blue-800" },
  { name: "Report Incident", href: "/incidents/new", icon: AlertTriangle, color: "bg-amber-500 hover:bg-amber-600" },
  { name: "Start Inspection", href: "/inspections/new", icon: ClipboardCheck, color: "bg-[#2E7D32] hover:bg-green-700" },
  { name: "Emergency", href: "/emergency", icon: Siren, color: "bg-red-600 hover:bg-red-700" },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-colors`}
          >
            <action.icon size={24} />
            <span className="text-sm font-medium">{action.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

