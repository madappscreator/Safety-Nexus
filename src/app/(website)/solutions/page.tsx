import SolutionCard from "@/components/website/SolutionCard";
import Link from "next/link";

const solutions = [
  {
    icon: "🏭",
    title: "Manufacturing Plants",
    features: ["Machine safety audits", "PPE tracking", "Multi-plant control", "Equipment maintenance", "Hazard reporting"],
  },
  {
    icon: "🚛",
    title: "Logistics & Transport",
    features: ["Vehicle safety inspections", "Driver training tracking", "Route-based reporting", "Fleet compliance", "Accident investigation"],
  },
  {
    icon: "🏢",
    title: "Offices & IT Parks",
    features: ["Fire drill management", "Facility audits", "Visitor safety", "Emergency evacuation", "Ergonomic assessments"],
  },
  {
    icon: "🏥",
    title: "Hospitals & Healthcare",
    features: ["Biomedical waste audit", "Infection control checklist", "Compliance management", "Patient safety", "Staff training"],
  },
  {
    icon: "🏗️",
    title: "Construction Sites",
    features: ["Daily safety briefings", "Scaffold inspections", "Fall protection", "Heavy equipment checks", "Contractor management"],
  },
  {
    icon: "⛽",
    title: "Oil & Gas",
    features: ["Permit to work", "Gas detection logs", "Emergency response", "Environmental monitoring", "HSE compliance"],
  },
];

export default function SolutionsPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Industry Solutions</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Tailored safety management for every industry
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <SolutionCard key={index} {...solution} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0D47A1] text-center mb-12">Why Industry-Specific Solutions?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🎯", title: "Targeted Compliance", desc: "Meet industry-specific regulatory requirements effortlessly" },
              { icon: "⚡", title: "Faster Deployment", desc: "Pre-configured templates get you started quickly" },
              { icon: "📈", title: "Better Results", desc: "Solutions designed for your unique safety challenges" },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0D47A1] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Find Your Industry Solution</h2>
          <p className="text-xl text-gray-200 mb-8">Let us help you choose the right safety solution for your industry</p>
          <Link href="/contact" className="inline-block bg-white text-[#0D47A1] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Talk to Our Experts
          </Link>
        </div>
      </section>
    </>
  );
}

