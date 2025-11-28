import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Safety Nexus</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            India&apos;s next-generation HSE and Workforce Safety Automation Platform
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#0D47A1] mb-6">Who We Are</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                SafetyNexus is India&apos;s next-generation HSE (Health, Safety & Environment) and Workforce Safety Automation Platform.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We are dedicated to making workplaces safer through innovative technology, real-time monitoring, and comprehensive safety management tools.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#0D47A1] to-[#2E7D32] rounded-2xl p-8 text-white">
              <div className="text-6xl mb-4">🛡️</div>
              <h3 className="text-2xl font-bold mb-2">Our Promise</h3>
              <p className="text-gray-200">Empowering every organization with accessible, automated, and data-driven safety solutions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#0D47A1]">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-[#0D47A1] mb-4">Our Mission</h3>
              <p className="text-gray-600 text-lg">
                Make safety accessible, automated, and data-driven for every organization regardless of size or industry.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#2E7D32]">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold text-[#2E7D32] mb-4">Our Vision</h3>
              <p className="text-gray-600 text-lg">
                To become the most trusted workplace safety ecosystem globally, protecting millions of workers every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0D47A1] text-center mb-12">Why Choose Safety Nexus?</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { icon: "💻", title: "Easy-to-use Interface", desc: "Intuitive design for all users" },
              { icon: "🔧", title: "Customizable Modules", desc: "Tailored to your needs" },
              { icon: "📊", title: "Real-time Reporting", desc: "Instant insights & analytics" },
              { icon: "💰", title: "Affordable Pricing", desc: "Plans for every budget" },
              { icon: "🏭", title: "All Industries", desc: "Designed for every sector" },
            ].map((item, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0D47A1] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make Your Workplace Safer?</h2>
          <p className="text-xl text-gray-200 mb-8">Join the growing community of safety-first organizations</p>
          <Link href="/contact" className="inline-block bg-white text-[#0D47A1] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started Today
          </Link>
        </div>
      </section>
    </>
  );
}

