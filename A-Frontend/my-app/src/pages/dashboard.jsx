// src/components/Dashboard.js
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import toast from "react-hot-toast";

const Dashboard = () => {
    const [dashboardStats, setDashboardStats] = useState({
        runningCampaign: "00",
        pendingCampaign: "00",
        totalCampaigns: "00",
        accountCount: "00",
        resellerCount: "00",
        userCount: "00",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found.');
                }
                const promise = axios.get(`${import.meta.env.VITE_API_URL}/api/auth/dashboard-stats`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                toast.promise(promise, {
                    loading: 'Fetching dashboard stats...',
                    success: 'Dashboard stats loaded!',
                    error: 'Failed to load dashboard stats.',
                });

                const response = await promise;
                setDashboardStats(response.data);
            } catch (err) {
                setError(err.message || 'Failed to fetch dashboard statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    const stats = [
        { title: "Running Campaign", value: dashboardStats.runningCampaign },
        { title: "Pending Campaign", value: dashboardStats.pendingCampaign },
        { title: "Total", value: dashboardStats.totalCampaigns },
        { title: "Account", value: dashboardStats.accountCount },
        { title: "Reseller", value: dashboardStats.resellerCount },
        { title: "User", value: dashboardStats.userCount },
    ];

    const StatCard = ({ title, value }) => (
        <div className="bg-blue-500 text-white rounded-md p-6 flex flex-col justify-between h-32 
                        shadow-2xl shadow-blue-500/50 transition duration-300 hover:scale-105 hover:shadow-amber-100/60">
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-4xl font-bold mt-2">{value}</p>
        </div>
    );

    return (
        <div className="flex w-screen h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />
            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-gray-100">
                {/* Header */}
                <Header />

                {/* Dashboard Title */}
                <div>
                    <h2 className="text-3xl font-bold text-black px-8 py-8">Dashboard</h2>
                </div>

                {/* Stats Grid */}
                <main className="py-1 p-8 flex-1 overflow-y-auto">
                    
                  
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <StatCard key={index} title={stat.title} value={stat.value} />
                            ))}
                        </div>
                
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
