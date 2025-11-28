import Hero from "@/components/website/Hero";
import FeatureCard from "@/components/website/FeatureCard";
import SolutionCard from "@/components/website/SolutionCard";
import PricingCard from "@/components/website/PricingCard";
import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import Link from "next/link";

const features = [
  {
    icon: "🚨",
    title: "Incident & Accident Reporting",
    description: "Capture and track incidents in real-time",
    features: ["Photos, videos & GPS capture", "Auto alerts to HSE teams", "CAPA tracking"],
  },
  {
    icon: "🔍",
    title: "Safety Audits & Inspections",
    description: "Comprehensive audit management",
    features: ["Custom audit templates", "Score evaluation system", "Inspection scheduling"],
  },
  {
    icon: "✅",
    title: "Digital Checklists",
    description: "Streamlined safety checklists",
    features: ["Daily/weekly/monthly checklists", "Auto reminders", "Task assignments"],
  },
  {
    icon: "⚠️",
    title: "Risk Assessment (HIRA/JSA)",
    description: "Identify and mitigate hazards",
    features: ["Hazard identification", "Risk score matrix", "Preventive controls"],
  },
];

const solutions = [
  { icon: "🏭", title: "Manufacturing Plants", features: ["Machine safety audits", "PPE tracking", "Multi-plant control"] },
  { icon: "🚛", title: "Logistics & Transport", features: ["Vehicle safety", "Driver inspections", "Route-based reporting"] },
  { icon: "🏢", title: "Offices & IT Parks", features: ["Fire drill management", "Facility audits", "Visitor safety"] },
  { icon: "🏥", title: "Hospitals", features: ["Biomedical waste audit", "Infection control", "Compliance management"] },
];

const pricingPlans = [
  { name: "Starter", subtitle: "For SMEs", price: "₹2,49,000", users: "25", features: ["Incident management", "Permits", "Checklists", "Dashboard"] },
  { name: "Professional", subtitle: "For Mid-size Companies", price: "₹3,99,000", users: "50", features: ["All Starter features", "Audits + Risk Assessment", "Training module", "Compliance management"], isPopular: true },
  { name: "Enterprise", subtitle: "For Large Corporates", price: "₹5,49,000", users: "100", features: ["All Professional features", "Contractor Safety", "Asset Safety", "Multi-site management", "Custom Reports"] },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0D47A1] mb-4">Powerful Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Everything you need to manage workplace safety effectively</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/features" className="text-[#0D47A1] font-semibold hover:text-[#2E7D32] transition-colors">
                View All Features →
              </Link>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0D47A1] mb-4">Industry Solutions</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Tailored safety solutions for every industry</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {solutions.map((solution, index) => (
                <SolutionCard key={index} {...solution} />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0D47A1] mb-4">Simple, Transparent Pricing</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Choose the plan that fits your organization</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <PricingCard key={index} {...plan} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/pricing" className="text-[#0D47A1] font-semibold hover:text-[#2E7D32] transition-colors">
                View Full Pricing Details →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#0D47A1] to-[#2E7D32] text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Workplace Safety?</h2>
            <p className="text-xl text-gray-200 mb-8">Join hundreds of organizations already using Safety Nexus</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="bg-white text-[#0D47A1] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial
              </Link>
              <Link href="/contact" className="border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#0D47A1] transition-colors">
                Schedule a Demo
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
