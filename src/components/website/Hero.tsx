import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#2E7D32] text-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Empowering Workplace Safety,
            <br />
            <span className="text-green-300">Compliance & Workforce Protection</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            A unified platform for Incident Reporting, Safety Audits, Risk Assessment, Training & Compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-[#0D47A1] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-[#0D47A1] transition-all duration-200"
            >
              Request Demo
            </Link>
          </div>

          {/* Key Highlights */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "📊", text: "Real-time Safety Dashboard" },
              { icon: "📱", text: "Mobile & Web Support" },
              { icon: "🏢", text: "Multi-Location Management" },
              { icon: "🔒", text: "100% Secure Cloud Platform" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors duration-200"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-sm font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

