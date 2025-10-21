import { FiRefreshCw } from "react-icons/fi";

const ConnectedRepositoriesTable = () => {
    const repositories = [
        { name: "backend-api", owner: "tech-corp", lastSync: "2 minutes ago", status: "active", branches: "12 branches - 1234 commits" },
        { name: "frontend-app", owner: "tech-corp", lastSync: "1 hour ago", status: "active", branches: "8 branches - 987 commits" },
        { name: "mobile-client", owner: "tech-client", lastSync: "3 days ago", status: "syncing", branches: "15 branches - 2341 commits" },
    ];

    const getStatusClasses = (status) => {
        switch (status) {
            case "active":
                return "text-green-400 bg-green-900/50";
            case "syncing":
                return "text-yellow-400 bg-yellow-900/50";
            default:
                return "text-gray-400 bg-gray-700/50";
        }
    };

    return (
        <div className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-4">Connected Repositories</h2>
            <div className="overflow-hidden border border-gray-900 rounded-xl shadow-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Repository</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Owner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Sync</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-800 bg-gray-900">
                        {repositories.map((repo, index) => (
                            <tr key={index} className="hover:bg-gray-800 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-base font-medium text-cyan-400">{repo.name}</div>
                                    <div className="text-xs text-gray-500">{repo.branches}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{repo.owner}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{repo.lastSync}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(repo.status)} ${repo.status === "syncing" ? "opacity-80" : ""}`}>
                                        {repo.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex justify-end">
                                        <button className="text-cyan-500 hover:text-cyan-300 font-medium flex items-center space-x-2">
                                            <FiRefreshCw className="w-4 h-4" />
                                            <span>Sync</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ConnectedRepositoriesTable;
