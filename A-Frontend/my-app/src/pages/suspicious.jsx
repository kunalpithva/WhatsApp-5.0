// File: src/pages/suspicious.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { CiSearch } from "react-icons/ci";
import toast, { Toaster } from "react-hot-toast"; // Assuming toast is available for notifications

const Suspicious = () => {
    const [suspiciousActivities, setSuspiciousActivities] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchSuspiciousActivitiesPromise = new Promise(async (resolve, reject) => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found.");
                }

                const response = await fetch(`${API_URL}/api/auth/suspiciousactivity`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch suspicious activities.");
                }

                const data = await response.json();
                setSuspiciousActivities(data.activities);
                resolve("Suspicious activities loaded successfully!");
            } catch (err) {
                console.error("Error fetching suspicious activities:", err);
                setError(err.message);
                reject(err.message);
            } finally {
                setLoading(false);
            }
        });

        toast.promise(fetchSuspiciousActivitiesPromise, {
            loading: "Loading suspicious activities...",
            success: (message) => message,
            error: (err) => `Error: ${err}`,
        });
    }, [API_URL]);

    const filteredActivities = suspiciousActivities.filter((activity) => {
        const searchTermLower = searchTerm.toLowerCase();
        return Object.values(activity).some(value =>
            String(value).toLowerCase().includes(searchTermLower)
        );
    });

    return (
        <div className="flex w-screen h-screen">
            <Toaster />
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <Header />

                <div className="flex-1 flex flex-col p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-xl font-bold text-black">Suspicious Campaigns</h1>
                    </div>

                    {/* Search Input with Icon */}
                    <div className="mb-4 ml-auto relative">
                        <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-80 pl-10 pr-3 py-2 border border-gray-400 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>


                    {/* Table */}
                    <div className="flex-1 overflow-auto bg-white rounded-lg">
                        <table className="w-full border-collapse text-sm border border-gray-300">
                            <thead>
                                <tr className="bg-blue-500 text-white text-left text-sm">
                                    <th className="px-2 py-1 border border-gray-300">Sr.No</th>
                                    <th className="px-2 py-1 border border-gray-300">Name</th>
                                    <th className="px-2 py-1 border border-gray-300">Mobile No</th>
                                    <th className="px-2 py-1 border border-gray-300">Typed Number</th>
                                    <th className="px-2 py-1 border border-gray-300">Pasted Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                { error ? (
                                    <tr>
                                        <td colSpan="5" className="px-2 py-1 text-center text-red-500">Error: {error}</td>
                                    </tr>
                                ) : filteredActivities.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-2 py-1 text-center text-black">No suspicious activities found.</td>
                                    </tr>
                                ) : (
                                    filteredActivities.map((activity, index) => (
                                        <tr key={activity._id} className="hover:bg-gray-100 text-black">
                                            <td className="px-2 py-1 border border-gray-300">{index + 1}</td>
                                            <td className="px-2 py-1 border border-gray-300">{activity.campaignname}</td>
                                            <td className="px-2 py-1 border border-gray-300">{activity.mobile_number}</td>
                                            <td className="px-2 py-1 border border-gray-300">{activity.typed_numbers}</td>
                                            <td className="px-2 py-1 border border-gray-300">{activity.pasted_numbers}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Suspicious;
