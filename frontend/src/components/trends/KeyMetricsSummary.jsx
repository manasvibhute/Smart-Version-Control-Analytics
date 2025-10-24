const KeyMetricsSummary = ({ commits, bugChartData }) => {
  const totalContributions = commits.length;

  const activeContributors = new Set(
    commits.map(c =>
      c?.author?.login || c?.commit?.author?.name || "Unknown"
    )
  ).size;

  const bugsThisMonth = bugChartData.datasets[0]?.data?.slice(-1)[0] || 0;
  const bugsFixed = bugChartData.datasets[1]?.data?.reduce((a, b) => a + b, 0);

  const metrics = [
    { title: "Total Contributions", value: totalContributions, color: "text-white" },
    { title: "Active Contributors", value: activeContributors, color: "text-cyan-400" },
    { title: "Bugs This Month", value: bugsThisMonth, color: "text-red-400" },
    { title: "Bugs Fixed", value: bugsFixed, color: "text-green-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-gray-900 p-4 border border-gray-700/50 rounded-xl text-left"
        >
          <div className="text-sm text-gray-400 mb-1">{metric.title}</div>
          <div className={`text-3xl font-bold ${metric.color}`}>{metric.value}</div>
        </div>
      ))}
    </div>
  );
};

export default KeyMetricsSummary;