import Link from "next/link";

interface PricingCardProps {
  name: string;
  subtitle: string;
  price: string;
  users: string;
  features: string[];
  isPopular?: boolean;
}

export default function PricingCard({ name, subtitle, price, users, features, isPopular }: PricingCardProps) {
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg p-8 ${isPopular ? 'border-2 border-[#0D47A1] scale-105' : 'border border-gray-200'} hover:shadow-xl transition-all duration-300`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#2E7D32] text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-[#0D47A1]">{name}</h3>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
      <div className="text-center mb-6">
        <span className="text-4xl font-bold text-gray-800">{price}</span>
        <span className="text-gray-500">/year</span>
        <p className="text-sm text-gray-500 mt-1">{users} users included</p>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-gray-700">
            <svg className="w-5 h-5 text-[#2E7D32] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/contact"
        className={`block text-center py-3 rounded-lg font-semibold transition-colors duration-200 ${
          isPopular
            ? 'bg-[#0D47A1] text-white hover:bg-[#2E7D32]'
            : 'bg-gray-100 text-[#0D47A1] hover:bg-[#0D47A1] hover:text-white'
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}

