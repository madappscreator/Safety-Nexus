import PricingCard from "@/components/website/PricingCard";
import Link from "next/link";

const plans = [
  { name: "Starter", subtitle: "For SMEs", price: "₹2,49,000", users: "25", features: ["Incident management", "Permits", "Checklists", "Dashboard", "Email support"] },
  { name: "Professional", subtitle: "For Mid-size Companies", price: "₹3,99,000", users: "50", features: ["All Starter features", "Audits + Risk Assessment", "Training module", "Compliance management", "Priority support"], isPopular: true },
  { name: "Enterprise", subtitle: "For Large Corporates", price: "₹5,49,000", users: "100", features: ["All Professional features", "Contractor Safety", "Asset Safety", "Multi-site management", "Custom Reports", "Dedicated support"] },
];

const userPricing = [
  { slab: "0–25", price: "Included in plan" },
  { slab: "25–50", price: "₹2,000/user" },
  { slab: "50–100", price: "₹2,500/user" },
  { slab: "100–300", price: "₹2,000/user" },
  { slab: "300–500", price: "₹1,500/user" },
  { slab: "500+", price: "₹1,000/user" },
];

const addons = [
  { name: "Contractor Safety Management", price: "₹1,00,000" },
  { name: "Pollution & Environment Module", price: "₹1,50,000" },
  { name: "IoT Sensor Integration", price: "₹1,50,000" },
  { name: "Fire & Safety Drills", price: "₹75,000" },
  { name: "Training Library + Exams", price: "₹1,25,000" },
  { name: "Custom Reports", price: "₹50,000" },
  { name: "AI Reporting Assistant", price: "₹1,00,000" },
];

const setupFees = [
  { size: "Small (<100 employees)", cost: "₹25,000" },
  { size: "Medium (<500 employees)", cost: "₹50,000" },
  { size: "Large (>500 employees)", cost: "₹1,00,000" },
  { size: "Enterprise (Multi-site)", cost: "₹2,00,000–₹3,00,000" },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">Choose the plan that fits your organization</p>
        </div>
      </section>

      {/* Main Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0D47A1] text-center mb-8">Platform Subscription (Annual)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (<PricingCard key={index} {...plan} />))}
          </div>
        </div>
      </section>

      {/* User Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0D47A1] text-center mb-8">💼 User-Based Add-On Pricing</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#0D47A1] text-white">
                <tr><th className="py-3 px-6 text-left">User Slab</th><th className="py-3 px-6 text-right">Price per User/Year</th></tr>
              </thead>
              <tbody>
                {userPricing.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-6">{item.slab}</td><td className="py-3 px-6 text-right font-semibold text-[#2E7D32]">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center mt-4 text-[#2E7D32] font-medium">🔥 Significantly more affordable than competitor pricing of ₹3,000/user</p>
        </div>
      </section>

      {/* Module Add-ons */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0D47A1] text-center mb-8">🧩 Optional Module Add-Ons</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {addons.map((addon, index) => (
              <div key={index} className="flex justify-between items-center bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <span className="text-gray-700">{addon.name}</span><span className="font-bold text-[#0D47A1]">{addon.price}/year</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Setup Fees */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0D47A1] text-center mb-8">🛠 One-Time Setup & Onboarding</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-[#2E7D32] text-white"><tr><th className="py-3 px-6 text-left">Company Size</th><th className="py-3 px-6 text-right">Setup Cost</th></tr></thead>
              <tbody>
                {setupFees.map((item, index) => (<tr key={index} className="border-b border-gray-100"><td className="py-3 px-6">{item.size}</td><td className="py-3 px-6 text-right font-semibold">{item.cost}</td></tr>))}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-800 mb-3">Setup Includes:</h3>
            <ul className="grid md:grid-cols-2 gap-2 text-gray-600">
              {["Company database creation", "Admin onboarding", "User creation", "Branding setup", "Safety policy upload", "Initial training"].map((item, i) => (
                <li key={i} className="flex items-center gap-2"><span className="text-[#2E7D32]">✓</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[#0D47A1] mb-4">🛡 Support & Maintenance</h2>
          <p className="text-3xl font-bold text-gray-800 mb-4">15% of annual subscription</p>
          <div className="flex flex-wrap justify-center gap-4 text-gray-600">
            {["8×5 support", "Monthly updates", "Security patching", "API maintenance"].map((item, i) => (
              <span key={i} className="bg-gray-100 px-4 py-2 rounded-full">✓ {item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0D47A1] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Quote?</h2>
          <p className="text-xl text-gray-200 mb-8">Contact us for customized pricing and bulk purchases</p>
          <Link href="/contact" className="inline-block bg-white text-[#0D47A1] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Get Custom Quote</Link>
        </div>
      </section>
    </>
  );
}

