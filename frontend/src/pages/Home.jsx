import React from "react";
import Navbar from "../components/home/Navbar";
import FeatureCard from "../components/home/FeatureCard";
import { FiHeart, FiBarChart2, FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import { FaGithub } from 'react-icons/fa';
import { Link } from "react-router-dom";

const Home = () => {
    const features = [
        {
            icon: FiHeart,
            title: "Repository Health",
            description: "Monitor your codebase health with real-time metrics and risk scoring."
        },
        {
            icon: FiBarChart2,
            title: "Developer Analytics",
            description: "Track team productivity and contribution patterns over time."
        },
        {
            icon: FiAlertTriangle,
            title: "Risk Detection",
            description: "Predict merge conflicts and identify bug-prone modules early."
        },
    ]

    const connectGithub = () => {
        const githubClientId = "Ov23liD61pAdYbyn6Tpg";
        const githubRedirectUri = "http://localhost:5000/auth/github/callback";
        const scope = encodeURIComponent("repo read:user security_events");

        const url = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${githubRedirectUri}&scope=${scope}`;
        window.location.href = url;
    };

    return (
        <div className="min-h-screen bg-gray-900 font-sans">
            <Navbar />

            <main className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center py-20 lg:py-32 bg-gray-900 rounded-2xl shadow-inner shadow-gray-900/50">
                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white mb-6 tracking-tight">
                        Turn your Git history into <br className="hidden md:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">
                            actionable insights
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
                        Visualize developer productivity, identify risky commits, and predict merge conflicts before they happen with AI-powered repository analytics.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                        {/* Primary Button */}
                        <button
                            onClick={connectGithub}
                            className="flex items-center justify-center px-8 py-3 text-lg font-semibold text-gray-900 bg-cyan-500 rounded-full shadow-lg hover:bg-cyan-400 transition duration-200 transform hover:scale-105 group"
                        >
                            <FaGithub className="w-5 h-5 mr-3" />
                            Connect GitHub Repository
                            <FiArrowRight className="w-4 h-4 ml-2 opacity-0 transition duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                        </button>

                        {/* Secondary Button */}
                        <button className="px-8 py-3 text-lg font-semibold text-white border-2 border-gray-600 rounded-full hover:border-cyan-500 hover:text-cyan-500 transition duration-200">
                            Use Demo Repository
                        </button>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                        />
                    ))}
                </div>
            </main>

            <footer className="py-6 text-center text-gray-500 text-sm">
                &copy; 2025 Smart Analytics Inc. All rights reserved.
            </footer>
        </div>
    );
};

export default Home;
