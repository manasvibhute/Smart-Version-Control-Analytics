import { FaHeartbeat, FaUsers, FaCodeBranch, FaExclamationTriangle } from "react-icons/fa";

export const RISK_MODULES = [
    { name: 'auth', category: 'Auth', score: 95, color: 'bg-red-600', tooltip: "Risk Score: 95/100" },
    { name: 'login', category: 'Auth', score: 80, color: 'bg-red-500', tooltip: "Risk Score: 80/100" },
    { name: 'jwt', category: 'Auth', score: 34, color: 'bg-green-600', tooltip: "Risk Score: 34/100" },
    { name: 'session', category: 'Auth', score: 67, color: 'bg-yellow-600', tooltip: "Risk Score: 67/100" },
    { name: 'connection', category: 'Database', score: 85, color: 'bg-red-500', tooltip: "Risk Score: 85/100" },
    { name: 'query', category: 'Database', score: 45, color: 'bg-yellow-600', tooltip: "Risk Score: 45/100" },
    { name: 'migrations', category: 'Database', score: 30, color: 'bg-green-600', tooltip: "Risk Score: 30/100" },
    { name: 'seeds', category: 'Database', score: 20, color: 'bg-green-500', tooltip: "Risk Score: 20/100" },
    { name: 'payment', category: 'API', score: 90, color: 'bg-red-600', tooltip: "Risk Score: 90/100" },
    { name: 'user', category: 'API', score: 70, color: 'bg-yellow-700', tooltip: "Risk Score: 70/100" },
    { name: 'product', category: 'API', score: 65, color: 'bg-yellow-600', tooltip: "Risk Score: 65/100" },
    { name: 'order', category: 'API', score: 55, color: 'bg-yellow-500', tooltip: "Risk Score: 55/100" },
    { name: 'rate-limit', category: 'Middleware', score: 5, color: 'bg-green-700', tooltip: "Risk Score: 5/100" },
];

// --- Top Risky Files ---
export const TOP_RISKY_FILES = [
    { path: 'src/auth/auth.service.ts', risk: 92, commits: 15, authors: ['Marcus K.', 'Sarah C.'], modified: '2 days ago' },
    { path: 'src/db/connection.ts', risk: 87, commits: 12, authors: ['Marcus K.'], modified: '1 day ago' },
    { path: 'src/api/payment.controller.ts', risk: 78, commits: 9, authors: ['Emma R.', 'James P.'], modified: '3 days ago' },
    { path: 'src/middleware/rate-limit.ts', risk: 65, commits: 7, authors: ['Sarah C.'], modified: '5 days ago' },
    { path: 'src/models/user.model.ts', risk: 58, commits: 6, authors: ['Lisa A.', 'Marcus K.'], modified: '1 week ago' },
];

// --- Quick Stats ---
export const QUICK_STATS = {
    totalModules: 20,
    highRisk: 2,
    mediumRisk: 10,
    lowRisk: 8,
};

export const RECENT_COMMITS = [
    { id: 'a7f3b2c', message: 'Fix authentication bug in login flow', author: 'Sarah Chen', files: 3, changes: '+45 / -12', risk: 'Low', time: '2 hours ago' },
    { id: 'd8e9f1a', message: 'Refactor database connection pool', author: 'Marcus Kim', files: 8, changes: '+234 / -189', risk: 'High', time: '5 hours ago' },
    { id: 'b2c3d4e', message: 'Update API rate limiting logic', author: 'Emma Rodriguez', files: 5, changes: '+78 / -34', risk: 'Medium', time: '1 day ago' },
    { id: 'c4d5e6f', message: 'Add unit tests for payment module', author: 'James Park', files: 12, changes: '+456 / -23', risk: 'Low', time: '2 days ago' },
    { id: 'e6f7g8h', message: 'Critical security patch for user sessions', author: 'Lisa Anderson', files: 6, changes: '+89 / -145', risk: 'High', time: '3 days ago' },
];

export const METRICS_DATA = [
  {
    title: "Repository Health Score",
    value: 87,
    trend: "+5%",
    status: "Good standing",
    icon: FaHeartbeat,
    iconColor: "text-green-500",
    trendColor: "text-green-400",
  },
  {
    title: "Active Developers",
    value: 24,
    trend: "+12%",
    status: "this month",
    icon: FaUsers,
    iconColor: "text-cyan-500",
    trendColor: "text-green-400",
  },
  {
    title: "Commits This Week",
    value: 189,
    trend: "+8%",
    status: "across all branches",
    icon: FaCodeBranch,
    iconColor: "text-yellow-500",
    trendColor: "text-green-400",
  },
  {
    title: "High-Risk Commits",
    value: 12,
    trend: "3%",
    status: "requires attention",
    icon: FaExclamationTriangle,
    iconColor: "text-red-500",
    trendColor: "text-red-400",
  },
];

export const COMMITS_PER_DAY_DATA = [
  { day: "Mon", commits: 25 },
  { day: "Tue", commits: 35 },
  { day: "Wed", commits: 42 },
  { day: "Thu", commits: 38 },
  { day: "Fri", commits: 48 },
  { day: "Sat", commits: 20 },
  { day: "Sun", commits: 12 },
];

export const LINES_CHANGED_DATA = [
  { name: "Sarah C.", added: 1245, deleted: 432 },
  { name: "Marcus K.", added: 2341, deleted: 1876 },
  { name: "Emma R.", added: 750, deleted: 300 },
  { name: "James P.", added: 1567, deleted: 345 },
  { name: "Lisa A.", added: 980, deleted: 210 },
];

export const RECENT_ALERTS = [
  {
    id: 1,
    title: "Potential merge conflict detected",
    details: "Changes in auth.service.ts conflicts with PR #234",
    time: "30 minutes ago",
    severity: "High",
    action: "Resolve",
  },
  {
    id: 2,
    title: "High-risk commit requires review",
    details: "Commit d8e91a modified 8 critical files",
    time: "5 hours ago",
    severity: "High",
    action: "Resolve",
  },
];