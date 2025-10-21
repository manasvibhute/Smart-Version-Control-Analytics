const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-start p-6 bg-gray-800 border border-gray-700/50 rounded-xl shadow-2xl transition duration-300 hover:border-cyan-500/50">
    <div className="bg-cyan-600/20 p-3 rounded-full mb-4">
      <Icon className="w-6 h-6 text-cyan-400" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-base">{description}</p>
  </div>
);
export default FeatureCard;
