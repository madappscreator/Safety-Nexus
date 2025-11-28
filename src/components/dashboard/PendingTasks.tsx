"use client";

import { Clock, AlertCircle, CheckCircle } from "lucide-react";

const tasks = [
  { id: 1, title: "Review Hot Work Permit #PTW-2024-090", type: "permit", priority: "high", dueDate: "Today" },
  { id: 2, title: "Complete CAPA for Incident #INC-2024-012", type: "capa", priority: "high", dueDate: "Tomorrow" },
  { id: 3, title: "Monthly Fire Equipment Inspection", type: "inspection", priority: "medium", dueDate: "In 2 days" },
  { id: 4, title: "Safety Induction for new contractors", type: "training", priority: "medium", dueDate: "In 3 days" },
  { id: 5, title: "Update Risk Assessment for Chemical Storage", type: "risk", priority: "low", dueDate: "In 5 days" },
];

export default function PendingTasks() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Pending Tasks</h3>
        <span className="text-sm text-gray-500">{tasks.length} tasks</span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100">
            <div className={`mt-0.5 ${
              task.priority === "high" ? "text-red-500" : 
              task.priority === "medium" ? "text-amber-500" : "text-gray-400"
            }`}>
              <AlertCircle size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  task.type === "permit" ? "bg-blue-100 text-blue-700" :
                  task.type === "capa" ? "bg-red-100 text-red-700" :
                  task.type === "inspection" ? "bg-green-100 text-green-700" :
                  task.type === "training" ? "bg-purple-100 text-purple-700" :
                  "bg-gray-100 text-gray-700"
                }`}>{task.type.toUpperCase()}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} /> {task.dueDate}
                </span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-green-600">
              <CheckCircle size={20} />
            </button>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 text-sm text-[#0D47A1] hover:underline">
        View all tasks
      </button>
    </div>
  );
}

