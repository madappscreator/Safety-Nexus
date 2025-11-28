"use client";

import { useState } from "react";
import { AlertTriangle, Phone, MapPin, Users, Siren, Shield, Clock, CheckCircle, Radio, Megaphone } from "lucide-react";

const emergencyContacts = [
  { name: "Fire Department", number: "101", icon: "🚒" },
  { name: "Ambulance", number: "102", icon: "🚑" },
  { name: "Police", number: "100", icon: "🚔" },
  { name: "Plant Emergency", number: "1800-XXX-XXXX", icon: "🏭" },
  { name: "HSE Manager", number: "+91 98XXX XXXXX", icon: "👷" },
];

const assemblyPoints = [
  { name: "Assembly Point A", location: "Main Gate Parking", capacity: 200, assigned: ["Building A", "Admin Block"] },
  { name: "Assembly Point B", location: "Warehouse Yard", capacity: 150, assigned: ["Warehouse", "Loading Bay"] },
  { name: "Assembly Point C", location: "Canteen Ground", capacity: 300, assigned: ["Production", "Utilities"] },
];

const recentDrills = [
  { type: "Fire Drill", date: "2024-11-15", duration: "12 min", participants: 245, status: "completed" },
  { type: "Evacuation Drill", date: "2024-10-20", duration: "8 min", participants: 280, status: "completed" },
  { type: "Chemical Spill", date: "2024-09-10", duration: "15 min", participants: 45, status: "completed" },
];

export default function EmergencyPage() {
  const [activeEmergency, setActiveEmergency] = useState(false);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Emergency Management</h1>
          <p className="text-gray-500 mt-1">Emergency response, contacts, and drill management</p>
        </div>
        <button onClick={() => setActiveEmergency(!activeEmergency)}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeEmergency ? "bg-green-600 text-white animate-pulse" : "bg-red-600 text-white hover:bg-red-700"}`}>
          <Siren size={24} /> {activeEmergency ? "END EMERGENCY" : "DECLARE EMERGENCY"}
        </button>
      </div>

      {/* Active Emergency Banner */}
      {activeEmergency && (
        <div className="bg-red-600 text-white rounded-xl p-6 mb-6 animate-pulse">
          <div className="flex items-center gap-4">
            <Siren size={48} />
            <div>
              <h2 className="text-2xl font-bold">⚠️ EMERGENCY ACTIVE</h2>
              <p className="text-red-100">All personnel proceed to designated assembly points immediately</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emergency Contacts */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Phone size={20} /> Emergency Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyContacts.map((contact) => (
                <a key={contact.name} href={`tel:${contact.number}`}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors">
                  <span className="text-3xl">{contact.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800">{contact.name}</p>
                    <p className="text-lg font-bold text-red-600">{contact.number}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Assembly Points */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><MapPin size={20} /> Assembly Points</h3>
            <div className="space-y-4">
              {assemblyPoints.map((point) => (
                <div key={point.name} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{point.name}</h4>
                    <span className="text-sm text-gray-500"><Users size={14} className="inline mr-1" /> Capacity: {point.capacity}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2"><MapPin size={14} className="inline mr-1" /> {point.location}</p>
                  <div className="flex flex-wrap gap-1">
                    {point.assigned.map((area) => (
                      <span key={area} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{area}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2">
                <Megaphone size={18} /> Send Alert
              </button>
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <Radio size={18} /> Start Headcount
              </button>
              <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <Shield size={18} /> View ERP
              </button>
            </div>
          </div>

          {/* Recent Drills */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Recent Drills</h3>
            <div className="space-y-3">
              {recentDrills.map((drill, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-800">{drill.type}</p>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      <CheckCircle size={12} className="inline mr-1" /> {drill.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{drill.date} • {drill.duration} • {drill.participants} participants</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Schedule New Drill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

