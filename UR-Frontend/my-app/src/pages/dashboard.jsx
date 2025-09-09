// src/components/Dashboard.js
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { toast } from "react-hot-toast";

const Dashboard = () => {
    const [campaignStats, setCampaignStats] = useState({
        running: 0,
        pending: 0,
        sent: 0,
        failed: 0,
        delivered: 0,
        completed: 0,
        cancelled: 0,
        total: 0,
    });
    const [totalCredits, setTotalCredits] = useState(0);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Please log in to view dashboard data.");
                return;
            }

            try {
                // Fetch campaigns
                const campaignResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/campaigns`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const campaignData = await campaignResponse.json();

                if (!campaignResponse.ok) {
                    throw new Error(campaignData.error || "Failed to fetch campaigns");
                }

                const campaigns = campaignData.campaigns;
                const stats = {
                    running: 0,
                    pending: 0,
                    sent: 0,
                    failed: 0,
                    delivered: 0,
                    completed: 0,
                    cancelled: 0,
                    total: campaigns.length,
                };

                campaigns.forEach(campaign => {
                    if (campaign.status === "running") stats.running++;
                    else if (campaign.status === "pending") stats.pending++;
                    else if (campaign.status === "sent") stats.sent++;
                    else if (campaign.status === "failed") stats.failed++;
                    else if (campaign.status === "delivered") stats.delivered++;
                    else if (campaign.status === "completed") stats.completed++;
                    else if (campaign.status === "Cancelled") stats.cancelled++;
                });
                setCampaignStats(stats);

                // Fetch credits
                const creditsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/credits`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const creditsData = await creditsResponse.json();

                if (!creditsResponse.ok) {
                    throw new Error(creditsData.error || "Failed to fetch credits");
                }
                setTotalCredits(creditsData.credits);

            } catch (error) {
                toast.error(error.message);
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchDashboardData();
    }, []);

    const stats = [
        { title: "Running Campaign", value: campaignStats.running },
        { title: "Pending Campaign", value: campaignStats.pending },
        { title: "completed", value: campaignStats.completed },
        { title: "Cancelled", value: campaignStats.cancelled },
        { title: "Total Credit", value: totalCredits },
        { title: "Total Campaigns", value: campaignStats.total },
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index}>
                                <StatCard title={stat.title} value={stat.value} />
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
