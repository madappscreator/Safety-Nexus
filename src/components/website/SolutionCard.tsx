interface SolutionCardProps {
  icon: string;
  title: string;
  features: string[];
}

export default function SolutionCard({ icon, title, features }: SolutionCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border-l-4 border-[#0D47A1] group">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl group-hover:scale-110 transition-transform duration-200">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-gray-600">
            <span className="w-2 h-2 bg-[#2E7D32] rounded-full"></span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

