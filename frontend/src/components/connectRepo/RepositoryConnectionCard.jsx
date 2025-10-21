const RepositoryConnectionCard = ({ icon: Icon, title, onConnect, loading }) => (
  <div className="flex flex-col items-center p-8 bg-gray-900 border border-gray-700 rounded-xl shadow-xl transition duration-300 hover:border-cyan-500">
    <div className="w-20 h-20 mb-4 flex items-center justify-center">
      <Icon className="w-full h-full text-white/90" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-center mb-6 text-sm">
      Connect your {title} repositories for analysis
    </p>
    <button
      onClick={onConnect}
      className="mt-auto px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-500"
      disabled={loading}
    >
      {loading ? `Connecting to ${title}...` : `Connect ${title}`}
    </button>
  </div>
);

export default RepositoryConnectionCard;
