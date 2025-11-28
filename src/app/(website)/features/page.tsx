import FeatureCard from "@/components/website/FeatureCard";
import Link from "next/link";

const allFeatures = [
  {
    icon: "🚨",
    title: "Incident & Accident Reporting",
    description: "Capture incident details with multimedia support",
    features: ["Capture with photos, videos & GPS", "Auto alerts to HSE teams", "CAPA (Corrective Action) tracking"],
  },
  {
    icon: "🔍",
    title: "Safety Audits & Inspections",
    description: "Comprehensive audit and inspection management",
    features: ["Custom audit templates", "Score evaluation system", "Inspection scheduling"],
  },
  {
    icon: "✅",
    title: "Digital Checklists",
    description: "Streamlined digital checklist management",
    features: ["Daily/weekly/monthly checklists", "Auto reminders & notifications", "Task assignments"],
  },
  {
    icon: "⚠️",
    title: "Risk Assessment (HIRA/JSA)",
    description: "Systematic hazard identification and risk analysis",
    features: ["Hazard identification", "Risk score matrix", "Preventive measures & controls"],
  },
  {
    icon: "📚",
    title: "Training & Certification",
    description: "Complete training lifecycle management",
    features: ["Training library", "Assessment tests", "Certificate tracking & expiry alerts"],
  },
  {
    icon: "📋",
    title: "Compliance Management",
    description: "Stay compliant with regulations",
    features: ["Policy & SOP management", "Legal compliance tracker", "Expiry alerts & reminders"],
  },
  {
    icon: "🔧",
    title: "Asset & Equipment Safety",
    description: "Track and maintain equipment safety",
    features: ["Equipment QR tagging", "AMC status tracking", "Maintenance reminders"],
  },
  {
    icon: "📊",
    title: "Reports & Analytics",
    description: "Data-driven insights and reporting",
    features: ["Graphical dashboards", "Export to PDF/Excel", "KPI monitoring"],
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Everything you need to manage workplace safety effectively
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0D47A1] text-center mb-12">How Safety Nexus Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Sign Up", desc: "Create your account and set up your organization" },
              { step: "2", title: "Configure", desc: "Customize modules and add your team members" },
              { step: "3", title: "Deploy", desc: "Roll out to your workforce via web and mobile" },
              { step: "4", title: "Monitor", desc: "Track safety metrics and improve continuously" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#0D47A1] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0D47A1] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Experience All Features</h2>
          <p className="text-xl text-gray-200 mb-8">Start your free trial today and explore every feature</p>
          <Link href="/contact" className="inline-block bg-white text-[#0D47A1] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Start Free Trial
          </Link>
        </div>
      </section>
    </>
  );
}

