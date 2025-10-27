import React, { useState } from "react";
import { FiGithub, FiBell, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom"; // <-- import useNavigate
import { useRepo } from "../context/RepoContext";

// --- SVG Icons ---
const IconLayoutDashboard = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
);
const IconGitCommit = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M12 2v6"></path><path d="M12 16v6"></path><path d="M6 12l2 2"></path><path d="M18 12l-2 2"></path><path d="M6 12l-2 2"></path><path d="M18 12l2 2"></path></svg>
);
const IconWarning = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>
);
const IconZap = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);
const IconBarChart = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
);
const IconGitBranch = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9c-1.64 1-2.9 3.2-3.5 5.5-1 4-2 6.5-5 7.5" /></svg>
);

const Navbarr = () => {
  const { repoHealth } = useRepo();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Dashboard', icon: IconLayoutDashboard, path: '/dashboard' },
    { name: 'Commits', icon: IconGitCommit, path: '/commits' },
    { name: 'Risky Modules', icon: IconWarning, path: '/risky-modules' },
    { name: 'Alerts', icon: IconZap, path: '/alerts' },
    { name: 'Trends', icon: IconBarChart, path: '/trends' },
  ];

  const healthColor = repoHealth >= 80 ? 'bg-green-500' : repoHealth >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 bg-opacity-90 backdrop-blur-sm shadow-md">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            {/* Hamburger */}
            <button className="text-white focus:outline-none" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <span className="text-lg font-semibold text-white tracking-wider">Smart Version Control</span>
          </div>

          <div className="flex items-center space-x-4">
            <button className="px-5 py-2.5 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition duration-200 flex items-center">
              <FiGithub className="w-5 h-5 mr-2" /> Connect Repo
            </button>
            {/* <button className="p-3 rounded-full hover:bg-gray-700 transition duration-200">
              <FiBell className="w-5 h-5 text-white" />
            </button> */}
            <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold">P</div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-4 overflow-y-auto">

          {/* Top: Close button + Logo */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-cyan-600/20 flex items-center justify-center">
                <IconGitBranch className="w-6 h-6 text-cyan-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">SVCA</p>
                <p className="text-xs text-gray-400">Smart Version Control</p>
              </div>
            </div>

            <button className="text-white focus:outline-none" onClick={() => setSidebarOpen(false)}>
              <FiX size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-300 border border-transparent hover:border-cyan-500 hover:text-cyan-500 transition duration-150"
              >
                <link.icon className="w-5 h-5 mr-3" />
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Bottom Section: Logout & Health */}
          <div className="mt-auto flex flex-col space-y-4">
            <button
              onClick={() => navigate("/")} // <-- navigate to home on logout
              className="flex items-center space-x-3 px-4 py-2 w-full rounded-lg hover:bg-gray-700 transition duration-200">
              <FiLogOut />
              <span>Logout</span>
            </button>

            <div className="p-5 bg-gray-800 rounded-lg border border-gray-600 shadow-md">
              <p className="text-sm font-medium text-gray-400 mb-2">Repository Health</p>
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-bold text-white">
                  {repoHealth !== null ? `${repoHealth}%` : "Calculating..."}
                </span>
                <span className="text-lg text-gray-400">/100</span>
              </div>
              <div className="w-full h-4 bg-gray-700 rounded-full">
                <div className={`${healthColor} h-4 rounded-full`} style={{ width: `${repoHealth}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setSidebarOpen(false)}></div>}
    </>
  );
};

export default Navbarr;
