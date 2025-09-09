// File: src/pages/campaign.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { CiSearch } from "react-icons/ci";
import { IoTrashOutline, IoClose } from "react-icons/io5";
import { toast } from "react-hot-toast";

// Utility function to strip HTML tags
const stripHtmlTags = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
};

const statusOptions = {
    Compeleted: "bg-emerald-100 text-emerald-700", // Softer green
    Pending: "bg-amber-100 text-amber-700",     // Softer orange/amber
    pending: "bg-amber-100 text-amber-700",     // Consistent with Pending
    Cancelled: "bg-rose-100 text-rose-700",     // Softer red/rose
    Running: "bg-blue-100 text-blue-700",       // Distinct blue for running
};

const Campaign = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredCampaigns, setFilteredCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const popupRef = useRef(null);

    const [showDeletePopup, setShowDeletePopup] = useState(false);

    // NEW: for full message popup
    const [showMessagePopup, setShowMessagePopup] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/campaigns`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const rawData = await response.json();
                const campaignsArray = rawData.campaigns; // Access the 'campaigns' property
                if (Array.isArray(campaignsArray)) {
                    const transformedData = campaignsArray.map(campaign => ({
                        id: campaign._id,
                        name: campaign.campaignname,
                        message: campaign.message,
                        date: new Date(campaign.startdate).toLocaleDateString(), // Format date
                        status: campaign.status, // Use status from API response
                    }));
                    setCampaigns(transformedData);
                    setFilteredCampaigns(transformedData);
                } else {
                    throw new Error("API did not return an array of campaigns.");
                }
            } catch (error) {
                setError(error);
                toast.error("Failed to fetch campaigns.");
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = Array.isArray(campaigns)
            ? campaigns.filter((campaign) =>
                  Object.values(campaign).some((value) =>
                      value.toString().toLowerCase().includes(term)
                  )
              )
            : [];
        setFilteredCampaigns(filtered);
    }, [searchTerm, campaigns]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                handleCloseDeletePopup();
                setShowMessagePopup(false);
            }
        };

        if (showDeletePopup || showMessagePopup) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDeletePopup, showMessagePopup]);

    const clearSearch = () => setSearchTerm("");

    const handleOpenDeletePopup = (campaign) => {
        setSelectedCampaign(campaign);
        setShowDeletePopup(true);
    };

    const handleCloseDeletePopup = () => {
        setShowDeletePopup(false);
        setSelectedCampaign(null);
    };

    // Instead of deleting, update status to "Cancelled"
    const handleCancelCampaign = async () => {
        if (selectedCampaign) {
            const cancelPromise = new Promise(async (resolve, reject) => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/campaigns/${selectedCampaign.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ status: "Cancelled" }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || `HTTP error! status: ${response.status}`);
                    }

                    // Update the campaigns list in the state
                    setCampaigns((prevCampaigns) =>
                        prevCampaigns.map((c) =>
                            c.id === selectedCampaign.id ? { ...c, status: "Cancelled" } : c
                        )
                    );
                    setFilteredCampaigns((prevFilteredCampaigns) =>
                        prevFilteredCampaigns.map((c) =>
                            c.id === selectedCampaign.id ? { ...c, status: "Cancelled" } : c
                        )
                    );

                    resolve(`Campaign "${selectedCampaign.name}" marked as Cancelled successfully!`);
                } catch (error) {
                    reject(error);
                }
            });

            toast.promise(cancelPromise, {
                loading: "Cancelling campaign...",
                success: (message) => message,
                error: (err) => err.message,
            });
            handleCloseDeletePopup();
        }
    };

    // NEW: message popup
    const handleShowMessage = (campaign) => {
        setSelectedMessage(campaign);
        setShowMessagePopup(true);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4 text-black">Campaigns</h1>
                    <div className="flex items-center justify-between mb-4">
                        <div className="relative w-60 justify-end">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <CiSearch size={20} />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by any field..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-8 py-2 border border-gray-400 rounded-full text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-gray-700 font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg shadow-md">
                        <table className="w-full border-collapse bg-white text-sm rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-blue-500 text-white text-left">
                                    <th className="px-2 py-1 border border-gray-300">Sr. No</th>
                                    <th className="px-2 py-1 border border-gray-300">Campaign Name</th>
                                    <th className="px-2 py-1 border border-gray-300">Message</th>
                                    <th className="px-2 py-1 border border-gray-300">Date</th>
                                    <th className="px-2 py-1 border border-gray-300">Status</th>
                                    <th className="px-2 py-1 border border-gray-300">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-gray-500">
                                            Loading campaigns...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-red-500">
                                            Error: {error.message}
                                        </td>
                                    </tr>
                                ) : filteredCampaigns.length > 0 ? (
                                    filteredCampaigns.map((campaign, idx) => (
                                        <tr
                                            key={campaign.id}
                                            className="hover:bg-gray-100 transition-colors text-black"
                                        >
                                            <td className="px-2 py-1 border border-gray-300">
                                                {String(idx + 1).padStart(2, "0")}
                                            </td>
                                            <td className="px-2 py-1 border border-gray-300">
                                                {campaign.name}
                                            </td>
                                            <td
                                                className="px-2 py-1 border border-gray-300 cursor-pointer max-w-xs truncate text-blue-600 hover:underline"
                                                onClick={() => handleShowMessage(campaign)}
                                                title="Click to view full message"
                                            >
                                                {stripHtmlTags(campaign.message)}
                                            </td>
                                            <td className="px-2 py-1 border border-gray-300">
                                                {campaign.date}
                                            </td>
                                            <td className="px-2 py-1 border border-gray-300">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusOptions[campaign.status]}`}>
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="px-2 py-1 border border-gray-300 flex justify-center items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenDeletePopup(campaign)}
                                                    className="flex justify-center items-center text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded-full border border-red-600 hover:border-red-800 bg-white"
                                                >
                                                    <IoTrashOutline />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-gray-500">
                                            No campaigns found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Message Full View Popup */}
            {showMessagePopup && selectedMessage && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                    <div
                        ref={popupRef}
                        className="relative bg-white border border-gray-300 rounded-2xl shadow-xl p-6 w-[500px] max-w-full"
                    >
                        <button
                            onClick={() => setShowMessagePopup(false)}
                            className="absolute top-4 right-1 text-gray-500 hover:text-gray-700 bg-white"
                        >
                            <IoClose size={22} />
                        </button>

                        <h2 className="text-lg font-bold mb-4 text-black">
                            {selectedMessage.name} : Full Message
                        </h2>
                        <p className="text-gray-700 whitespace-pre-wrap break-words">
                            {stripHtmlTags(selectedMessage.message)}
                        </p>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Popup */}
            {showDeletePopup && selectedCampaign && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                    <div
                        ref={popupRef}
                        className="relative bg-white border border-gray-300 rounded-2xl shadow-2xl shadow-blue-300 p-6 w-96"
                    >
                        <button
                            onClick={handleCloseDeletePopup}
                            className="absolute top-4 right-1 text-gray-500 hover:text-gray-700 bg-white"
                        >
                            <IoClose size={22} />
                        </button>

                        <h2 className="text-lg font-bold mb-4 text-black">
                            Cancel Campaign {selectedCampaign.name}?
                        </h2>
                        <p className="mb-4 text-gray-700">
                            Are you sure you want to mark this campaign as Cancelled?
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCloseDeletePopup}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                No
                            </button>
                            <button
                                onClick={handleCancelCampaign}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Campaign;
